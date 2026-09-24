Skill Specification: Vehicle Sales & Proposal Management System (Updated)
System Overview & Tech Stack
You are an expert full-stack AI developer tasked with building a web-based Vehicle Proposal, Contract, and Sales Management System.

Core Architecture Requirements
Frontend: React (Modern Hooks, Context API / Redux, Clean UI)

Backend: Node.js (Express or NestJS)

Database: PostgreSQL (Relational schema with strict foreign keys)

Storage: Object Storage (S3 / Cloudinary / local uploads) for photos, user avatars, and video files.

Security: JWT Authentication, RBAC (Role-Based Access Control), Password Hashing (bcrypt).

1. User Roles & Access Control (RBAC)
The system enforces strict RBAC across 4 distinct roles, with support for functional inheritance:

ADMIN (Administrador)

MANAGER (Gerente - possui perfil duplo/acúmulo de função)

SELLER (Vendedor)

SUPPORT (Suporte)

Acúmulo de Funções (Rule Update)
Gerente-Vendedor: O perfil MANAGER acumula integralmente as funções de SELLER. Gerentes têm autorização para cadastrar clientes, realizar simulações, emitir propostas, fechar vendas diretas e receber comissões de suas próprias vendas, além de visualizar a performance global da sua equipe.

User Profile Data Fields (Updated)
Todo usuário cadastrado no sistema deve conter obrigatoriamente as seguintes informações de identificação:

Foto de Perfil (User Avatar / Photo)

Nome Completo

E-mail (utilizado obrigatoriamente como Login do sistema)

Telefone / WhatsApp

Endereço Completo (Logradouro, Número, Complemento, Bairro, Cidade, Estado)

CEP (com busca/preenchimento automático via API ViaCEP)

Perfil de Acesso / Role (ADMIN, MANAGER, SELLER, SUPPORT)

Status do Usuário (ACTIVE, INACTIVE)

Authentication & Account Rules
Login Credentials: Unique Email and Password.

Auto-Generated Passwords: Upon initial registration (by ADMIN or SUPPORT), a temporary password is generated and dispatched via email.

First-Time Password Change: On first login, the user must update their password.

Password Policy: Minimum 8 characters, containing at least one uppercase letter, one lowercase letter, and one number.

Password Reset: "Forgot Password" functionality on the login screen sends a secure link via email for resetting credentials.

2. Modules & Feature Specifications
Module 1: System & Access Administration (ADMIN)
User Management & Role Editing (Updated):

Register users with complete profile data (photo, full address, phone, email, assigned role).

Profile Editing / Promotion: Full capability for ADMIN to edit user accounts at any time (e.g., promoting a SELLER to MANAGER or changing permissions).

Dynamic access privileges update immediately upon role change without breaking past transaction history.

Interest Rates (Tabela de Juros): Manage default financing interest rates used across contract simulations.

Vehicle Inventory Management:

Media Attachments: Right Side, Left Side, Front View, Rear View, Interior photos, and 1-minute max video.

Pricing Specifications: Suggested Selling Price, Minimum Selling Price, and FIPE Value.

Vehicle Availability Statuses: AVAILABLE (Disponível), IN_NEGOTIATION (Em Negociação), SOLD (Vendido / Indisponível).

Advanced Search & Filtering: Filter inventory by Manufacturing Year, Model Year, Brand, Model, and Availability Status.

Contract Benefits: Manage available perks (e.g., Paid IPVA, Full Tank, Free Insurance, Title Transfer).

Admin Dashboard: Total Simulations, Proposals, Finalized Contracts, Rejected Proposals (Default filter: Current calendar week, Sunday to Saturday).

Module 2: Sales & Customer Operations (SELLER & MANAGER)
Customer Registration: Capture complete customer data required for contracts (CPF credit check included).

Conflict Management: If a seller/manager attempts to run a simulation for a customer assigned to another seller, the system blocks/alerts the user.

Vehicle Selection & Simulation Rules:

Multi-simulation allowance on vehicles in AVAILABLE or IN_NEGOTIATION state.

Simulation Counter: Displays active simulation count for selected vehicles.

Automatic status updates (IN_NEGOTIATION on first simulation, SOLD on contract approval).

Pricing Controls: Sale price cannot be lower than vehicle.min_price.

Financing Calculation: Amortization formulas applied dynamically based on down payment, installments, and bank rates.

Seller Dashboard: Tracks individual production metrics (simulations, proposals, finalized contracts).

Module 3: Banking & Support Operations (SUPPORT)
Bank Financing Tables: Manage bank-specific financing rates.

Proposal Submission & Approval: Review proposals and submit them to banking portals for approval. Approving a contract locks the vehicle to SOLD.

Sales Team & User Management: Create Sales Teams, assign Managers, and register new Sellers/Managers with complete profile information.

Commissions & Financial Reports: Define commissions (including dual-payout rules for Manager-Sellers), calculate payouts, and export reports in PDF format.

Support Dashboard: Performance leaderboard for sales teams and individual sellers.

Module 4: Team Leadership & Management (MANAGER)
Dual Capability (Updated): Full access to both Manager oversight tools and Seller operational features (creating customer proposals and closing direct sales).

Team Oversight: Manage assigned sellers, track production, and view team dashboards.

Staff Control: Soft-delete/deactivate sellers without purging historical audit records.

Manager Commission: Earn override percentages on team sales + direct commissions on personal sales.

3. Core Database Entities & Relationships (Updated)
+-----------------------------------+         +-------------------+         +-------------------+
|               USERS               |         |       ROLES       |         |      TEAMS        |
+-----------------------------------+         +-------------------+         +-------------------+
| id                                |         | id                |         | id                |
| full_name                         |         | name              |         | manager_id        |
| email (login)                     |-------->|   [ADMIN, MANAGER,|         +-------------------+
| password_hash                     |         |    SELLER, SUPPORT|                   |
| phone                             |         +-------------------+                   |
| avatar_url                        |                                                 |
| zip_code (cep)                    |-------------------------------------------------+
| street_address                    |
| number                            |
| complement                        |
| neighborhood                      |
| city                              |
| state                             |
| is_active                         |
| first_access                      |
+-----------------------------------+
         |
         v
+------------------+         +-------------------------------+     +-------------------+
|    CUSTOMERS     |         |           VEHICLES            |     |     BENEFITS      |
+------------------+         +-------------------------------+     +-------------------+
| id               |         | id                            |     | id                |
| cpf              |         | brand                         |     | name              |
| current_seller_id|         | model                         |     | description       |
+------------------+         | mfg_year                      |     +-------------------+
         |                   | model_year                    |               |
         |                   | fipe_code                     |               |
         |                   | fipe_price                    |               |
         |                   | suggested_price               |               |
         |                   | min_price                     |               |
         |                   | status (ENUM)                 |               |
         |                   | description                   |               |
         |                   | photo_urls...                 |               |
         |                   | video_url                     |               |
         |                   +-------------------------------+               |
         |                                   |                               |
         +-------------------+---------------+-------------------------------+
                             |
                             v
              +----------------------------------+
              |   SIMULATIONS / PROPOSALS /      |
              |         CONTRACTS                |
              +----------------------------------+
              | id                               |
              | customer_id                      |
              | vehicle_id                       |
              | seller_id (User ID - Seller/Mgr) |
              | status                           |
              | down_payment                     |
              | installments                     |
              | interest_rate                    |
              | total_amount                     |
              | created_at                       |
              +----------------------------------+
4. Implementation Guidelines for AI Code Generation
Role Inheritance (Manager = Seller):

Implement RBAC middleware such that users with role == 'MANAGER' automatically pass permission checks for SELLER endpoints.

JavaScript
const hasAccess = (requiredRole, userRole) => {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'MANAGER' && (requiredRole === 'SELLER' || requiredRole === 'MANAGER')) return true;
  return userRole === requiredRole;
};
User Profile Updates & Preserved History:

Allow ADMIN to update user roles (role_id) dynamically. Ensure that historical records in simulations_proposals maintain the user's ID regardless of subsequent role changes.

Address Lookup Integration:

On the user registration form, integrate an asynchronous CEP fetcher (e.g., ViaCEP API) to automatically autofill street_address, neighborhood, city, and state.

Active Simulation Counter Query:

Calculate active simulations dynamically per vehicle using WHERE vehicle_id = :id AND status IN ('SIMULATION', 'PROPOSAL').

Vehicle Lifecycle Transitions:

Transition vehicle status to IN_NEGOTIATION on first simulation, and to SOLD upon contract finalization. Automatically cancel other pending proposals when marked as SOLD.