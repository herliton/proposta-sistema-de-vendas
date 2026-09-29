# CODEX MASTER SPECIFICATION & IMPLEMENTATION BLUEPRINT
## System: Vehicle Sales, Credit Recovery & Proposal Management System
## Version: 1.0.0

---

## 1. SYSTEM OVERVIEW & ARCHITECTURE STACK

You are an expert full-stack AI engineer. You are instructed to build and deploy a complete, multi-role web platform for vehicle proposal generation, contract effective tracking, credit recovery cross-selling, multi-store management, and dynamic access control.

### Tech Stack Specifications
- **Backend:** Node.js (Express.js framework)
- **Database:** PostgreSQL (using `pg` / `pg-promise` driver) with strict foreign key constraints, indexes, and soft-delete capabilities.
- **Frontend:** React (Modern Functional Components, Hooks, Context API / Redux, Tailwind CSS).
- **Integrations:**
  - **ViaCEP API:** Automatic ZIP code address lookup (`https://viacep.com.br/ws/{cep}/json/`).
  - **FIPE Table API:** Vehicle market valuation lookup.
  - **SMTP Mailer:** Nodemailer + `crypto` module for secure password reset tokens and temporary credentials.
- **Document & PDF Engine:** `pdfkit` / `puppeteer` for server-side generation of Commercial Proposals and Payout Reports.
- **Security & RBAC:** JWT authentication, BCrypt password hashing, SHA-256 token hashing, and Dynamic Menu & Feature Permissions Engine.

---

## 2. DATABASE SCHEMA (POSTGRESQL DDL)

```sql
-- ENUM TYPES DEFINITION
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'SELLER', 'SUPPORT');
CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'IN_NEGOTIATION', 'SOLD');
CREATE TYPE deal_status AS ENUM ('SIMULATION', 'PROPOSAL', 'CREDIT_REJECTED', 'CONTRACT_EFFECTIVE', 'CANCELLED');
CREATE TYPE contract_type AS ENUM ('VEHICLE_SALE', 'CREDIT_CONSULTANCY');
CREATE TYPE person_type AS ENUM ('PF', 'PJ');

-- SYSTEM MODULES CATALOG
CREATE TABLE system_modules (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  route VARCHAR(100) NOT NULL,
  icon VARCHAR(50)
);

-- DYNAMIC ROLE PERMISSIONS MATRIX
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  module_id VARCHAR(50) REFERENCES system_modules(id) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT TRUE,
  UNIQUE(role, module_id)
);

-- SALES TEAMS TABLE
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  manager_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  zip_code VARCHAR(10),
  street_address VARCHAR(255),
  number VARCHAR(20),
  complement VARCHAR(100),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(2),
  role user_role NOT NULL DEFAULT 'SELLER',
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  pix_key VARCHAR(255),
  monthly_target DECIMAL(12,2),
  is_active BOOLEAN DEFAULT TRUE,
  first_access BOOLEAN DEFAULT TRUE,
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE teams ADD CONSTRAINT fk_team_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- VEHICLES INVENTORY & SHOWCASE TABLE
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  mfg_year INT NOT NULL,
  model_year INT NOT NULL,
  fipe_code VARCHAR(20),
  fipe_price DECIMAL(12,2),
  suggested_price DECIMAL(12,2) NOT NULL,
  min_price DECIMAL(12,2) NOT NULL,
  status vehicle_status DEFAULT 'AVAILABLE',
  description TEXT,
  photo_right_url TEXT,
  photo_left_url TEXT,
  photo_front_url TEXT,
  photo_rear_url TEXT,
  photo_interior_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMERS TABLE (PF & PJ INTEGRATED)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type person_type NOT NULL DEFAULT 'PF',
  full_name VARCHAR(255),
  cpf VARCHAR(14) UNIQUE,
  company_name VARCHAR(255),
  trade_name VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE,
  contact_person VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  zip_code VARCHAR(10) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(100),
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  current_seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SIMULATIONS, PROPOSALS & CONTRACTS TABLE
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type contract_type DEFAULT 'VEHICLE_SALE',
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
  status deal_status DEFAULT 'SIMULATION',
  negotiated_price DECIMAL(12,2),
  down_payment DECIMAL(12,2),
  installments INT,
  interest_rate DECIMAL(5,2),
  installment_value DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- COMMISSIONS LEDGER
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR HIGH-PERFORMANCE SEARCH
CREATE INDEX idx_vehicles_search ON vehicles(brand, model, mfg_year, model_year, status);
CREATE INDEX idx_deals_active_simulations ON deals(vehicle_id, status);
CREATE INDEX idx_customers_lookup ON customers(cpf, cnpj);
```

---

## 3. SEED DATA FOR SYSTEM MODULES

```sql
INSERT INTO system_modules (id, name, route, icon) VALUES
  ('SHOWCASE', 'Classificado Digital / Estoque', '/estoque', 'car'),
  ('CUSTOMERS', 'Gestão de Clientes (PF/PJ)', '/clientes', 'users'),
  ('SIMULATION', 'Simulador & Propostas', '/propostas', 'calculator'),
  ('TEAM_DASHBOARD', 'Dashboard da Equipe (Gerente)', '/dashboard-equipe', 'chart-bar'),
  ('SUPPORT_APPROVAL', 'Aprovação de Crédito (Suporte)', '/aprovacoes', 'check-circle'),
  ('BANK_TABLES', 'Tabelas de Financiamento', '/tabelas-banco', 'table'),
  ('COMMISSIONS', 'Relatórios & Comissões', '/comissoes', 'dollar-sign')
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_permissions (role, module_id, can_access) VALUES
  ('SELLER', 'SHOWCASE', TRUE),
  ('SELLER', 'CUSTOMERS', TRUE),
  ('SELLER', 'SIMULATION', TRUE),
  ('MANAGER', 'SHOWCASE', TRUE),
  ('MANAGER', 'CUSTOMERS', TRUE),
  ('MANAGER', 'SIMULATION', TRUE),
  ('MANAGER', 'TEAM_DASHBOARD', TRUE),
  ('SUPPORT', 'SUPPORT_APPROVAL', TRUE),
  ('SUPPORT', 'BANK_TABLES', TRUE),
  ('SUPPORT', 'COMMISSIONS', TRUE)
ON CONFLICT (role, module_id) DO NOTHING;
```

---

## 4. MAILER SERVICE & SECURITY IMPLEMENTATION (`src/services/mailService.js`)

```javascript
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generatePasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 Hour

  return { resetToken, resetPasswordTokenHash, resetPasswordExpires };
}

async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Suporte Sistema Auto" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Solicitação de Alteração de Senha',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0056b3;">Redefinição de Senha</h2>
        <p>Olá, <strong>${user.full_name}</strong>!</p>
        <p>Recebemos uma solicitação para redefinir a sua senha de acesso.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0056b3; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Alterar Minha Senha</a>
        </div>
        <p style="font-size: 0.85em; color: #666;">Se o botão não funcionar, acesse o link: ${resetUrl}</p>
        <p style="font-size: 0.8em; color: #999;">Válido por 1 hora. Caso não tenha solicitado, ignore esta mensagem.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

async function sendWelcomeEmail(user, tempPassword) {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const mailOptions = {
    from: `"Suporte Sistema Auto" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Acesso Criado - Sistema de Vendas de Veículos',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0056b3;">Bem-vindo ao Sistema!</h2>
        <p>Olá, <strong>${user.full_name}</strong>!</p>
        <p>Seu acesso foi cadastrado com sucesso.</p>
        <p><strong>Login:</strong> ${user.email}</p>
        <p><strong>Senha Temporária:</strong> <code>${tempPassword}</code></p>
        <p>Obrigatório alterar a senha no primeiro login.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #28a745; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acessar o Sistema</a>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = {
  generatePasswordResetToken,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
```

---

## 5. RESTFUL API ROUTE SPECIFICATION (BACKEND NODE.JS)

### Auth & Password Recovery Routes (`/api/auth`)
- `POST /api/auth/login`: Authenticates credentials, returns JWT, user object, and `first_access` status.
- `POST /api/auth/forgot-password`: Generates SHA-256 token hash, updates `reset_password_token` and `reset_password_expires`, calls `sendPasswordResetEmail`. Returns `"Se o e-mail estiver cadastrado, o link foi enviado."`.
- `POST /api/auth/reset-password`: Validates token parameter against stored SHA-256 hash and expiration, updates `password_hash`, clears reset fields.
- `POST /api/auth/first-access-change`: Changes temporary password on first login (`first_access = false`).

### Dynamic Permissions Routes (`/api/permissions`)
- `GET /api/permissions/modules`: Lists all modules from `system_modules`.
- `GET /api/permissions/role/:role`: Returns allowed menu modules for a given role.
- `PUT /api/permissions/role/:role`: Admin updates accessibility matrix in `role_permissions`.

### Vehicles & Digital Showcase Routes (`/api/vehicles`)
- `GET /api/vehicles`: Multi-filter search (brand, model, mfg_year, model_year, status). Computes `active_simulations_count` dynamically:
  ```sql
  SELECT COUNT(*) FROM deals WHERE vehicle_id = vehicles.id AND status IN ('SIMULATION', 'PROPOSAL');
  ```
- `POST /api/vehicles`: Creates vehicle record with 5 mandatory photo URLs (`photo_right`, `photo_left`, `photo_front`, `photo_rear`, `photo_interior`) and max 60-second video URL (`video_url`). Enforces `min_price` guardrail.

### Customer Routes (`/api/customers`)
- `GET /api/customers`: Search by Name, CPF (PF), or CNPJ (PJ).
- `POST /api/customers`: Creates PF or PJ customer with full ViaCEP address structure.

### Deal & Sales Engine Routes (`/api/deals`)
- `POST /api/deals/simulate`: Runs amortization calculation, checks `negotiated_price >= vehicle.min_price`, logs customer takeover if assigned to another seller, updates vehicle status to `IN_NEGOTIATION`.
- `PUT /api/deals/:id`: Edits open simulations/proposals (`SIMULATION` or `PROPOSAL` status).
- `GET /api/deals/:id/pdf`: Exports commercial proposal PDF.
- `PATCH /api/deals/:id/reject`: Marks proposal as `CREDIT_REJECTED`. Automatically resets vehicle status back to `AVAILABLE`.
- `POST /api/deals/:id/credit-consultancy`: Registers credit recovery consultancy sale (`CONTRATO_CONSULTORIA_EFETIVADO`) with separate commission calculations.
- `PATCH /api/deals/:id/approve`: Support approves proposal (`CONTRACT_EFFECTIVE`). Vehicle status changes permanently to `SOLD`. Automatically sets other pending open simulations for that vehicle to `REJECTED` (*"Veículo Vendido"*).

---

## 6. MIDDLEWARE & UTILITIES IMPLEMENTATION

```javascript
// Dynamic Menu & Permission Middleware
const checkModulePermission = (requiredModule) => async (req, res, next) => {
  const userRole = req.user.role;
  if (userRole === 'ADMIN') return next();

  const permission = await db.query(
    `SELECT can_access FROM role_permissions WHERE role = $1 AND module_id = $2`,
    [userRole, requiredModule]
  );

  if (permission.rows.length && permission.rows[0].can_access) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado a esta funcionalidade.' });
};

// Date Range Helper: Default Calendar Week (Sunday to Saturday)
const getWeekBounds = () => {
  const now = new Date();
  const sunday = new Date(now.setDate(now.getDate() - now.getDay()));
  sunday.setHours(0, 0, 0, 0);
  const saturday = new Date(sunday);
  saturday.setDate(saturday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);
  return { startDate: sunday, endDate: saturday };
};
```