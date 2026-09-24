import { useState } from "react";
import { downloadCommissionReport } from "./api/reports";
import { formatWeekRange, getCurrentWeekRange } from "./utils/dateRange";
import { transitionSalesStage, type SalesStage } from "./utils/salesLifecycle";

const currentWeek = getCurrentWeekRange();
const currentWeekLabel = formatWeekRange(currentWeek);
const clientCompany = "VFC Multimarcas";
const currentDateLabel = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
}).format(new Date());
const dashboardPeriodData = {
  [currentWeekLabel]: {
    label: currentWeekLabel,
    sims: { value: "48", delta: "+12,5%", tone: "up" },
    proposals: { value: "26", delta: "+8,3%", tone: "up" },
    contracts: { value: "13", delta: "+18,2%", tone: "up" },
    rejected: { value: "5", delta: "−2,1%", tone: "down" },
    spark: [
      { height: "35%", tone: "blue" },
      { height: "55%", tone: "blue" },
      { height: "43%", tone: "blue" },
      { height: "70%", tone: "purple" },
      { height: "61%", tone: "purple" },
      { height: "88%", tone: "purple" },
      { height: "100%", tone: "green" },
    ],
  },
  "Últimos 30 dias": {
    label: "Últimos 30 dias",
    sims: { value: "164", delta: "+18,7%", tone: "up" },
    proposals: { value: "92", delta: "+11,4%", tone: "up" },
    contracts: { value: "41", delta: "+22,1%", tone: "up" },
    rejected: { value: "16", delta: "−4,8%", tone: "down" },
    spark: [
      { height: "40%", tone: "blue" },
      { height: "60%", tone: "blue" },
      { height: "52%", tone: "blue" },
      { height: "75%", tone: "purple" },
      { height: "66%", tone: "purple" },
      { height: "92%", tone: "purple" },
      { height: "100%", tone: "green" },
    ],
  },
  "Últimos 90 dias": {
    label: "Últimos 90 dias",
    sims: { value: "512", delta: "+26,4%", tone: "up" },
    proposals: { value: "286", delta: "+17,9%", tone: "up" },
    contracts: { value: "127", delta: "+28,5%", tone: "up" },
    rejected: { value: "38", delta: "−6,2%", tone: "down" },
    spark: [
      { height: "46%", tone: "blue" },
      { height: "63%", tone: "blue" },
      { height: "58%", tone: "blue" },
      { height: "78%", tone: "purple" },
      { height: "71%", tone: "purple" },
      { height: "95%", tone: "purple" },
      { height: "100%", tone: "green" },
    ],
  },
  "Período personalizado": {
    label: "Período personalizado",
    sims: { value: "48", delta: "+12,5%", tone: "up" },
    proposals: { value: "26", delta: "+8,3%", tone: "up" },
    contracts: { value: "13", delta: "+18,2%", tone: "up" },
    rejected: { value: "5", delta: "−2,1%", tone: "down" },
    spark: [
      { height: "35%", tone: "blue" },
      { height: "55%", tone: "blue" },
      { height: "43%", tone: "blue" },
      { height: "70%", tone: "purple" },
      { height: "61%", tone: "purple" },
      { height: "88%", tone: "purple" },
      { height: "100%", tone: "green" },
    ],
  },
};

type IconName =
  | "home"
  | "proposal"
  | "contract"
  | "users"
  | "car"
  | "percent"
  | "gift"
  | "chart"
  | "settings"
  | "search"
  | "bell"
  | "calendar"
  | "arrow"
  | "plus"
  | "more"
  | "trend"
  | "file"
  | "check"
  | "close"
  | "play"
  | "menu";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 10.8 12 3l9 7.8"/><path d="M5 9.8V21h14V9.8M9 21v-7h6v7"/></>,
  proposal: <><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
  contract: <><path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 13h8M8 17h5"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V20M16 4.8a3 3 0 0 1 0 5.7M17 13.2a4.8 4.8 0 0 1 3.5 4.6V20"/></>,
  car: <><path d="m3 15 1.7-5.2A2.6 2.6 0 0 1 7.2 8h9.6a2.6 2.6 0 0 1 2.5 1.8L21 15"/><path d="M4 14h16a2 2 0 0 1 2 2v3H2v-3a2 2 0 0 1 2-2ZM5 19v2M19 19v2M6 16h2M16 16h2"/></>,
  percent: <><circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="17" r="2.2"/><path d="m19 5-14 14"/></>,
  gift: <><path d="M3 10h18v11H3zM2 6h20v4H2zM12 6v15"/><path d="M12 6H8.5a2.5 2.5 0 1 1 0-5C11 1 12 6 12 6ZM12 6h3.5a2.5 2.5 0 1 0 0-5C13 1 12 6 12 6Z"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  arrow: <><path d="m9 18 6-6-6-6"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  trend: <><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></>,
  file: <><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  play: <path d="m8 5 11 7-11 7Z"/>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const navGroups = [
  {
    label: "VISÃO GERAL",
    items: [{ label: "Dashboard", icon: "home" as IconName }],
  },
  {
    label: "COMERCIAL",
    items: [
      { label: "Simulações", icon: "proposal" as IconName, badge: "12" },
      { label: "Propostas", icon: "file" as IconName, badge: "8" },
      { label: "Contratos", icon: "contract" as IconName },
      { label: "Clientes", icon: "users" as IconName },
      { label: "Classificados", icon: "car" as IconName },
    ],
  },
  {
    label: "CADASTROS",
    items: [
      { label: "Veículos", icon: "car" as IconName },
      { label: "Taxas e tabelas", icon: "percent" as IconName },
      { label: "Benefícios", icon: "gift" as IconName },
      { label: "Usuários e perfis", icon: "users" as IconName },
    ],
  },
  {
    label: "GESTÃO",
    items: [
      { label: "Painel do gerente", icon: "home" as IconName },
      { label: "Minha equipe", icon: "users" as IconName },
      { label: "Aprovações e documentos", icon: "file" as IconName },
      { label: "Painel de suporte", icon: "trend" as IconName },
      { label: "Entrega e pós-venda", icon: "car" as IconName },
      { label: "Garantia e pós-venda", icon: "gift" as IconName },
      { label: "CRM pós-venda", icon: "users" as IconName },
      { label: "Equipes e comissões", icon: "chart" as IconName },
      { label: "Sistema financeiro", icon: "percent" as IconName },
      { label: "Relatórios", icon: "file" as IconName },
      { label: "Configurações", icon: "settings" as IconName },
    ],
  },
];

const activities = [
  { initials: "MC", tone: "blue", name: "Marcos Costa", action: "criou uma nova proposta", item: "#PROP-2025-0842", time: "Há 8 min" },
  { initials: "AS", tone: "purple", name: "Amanda Silva", action: "efetivou o contrato", item: "#CONT-2025-0318", time: "Há 24 min" },
  { initials: "RL", tone: "orange", name: "Rafael Lima", action: "enviou para análise", item: "#PROP-2025-0841", time: "Há 46 min" },
  { initials: "JC", tone: "green", name: "Juliana Castro", action: "cadastrou um cliente", item: "Henrique Alves", time: "Há 1h" },
];

const proposals = [
  { id: "#0842", client: "Ricardo Nunes", car: "Jeep Compass Limited", seller: "Marcos Costa", value: "R$ 168.900", status: "Em análise", tone: "yellow" },
  { id: "#0841", client: "Camila Rocha", car: "Toyota Corolla XEi", seller: "Rafael Lima", value: "R$ 142.500", status: "Aguardando", tone: "blue" },
  { id: "#0840", client: "Henrique Alves", car: "VW T-Cross Highline", seller: "Juliana Castro", value: "R$ 134.900", status: "Aprovada", tone: "green" },
  { id: "#0839", client: "Fernanda Dias", car: "Honda HR-V Touring", seller: "Amanda Silva", value: "R$ 176.200", status: "Recusada", tone: "red" },
];

type AuthMode = "login" | "forgot" | "change";

type CustomerHistoryEntry = {
  date: string;
  title: string;
  detail: string;
  tone: string;
  icon: IconName;
};

function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("admin@proposta.com.br");
  const [password, setPassword] = useState("Proposta123");
  const [notice, setNotice] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setNotice("");
    if (mode === "forgot") {
      setNotice("Link de recuperação enviado. Verifique sua caixa de entrada.");
      return;
    }
    if (mode === "change") {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) {
        setNotice("Use ao menos 8 caracteres, com maiúscula, minúscula e número.");
        return;
      }
      onAuthenticated();
      return;
    }
    if (!email.includes("@") || password.length < 8) {
      setNotice("Informe um e-mail válido e uma senha com pelo menos 8 caracteres.");
      return;
    }
    setMode("change");
    setPassword("");
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark"><span /><span /><span /></div>
        <div className="brand-wordmark"><strong>VFC</strong><small>Multimarcas</small></div>
      </div>
      <div className="auth-visual">
        <div className="auth-visual-copy">
          <span className="eyebrow">GESTÃO DE VENDAS AUTOMOTIVAS</span>
          <h1>Do lead ao contrato, <em>tudo em um só lugar.</em></h1>
          <p>Centralize propostas, clientes, estoque e comissões em uma operação mais rápida, segura e preparada para crescer.</p>
          <div className="auth-features">
            <span><Icon name="check" size={15}/> Fluxo de vendas inteligente</span>
            <span><Icon name="check" size={15}/> Operação centralizada</span>
            <span><Icon name="check" size={15}/> Dados protegidos</span>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <form className="auth-card" onSubmit={submit}>
          {mode === "login" && <>
            <span className="auth-kicker">BEM-VINDO DE VOLTA</span>
            <h2>Acesse o painel comercial</h2>
            <p>Entre com suas credenciais para continuar a operação.</p>
            <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com.br"/></label>
            <label>Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha"/></label>
            <button type="button" className="forgot-link" onClick={() => { setMode("forgot"); setNotice(""); }}>Esqueci minha senha</button>
            <button className="auth-submit" type="submit">Entrar <Icon name="arrow" size={16}/></button>
            <div className="demo-access"><strong>Demonstração ativa</strong><span>admin@proposta.com.br · Proposta123</span></div>
          </>}
          {mode === "forgot" && <>
            <button type="button" className="auth-back" onClick={() => { setMode("login"); setNotice(""); }}>‹ Voltar para o login</button>
            <div className="auth-symbol"><Icon name="file" size={25}/></div>
            <h2>Recupere sua senha</h2>
            <p>Enviaremos um link seguro para você criar uma nova senha.</p>
            <label>E-mail cadastrado<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com.br"/></label>
            <button className="auth-submit" type="submit">Enviar link de recuperação</button>
          </>}
          {mode === "change" && <>
            <div className="auth-symbol"><Icon name="settings" size={25}/></div>
            <span className="auth-kicker">PRIMEIRO ACESSO</span>
            <h2>Crie sua senha definitiva</h2>
            <p>Por segurança, substitua a senha temporária antes de continuar.</p>
            <label>Nova senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite uma senha segura"/></label>
            <div className="password-rules"><span className={password.length >= 8 ? "valid" : ""}>8+ caracteres</span><span className={/[A-Z]/.test(password) ? "valid" : ""}>Uma maiúscula</span><span className={/[a-z]/.test(password) ? "valid" : ""}>Uma minúscula</span><span className={/\d/.test(password) ? "valid" : ""}>Um número</span></div>
            <button className="auth-submit" type="submit">Salvar nova senha</button>
          </>}
          {notice && <div className={`auth-notice ${notice.startsWith("Link") ? "success" : ""}`}>{notice}</div>}
        </form>
        <span className="auth-footer">© 2025 {clientCompany} · Segurança, produtividade e confiança</span>
      </div>
    </div>
  );
}

const moduleData: Record<string, { title: string; subtitle: string; action: string; columns: string[]; rows: string[][] }> = {
  "Usuários e perfis": {
    title: "Usuários e perfis", subtitle: "Gerencie acessos, funções e status dos colaboradores.", action: "Novo usuário",
    columns: ["USUÁRIO", "E-MAIL", "PERFIL", "STATUS", "ÚLTIMO ACESSO"],
    rows: [["Marcos Costa", "marcos@proposta.com.br", "Vendedor", "Ativo", "Hoje, 09:42"], ["Amanda Silva", "amanda@proposta.com.br", "Gerente", "Ativo", "Hoje, 08:15"], ["Rafael Lima", "rafael@proposta.com.br", "Vendedor", "Ativo", "Ontem, 17:38"], ["Beatriz Souza", "beatriz@proposta.com.br", "Suporte", "Inativo", "02 jun, 14:10"]],
  },
  "Veículos": {
    title: "Estoque de veículos", subtitle: "Consulte a FIPE e acompanhe a disponibilidade do estoque.", action: "Cadastrar veículo",
    columns: ["VEÍCULO", "PLACA", "ANO", "VALOR DE VENDA", "VALOR FIPE", "STATUS"],
    rows: [["Jeep Compass Limited", "RZY-4J82", "2024/2025", "R$ 168.900", "R$ 163.420", "Disponível"], ["Toyota Corolla XEi", "GHT-8A11", "2023/2024", "R$ 142.500", "R$ 139.870", "Reservado"], ["VW T-Cross Highline", "KLP-2D67", "2024/2024", "R$ 134.900", "R$ 132.110", "Disponível"], ["Honda HR-V Touring", "BRA-9F21", "2024/2025", "R$ 176.200", "R$ 171.800", "Vendido"]],
  },
  "Taxas e tabelas": {
    title: "Taxas e tabelas", subtitle: "Configure as condições de financiamento utilizadas nas propostas.", action: "Nova tabela",
    columns: ["TABELA", "INSTITUIÇÃO", "PRAZO", "TAXA AO MÊS", "VIGÊNCIA", "STATUS"],
    rows: [["Padrão veículos novos", "Banco Alfa", "12 a 48x", "1,39% a.m.", "Até 30/06/2025", "Ativa"], ["Seminovos premium", "Banco Capital", "24 a 60x", "1,59% a.m.", "Até 15/07/2025", "Ativa"], ["Campanha Junho", "Banco União", "24 a 36x", "0,99% a.m.", "Até 30/06/2025", "Ativa"]],
  },
  "Benefícios": {
    title: "Benefícios do contrato", subtitle: "Defina as vantagens que podem ser incluídas nas negociações.", action: "Novo benefício",
    columns: ["BENEFÍCIO", "DESCRIÇÃO", "CUSTO ESTIMADO", "DISPONIBILIDADE"],
    rows: [["IPVA pago", "IPVA do ano vigente integralmente quitado", "R$ 2.800", "Disponível"], ["Tanque cheio", "Entrega do veículo com tanque completo", "R$ 360", "Disponível"], ["Transferência", "Taxas e serviço de transferência inclusos", "R$ 540", "Disponível"], ["Seguro 3 meses", "Cobertura básica por noventa dias", "R$ 1.250", "Indisponível"]],
  },
};

function UsersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [userStatus, setUserStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState({ street: "", neighborhood: "", city: "", state: "" });
  const [cepStatus, setCepStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "SELLER",
    active: true,
  });
  const [users, setUsers] = useState([
    { id: 1, initials: "MC", name: "Marcos Costa", email: "marcos@proposta.com.br", phone: "(11) 98722-1840", role: "SELLER", active: true },
    { id: 2, initials: "AS", name: "Amanda Silva", email: "amanda@proposta.com.br", phone: "(11) 99188-4201", role: "MANAGER", active: true },
    { id: 3, initials: "RL", name: "Rafael Lima", email: "rafael@proposta.com.br", phone: "(11) 99854-1770", role: "SELLER", active: true },
    { id: 4, initials: "BS", name: "Beatriz Souza", email: "beatriz@proposta.com.br", phone: "(11) 98231-9802", role: "SUPPORT", active: false },
  ]);

  const filteredUsers = users.filter((user) => {
    const matchesQuery = `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(userQuery.toLowerCase());
    const matchesStatus = userStatus === "ALL" || (userStatus === "ACTIVE" ? user.active : !user.active);
    return matchesQuery && matchesStatus;
  });

  const lookupCep = async () => {
    const normalized = cep.replace(/\D/g, "");
    if (normalized.length !== 8) {
      setCepStatus("Informe um CEP com 8 dígitos.");
      return;
    }
    setCepStatus("Consultando CEP...");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`);
      const result = await response.json();
      if (result.erro) throw new Error();
      setAddress({ street: result.logradouro, neighborhood: result.bairro, city: result.localidade, state: result.uf });
      setCepStatus("Endereço preenchido pela ViaCEP.");
    } catch {
      setCepStatus("CEP não encontrado. Preencha o endereço manualmente.");
    }
  };

  const openForm = (user?: typeof users[number]) => {
    setEditingUserId(user ? user.id : null);
    setForm({
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "SELLER",
      active: user?.active ?? true,
    });
    setCep("");
    setAddress({ street: "", neighborhood: "", city: "", state: "" });
    setCepStatus("");
    setShowForm(true);
  };

  const saveUser = (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = form.name.trim();
    const nextEmail = form.email.trim();
    if (!nextName || !nextEmail) return;

    if (editingUserId === null) {
      const nextId = Math.max(0, ...users.map((user) => user.id)) + 1;
      const initials = nextName.split(" ").slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
      setUsers((current) => [{ id: nextId, initials, name: nextName, email: nextEmail, phone: form.phone, role: form.role, active: form.active }, ...current]);
    } else {
      setUsers((current) => current.map((user) => user.id === editingUserId ? { ...user, name: nextName, email: nextEmail, phone: form.phone, role: form.role, active: form.active, initials: nextName.split(" ").slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") } : user));
    }

    setShowForm(false);
  };

  const toggleUserStatus = (id: number) => {
    setUsers((current) => current.map((user) => user.id === id ? { ...user, active: !user.active } : user));
  };

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>ADMINISTRAÇÃO E ACESSOS</p><h1>Usuários e perfis</h1><span>Gerencie dados pessoais, funções e acessos dos colaboradores.</span></div><button className="primary-button" onClick={() => openForm()}><Icon name="plus" size={18}/>Novo usuário</button></section>
      <section className="module-summary"><div><span>Usuários ativos</span><strong>{users.filter((user) => user.active).length}</strong></div><div><span>Gerentes-vendedores</span><strong>{users.filter((user) => user.role === "MANAGER").length}</strong></div><div><span>Acessos desativados</span><strong>{users.filter((user) => !user.active).length}</strong></div></section>
      <section className="panel module-table">
        <div className="module-toolbar">
          <div className="search-box"><Icon name="search" size={17}/><input value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="Buscar usuário, e-mail ou perfil..."/></div>
          <select value={userStatus} onChange={(event) => setUserStatus(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")} className="status-filter-select">
            <option value="ALL">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
        <div className="table-wrap"><table><thead><tr><th>USUÁRIO</th><th>CONTATO</th><th>PERFIL</th><th>STATUS</th><th>ACESSOS HERDADOS</th><th>AÇÃO</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id}><td><div className="seller-cell"><div className="mini-avatar blue">{user.initials}</div><div><strong>{user.name}</strong><small className="table-subcopy">{user.email}</small></div></div></td><td>{user.phone}</td><td><span className="role-pill">{user.role}</span></td><td><span className={`status ${user.active ? "green" : "red"}`}>{user.active ? "Ativo" : "Inativo"}</span></td><td>{user.role === "MANAGER" ? <span className="inheritance-pill">MANAGER + SELLER</span> : "—"}</td><td><div className="row-actions"><button className="edit-link" onClick={() => openForm(user)}>Editar</button><button className="row-status-toggle" onClick={() => toggleUserStatus(user.id)}>{user.active ? "Desativar" : "Ativar"}</button></div></td></tr>)}</tbody></table></div>
      </section>
      {showForm && <div className="page-form-layer"><form onSubmit={saveUser} className="modal-card wide-modal user-modal page-form-card">
        <button type="button" className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para usuários</button>
        <div className="modal-title"><div><span>{editingUserId === null ? "NOVO USUÁRIO" : "EDIÇÃO DE USUÁRIO"}</span><h2>{editingUserId === null ? "Cadastrar colaborador" : form.name || "Editar colaborador"}</h2><p>Preencha os dados de identificação, acesso e endereço do colaborador.</p></div></div>
        <div className="profile-upload"><label><input type="file" accept="image/*"/><span><Icon name="plus" size={17}/></span></label><div><strong>Foto de perfil</strong><small>JPG ou PNG · máximo de 5 MB</small></div></div>
        <div className="form-section-title">Identificação e acesso</div>
        <div className="modal-row"><label>Nome completo<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome e sobrenome"/></label><label>Telefone / WhatsApp<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="(00) 00000-0000"/></label></div>
        <div className="modal-row"><label>E-mail de acesso<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="usuario@empresa.com.br"/></label><label>Perfil<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}><option value="ADMIN">ADMIN</option><option value="MANAGER">MANAGER</option><option value="SELLER">SELLER</option><option value="SUPPORT">SUPPORT</option></select></label></div>
        <div className="role-inheritance-note"><Icon name="users" size={17}/><span>O perfil <strong>MANAGER</strong> herda automaticamente todos os acessos operacionais de <strong>SELLER</strong>.</span></div>
        <div className="form-section-title">Endereço completo</div>
        <div className="cep-row"><label>CEP<input value={cep} onChange={(event) => setCep(event.target.value)} onBlur={lookupCep} placeholder="00000-000"/></label><button type="button" onClick={lookupCep}><Icon name="search" size={15}/>Buscar CEP</button><span>{cepStatus}</span></div>
        <div className="modal-row address-main"><label>Logradouro<input value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })}/></label><label>Número<input placeholder="Nº"/></label></div>
        <div className="modal-row"><label>Complemento<input placeholder="Apto, bloco ou referência"/></label><label>Bairro<input value={address.neighborhood} onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })}/></label></div>
        <div className="modal-row city-row"><label>Cidade<input value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })}/></label><label>Estado<input value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })}/></label></div>
        <div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" className="primary-button">{editingUserId === null ? "Cadastrar e enviar acesso" : "Salvar alterações"}</button></div>
      </form></div>}
    </div>
  );
}

type VehicleStatus = "AVAILABLE" | "IN_NEGOTIATION" | "SOLD";

type VehicleRecord = {
  id: number;
  name: string;
  detail: string;
  years: string;
  fipe: string;
  suggested: string;
  minimum: string;
  status: VehicleStatus;
  simulations: number;
};

function VehiclesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [form, setForm] = useState({
    name: "",
    detail: "",
    years: "",
    fipe: "",
    suggested: "",
    minimum: "",
    status: "AVAILABLE" as VehicleStatus,
    simulations: 0,
  });
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([
    { id: 1, name: "Jeep Compass Limited", detail: "RZY-4J82 · Flex · Automático", years: "2024 / 2025", fipe: "R$ 163.420", suggested: "R$ 168.900", minimum: "R$ 160.000", status: "IN_NEGOTIATION", simulations: 4 },
    { id: 2, name: "VW T-Cross Highline", detail: "KLP-2D67 · Flex · Automático", years: "2024 / 2024", fipe: "R$ 132.110", suggested: "R$ 134.900", minimum: "R$ 128.500", status: "AVAILABLE", simulations: 0 },
    { id: 3, name: "Hyundai Creta Platinum", detail: "EJM-7K31 · Flex · Automático", years: "2023 / 2024", fipe: "R$ 96.870", suggested: "R$ 98.500", minimum: "R$ 93.000", status: "IN_NEGOTIATION", simulations: 2 },
    { id: 4, name: "Honda HR-V Touring", detail: "BRA-9F21 · Gasolina · Automático", years: "2024 / 2025", fipe: "R$ 171.800", suggested: "R$ 176.200", minimum: "R$ 168.000", status: "SOLD", simulations: 0 },
  ]);

  const statusLabel = { AVAILABLE: "Disponível", IN_NEGOTIATION: "Em negociação", SOLD: "Vendido" };

  const visible = vehicles.filter((vehicle) => {
    const matchesFilter = statusFilter === "ALL" || vehicle.status === statusFilter;
    const matchesQuery = `${vehicle.name} ${vehicle.detail} ${vehicle.years}`.toLowerCase().includes(vehicleQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const openForm = (vehicle?: VehicleRecord) => {
    setEditingVehicleId(vehicle ? vehicle.id : null);
    setForm({
      name: vehicle?.name ?? "",
      detail: vehicle?.detail ?? "",
      years: vehicle?.years ?? "",
      fipe: vehicle?.fipe ?? "",
      suggested: vehicle?.suggested ?? "",
      minimum: vehicle?.minimum ?? "",
      status: vehicle?.status ?? "AVAILABLE",
      simulations: vehicle?.simulations ?? 0,
    });
    setShowForm(true);
  };

  const saveVehicle = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.suggested.trim()) return;

    if (editingVehicleId === null) {
      const nextId = Math.max(0, ...vehicles.map((vehicle) => vehicle.id)) + 1;
      setVehicles((current) => [{
        id: nextId,
        name: form.name.trim(),
        detail: form.detail.trim() || "Placa não informada · Flex · Automático",
        years: form.years.trim() || "2024 / 2025",
        fipe: form.fipe.trim() || "R$ 0,00",
        suggested: form.suggested.trim(),
        minimum: form.minimum.trim() || form.suggested.trim(),
        status: form.status,
        simulations: form.simulations,
      }, ...current]);
    } else {
      setVehicles((current) => current.map((vehicle) => vehicle.id === editingVehicleId ? {
        ...vehicle,
        name: form.name.trim(),
        detail: form.detail.trim() || vehicle.detail,
        years: form.years.trim() || vehicle.years,
        fipe: form.fipe.trim() || vehicle.fipe,
        suggested: form.suggested.trim() || vehicle.suggested,
        minimum: form.minimum.trim() || vehicle.minimum,
        status: form.status,
        simulations: Number(form.simulations) || vehicle.simulations,
      } : vehicle));
    }

    setShowForm(false);
  };

  const toggleVehicleStatus = (id: number) => {
    setVehicles((current) => current.map((vehicle) => {
      if (vehicle.id !== id) return vehicle;
      const nextStatus: VehicleStatus = vehicle.status === "AVAILABLE" ? "IN_NEGOTIATION" : vehicle.status === "IN_NEGOTIATION" ? "AVAILABLE" : "AVAILABLE";
      return { ...vehicle, status: nextStatus };
    }));
  };

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>GESTÃO DE ESTOQUE</p><h1>Veículos</h1><span>Controle preços, mídia e disponibilidade do estoque.</span></div><button className="primary-button" onClick={() => openForm()}><Icon name="plus" size={18}/>Cadastrar veículo</button></section>
      <section className="module-summary"><div><span>Disponíveis</span><strong>{vehicles.filter((vehicle) => vehicle.status === "AVAILABLE").length}</strong></div><div><span>Em negociação</span><strong>{vehicles.filter((vehicle) => vehicle.status === "IN_NEGOTIATION").length}</strong></div><div><span>Vendidos no mês</span><strong>{vehicles.filter((vehicle) => vehicle.status === "SOLD").length}</strong></div></section>
      <section className="panel module-table">
        <div className="module-toolbar vehicle-toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={vehicleQuery} onChange={(event) => setVehicleQuery(event.target.value)} placeholder="Buscar marca, modelo ou placa..."/></div><div className="filter-fields"><select><option>Todos os anos</option><option>2025</option><option>2024</option><option>2023</option></select><select><option>Todas as marcas</option><option>Jeep</option><option>Volkswagen</option><option>Hyundai</option></select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">Todos os status</option><option value="AVAILABLE">Disponível</option><option value="IN_NEGOTIATION">Em negociação</option><option value="SOLD">Vendido</option></select></div></div>
        <div className="table-wrap"><table><thead><tr><th>VEÍCULO</th><th>ANO FAB. / MOD.</th><th>VALOR FIPE</th><th>PREÇO SUGERIDO</th><th>PREÇO MÍNIMO</th><th>SIMULAÇÕES ATIVAS</th><th>STATUS</th><th>AÇÃO</th></tr></thead><tbody>{visible.map((vehicle) => <tr key={vehicle.id}><td><div className="vehicle-cell"><div><Icon name="car" size={20}/></div><span><strong>{vehicle.name}</strong><small>{vehicle.detail}</small></span></div></td><td>{vehicle.years}</td><td>{vehicle.fipe}</td><td><strong>{vehicle.suggested}</strong></td><td>{vehicle.minimum}</td><td><span className={`simulation-count ${vehicle.simulations ? "has-count" : ""}`}>{vehicle.simulations}</span></td><td><span className={`status ${vehicle.status === "AVAILABLE" ? "green" : vehicle.status === "SOLD" ? "red" : "yellow"}`}>{statusLabel[vehicle.status]}</span></td><td><div className="row-actions"><button className="edit-link" onClick={() => openForm(vehicle)}>Editar</button><button className="row-status-toggle" onClick={() => toggleVehicleStatus(vehicle.id)}>{vehicle.status === "AVAILABLE" ? "Reservar" : "Disponibilizar"}</button></div></td></tr>)}</tbody></table></div>
      </section>
      {showForm && <div className="page-form-layer"><form onSubmit={saveVehicle} className="modal-card wide-modal vehicle-modal page-form-card">
        <button type="button" className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para veículos</button>
        <div className="modal-title"><div><span>{editingVehicleId === null ? "NOVO ITEM DO ESTOQUE" : "EDIÇÃO DE VEÍCULO"}</span><h2>{editingVehicleId === null ? "Cadastrar veículo" : form.name || "Editar veículo"}</h2><p>Adicione ou atualize os dados, valores e arquivos de mídia do veículo.</p></div></div>
        <div className="form-section-title">Identificação</div>
        <div className="modal-row"><label>Marca/Modelo<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ex.: Jeep Compass Limited"/></label><label>Detalhes<input value={form.detail} onChange={(event) => setForm((current) => ({ ...current, detail: event.target.value }))} placeholder="Ex.: RZY-4J82 · Flex · Automático"/></label></div>
        <div className="modal-row"><label>Ano de fabricação / modelo<input value={form.years} onChange={(event) => setForm((current) => ({ ...current, years: event.target.value }))} placeholder="2024 / 2025"/></label><label>Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as VehicleStatus }))}><option value="AVAILABLE">Disponível</option><option value="IN_NEGOTIATION">Em negociação</option><option value="SOLD">Vendido</option></select></label></div>
        <div className="form-section-title">Precificação</div>
        <div className="pricing-grid"><label>Valor FIPE<input value={form.fipe} onChange={(event) => setForm((current) => ({ ...current, fipe: event.target.value }))} placeholder="R$ 0,00"/></label><label>Preço sugerido<input value={form.suggested} onChange={(event) => setForm((current) => ({ ...current, suggested: event.target.value }))} placeholder="R$ 0,00"/></label><label>Preço mínimo<input value={form.minimum} onChange={(event) => setForm((current) => ({ ...current, minimum: event.target.value }))} placeholder="R$ 0,00"/></label></div>
        <div className="form-section-title">Simulações</div>
        <div className="modal-row"><label>Simulações ativas<input type="number" min={0} value={form.simulations} onChange={(event) => setForm((current) => ({ ...current, simulations: Number(event.target.value) }))} placeholder="0"/></label></div>
        <div className="form-section-title">Fotos e vídeo</div>
        <div className="media-grid">{["Frente", "Lateral direita", "Lateral esquerda", "Traseira", "Interior"].map((label) => <label key={label}><input type="file" accept="image/*"/><Icon name="plus" size={18}/><span>{label}</span></label>)}<label className="video-upload"><input type="file" accept="video/*"/><Icon name="plus" size={18}/><span>Vídeo · máx. 1 min</span></label></div>
        <div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" className="primary-button">{editingVehicleId === null ? "Cadastrar veículo" : "Salvar alterações"}</button></div>
      </form></div>}
    </div>
  );
}

function ModulePage({ name }: { name: string }) {
  const data = moduleData[name] ?? {
    title: name, subtitle: "Consulte e gerencie os registros deste módulo.", action: `Novo registro`,
    columns: ["REGISTRO", "RESPONSÁVEL", "DATA", "VALOR", "STATUS"],
    rows: proposals.map((p) => [p.id, p.client, p.seller, p.value, p.status]),
  };
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const visibleRows = data.rows.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="content module-content">
      <section className="module-heading">
        <div><p>ADMINISTRAÇÃO</p><h1>{data.title}</h1><span>{data.subtitle}</span></div>
        <button className="primary-button" onClick={() => setShowForm(true)}><Icon name="plus" size={18}/>{data.action}</button>
      </section>
      <section className="module-summary">
        <div><span>Total de registros</span><strong>{data.rows.length}</strong></div>
        <div><span>Ativos / disponíveis</span><strong>{Math.max(data.rows.length - 1, 1)}</strong></div>
        <div><span>Atualizados esta semana</span><strong>{Math.min(data.rows.length, 3)}</strong></div>
      </section>
      <section className="panel module-table">
        <div className="module-toolbar">
          <div className="search-box"><Icon name="search" size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar registros..."/></div>
          <button><Icon name="settings" size={16}/> Filtros</button>
        </div>
        <div className="table-wrap"><table><thead><tr>{data.columns.map((column) => <th key={column}>{column}</th>)}<th></th></tr></thead>
          <tbody>{visibleRows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`}>{row.map((cell, index) => <td key={cell}><span className={index === row.length - 1 ? `status ${cell.includes("Inativ") || cell.includes("Indis") || cell === "Vendido" || cell === "Recusada" ? "red" : cell === "Reservado" || cell === "Aguardando" ? "yellow" : "green"}` : ""}>{cell}</span></td>)}<td><button className="row-more"><Icon name="more" size={18}/></button></td></tr>)}</tbody>
        </table></div>
      </section>
      {showForm && <div className="page-form-layer"><div className="modal-card page-form-card">
        <button className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para {data.title.toLowerCase()}</button>
        <div className="modal-title"><div><span>NOVO CADASTRO</span><h2>{data.action}</h2><p>Preencha as informações abaixo para concluir o cadastro.</p></div></div>
        <label>Nome ou identificação<input autoFocus placeholder="Digite a identificação"/></label>
        <div className="modal-row"><label>Categoria<select><option>Selecione uma opção</option><option>Ativo</option></select></label><label>Status<select><option>Ativo</option><option>Inativo</option></select></label></div>
        <label>Observações<textarea placeholder="Informações adicionais"/></label>
        <div className="modal-actions"><button onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" onClick={() => setShowForm(false)}>Salvar cadastro</button></div>
      </div></div>}
    </div>
  );
}

function CustomersPage({ customerHistoryMap, onAddCustomerHistory }: { customerHistoryMap: Record<number, CustomerHistoryEntry[]>; onAddCustomerHistory: (customerName: string, title: string, detail: string, tone?: string, icon?: IconName) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [cpf, setCpf] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerStatus, setCustomerStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [customerCep, setCustomerCep] = useState("");
  const [customerAddress, setCustomerAddress] = useState({ street: "", neighborhood: "", city: "", state: "" });
  const [customerCepStatus, setCustomerCepStatus] = useState("");
  const [creditResult, setCreditResult] = useState<"idle" | "loading" | "approved">("idle");
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    income: "R$ 0,00",
    seller: "Marcos Costa",
    status: "Em atendimento",
    active: true,
  });
  const [customers, setCustomers] = useState([
    { id: 1, name: "Henrique Alves", cpf: "123.456.789-10", email: "henrique@email.com", phone: "(11) 98722-1840", income: "R$ 12.500", seller: "Juliana Castro", status: "Em atendimento", active: true },
    { id: 2, name: "Camila Rocha", cpf: "298.441.720-09", email: "camila@email.com", phone: "(11) 99134-5531", income: "R$ 18.900", seller: "Rafael Lima", status: "Em proposta", active: true },
    { id: 3, name: "Ricardo Nunes", cpf: "442.807.116-34", email: "ricardo@email.com", phone: "(11) 98802-4260", income: "R$ 9.800", seller: "Marcos Costa", status: "Em simulação", active: true },
    { id: 4, name: "Fernanda Dias", cpf: "856.412.339-21", email: "fernanda@email.com", phone: "(11) 99910-9472", income: "R$ 21.300", seller: "Amanda Silva", status: "Inativo", active: false },
  ]);

  const filteredCustomers = customers.filter((customer) => {
    const matchesQuery = `${customer.name} ${customer.cpf} ${customer.seller}`.toLowerCase().includes(customerQuery.toLowerCase());
    const matchesStatus = customerStatus === "ALL" || (customerStatus === "ACTIVE" ? customer.active : !customer.active);
    return matchesQuery && matchesStatus;
  });

  const checkCredit = () => {
    setCreditResult("loading");
    window.setTimeout(() => setCreditResult("approved"), 700);
  };
  const openCustomerForm = (customer?: typeof customers[number]) => {
    setEditingCustomerId(customer ? customer.id : null);
    setForm({
      name: customer?.name ?? "",
      cpf: customer?.cpf ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      income: customer?.income ?? "R$ 0,00",
      seller: customer?.seller ?? "Marcos Costa",
      status: customer?.status ?? "Em atendimento",
      active: customer?.active ?? true,
    });
    setCpf(customer?.cpf ?? "");
    setCustomerCep(customer ? "01310-100" : "");
    setCustomerAddress(customer ? { street: "Avenida Paulista", neighborhood: "Bela Vista", city: "São Paulo", state: "SP" } : { street: "", neighborhood: "", city: "", state: "" });
    setCustomerCepStatus("");
    setCreditResult("idle");
    setShowForm(true);
  };

  const saveCustomer = (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = form.name.trim();
    const nextCpf = form.cpf.trim();
    if (!nextName || !nextCpf) return;

    if (editingCustomerId === null) {
      const nextId = Math.max(0, ...customers.map((customer) => customer.id)) + 1;
      setCustomers((current) => [{ id: nextId, name: nextName, cpf: nextCpf, email: form.email, phone: form.phone, income: form.income, seller: form.seller, status: form.status, active: form.active }, ...current]);
    } else {
      setCustomers((current) => current.map((customer) => customer.id === editingCustomerId ? { ...customer, name: nextName, cpf: nextCpf, email: form.email, phone: form.phone, income: form.income, seller: form.seller, status: form.status, active: form.active } : customer));
    }

    setShowForm(false);
  };

  const toggleCustomerStatus = (id: number) => {
    setCustomers((current) => current.map((customer) => customer.id === id ? { ...customer, active: !customer.active, status: customer.active ? "Inativo" : "Em atendimento" } : customer));
  };

  const lookupCustomerCep = async () => {
    const normalized = customerCep.replace(/\D/g, "");
    if (normalized.length !== 8) {
      setCustomerCepStatus("Informe um CEP com 8 dígitos.");
      return;
    }
    setCustomerCepStatus("Consultando ViaCEP...");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`);
      const result = await response.json();
      if (result.erro) throw new Error();
      setCustomerAddress({ street: result.logradouro, neighborhood: result.bairro, city: result.localidade, state: result.uf });
      setCustomerCepStatus("Endereço encontrado e preenchido.");
    } catch {
      setCustomerCepStatus("CEP não encontrado. Preencha o endereço manualmente.");
    }
  };
  const customerHistory = customerHistoryMap[editingCustomerId ?? 0] ?? [
    { date: "12/06/2025 · 14:32", title: "Simulação realizada", detail: "Jeep Compass Limited · Entrada de R$ 50.000 · 48 parcelas", tone: "blue", icon: "proposal" as IconName },
    { date: "10/06/2025 · 09:18", title: "Consulta de crédito", detail: "Score 782 · Risco baixo · Cliente sem restrições ativas", tone: "green", icon: "search" as IconName },
    { date: "22/03/2024 · 16:45", title: "Veículo adquirido", detail: "Honda City EXL 2023 · Contrato #CONT-2024-0148", tone: "purple", icon: "car" as IconName },
    { date: "18/03/2024 · 11:20", title: "Contrato de recuperação de crédito", detail: "Acordo concluído e baixado em 02/04/2024", tone: "orange", icon: "contract" as IconName },
  ];

  return (
    <div className="content module-content">
      <section className="module-heading">
        <div><p>OPERAÇÃO COMERCIAL</p><h1>Clientes</h1><span>Cadastre clientes e acompanhe o responsável por cada atendimento.</span></div>
        <button className="primary-button" onClick={() => openCustomerForm()}><Icon name="plus" size={18}/>Novo cliente</button>
      </section>
      <section className="module-summary">
        <div><span>Clientes ativos</span><strong>{customers.filter((customer) => customer.active).length}</strong></div><div><span>Novos esta semana</span><strong>12</strong></div><div><span>Em negociação</span><strong>{customers.filter((customer) => customer.status !== "Inativo").length}</strong></div>
      </section>
      <section className="panel module-table">
        <div className="module-toolbar">
          <div className="search-box"><Icon name="search" size={17}/><input value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder="Buscar por nome ou CPF..."/></div>
          <select value={customerStatus} onChange={(event) => setCustomerStatus(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")} className="status-filter-select">
            <option value="ALL">Todos os clientes</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
        <div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>CPF</th><th>CONTATO</th><th>RENDA</th><th>VENDEDOR RESPONSÁVEL</th><th>STATUS</th><th>AÇÃO</th></tr></thead>
          <tbody>{filteredCustomers.map((customer) => <tr key={customer.id}><td>{customer.name}</td><td>{customer.cpf}</td><td>{customer.phone}</td><td>{customer.income}</td><td>{customer.seller}</td><td><span className={`status ${customer.active ? "blue" : "red"}`}>{customer.status}</span></td><td><div className="row-actions"><button className="edit-customer-button" onClick={() => openCustomerForm(customer)}>Editar <Icon name="arrow" size={14}/></button><button className="row-status-toggle" onClick={() => toggleCustomerStatus(customer.id)}>{customer.active ? "Desativar" : "Ativar"}</button></div></td></tr>)}</tbody>
        </table></div>
      </section>
      {showForm && <div className="page-form-layer"><form onSubmit={saveCustomer} className="modal-card wide-modal page-form-card">
        <button type="button" className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para clientes</button>
        <div className="modal-title"><div><span>{editingCustomerId === null ? "CADASTRO COMERCIAL" : "EDIÇÃO E RELACIONAMENTO"}</span><h2>{editingCustomerId === null ? "Novo cliente" : form.name || "Editar cliente"}</h2><p>{editingCustomerId === null ? "Informe os dados necessários para contratos e análise de crédito." : "Atualize os dados cadastrais e consulte o histórico de relacionamento."}</p></div></div>
        <div className="form-section-title">Dados pessoais</div>
        <div className="modal-row"><label>Nome completo<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome conforme documento"/></label><label>CPF<input value={cpf} onChange={(event) => { setCpf(event.target.value); setForm((current) => ({ ...current, cpf: event.target.value })); setCreditResult("idle"); }} placeholder="000.000.000-00"/></label></div>
        <div className="modal-row"><label>E-mail<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="cliente@email.com"/></label><label>Telefone<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="(00) 00000-0000"/></label></div>
        <div className="form-section-title">Endereço completo</div>
        <div className="cep-row"><label>CEP<input value={customerCep} onChange={(event) => setCustomerCep(event.target.value)} onBlur={lookupCustomerCep} placeholder="00000-000"/></label><button type="button" onClick={lookupCustomerCep}><Icon name="search" size={15}/>Buscar ViaCEP</button><span>{customerCepStatus}</span></div>
        <div className="modal-row address-main"><label>Logradouro<input value={customerAddress.street} onChange={(event) => setCustomerAddress({ ...customerAddress, street: event.target.value })} placeholder="Rua, avenida ou travessa"/></label><label>Número<input placeholder="Nº"/></label></div>
        <div className="modal-row"><label>Complemento<input placeholder="Apto, bloco ou referência"/></label><label>Bairro<input value={customerAddress.neighborhood} onChange={(event) => setCustomerAddress({ ...customerAddress, neighborhood: event.target.value })}/></label></div>
        <div className="modal-row city-row"><label>Cidade<input value={customerAddress.city} onChange={(event) => setCustomerAddress({ ...customerAddress, city: event.target.value })}/></label><label>Estado<input value={customerAddress.state} onChange={(event) => setCustomerAddress({ ...customerAddress, state: event.target.value })}/></label></div>
        <div className="form-section-title">Renda e ocupação</div>
        <div className="modal-row"><label>Renda mensal<input value={form.income} onChange={(event) => setForm((current) => ({ ...current, income: event.target.value }))} placeholder="R$ 0,00"/></label><label>Vendedor responsável<select value={form.seller} onChange={(event) => setForm((current) => ({ ...current, seller: event.target.value }))}><option>Marcos Costa</option><option>Juliana Castro</option><option>Rafael Lima</option><option>Amanda Silva</option></select></label></div>
        <div className="modal-row"><label>Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option>Em atendimento</option><option>Em proposta</option><option>Em simulação</option><option>Inativo</option></select></label><label>Ativo<input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}/></label></div>
        <div className="credit-check">
          <div className="credit-icon"><Icon name={creditResult === "approved" ? "check" : "search"} size={19}/></div>
          <div><strong>Consulta de crédito</strong><span>{creditResult === "approved" ? "CPF consultado · Score 782 · Risco baixo" : "Consulte o CPF nos bureaus de proteção ao crédito."}</span></div>
          <button type="button" onClick={checkCredit} disabled={!cpf || creditResult === "loading"}>{creditResult === "loading" ? "Consultando..." : creditResult === "approved" ? "Consultar novamente" : "Consultar CPF"}</button>
        </div>
        {editingCustomerId !== null && <div className="customer-history"><div className="form-section-title">Histórico de relacionamento</div><div className="timeline">{customerHistory.map((event) => <div className="timeline-event" key={event.date}><div className={`timeline-icon ${event.tone}`}><Icon name={event.icon} size={16}/></div><div><span>{event.date}</span><strong>{event.title}</strong><p>{event.detail}</p></div></div>)}</div></div>}
        <div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" className="primary-button">{editingCustomerId === null ? "Cadastrar cliente" : "Salvar alterações"}</button></div>
      </form></div>}
    </div>
  );
}

const classifiedVehicles = [
  {
    name: "Jeep Compass Limited",
    year: "2024 / 2025",
    price: "R$ 168.900",
    mileage: "8.420 km",
    transmission: "Automático",
    fuel: "Flex",
    color: "Preto Carbon",
    status: "Em negociação",
    simulations: 4,
    image: "https://images.unsplash.com/photo-1632081831947-24ffdea2cd04?auto=format&fit=crop&w=1200&q=85",
    description: "SUV premium com acabamento em couro, central multimídia, teto solar panorâmico e pacote completo de assistência à condução.",
  },
  {
    name: "Volkswagen T-Cross Highline",
    year: "2024 / 2024",
    price: "R$ 134.900",
    mileage: "14.810 km",
    transmission: "Automático",
    fuel: "Flex",
    color: "Cinza Platinum",
    status: "Disponível",
    simulations: 0,
    image: "https://images.unsplash.com/photo-1642888374507-d1fd1362ff9f?auto=format&fit=crop&w=1200&q=85",
    description: "SUV versátil com motor turbo, painel digital, conectividade sem fio e excelente espaço interno para toda a família.",
  },
  {
    name: "Hyundai Creta Platinum",
    year: "2023 / 2024",
    price: "R$ 98.500",
    mileage: "27.300 km",
    transmission: "Automático",
    fuel: "Flex",
    color: "Vermelho Magic",
    status: "Em negociação",
    simulations: 2,
    image: "https://images.unsplash.com/photo-1605152276590-819c25679592?auto=format&fit=crop&w=1200&q=85",
    description: "Design marcante, bancos em couro, câmera 360°, carregador por indução e revisões realizadas na concessionária.",
  },
  {
    name: "Chevrolet Tracker Premier",
    year: "2023 / 2023",
    price: "R$ 112.900",
    mileage: "31.200 km",
    transmission: "Automático",
    fuel: "Flex",
    color: "Branco Summit",
    status: "Disponível",
    simulations: 1,
    image: "https://images.unsplash.com/photo-1714703394026-dcbbcd822489?auto=format&fit=crop&w=1200&q=85",
    description: "Motor turbo econômico, teto solar, alerta de ponto cego e seis airbags. Laudo cautelar aprovado.",
  },
  {
    name: "Toyota Corolla Cross XRE",
    year: "2024 / 2024",
    price: "R$ 159.800",
    mileage: "11.580 km",
    transmission: "Automático",
    fuel: "Flex",
    color: "Prata Lua Nova",
    status: "Disponível",
    simulations: 0,
    image: "https://images.unsplash.com/photo-1714703394022-b46582c0e56b?auto=format&fit=crop&w=1200&q=85",
    description: "Conforto e confiabilidade com piloto automático adaptativo, frenagem autônoma e amplo porta-malas.",
  },
  {
    name: "Nissan Kicks Exclusive",
    year: "2023 / 2024",
    price: "R$ 119.500",
    mileage: "19.740 km",
    transmission: "CVT",
    fuel: "Flex",
    color: "Azul Magnetic",
    status: "Disponível",
    simulations: 1,
    image: "https://images.unsplash.com/photo-1574023240744-64c47c8c0676?auto=format&fit=crop&w=1200&q=85",
    description: "Versão completa com sistema de som premium, câmera 360°, chave presencial e bancos com tecnologia Zero Gravity.",
  },
];

function ClassifiedsPage({ onSimulate }: { onSimulate: () => void }) {
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const visibleVehicles = classifiedVehicles.filter((vehicle) =>
    vehicle.name.toLowerCase().includes(query.toLowerCase()) &&
    (status === "Todos" || vehicle.status === status)
  );

  if (selectedVehicle !== null) {
    const vehicle = classifiedVehicles[selectedVehicle];
    const gallery = [
      vehicle.image,
      "https://images.unsplash.com/photo-1642888374507-d1fd1362ff9f?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1714703394026-dcbbcd822489?auto=format&fit=crop&w=800&q=82",
      "https://images.unsplash.com/photo-1574023240744-64c47c8c0676?auto=format&fit=crop&w=800&q=82",
    ];
    return (
      <div className="content module-content classified-detail">
        <button className="standalone-back" onClick={() => setSelectedVehicle(null)}><Icon name="arrow" size={16}/>Voltar aos classificados</button>
        <div className="detail-heading"><div><span>{vehicle.status.toUpperCase()}</span><h1>{vehicle.name}</h1><p>{vehicle.year} · {vehicle.mileage} · {vehicle.color}</p></div><div><span>Preço de venda</span><strong>{vehicle.price}</strong></div></div>
        <div className="vehicle-gallery">
          <div className="gallery-main"><img src={gallery[0]} alt={`${vehicle.name} em vista externa`}/><span>Foto principal</span></div>
          {gallery.slice(1).map((photo, index) => <button key={photo}><img src={photo} alt={`${vehicle.name}, vista ${index + 2}`}/>{index === 2 && <span className="photo-count">+ 5 fotos</span>}</button>)}
          <button className="video-thumbnail"><img src={vehicle.image} alt={`Vídeo de apresentação do ${vehicle.name}`}/><span className="play-button"><Icon name="play" size={22}/></span><small>Assistir vídeo · 00:48</small></button>
        </div>
        <div className="classified-detail-grid">
          <section className="panel vehicle-information">
            <h3>Informações do veículo</h3>
            <div className="specification-grid"><div><span>Ano / Modelo</span><strong>{vehicle.year}</strong></div><div><span>Quilometragem</span><strong>{vehicle.mileage}</strong></div><div><span>Câmbio</span><strong>{vehicle.transmission}</strong></div><div><span>Combustível</span><strong>{vehicle.fuel}</strong></div><div><span>Cor</span><strong>{vehicle.color}</strong></div><div><span>Garantia</span><strong>12 meses</strong></div></div>
            <h3>Sobre este veículo</h3><p>{vehicle.description}</p>
            <div className="feature-list">{["Laudo cautelar aprovado", "Revisões em dia", "Chave reserva", "Manual do proprietário"].map((feature) => <span key={feature}><Icon name="check" size={14}/>{feature}</span>)}</div>
          </section>
          <aside className="panel seller-action-card">
            <span>DISPONIBILIDADE</span><div className={`availability ${vehicle.status === "Disponível" ? "available" : ""}`}><i/>{vehicle.status}</div>
            <p>Este veículo possui <strong>{vehicle.simulations} {vehicle.simulations === 1 ? "simulação ativa" : "simulações ativas"}</strong> no momento.</p>
            <button className="auth-submit" onClick={onSimulate}>Iniciar simulação <Icon name="arrow" size={16}/></button>
            <button className="outline-action"><Icon name="users" size={17}/>Compartilhar com cliente</button>
            <small>O veículo continuará disponível até a efetivação de um contrato.</small>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="content module-content">
      <section className="module-heading classified-heading"><div><p>ESTOQUE PARA VENDA</p><h1>Classificados de veículos</h1><span>Apresente ao cliente os veículos disponíveis e em negociação.</span></div><div className="classified-total"><strong>{visibleVehicles.length}</strong><span>veículos encontrados</span></div></section>
      <section className="classified-filters"><div className="search-box"><Icon name="search" size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por marca ou modelo..."/></div><select><option>Todos os anos</option><option>2025</option><option>2024</option><option>2023</option></select><select><option>Todos os preços</option><option>Até R$ 100 mil</option><option>R$ 100 a 150 mil</option><option>Acima de R$ 150 mil</option></select><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Disponível</option><option>Em negociação</option></select></section>
      <section className="classified-grid">
        {visibleVehicles.map((vehicle) => {
          const vehicleIndex = classifiedVehicles.indexOf(vehicle);
          return <article className="classified-card" key={vehicle.name}>
            <button className="classified-image" onClick={() => setSelectedVehicle(vehicleIndex)}><img src={vehicle.image} alt={vehicle.name}/><span className={`classified-status ${vehicle.status === "Disponível" ? "available" : ""}`}>{vehicle.status}</span><span className="media-badge"><Icon name="play" size={12}/> Fotos e vídeo</span></button>
            <div className="classified-body"><span>{vehicle.year} · {vehicle.mileage}</span><h2>{vehicle.name}</h2><div className="compact-specs"><span>{vehicle.transmission}</span><span>{vehicle.fuel}</span><span>{vehicle.color}</span></div><div className="classified-price"><div><small>A partir de</small><strong>{vehicle.price}</strong></div><span><Icon name="proposal" size={14}/>{vehicle.simulations} ativas</span></div><button onClick={() => setSelectedVehicle(vehicleIndex)}>Ver veículo <Icon name="arrow" size={15}/></button></div>
          </article>;
        })}
      </section>
      <p className="photo-credit">Fotografias demonstrativas via Unsplash.</p>
    </div>
  );
}

function SimulationPage({ onAddCustomerHistory }: { onAddCustomerHistory: (customerName: string, title: string, detail: string, tone?: string, icon?: IconName) => void }) {
  const [customer, setCustomer] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicle, setVehicle] = useState("169000");
  const [salePrice, setSalePrice] = useState("168900");
  const [downPayment, setDownPayment] = useState("50000");
  const [months, setMonths] = useState("48");
  const [rate, setRate] = useState("1.39");
  const [conflict, setConflict] = useState("");
  const [benefits, setBenefits] = useState<string[]>(["Transferência"]);
  const [stage, setStage] = useState<SalesStage>("SIMULATION");
  const vehicleRules: Record<string, { minimum: number; simulations: number; status: VehicleStatus }> = {
    "169000": { minimum: 160000, simulations: 4, status: "IN_NEGOTIATION" },
    "134900": { minimum: 128500, simulations: 0, status: "AVAILABLE" },
    "98500": { minimum: 93000, simulations: 2, status: "IN_NEGOTIATION" },
  };
  const currentVehicle = vehicleRules[vehicle];
  const isBelowMinimum = Number(salePrice) < currentVehicle.minimum;
  const principal = Math.max(Number(salePrice) - Number(downPayment || 0), 0);
  const monthlyRate = Number(rate) / 100;
  const count = Number(months);
  const installment = monthlyRate > 0 ? principal * (monthlyRate * (1 + monthlyRate) ** count) / ((1 + monthlyRate) ** count - 1) : principal / count;
  const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const selectCustomer = (value: string) => {
    setCustomer(value);
    setCurrentStep(1);
    setConflict(value === "Henrique Alves" ? "O cliente está sendo atendido por Juliana Castro desde 09/06/2025." : "");
  };
  const toggleBenefit = (benefit: string) => setBenefits((current) => current.includes(benefit) ? current.filter((item) => item !== benefit) : [...current, benefit]);
  const completeSimulation = () => {
    if (!customer) return;
    const timestamp = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date());
    const detail = `${months} parcelas • Entrada ${brl(Number(downPayment || 0))} • Valor ${brl(Number(salePrice))}`;
    onAddCustomerHistory(customer, "Simulação criada", `${timestamp} • ${detail}`, "blue", "proposal");
    setStage((current) => transitionSalesStage(current, "PROPOSAL"));
  };

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>OPERAÇÃO COMERCIAL</p><h1>Nova simulação</h1><span>Configure os dados da negociação e calcule o financiamento.</span></div><button className="secondary-button">Salvar rascunho</button></section>
      <div className="simulation-steps" aria-label="Fluxo em 3 etapas">
        {[
          { step: 1, label: "Cliente" },
          { step: 2, label: "Veículo" },
          { step: 3, label: "Resumo" },
        ].map((item) => (
          <button key={item.step} type="button" className={currentStep === item.step ? "active" : ""} onClick={() => setCurrentStep(item.step)}>
            <span>{item.step}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="simulation-layout">
        <div className="simulation-form">
          <section className="panel form-panel">
            <div className="step-title"><span>1</span><div><h3>Cliente</h3><p>Selecione o cliente desta negociação.</p></div></div>
            <label>Cliente cadastrado<select value={customer} onChange={(e) => selectCustomer(e.target.value)}><option value="">Selecione um cliente</option><option>Ricardo Nunes</option><option>Camila Rocha</option><option>Henrique Alves</option></select></label>
            {conflict && <div className="conflict-alert"><strong>Atendimento em andamento</strong><span>{conflict}</span><small>Para prosseguir, solicite a transferência ao gerente.</small></div>}
            {customer && <button type="button" className="secondary-button" onClick={() => setCurrentStep(2)}>Avançar para veículo</button>}
          </section>
          <section className="panel form-panel">
            <div className="step-title"><span>2</span><div><h3>Veículo</h3><p>Apenas veículos disponíveis podem ser selecionados.</p></div></div>
            <label>Veículo do estoque<select value={vehicle} onChange={(e) => { setVehicle(e.target.value); setSalePrice(e.target.value === "169000" ? "168900" : e.target.value); }}><option value="169000">Jeep Compass Limited · Em negociação · 4 simulações</option><option value="134900">VW T-Cross Highline · Disponível · 0 simulações</option><option value="98500">Hyundai Creta Platinum · Em negociação · 2 simulações</option></select></label>
            <div className="vehicle-selection-meta"><span><Icon name="check" size={15}/> Aceita novas simulações</span><span><Icon name="proposal" size={15}/> {currentVehicle.simulations} simulações ativas</span><span>Status: <strong>{currentVehicle.status === "AVAILABLE" ? "Disponível" : "Em negociação"}</strong></span></div>
            <label className="sale-price-field">Preço negociado<input type="number" value={salePrice} onChange={(event) => setSalePrice(event.target.value)}/><small>Preço mínimo autorizado: {brl(currentVehicle.minimum)}</small></label>
            {isBelowMinimum && <div className="price-alert">O valor de venda não pode ser menor que o preço mínimo cadastrado.</div>}
            <button type="button" className="secondary-button" onClick={() => setCurrentStep(3)}>Avançar para resumo</button>
          </section>
          <section className="panel form-panel">
            <div className="step-title"><span>3</span><div><h3>Benefícios</h3><p>Escolha os benefícios autorizados para esta proposta.</p></div></div>
            <div className="benefit-grid">{["IPVA pago", "Tanque cheio", "Transferência", "Seguro 3 meses"].map((benefit) => <button type="button" className={benefits.includes(benefit) ? "selected" : ""} onClick={() => toggleBenefit(benefit)} key={benefit}><span><Icon name="gift" size={18}/>{benefit}</span><i>{benefits.includes(benefit) ? "✓" : "+"}</i></button>)}</div>
            <button type="button" className="auth-submit" onClick={completeSimulation} disabled={!customer || Boolean(conflict) || isBelowMinimum || stage !== "SIMULATION"}>{stage === "PROPOSAL" ? "Proposta gerada" : "Gerar proposta"} <Icon name={stage === "PROPOSAL" ? "check" : "arrow"} size={16}/></button>
          </section>
        </div>
        <aside className="finance-card">
          <span className="finance-kicker">RESUMO DO FINANCIAMENTO</span><h2>{brl(Number(salePrice))}</h2><p>Valor negociado do veículo</p>
          <div className="finance-fields">
            <label>Valor de entrada<input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)}/></label>
            <div className="finance-row"><label>Parcelas<select value={months} onChange={(e) => setMonths(e.target.value)}><option value="24">24x</option><option value="36">36x</option><option value="48">48x</option><option value="60">60x</option></select></label><label>Taxa a.m.<select value={rate} onChange={(e) => setRate(e.target.value)}><option value="0.99">0,99%</option><option value="1.39">1,39%</option><option value="1.59">1,59%</option></select></label></div>
          </div>
          <div className="finance-result"><span>Financiamento em {months}x de</span><strong>{brl(installment)}</strong><small>Valor financiado: {brl(principal)}</small></div>
          <div className="finance-breakdown"><span><em>Total financiado</em><strong>{brl(installment * count)}</strong></span><span><em>Custo efetivo estimado</em><strong>{brl(installment * count + Number(downPayment || 0))}</strong></span><span><em>Benefícios incluídos</em><strong>{benefits.length}</strong></span></div>
          <button
            disabled={!customer || Boolean(conflict) || isBelowMinimum || stage !== "SIMULATION"}
            className="auth-submit"
            onClick={completeSimulation}
          >
            {stage === "PROPOSAL" ? "Proposta gerada" : "Gerar proposta"} <Icon name={stage === "PROPOSAL" ? "check" : "arrow"} size={16}/>
          </button>
          {stage === "PROPOSAL" && <small className="lifecycle-copy">Etapa atual: PROPOSAL · Aguardando análise bancária.</small>}
          {conflict && <small className="blocked-copy">Resolva o conflito de atendimento para continuar.</small>}
        </aside>
      </div>
    </div>
  );
}

function SupportDashboard() {
  const teams = [
    { name: `Equipe ${clientCompany}`, manager: "Amanda Silva", contracts: 18, sales: "R$ 2,48 mi", goal: 92 },
    { name: "Equipe Impulso", manager: "Bruno Tavares", contracts: 15, sales: "R$ 1,96 mi", goal: 81 },
    { name: "Equipe Vértice", manager: "Patrícia Melo", contracts: 12, sales: "R$ 1,54 mi", goal: 74 },
  ];
  const sellers = [
    { initials: "MC", name: "Marcos Costa", team: clientCompany, contracts: 8, sales: "R$ 986 mil" },
    { initials: "JC", name: "Juliana Castro", team: "Impulso", contracts: 7, sales: "R$ 842 mil" },
    { initials: "RL", name: "Rafael Lima", team: clientCompany, contracts: 6, sales: "R$ 728 mil" },
  ];
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>SUPORTE E OPERAÇÕES</p><h1>Performance comercial</h1><span>Acompanhe equipes, vendedores e propostas enviadas aos bancos.</span></div><label className="period-picker"><Icon name="calendar" size={18}/><select><option>{currentWeekLabel}</option><option>Período personalizado</option></select></label></section>
      <section className="stats-grid support-stats">
        <article className="stat-card"><div className="stat-icon blue"><Icon name="proposal"/></div><div className="stat-title"><span>Propostas em análise</span><strong className="up">+6 hoje</strong></div><h2>24</h2><p>Em 4 instituições financeiras</p></article>
        <article className="stat-card"><div className="stat-icon green"><Icon name="check"/></div><div className="stat-title"><span>Aprovações</span><strong className="up">78%</strong></div><h2>32</h2><p>Taxa de aprovação no período</p></article>
        <article className="stat-card"><div className="stat-icon purple"><Icon name="trend"/></div><div className="stat-title"><span>Volume vendido</span><strong className="up">+14,2%</strong></div><h2>R$ 5,9 mi</h2><p>45 contratos efetivados</p></article>
        <article className="stat-card"><div className="stat-icon red"><Icon name="percent"/></div><div className="stat-title"><span>Comissões previstas</span><strong>Junho</strong></div><h2>R$ 94,2 mil</h2><p>12 colaboradores elegíveis</p></article>
      </section>
      <div className="support-grid">
        <section className="panel ranking-panel">
          <div className="panel-header"><div><h3>Ranking de equipes</h3><p>Desempenho consolidado no período</p></div><button className="plain-link">Ver detalhes <Icon name="arrow" size={14}/></button></div>
          <div className="team-ranking">{teams.map((team, index) => <div className="rank-row" key={team.name}><span className={`rank-number rank-${index + 1}`}>{index + 1}</span><div className="rank-main"><strong>{team.name}</strong><small>Gerente: {team.manager}</small><div><i style={{ width: `${team.goal}%` }}/></div></div><div className="rank-metric"><strong>{team.sales}</strong><span>{team.contracts} contratos</span></div><b>{team.goal}%</b></div>)}</div>
        </section>
        <section className="panel seller-ranking">
          <div className="panel-header"><div><h3>Vendedores em destaque</h3><p>Maiores resultados individuais</p></div></div>
          {sellers.map((seller, index) => <div className="seller-row" key={seller.name}><span className="seller-position">{index + 1}</span><div className="mini-avatar blue">{seller.initials}</div><div><strong>{seller.name}</strong><small>Equipe {seller.team}</small></div><div><strong>{seller.sales}</strong><small>{seller.contracts} contratos</small></div></div>)}
        </section>
      </div>
    </div>
  );
}

type ReviewStatus = "PENDING" | "BANK_ANALYSIS" | "APPROVED" | "REJECTED" | "CONTRACT_EFFECTIVE";

function ProposalReviewPage({ onAddCustomerHistory }: { onAddCustomerHistory: (customerName: string, title: string, detail: string, tone?: string, icon?: IconName) => void }) {
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ReviewStatus | "ALL">("ALL");
  const [selectedProposalId, setSelectedProposalId] = useState<string>("#0842");
  const [documentChecklist, setDocumentChecklist] = useState<Record<string, Record<string, boolean>>>({
    "#0842": { "RG/CPF": true, "Comprovante residencial": true, "Contrato digital": false, "Assinatura do cliente": false },
    "#0841": { "RG/CPF": true, "Comprovante residencial": false, "Contrato digital": false, "Assinatura do cliente": false },
    "#0838": { "RG/CPF": true, "Comprovante residencial": true, "Contrato digital": true, "Assinatura do cliente": true },
    "#0837": { "RG/CPF": false, "Comprovante residencial": false, "Contrato digital": false, "Assinatura do cliente": false },
  });
  const [reviewRows, setReviewRows] = useState([
    { id: "#0842", customer: "Ricardo Nunes", seller: "Marcos Costa", bank: "Banco Alfa", amount: "R$ 118.900", score: "782", status: "PENDING" as ReviewStatus },
    { id: "#0841", customer: "Camila Rocha", seller: "Rafael Lima", bank: "Banco Capital", amount: "R$ 92.500", score: "714", status: "BANK_ANALYSIS" as ReviewStatus },
    { id: "#0838", customer: "Pedro Azevedo", seller: "Juliana Castro", bank: "Banco União", amount: "R$ 106.200", score: "698", status: "CONTRACT_EFFECTIVE" as ReviewStatus },
    { id: "#0837", customer: "Fernanda Dias", seller: "Amanda Silva", bank: "Bradesco", amount: "R$ 132.400", score: "744", status: "REJECTED" as ReviewStatus },
  ]);

  const tabs: Array<{ key: ReviewStatus | "ALL"; label: string }> = [
    { key: "ALL", label: "Todas" },
    { key: "PENDING", label: "Aguardando envio" },
    { key: "BANK_ANALYSIS", label: "Em análise bancária" },
    { key: "APPROVED", label: "Aprovadas" },
    { key: "CONTRACT_EFFECTIVE", label: "Contratos ativos" },
    { key: "REJECTED", label: "Recusadas" },
  ];

  const visibleRows = reviewRows.filter((row) => {
    const matchesTab = activeTab === "ALL" || row.status === activeTab;
    const matchesQuery = `${row.id} ${row.customer} ${row.seller} ${row.bank}`.toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const statusLabel: Record<ReviewStatus, string> = {
    PENDING: "Aguardando envio",
    BANK_ANALYSIS: "Em análise",
    APPROVED: "Aprovada",
    REJECTED: "Recusada",
    CONTRACT_EFFECTIVE: "Contrato ativo",
  };

  const statusTone: Record<ReviewStatus, string> = {
    PENDING: "yellow",
    BANK_ANALYSIS: "blue",
    APPROVED: "green",
    REJECTED: "red",
    CONTRACT_EFFECTIVE: "green",
  };

  const addHistoryForCustomer = (customer: string, eventName: string, note: string, tone: string = "blue", icon: IconName = "proposal") => {
    onAddCustomerHistory(customer, eventName, note, tone, icon);
  };

  const handleSendToBank = (row: typeof reviewRows[number]) => {
    setSubmitted((current) => (current.includes(row.id) ? current : [...current, row.id]));
    if (row.status === "PENDING") {
      setReviewRows((current) => current.map((item) => item.id === row.id ? { ...item, status: "BANK_ANALYSIS" } : item));
      addHistoryForCustomer(row.customer, "Proposta enviada ao banco", `${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())} • ${row.bank} • Valor ${row.amount}`, "blue", "file");
      return;
    }
    if (row.status === "BANK_ANALYSIS") {
      setReviewRows((current) => current.map((item) => item.id === row.id ? { ...item, status: "APPROVED" } : item));
      addHistoryForCustomer(row.customer, "Proposta aprovada", `${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())} • ${row.bank} • Documento aprovado e liberado para contratação`, "green", "check");
      return;
    }
    if (row.status === "APPROVED") {
      setReviewRows((current) => current.map((item) => item.id === row.id ? { ...item, status: "CONTRACT_EFFECTIVE" } : item));
      addHistoryForCustomer(row.customer, "Contrato efetivado", `${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())} • ${row.amount} • Documento assinado e contrato ativo`, "purple", "contract");
      return;
    }
    if (row.status === "REJECTED") {
      setReviewRows((current) => current.map((item) => item.id === row.id ? { ...item, status: "PENDING" } : item));
      addHistoryForCustomer(row.customer, "Nova proposta aberta", `${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())} • Revisão reaberta para ajuste de documentação`, "orange", "proposal");
    }
  };

  const selectedProposal = reviewRows.find((row) => row.id === selectedProposalId) ?? reviewRows[0];
  const selectedDocuments = documentChecklist[selectedProposal.id] ?? { "RG/CPF": false, "Comprovante residencial": false, "Contrato digital": false, "Assinatura do cliente": false };

  const toggleDocument = (documentName: string) => {
    setDocumentChecklist((current) => ({
      ...current,
      [selectedProposal.id]: {
        ...(current[selectedProposal.id] ?? {}),
        [documentName]: !(current[selectedProposal.id]?.[documentName] ?? false),
      },
    }));
  };

  const completeContract = () => {
    if (!selectedProposal) return;
    setReviewRows((current) => current.map((row) => row.id === selectedProposal.id ? { ...row, status: "CONTRACT_EFFECTIVE" } : row));
    addHistoryForCustomer(selectedProposal.customer, "Contrato assinado digitalmente", `${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())} • Checklist concluída com assinatura eletrônica`, "purple", "contract");
  };

  const getActionLabel = (status: ReviewStatus) => {
    switch (status) {
      case "PENDING":
        return "Revisar e enviar";
      case "BANK_ANALYSIS":
        return "Aprovar proposta";
      case "APPROVED":
        return "Ativar contrato";
      case "CONTRACT_EFFECTIVE":
        return "Contrato ativo";
      case "REJECTED":
        return "Reabrir proposta";
      default:
        return "Ação";
    }
  };

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>OPERAÇÃO BANCÁRIA</p><h1>Análise de propostas</h1><span>Revise a documentação e envie propostas para aprovação bancária.</span></div></section>
      <div className="review-tabs">
        {tabs.map((tab) => {
          const count = tab.key === "ALL" ? reviewRows.length : reviewRows.filter((row) => row.status === tab.key).length;
          return (
            <button key={tab.key} className={activeTab === tab.key ? "active" : ""} onClick={() => setActiveTab(tab.key)}>
              {tab.label} <span>{count}</span>
            </button>
          );
        })}
      </div>
      <section className="panel module-table">
        <div className="module-toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar proposta, cliente ou banco..."/></div><button><Icon name="settings" size={16}/>Filtros</button></div>
        <div className="table-wrap"><table><thead><tr><th>PROPOSTA</th><th>CLIENTE</th><th>VENDEDOR</th><th>BANCO SELECIONADO</th><th>FINANCIADO</th><th>SCORE</th><th>STATUS</th><th>AÇÃO</th></tr></thead>
          <tbody>{visibleRows.map((row) => <tr key={row.id} className={selectedProposalId === row.id ? "selected-row" : ""} onClick={() => setSelectedProposalId(row.id)}><td><strong>{row.id}</strong></td><td>{row.customer}</td><td>{row.seller}</td><td>{row.bank}</td><td><strong>{row.amount}</strong></td><td><span className="score-pill">{row.score}</span></td><td><span className={`status ${statusTone[row.status]}`}>{statusLabel[row.status]}</span></td><td><button className={`submit-bank ${submitted.includes(row.id) ? "done" : ""}`} onClick={(event) => { event.stopPropagation(); handleSendToBank(row); }} disabled={row.status === "CONTRACT_EFFECTIVE"}>{getActionLabel(row.status)}</button></td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="panel support-note contract-panel">
        <div className="panel-header"><div><h3>Checklist de documentos</h3><p>Proposta selecionada: {selectedProposal.id} · {selectedProposal.customer}</p></div><button className="primary-button" onClick={completeContract}>Assinar digitalmente</button></div>
        <div className="document-list">
          {Object.entries(selectedDocuments).map(([documentName, checked]) => (
            <button key={documentName} type="button" className={checked ? "document-item complete" : "document-item"} onClick={() => toggleDocument(documentName)}>
              <span className="document-check"><Icon name={checked ? "check" : "file"} size={16}/></span>
              <span>{documentName}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="support-note"><Icon name="settings" size={18}/><div><strong>Integração com portais bancários</strong><span>O envio está em modo demonstrativo. Em produção, cada banco utilizará seu conector de API ou portal homologado.</span></div></div>
    </div>
  );
}

function ContractManagementPage() {
  const [selectedContractId, setSelectedContractId] = useState("#CONT-2025-0318");
  const [selectedRecoveryContractId, setSelectedRecoveryContractId] = useState("#REC-2025-0101");
  const [proposalSent, setProposalSent] = useState(false);
  const [proposalAccepted, setProposalAccepted] = useState(false);
  const [observation, setObservation] = useState("Cliente possui análise documental concluída e perfil adequado para acompanhamento financeiro. Encaminhar proposta com foco em melhores condições de enquadramento bancário.");
  const [signedDocuments, setSignedDocuments] = useState<Record<string, { fileName: string; signedAt: string; eGovSignature: string; status: string; stored: boolean }>>({
    "#REC-2025-0101": { fileName: "consultoria-recuperacao-camila-rocha.pdf", signedAt: "24/09/2026 · 14:20", eGovSignature: "e-Gov • Assinatura válida", status: "Arquivo armazenado com validade jurídica", stored: true },
    "#REC-2025-0104": { fileName: "consultoria-recuperacao-ricardo-nunes.pdf", signedAt: "24/09/2026 · 09:45", eGovSignature: "e-Gov • Assinatura válida", status: "Arquivo armazenado com validade jurídica", stored: true },
  });

  const contracts = [
    { id: "#CONT-2025-0318", customer: "Pedro Azevedo", vehicle: "Toyota Corolla Cross XRE", value: "R$ 159.800", status: "Em assinatura", completion: 82, nextStep: "Assinatura do cliente", docs: 5, due: "12/07/2025" },
    { id: "#CONT-2025-0315", customer: "Camila Rocha", vehicle: "Jeep Compass Limited", value: "R$ 168.900", status: "Documentação", completion: 64, nextStep: "Validação de renda", docs: 3, due: "18/07/2025" },
    { id: "#CONT-2025-0306", customer: "Ricardo Nunes", vehicle: "Hyundai Creta Platinum", value: "R$ 98.500", status: "Aprovado", completion: 100, nextStep: "Agendar entrega", docs: 6, due: "21/07/2025" },
  ];
  const creditRecoveryContracts = [
    { id: "#REC-2025-0101", customer: "Camila Rocha", vehicle: "Jeep Compass Limited", financingStatus: "Não recusado", value: "R$ 2.400", status: "Elegível", nextStep: "Emitir contrato de consultoria" },
    { id: "#REC-2025-0104", customer: "Ricardo Nunes", vehicle: "Hyundai Creta Platinum", financingStatus: "Aprovado", value: "R$ 2.400", status: "Elegível", nextStep: "Enviar proposta de consultoria" },
    { id: "#REC-2025-0107", customer: "Fernanda Dias", vehicle: "Honda HR-V Touring", financingStatus: "Recusado", value: "R$ 0", status: "Não elegível", nextStep: "Financiamento recusado - sem contratação" },
  ].filter((entry) => entry.financingStatus !== "Recusado");

  const selectedContract = contracts.find((contract) => contract.id === selectedContractId) ?? contracts[0];
  const selectedRecoveryContract = creditRecoveryContracts.find((entry) => entry.id === selectedRecoveryContractId) ?? creditRecoveryContracts[0];
  const selectedSignedDocument = signedDocuments[selectedRecoveryContract.id] ?? {
    fileName: `consultoria-recuperacao-${selectedRecoveryContract.customer.toLowerCase().replace(/\s+/g, "-")}.pdf`,
    signedAt: "Aguardando assinatura",
    eGovSignature: "e-Gov • pendente",
    status: "Arquivo ainda não armazenado",
    stored: false,
  };

  const archiveEntries = [
    { id: "#DOC-3021", client: "Camila Rocha", document: "Proposta de consultoria", file: "consultoria-recuperacao-camila-rocha.pdf", status: "Arquivado", channel: "e-Gov", date: "24/09/2026" },
    { id: "#DOC-3022", client: "Ricardo Nunes", document: "Contratação de acompanhamento financeiro", file: "consultoria-recuperacao-ricardo-nunes.pdf", status: "Arquivado", channel: "e-Gov", date: "24/09/2026" },
    { id: "#DOC-3023", client: "Fernanda Dias", document: "Análise documental inicial", file: "documentacao-fernanda-dias.pdf", status: "Rascunho", channel: "Manual", date: "Em revisão" },
  ];

  const clientDocuments = [
    { id: "DOC-001", name: "Proposta comercial", version: "v2.1", status: "Assinado", date: "24/09/2026", channel: "e-Gov" },
    { id: "DOC-002", name: "Análise documental", version: "v1.4", status: "Validado", date: "23/09/2026", channel: "Coleta interna" },
    { id: "DOC-003", name: "Comprovante de renda", version: "v1.0", status: "Conferido", date: "22/09/2026", channel: "Cliente" },
    { id: "DOC-004", name: "Checklist bancária", version: "v3.0", status: "Pendência", date: "21/09/2026", channel: "Operação" },
  ];

  const legalHistory = [
    { date: "24/09/2026 · 14:20", title: "PDF assinado armazenado", detail: "Arquivo legal registrado para Camila Rocha com assinatura válida do e-Gov.", tone: "green", icon: "check" as IconName },
    { date: "24/09/2026 · 09:45", title: "Proposta aceita", detail: "Ricardo Nunes confirmou ciência e aceite da proposta de consultoria.", tone: "blue", icon: "file" as IconName },
    { date: "23/09/2026 · 16:35", title: "Análise documental concluída", detail: "Checklist de renda e histórico cadastral validada para revisão jurídica.", tone: "purple", icon: "contract" as IconName },
  ];

  const billingRows = [
    { id: "INV-001", client: "Camila Rocha", amount: "R$ 7.000,00", status: "Pendente", dueDate: "30/09/2026", channel: "Boleto", progress: 38 },
    { id: "INV-002", client: "Ricardo Nunes", amount: "R$ 7.000,00", status: "Pago", dueDate: "18/09/2026", channel: "Pix", progress: 100 },
    { id: "INV-003", client: "Fernanda Dias", amount: "R$ 7.000,00", status: "Em análise", dueDate: "02/10/2026", channel: "Cartão", progress: 62 },
  ];

  const deliveryChannels = [
    { id: "MSG-001", client: "Camila Rocha", channel: "WhatsApp", status: "Entregue", recipient: "+55 (11) 9 9123-4455", sentAt: "24/09/2026 · 12:10", deliveryState: "Aceite em andamento" },
    { id: "MSG-002", client: "Ricardo Nunes", channel: "E-mail", status: "Lido", recipient: "ricardo.nunes@gmail.com", sentAt: "24/09/2026 · 09:40", deliveryState: "Aceite confirmado" },
    { id: "MSG-003", client: "Fernanda Dias", channel: "SMS", status: "Pendente", recipient: "+55 (11) 9 8824-7710", sentAt: "Aguardando envio", deliveryState: "Não entregue" },
  ];

  const approvalDashboard = [
    { seller: "Marcos Costa", proposals: 11, sent: 9, accepted: 6, pending: 3, revenue: "R$ 84.000" },
    { seller: "Juliana Castro", proposals: 8, sent: 7, accepted: 5, pending: 2, revenue: "R$ 67.500" },
    { seller: "Rafael Lima", proposals: 10, sent: 8, accepted: 4, pending: 4, revenue: "R$ 59.000" },
    { seller: "Amanda Silva", proposals: 7, sent: 6, accepted: 5, pending: 1, revenue: "R$ 52.000" },
  ];

  const approvalChecklist = [
    { label: "Cobrança enviada", status: "Concluído" },
    { label: "Proposta entregue", status: "Concluído" },
    { label: "Cliente recebeu e leu", status: "Concluído" },
    { label: "Aceite confirmado", status: "Em revisão" },
    { label: "Arquivo jurídico arquivado", status: "Pendente" },
  ];

  const registerSignedProposal = () => {
    const signedAt = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    setSignedDocuments((current) => ({
      ...current,
      [selectedRecoveryContract.id]: {
        fileName: `consultoria-recuperacao-${selectedRecoveryContract.customer.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        signedAt,
        eGovSignature: "e-Gov • assinatura validada",
        status: "Arquivo arquivado em cópia jurídica",
        stored: true,
      },
    }));
    setProposalSent(true);
    setProposalAccepted(true);
  };

  const recoveryProposalText = `COMO VAMOS CONDUZIR SUA LIBERAÇÃO

Um passo a passo técnico e transparente, pensado para elevar suas chances reais de aprovação.

A ESPECIALIZA PRO assume por você todo o trabalho técnico de aprovação de crédito, com agilidade, transparência e acompanhamento personalizado do início ao fim.

Analisamos seu histórico cadastral dos últimos dois anos, identificamos os pontos de atenção e aplicamos estratégias comprovadas para fortalecer seu perfil junto às instituições financeiras.

Cuidamos da atualização de renda junto à Receita Federal, oferecemos consultoria financeira estratégica e negociamos diretamente com os bancos as melhores taxas e condições do mercado.

O resultado: mais segurança, mais agilidade e mais chances reais de aprovação, com suporte contínuo até a conclusão da sua aquisição.

FLUXO DE ATENDIMENTO
1. Análise documental
Levantamento e conferência da documentação e do histórico de crédito.

2. Simulações
Simulações personalizadas com as condições mais vantajosas para o seu perfil.

3. Estratégia Financeira Personalizada
Orientações sob medida para fortalecer seu cadastro e elevar suas chances.

4. Enquadramento bancário
Direcionamento do seu perfil ao banco e às condições mais favoráveis ao seu caso.

5. Suporte com setor especializado
Equipe especializada te acompanha em todas as etapas, com segurança e agilidade.

Pagamento pelos serviços prestados
Para a execução da prestação de serviço constante nesta proposta comercial, o contratante pagará à empresa os honorários profissionais correspondentes a R$ 7.000,00, a serem pagos via boleto, após o envio da presente proposta.

CONFIRMAÇÃO DE ACEITE
Ao validar o aceite pelo link enviado, o contratante confirma ciência das condições apresentadas e autoriza a continuidade do atendimento.

_______________________________
CONTRATANTE ${selectedRecoveryContract.customer.toUpperCase()}
_______________________________
CONTRATADA ESPECIALIZA PRO

CONDIÇÃO ESPECIAL: Proposta estruturada com condições diferenciadas de negociação, e acompanhamento especializado para busca das melhores condições bancárias disponíveis, conforme perfil e análise de crédito do contratante.`;

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>GESTÃO DE VENDAS</p><h1>Contratos em execução</h1><span>Controles do ciclo após aprovação e antes da entrega do veículo.</span></div><button className="primary-button"><Icon name="plus" size={18}/>Novo contrato</button></section>
      <section className="stats-grid">
        <article className="stat-card"><div className="stat-icon blue"><Icon name="contract" /></div><div className="stat-title"><span>Contratos ativos</span><strong className="up">+12%</strong></div><h2>18</h2><p>em análise ou assinatura</p></article>
        <article className="stat-card"><div className="stat-icon green"><Icon name="check" /></div><div className="stat-title"><span>Assinaturas concluídas</span><strong className="up">92%</strong></div><h2>14</h2><p>atributos digitais validados</p></article>
        <article className="stat-card"><div className="stat-icon purple"><Icon name="calendar" /></div><div className="stat-title"><span>Entregas previstas</span><strong>7 dias</strong></div><h2>6</h2><p>veículos para liberação</p></article>
        <article className="stat-card"><div className="stat-icon orange"><Icon name="file" /></div><div className="stat-title"><span>Documentação pendente</span><strong>3 itens</strong></div><h2>11</h2><p>pendências em revisão</p></article>
      </section>
      <div className="contract-stream">
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Contratos em andamento</h3><p>Fluxo de pós-aprovação e entrega</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>CONTRATO</th><th>CLIENTE</th><th>VEÍCULO</th><th>VALOR</th><th>STATUS</th><th>PRÓXIMO PASSO</th></tr></thead>
            <tbody>{contracts.map((contract) => (
              <tr key={contract.id} className={selectedContractId === contract.id ? "selected-row" : ""} onClick={() => setSelectedContractId(contract.id)}>
                <td><strong>{contract.id}</strong></td>
                <td>{contract.customer}</td>
                <td>{contract.vehicle}</td>
                <td><strong>{contract.value}</strong></td>
                <td><span className={`status ${contract.status === "Aprovado" ? "green" : contract.status === "Documentação" ? "yellow" : "blue"}`}>{contract.status}</span></td>
                <td>{contract.nextStep}</td>
              </tr>
            ))}</tbody></table></div>
        </section>
        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Detalhes do contrato</h3><p>{selectedContract.id}</p></div></div>
          <div className="contract-summary-card">
            <div className="contract-title"><strong>{selectedContract.customer}</strong><span>{selectedContract.vehicle}</span></div>
            <div className="contract-metric"><label>Progresso</label><strong>{selectedContract.completion}%</strong><div className="progress-bar"><i style={{ width: `${selectedContract.completion}%` }} /></div></div>
            <div className="contract-metric"><label>Valor do contrato</label><strong>{selectedContract.value}</strong></div>
            <div className="contract-metric"><label>Próximo evento</label><strong>{selectedContract.nextStep}</strong></div>
            <div className="contract-metric"><label>Vencimento da documentação</label><strong>{selectedContract.due}</strong></div>
            <div className="document-list compact-list">
              {[
                "Contrato digital",
                "Boletim de financiamento",
                "Comprovante de renda",
                "Assinatura eletrônica",
                "Entrega do veículo",
              ].map((item, index) => (
                <button key={item} type="button" className={index < selectedContract.docs ? "document-item complete" : "document-item"}>
                  <span className="document-check"><Icon name={index < selectedContract.docs ? "check" : "file"} size={16} /></span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
            <button className="primary-button">Acompanhar entrega</button>
          </div>
        </aside>
      </div>
      <section className="panel module-table">
        <div className="panel-header"><div><h3>Consultoria de recuperação de crédito</h3><p>Oferecida somente para clientes cujo financiamento não foi recusado.</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>CONTRATO</th><th>CLIENTE</th><th>VEÍCULO</th><th>FINANCIAMENTO</th><th>VALOR</th><th>STATUS</th><th>PRÓXIMO PASSO</th></tr></thead>
          <tbody>{creditRecoveryContracts.map((entry) => (
            <tr key={entry.id} className={selectedRecoveryContractId === entry.id ? "selected-row" : ""} onClick={() => setSelectedRecoveryContractId(entry.id)}>
              <td><strong>{entry.id}</strong></td>
              <td>{entry.customer}</td>
              <td>{entry.vehicle}</td>
              <td><span className="status green">{entry.financingStatus}</span></td>
              <td><strong>{entry.value}</strong></td>
              <td><span className={`status ${entry.status === "Elegível" ? "blue" : "green"}`}>{entry.status}</span></td>
              <td>{entry.nextStep}</td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <section className="panel support-note contract-panel" style={{ display: "grid", gap: "1rem" }}>
        <div className="panel-header"><div><h3>Proposta comercial simulada</h3><p>Cliente selecionado: {selectedRecoveryContract.customer} · {selectedRecoveryContract.id}</p></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.9fr", gap: "1rem" }}>
          <div style={{ background: "#f6f8fc", border: "1px solid #dfe7f4", borderRadius: "16px", padding: "1rem 1.1rem", lineHeight: "1.7", whiteSpace: "pre-line", fontSize: "0.9rem", color: "#1f2a37" }}>
            {recoveryProposalText}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontWeight: 600, color: "#1f2a37" }}>
              Observação do atendimento
              <textarea value={observation} onChange={(event) => setObservation(event.target.value)} rows={8} style={{ border: "1px solid #dfe7f4", borderRadius: "12px", padding: "0.8rem", resize: "vertical", fontFamily: "inherit" }} />
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <button className="primary-button" type="button" onClick={() => setProposalSent(true)}>{proposalSent ? "Proposta enviada" : "Simular envio"}</button>
              <button className="secondary-button" type="button" onClick={registerSignedProposal}>{proposalAccepted ? "Arquivo arquivado" : "Salvar PDF assinado"}</button>
            </div>
            <div className="support-note" style={{ margin: 0 }}>
              <Icon name="check" size={18}/>
              <div>
                <strong>Status</strong>
                <span>{proposalAccepted ? `${selectedSignedDocument.status} · ${selectedSignedDocument.eGovSignature}` : proposalSent ? "Proposta enviada para análise e aceite do cliente." : "Aguardando envio da proposta para o cliente."}</span>
              </div>
            </div>
            <div style={{ border: "1px solid #dfe7f4", borderRadius: "12px", padding: "0.8rem 0.9rem", background: "#f9fbff", display: "grid", gap: "0.35rem" }}>
              <strong style={{ fontSize: "0.85rem", color: "#1f2a37" }}>Arquivo jurídico</strong>
              <span style={{ fontSize: "0.8rem", color: "#53627a" }}>{selectedSignedDocument.fileName}</span>
              <span style={{ fontSize: "0.8rem", color: "#53627a" }}>{selectedSignedDocument.signedAt}</span>
              <span style={{ fontSize: "0.8rem", color: selectedSignedDocument.stored ? "#0d7a62" : "#8d5b00", fontWeight: 600 }}>{selectedSignedDocument.eGovSignature}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel module-table">
        <div className="panel-header"><div><h3>Caixa documental</h3><p>Arquivos jurídicos e históricos de assinatura digital</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>DOCUMENTO</th><th>ARQUIVO</th><th>CANAL</th><th>STATUS</th><th>DATA</th></tr></thead>
          <tbody>{archiveEntries.map((entry) => (
            <tr key={entry.id}>
              <td><strong>{entry.id}</strong></td>
              <td>{entry.client}</td>
              <td>{entry.document}</td>
              <td>{entry.file}</td>
              <td>{entry.channel}</td>
              <td><span className={`status ${entry.status === "Arquivado" ? "green" : "yellow"}`}>{entry.status}</span></td>
              <td>{entry.date}</td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <section className="panel contract-panel" style={{ display: "grid", gap: "1rem" }}>
        <div className="panel-header"><div><h3>Gestão documental por cliente</h3><p>Documentos, versões e arquivamento da consultoria para {selectedRecoveryContract.customer}</p></div><button className="primary-button" type="button">+ Novo anexo</button></div>
        <div className="table-wrap"><table><thead><tr><th>ID</th><th>NOME</th><th>VERSÃO</th><th>STATUS</th><th>DATA</th><th>CANAL</th><th>AÇÃO</th></tr></thead>
          <tbody>{clientDocuments.map((doc) => (
            <tr key={doc.id}>
              <td><strong>{doc.id}</strong></td>
              <td>{doc.name}</td>
              <td>{doc.version}</td>
              <td><span className={`status ${doc.status === "Assinado" || doc.status === "Validado" ? "green" : doc.status === "Conferido" ? "blue" : "yellow"}`}>{doc.status}</span></td>
              <td>{doc.date}</td>
              <td>{doc.channel}</td>
              <td><div style={{ display: "flex", gap: "0.5rem" }}><button className="secondary-button" type="button">Baixar</button><button className="secondary-button" type="button">Arquivar</button></div></td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <section className="panel support-note contract-panel">
        <div className="panel-header"><div><h3>Histórico jurídico</h3><p>Eventos vinculados ao aceite e entrega da proposta</p></div></div>
        <div className="timeline">
          {legalHistory.map((event) => (
            <div className="timeline-event" key={`${event.date}-${event.title}`}>
              <div className={`timeline-icon ${event.tone}`}><Icon name={event.icon} size={16}/></div>
              <div>
                <span>{event.date}</span>
                <strong>{event.title}</strong>
                <p>{event.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel support-note contract-panel" style={{ display: "grid", gap: "1rem" }}>
        <div className="panel-header"><div><h3>Honorários e cobrança</h3><p>Pagamento pelos serviços prestados conforme proposta comercial</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>FATURA</th><th>CLIENTE</th><th>VALOR</th><th>STATUS</th><th>VENCIMENTO</th><th>CANAL</th><th>PROGRESSO</th></tr></thead>
          <tbody>{billingRows.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.client}</td>
              <td>{row.amount}</td>
              <td><span className={`status ${row.status === "Pago" ? "green" : row.status === "Pendente" ? "yellow" : "blue"}`}>{row.status}</span></td>
              <td>{row.dueDate}</td>
              <td>{row.channel}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div className="progress-bar" style={{ minWidth: "90px" }}><i style={{ width: `${row.progress}%` }} /></div>
                  <small>{row.progress}%</small>
                </div>
              </td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <section className="panel support-note contract-panel" style={{ display: "grid", gap: "1rem" }}>
        <div className="panel-header"><div><h3>Entrega da proposta</h3><p>Envio por canal e rastreio do aceite do cliente</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>CANAL</th><th>CONTATO</th><th>STATUS</th><th>ENVIADO EM</th><th>ESTADO</th></tr></thead>
          <tbody>{deliveryChannels.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.id}</strong></td>
              <td>{item.client}</td>
              <td>{item.channel}</td>
              <td>{item.recipient}</td>
              <td><span className={`status ${item.status === "Entregue" || item.status === "Lido" ? "green" : item.status === "Pendente" ? "yellow" : "blue"}`}>{item.status}</span></td>
              <td>{item.sentAt}</td>
              <td>{item.deliveryState}</td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <section className="panel support-note contract-panel" style={{ display: "grid", gap: "1rem" }}>
        <div className="panel-header"><div><h3>Painel de aprovação</h3><p>Checklist operacional de cobrança, envio e aceite para gestão por gerente</p></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem" }}>
          <div className="table-wrap"><table><thead><tr><th>ETAPA</th><th>STATUS</th></tr></thead><tbody>{approvalChecklist.map((step) => (
            <tr key={step.label}>
              <td>{step.label}</td>
              <td><span className={`status ${step.status === "Concluído" ? "green" : step.status === "Em revisão" ? "yellow" : "blue"}`}>{step.status}</span></td>
            </tr>
          ))}</tbody></table></div>
          <div style={{ display: "grid", gap: "0.8rem" }}>
            <div style={{ background: "#f4f8ff", border: "1px solid #dfe7f4", borderRadius: "12px", padding: "0.9rem 1rem" }}>
              <strong style={{ display: "block", marginBottom: "0.2rem" }}>Taxa de aprovação</strong>
              <span style={{ fontSize: "1.9rem", fontWeight: 700, color: "#173d82" }}>68%</span>
              <small style={{ color: "#53627a" }}>Média da equipe no mês</small>
            </div>
            <div style={{ background: "#f9fbff", border: "1px solid #dfe7f4", borderRadius: "12px", padding: "0.9rem 1rem" }}>
              <strong style={{ display: "block", marginBottom: "0.2rem" }}>Receita potencial</strong>
              <span style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0d7a62" }}>R$ 263.500</span>
              <small style={{ color: "#53627a" }}>Honorários em carteira</small>
            </div>
          </div>
        </div>
      </section>

      <section className="panel support-note contract-panel" style={{ display: "grid", gap: "1rem" }}>
        <div className="panel-header"><div><h3>Dashboard por gerente</h3><p>Dados de propostas, envios e aceites por vendedor</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>VENDEDOR</th><th>PROPOSTAS</th><th>ENVIADAS</th><th>ACEITES</th><th>PENDENTES</th><th>RECEITA</th></tr></thead>
          <tbody>{approvalDashboard.map((row) => (
            <tr key={row.seller}>
              <td><strong>{row.seller}</strong></td>
              <td>{row.proposals}</td>
              <td>{row.sent}</td>
              <td>{row.accepted}</td>
              <td>{row.pending}</td>
              <td>{row.revenue}</td>
            </tr>
          ))}</tbody></table></div>
      </section>
    </div>
  );
}

function DeliveryPage() {
  const deliveries = [
    { id: "#ENT-1042", customer: "Pedro Azevedo", vehicle: "Toyota Corolla Cross XRE", date: "12/07/2025", status: "Agendar entrega", progress: 72, seller: "Juliana Castro", plan: "Ajuste final de acessórios" },
    { id: "#ENT-1041", customer: "Camila Rocha", vehicle: "Jeep Compass Limited", date: "18/07/2025", status: "Liberado", progress: 92, seller: "Rafael Lima", plan: "Entrega com documentação completa" },
    { id: "#ENT-1039", customer: "Ricardo Nunes", vehicle: "Hyundai Creta Platinum", date: "21/07/2025", status: "Em revisão", progress: 58, seller: "Marcos Costa", plan: "Conferir acessórios e garantia" },
  ];

  const [selectedDeliveryId, setSelectedDeliveryId] = useState("#ENT-1042");
  const selectedDelivery = deliveries.find((delivery) => delivery.id === selectedDeliveryId) ?? deliveries[0];
  const deliveryChecklist = [
    "Financiamento validado",
    "Contrato assinado",
    "Crédito liberado",
    "Acessórios instalados",
    "Entrega programada",
    "Pós-venda confirmado",
  ];

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>PÓS-VENDA</p><h1>Entrega de veículos</h1><span>Acompanhe o preparo do veículo, a documentação e a data de entrega ao cliente.</span></div><button className="primary-button"><Icon name="plus" size={18}/>Nova entrega</button></section>
      <section className="stats-grid">
        <article className="stat-card"><div className="stat-icon blue"><Icon name="car" /></div><div className="stat-title"><span>Entregas no mês</span><strong className="up">+18%</strong></div><h2>21</h2><p>veículos programados</p></article>
        <article className="stat-card"><div className="stat-icon green"><Icon name="check" /></div><div className="stat-title"><span>Liberações</span><strong className="up">92%</strong></div><h2>19</h2><p>documentação aprovada</p></article>
        <article className="stat-card"><div className="stat-icon purple"><Icon name="calendar" /></div><div className="stat-title"><span>Próximas entregas</span><strong>7 dias</strong></div><h2>6</h2><p>agendadas para esta semana</p></article>
        <article className="stat-card"><div className="stat-icon orange"><Icon name="gift" /></div><div className="stat-title"><span>Pós-venda ativo</span><strong>84%</strong></div><h2>17</h2><p>planos ativos no primeiro mês</p></article>
      </section>
      <div className="contract-stream">
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Agenda de entregas</h3><p>Calendário do pós-venda e liberação do cliente</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>ENTREGA</th><th>CLIENTE</th><th>VEÍCULO</th><th>VENDEDOR</th><th>DATA</th><th>STATUS</th></tr></thead>
            <tbody>{deliveries.map((delivery) => (
              <tr key={delivery.id} className={selectedDeliveryId === delivery.id ? "selected-row" : ""} onClick={() => setSelectedDeliveryId(delivery.id)}>
                <td><strong>{delivery.id}</strong></td>
                <td>{delivery.customer}</td>
                <td>{delivery.vehicle}</td>
                <td>{delivery.seller}</td>
                <td>{delivery.date}</td>
                <td><span className={`status ${delivery.status === "Liberado" ? "green" : delivery.status === "Em revisão" ? "yellow" : "blue"}`}>{delivery.status}</span></td>
              </tr>
            ))}</tbody></table></div>
        </section>
        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Detalhes da entrega</h3><p>{selectedDelivery.id}</p></div></div>
          <div className="contract-summary-card">
            <div className="contract-title"><strong>{selectedDelivery.customer}</strong><span>{selectedDelivery.vehicle}</span></div>
            <div className="contract-metric"><label>Progresso da entrega</label><strong>{selectedDelivery.progress}%</strong><div className="progress-bar"><i style={{ width: `${selectedDelivery.progress}%` }} /></div></div>
            <div className="contract-metric"><label>Vendedor responsável</label><strong>{selectedDelivery.seller}</strong></div>
            <div className="contract-metric"><label>Agenda prevista</label><strong>{selectedDelivery.date}</strong></div>
            <div className="contract-metric"><label>Observação</label><strong>{selectedDelivery.plan}</strong></div>
            <div className="document-list compact-list">
              {deliveryChecklist.map((item, index) => (
                <button key={item} type="button" className={index < 4 ? "document-item complete" : "document-item"}>
                  <span className="document-check"><Icon name={index < 4 ? "check" : "file"} size={16} /></span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
            <button className="primary-button">Confirmar entrega</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AfterSalesPage() {
  const jobs = [
    { id: "#OS-2214", customer: "Pedro Azevedo", vehicle: "Toyota Corolla Cross XRE", type: "Revisão 1.000 km", status: "Agendada", progress: 74, date: "14/07/2025", technician: "Oficina VFC", warranty: "Garantia de fábrica" },
    { id: "#OS-2211", customer: "Camila Rocha", vehicle: "Jeep Compass Limited", type: "Inspeção preventiva", status: "Em andamento", progress: 58, date: "16/07/2025", technician: "Check-up Premium", warranty: "Cobertura 24 meses" },
    { id: "#OS-2208", customer: "Ricardo Nunes", vehicle: "Hyundai Creta Platinum", type: "Troca de óleo e filtros", status: "Concluída", progress: 100, date: "09/07/2025", technician: "Manutenção Rápida", warranty: "Serviço contratado" },
  ];

  const [selectedJobId, setSelectedJobId] = useState("#OS-2214");
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>ATENDIMENTO PÓS-VENDA</p><h1>Garantia e manutenção</h1><span>Gerencie revisões, garantias e inspeções após a entrega do veículo.</span></div><button className="primary-button"><Icon name="plus" size={18}/>Nova ordem</button></section>
      <section className="stats-grid">
        <article className="stat-card"><div className="stat-icon blue"><Icon name="gift" /></div><div className="stat-title"><span>Ordens ativas</span><strong className="up">+9%</strong></div><h2>34</h2><p>serviços em manutenção</p></article>
        <article className="stat-card"><div className="stat-icon green"><Icon name="check" /></div><div className="stat-title"><span>Concluídas</span><strong className="up">88%</strong></div><h2>30</h2><p>em garantia ou revisões</p></article>
        <article className="stat-card"><div className="stat-icon purple"><Icon name="calendar" /></div><div className="stat-title"><span>Próximos atendimentos</span><strong>5 dias</strong></div><h2>9</h2><p>agendados para a semana</p></article>
        <article className="stat-card"><div className="stat-icon orange"><Icon name="settings" /></div><div className="stat-title"><span>Garantia em vigência</span><strong>24 meses</strong></div><h2>18</h2><p>veículos com cobertura ativa</p></article>
      </section>
      <div className="contract-stream">
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Ordens de serviço</h3><p>Atendimentos e vigência de garantia</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>OS</th><th>CLIENTE</th><th>VEÍCULO</th><th>TIPO</th><th>DATA</th><th>STATUS</th></tr></thead>
            <tbody>{jobs.map((job) => (
              <tr key={job.id} className={selectedJobId === job.id ? "selected-row" : ""} onClick={() => setSelectedJobId(job.id)}>
                <td><strong>{job.id}</strong></td>
                <td>{job.customer}</td>
                <td>{job.vehicle}</td>
                <td>{job.type}</td>
                <td>{job.date}</td>
                <td><span className={`status ${job.status === "Concluída" ? "green" : job.status === "Em andamento" ? "yellow" : "blue"}`}>{job.status}</span></td>
              </tr>
            ))}</tbody></table></div>
        </section>
        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Detalhes da ordem</h3><p>{selectedJob.id}</p></div></div>
          <div className="contract-summary-card">
            <div className="contract-title"><strong>{selectedJob.customer}</strong><span>{selectedJob.vehicle}</span></div>
            <div className="contract-metric"><label>Progresso</label><strong>{selectedJob.progress}%</strong><div className="progress-bar"><i style={{ width: `${selectedJob.progress}%` }} /></div></div>
            <div className="contract-metric"><label>Tipo de serviço</label><strong>{selectedJob.type}</strong></div>
            <div className="contract-metric"><label>Responsável</label><strong>{selectedJob.technician}</strong></div>
            <div className="contract-metric"><label>Garantia</label><strong>{selectedJob.warranty}</strong></div>
            <div className="document-list compact-list">
              {[
                "Checklist de inspeção",
                "Acessórios revisados",
                "Status de garantia",
                "Feedback do cliente",
                "Encerramento",
              ].map((item, index) => (
                <button key={item} type="button" className={index < 3 ? "document-item complete" : "document-item"}>
                  <span className="document-check"><Icon name={index < 3 ? "check" : "file"} size={16} /></span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
            <button className="primary-button">Encerrar atendimento</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CustomerFollowUpPage() {
  const followUps = [
    { id: "#CRM-410", customer: "Pedro Azevedo", channel: "WhatsApp", status: "Agendado", nextAction: "Oferta de revisão 1.000 km", priority: "Alta", lastContact: "12/07/2025" },
    { id: "#CRM-409", customer: "Camila Rocha", channel: "Telefone", status: "Pendente", nextAction: "Confirmar satisfação da entrega", priority: "Média", lastContact: "10/07/2025" },
    { id: "#CRM-408", customer: "Ricardo Nunes", channel: "E-mail", status: "Concluído", nextAction: "Cliente passou em nova cotação", priority: "Baixa", lastContact: "08/07/2025" },
    { id: "#CRM-407", customer: "Henrique Alves", channel: "SMS", status: "Agendado", nextAction: "Lembrete de revisão anual", priority: "Média", lastContact: "11/07/2025" },
  ];

  const [selectedFollowUpId, setSelectedFollowUpId] = useState("#CRM-410");
  const selectedFollowUp = followUps.find((entry) => entry.id === selectedFollowUpId) ?? followUps[0];

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>RELACIONAMENTO PÓS-VENDA</p><h1>CRM de clientes</h1><span>Acompanhe o relacionamento, lembretes e ações de retenção após a venda.</span></div><button className="primary-button"><Icon name="plus" size={18}/>Novo follow-up</button></section>
      <section className="stats-grid">
        <article className="stat-card"><div className="stat-icon blue"><Icon name="users" /></div><div className="stat-title"><span>Clientes ativos</span><strong className="up">96%</strong></div><h2>184</h2><p>em acompanhamento comercial</p></article>
        <article className="stat-card"><div className="stat-icon green"><Icon name="check" /></div><div className="stat-title"><span>Follow-up concluído</span><strong className="up">72%</strong></div><h2>133</h2><p>ações de pós-venda concluídas</p></article>
        <article className="stat-card"><div className="stat-icon purple"><Icon name="bell" /></div><div className="stat-title"><span>Próximos lembretes</span><strong>9 hoje</strong></div><h2>14</h2><p>ações agendadas esta semana</p></article>
        <article className="stat-card"><div className="stat-icon orange"><Icon name="trend" /></div><div className="stat-title"><span>Retenção</span><strong>81%</strong></div><h2>149</h2><p>clientes com intenção de renovar</p></article>
      </section>
      <div className="contract-stream">
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Follow-up de clientes</h3><p>Retenção, lembretes e ações pós-venda</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>CANAL</th><th>STATUS</th><th>PRÓXIMA AÇÃO</th><th>PRIORIDADE</th></tr></thead>
            <tbody>{followUps.map((entry) => (
              <tr key={entry.id} className={selectedFollowUpId === entry.id ? "selected-row" : ""} onClick={() => setSelectedFollowUpId(entry.id)}>
                <td><strong>{entry.id}</strong></td>
                <td>{entry.customer}</td>
                <td>{entry.channel}</td>
                <td><span className={`status ${entry.status === "Concluído" ? "green" : entry.status === "Pendente" ? "yellow" : "blue"}`}>{entry.status}</span></td>
                <td>{entry.nextAction}</td>
                <td><span className={`status ${entry.priority === "Alta" ? "red" : entry.priority === "Média" ? "yellow" : "green"}`}>{entry.priority}</span></td>
              </tr>
            ))}</tbody></table></div>
        </section>
        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Resumo do cliente</h3><p>{selectedFollowUp.id}</p></div></div>
          <div className="contract-summary-card">
            <div className="contract-title"><strong>{selectedFollowUp.customer}</strong><span>{selectedFollowUp.channel}</span></div>
            <div className="contract-metric"><label>Status da atividade</label><strong>{selectedFollowUp.status}</strong></div>
            <div className="contract-metric"><label>Próxima ação</label><strong>{selectedFollowUp.nextAction}</strong></div>
            <div className="contract-metric"><label>Último contato</label><strong>{selectedFollowUp.lastContact}</strong></div>
            <div className="contract-metric"><label>Prioridade</label><strong>{selectedFollowUp.priority}</strong></div>
            <div className="document-list compact-list">
              {[
                "Lembrete de revisão",
                "Pesquisa de satisfação",
                "Oferta de acessórios",
                "Retenção de cliente",
                "Checklist de pós-venda",
              ].map((item, index) => (
                <button key={item} type="button" className={index < 2 ? "document-item complete" : "document-item"}>
                  <span className="document-check"><Icon name={index < 2 ? "check" : "file"} size={16} /></span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
            <button className="primary-button">Enviar lembrete</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TeamsCommissionsPage() {
  const [sellerRate, setSellerRate] = useState("1.5");
  const [managerRate, setManagerRate] = useState("0.5");
  const sales = 2480000;
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>GESTÃO DE EQUIPES</p><h1>Equipes e comissões</h1><span>Organize a estrutura comercial e configure regras de remuneração.</span></div><button className="primary-button"><Icon name="plus" size={18}/>Nova equipe</button></section>
      <div className="commissions-layout">
        <section className="panel teams-list">
          <div className="panel-header"><div><h3>Equipes de vendas</h3><p>3 equipes · 12 vendedores ativos</p></div></div>
          {[[clientCompany, "Amanda Silva", "5 vendedores", "R$ 2,48 mi"], ["Impulso", "Bruno Tavares", "4 vendedores", "R$ 1,96 mi"], ["Vértice", "Patrícia Melo", "3 vendedores", "R$ 1,54 mi"]].map((team, index) => <div className="team-card" key={team[0]}><div className={`team-icon team-${index + 1}`}><Icon name="users" size={19}/></div><div><strong>Equipe {team[0]}</strong><span>Gerente: {team[1]} · {team[2]}</span></div><div><strong>{team[3]}</strong><span>Vendas no período</span></div><button><Icon name="arrow" size={17}/></button></div>)}
        </section>
        <section className="panel commission-config">
          <div className="panel-header"><div><h3>Regras de comissão</h3><p>Percentuais sobre contratos efetivados</p></div></div>
          <div className="commission-body">
            <label>Comissão do vendedor<div className="percent-input"><input type="number" step=".1" value={sellerRate} onChange={(e) => setSellerRate(e.target.value)}/><span>%</span></div><small>Aplicada sobre o valor total vendido pelo vendedor.</small></label>
            <label>Comissão do gerente<div className="percent-input"><input type="number" step=".1" value={managerRate} onChange={(e) => setManagerRate(e.target.value)}/><span>%</span></div><small>Aplicada sobre as vendas de toda a equipe gerenciada.</small></label>
            <div className="commission-preview"><span>Simulação · Equipe {clientCompany}</span><div><p>Volume vendido<strong>R$ 2.480.000</strong></p><p>Vendedores<strong>R$ {(sales * Number(sellerRate) / 100).toLocaleString("pt-BR")}</strong></p><p>Gerência<strong>R$ {(sales * Number(managerRate) / 100).toLocaleString("pt-BR")}</strong></p></div></div>
            <button className="auth-submit">Salvar regras de comissão</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ReportHeader({ title }: { title: string }) {
  const printedAt = new Date().toLocaleString("pt-BR");

  return (
    <>
      <div className="report-print-header">
        <div className="report-brand">
          <span className="report-mark">VFC</span>
          <span className="report-company">{clientCompany}</span>
        </div>
        <div className="report-title">{title}</div>
      </div>
      <div className="report-print-footer">Data e hora: {printedAt}</div>
    </>
  );
}

function FinanceSystemPage() {
  const exportPdf = () => {
    if (typeof window === "undefined") return;
    const previousTitle = document.title;
    document.title = "Relatório financeiro VFC Multimarcas";
    window.print();
    document.title = previousTitle;
  };

  const revenueSummary = [
    { label: "Disponível em caixa", value: "R$ 1.428.300", tone: "green" },
    { label: "Recebimentos previstos", value: "R$ 486.000", tone: "blue" },
    { label: "Pagamentos pendentes", value: "R$ 198.500", tone: "yellow" },
    { label: "Inadimplência ativa", value: "4,3%", tone: "red" },
  ];

  const movements = [
    { id: "FIN-2301", client: "Camila Rocha", type: "Honorários consultoria", value: "R$ 7.000", status: "Pendente", due: "30/09/2026" },
    { id: "FIN-2302", client: "Ricardo Nunes", type: "Entrada de contrato", value: "R$ 18.400", status: "Recebido", due: "25/09/2026" },
    { id: "FIN-2303", client: "Pedro Azevedo", type: "Complemento de veículo", value: "R$ 6.200", status: "Em revisão", due: "28/09/2026" },
    { id: "FIN-2304", client: "Fernanda Dias", type: "Taxa de análise", value: "R$ 2.400", status: "Pendente", due: "02/10/2026" },
  ];

  const bankFlow = [
    { label: "Receitas do mês", value: "R$ 812.000" },
    { label: "Despesas operacionais", value: "R$ 318.600" },
    { label: "Fluxo líquido", value: "R$ 493.400" },
    { label: "Conciliação bancária", value: "92%" },
  ];

  const sellerFinance = [
    { seller: "Marcos Costa", volume: "R$ 186.500", comission: "R$ 12.400", balance: "R$ 42.800" },
    { seller: "Juliana Castro", volume: "R$ 163.200", comission: "R$ 10.620", balance: "R$ 38.700" },
    { seller: "Rafael Lima", volume: "R$ 142.900", comission: "R$ 9.100", balance: "R$ 31.200" },
    { seller: "Amanda Silva", volume: "R$ 121.300", comission: "R$ 8.200", balance: "R$ 27.900" },
  ];

  const overdueReceivables = [
    { customer: "Lívia Mendes", amount: "R$ 14.600", due: "10/09/2026", risk: "Alta" },
    { customer: "Rogério Souza", amount: "R$ 11.300", due: "12/09/2026", risk: "Média" },
    { customer: "Ana Cavalcanti", amount: "R$ 8.900", due: "15/09/2026", risk: "Alta" },
    { customer: "Daniel Martins", amount: "R$ 5.700", due: "18/09/2026", risk: "Baixa" },
  ];

  const payableAccounts = [
    { provider: "Seguradora VFC", value: "R$ 36.400", due: "27/09/2026", status: "Pendente" },
    { provider: "Oficina Premium", value: "R$ 18.200", due: "28/09/2026", status: "Em revisão" },
    { provider: "Logística e entrega", value: "R$ 12.750", due: "30/09/2026", status: "Agendado" },
    { provider: "Imposto e contabilidade", value: "R$ 23.600", due: "04/10/2026", status: "Pendente" },
  ];

  const cashFlowTrend = [
    { month: "Jan", value: 58 },
    { month: "Fev", value: 62 },
    { month: "Mar", value: 71 },
    { month: "Abr", value: 68 },
    { month: "Mai", value: 81 },
    { month: "Jun", value: 94 },
  ];

  const approvalQueue = [
    { label: "Pagamento de comissão", type: "Vendedor", amount: "R$ 42.800", owner: "Marcos Costa", status: "Aguardando", risk: "Baixa" },
    { label: "Rescisão de contrato", type: "Operação", amount: "R$ 18.650", owner: "Financeiro", status: "Em revisão", risk: "Média" },
    { label: "Fatura de logística", type: "Fornecedor", amount: "R$ 12.750", owner: "Compras", status: "Aprovado", risk: "Baixa" },
    { label: "Multa tributária", type: "Tributos", amount: "R$ 23.600", owner: "Contábil", status: "Pendente", risk: "Alta" },
  ];

  const payablesByCategory = [
    { category: "Tributos", amount: "R$ 96.400", share: "32%" },
    { category: "Logística", amount: "R$ 74.200", share: "24%" },
    { category: "Seguros", amount: "R$ 58.600", share: "19%" },
    { category: "Comissões", amount: "R$ 48.300", share: "16%" },
    { category: "Outros", amount: "R$ 27.500", share: "9%" },
  ];

  const activeCollection = [
    { client: "Carla Moreira", amount: "R$ 21.800", stage: "Contato 2/3", owner: "Cecília", status: "Negociação" },
    { client: "Paulo Rocha", amount: "R$ 15.600", stage: "Acordo firmado", owner: "Thiago", status: "Em dia" },
    { client: "Nina Costa", amount: "R$ 13.250", stage: "Cobrança ativa", owner: "Luan", status: "Em atraso" },
    { client: "Lucas Mendes", amount: "R$ 9.400", stage: "Documentação", owner: "Beatriz", status: "Em revisão" },
  ];

  const profitability = [
    { line: "Vendas de veículos", margin: "31,6%", revenue: "R$ 2.480.000", cost: "R$ 1.700.000" },
    { line: "Consultoria crédito", margin: "28,9%", revenue: "R$ 360.000", cost: "R$ 256.000" },
    { line: "Pós-venda e serviços", margin: "22,4%", revenue: "R$ 540.000", cost: "R$ 419.000" },
    { line: "Financiamento", margin: "18,7%", revenue: "R$ 210.000", cost: "R$ 171.000" },
  ];

  const approvalCenter = [
    { id: "AP-9041", title: "Comissão de vendedores", amount: "R$ 42.800", department: "Vendas", approver: "Amanda Silva", status: "Pendência" },
    { id: "AP-9042", title: "Pagamento de fornecedores", amount: "R$ 18.650", department: "Operações", approver: "Financeiro", status: "Em revisão" },
    { id: "AP-9043", title: "Tributos do mês", amount: "R$ 23.600", department: "Contábil", approver: "Diretoria", status: "Aprovado" },
    { id: "AP-9044", title: "Seguro de frota", amount: "R$ 36.400", department: "Seguros", approver: "Compras", status: "Agendado" },
  ];

  const managerView = [
    { manager: "Amanda Silva", collection: "R$ 742.000", approvals: "14", risk: "Baixo", margin: "31,2%" },
    { manager: "Marcos Costa", collection: "R$ 621.300", approvals: "11", risk: "Médio", margin: "28,7%" },
    { manager: "Juliana Castro", collection: "R$ 594.500", approvals: "9", risk: "Baixo", margin: "30,8%" },
    { manager: "Rafael Lima", collection: "R$ 508.200", approvals: "8", risk: "Médio", margin: "26,4%" },
  ];

  const monthlyClosing = [
    { item: "Receitas operacionais", value: "R$ 812.000", status: "Fechado" },
    { item: "Despesas fixas", value: "R$ 318.600", status: "Fechado" },
    { item: "Comissões", value: "R$ 74.800", status: "Em revisão" },
    { item: "Tributos", value: "R$ 94.300", status: "Aguardando" },
  ];

  const financeChecklist = [
    "Conciliação bancária validada",
    "Contratos com pagamento confirmado",
    "Faturas de fornecedores aprovadas",
    "Códigos de contabilidade ajustados",
    "Fechamento do mês enviado a diretoria",
  ];

  const approvalHierarchy = [
    { role: "Vendedor", maxValue: "R$ 5.000", owner: "Marcos Costa" },
    { role: "Gerente", maxValue: "R$ 20.000", owner: "Amanda Silva" },
    { role: "Diretoria", maxValue: "R$ 100.000", owner: "Comitê financeiro" },
    { role: "Presidência", maxValue: "> R$ 100.000", owner: "Diretoria executiva" },
  ];

  const unitResults = [
    { unit: "São Paulo", revenue: "R$ 1.280.000", margin: "29,7%", roi: "14,8%" },
    { unit: "Rio de Janeiro", revenue: "R$ 968.400", margin: "27,5%", roi: "12,9%" },
    { unit: "Belo Horizonte", revenue: "R$ 812.900", margin: "26,1%", roi: "11,7%" },
    { unit: "Curitiba", revenue: "R$ 740.200", margin: "25,8%", roi: "10,6%" },
  ];

  const costCenters = [
    { center: "Vendas", budget: "R$ 420.000", spend: "R$ 311.200", variance: "-26%" },
    { center: "Operações", budget: "R$ 290.000", spend: "R$ 264.700", variance: "-9%" },
    { center: "Marketing", budget: "R$ 180.000", spend: "R$ 152.300", variance: "-15%" },
    { center: "Pós-venda", budget: "R$ 240.000", spend: "R$ 217.500", variance: "-9%" },
  ];

  const resultByMonth = [
    { month: "Jan", result: "R$ 324.000" },
    { month: "Fev", result: "R$ 346.000" },
    { month: "Mar", result: "R$ 381.000" },
    { month: "Abr", result: "R$ 408.000" },
    { month: "Mai", result: "R$ 462.000" },
    { month: "Jun", result: "R$ 493.400" },
  ];

  return (
    <div className="content module-content report-page">
      <ReportHeader title="Fluxo financeiro" />
      <section className="module-heading"><div><p>SISTEMA FINANCEIRO</p><h1>Fluxo financeiro</h1><span>Controle de caixa, cobrança, recebimentos e operações do negócio.</span></div><div className="heading-actions"><button className="primary-button" onClick={exportPdf}><Icon name="file" size={17}/>Exportar PDF</button><button className="primary-button"><Icon name="plus" size={18}/>Nova movimentação</button></div></section>

      <section className="stats-grid">
        {revenueSummary.map((item) => (
          <article className="stat-card" key={item.label}>
            <div className={`stat-icon ${item.tone}`}><Icon name={item.tone === "green" ? "check" : item.tone === "blue" ? "file" : item.tone === "yellow" ? "calendar" : "close"} /></div>
            <div className="stat-title"><span>{item.label}</span><strong className={item.tone === "green" ? "up" : item.tone === "red" ? "down" : "up"}>{item.tone === "red" ? "-0,4%" : "+8,2%"}</strong></div>
            <h2>{item.value}</h2><p>{item.tone === "red" ? "em comparação ao mês anterior" : "em alta no período"}</p>
          </article>
        ))}
      </section>

      <div className="contract-stream">
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Movimentações financeiras</h3><p>Fluxo de recebimentos, pagamentos e pendências</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>TIPO</th><th>VALOR</th><th>STATUS</th><th>VENCIMENTO</th></tr></thead>
            <tbody>{movements.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.client}</td>
                <td>{row.type}</td>
                <td><strong>{row.value}</strong></td>
                <td><span className={`status ${row.status === "Recebido" ? "green" : row.status === "Pendente" ? "yellow" : "blue"}`}>{row.status}</span></td>
                <td>{row.due}</td>
              </tr>
            ))}</tbody></table></div>
        </section>

        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Resumo bancário</h3><p>Fluxo e conciliação</p></div></div>
          <div className="contract-summary-card">
            {bankFlow.map((row, index) => (
              <div key={row.label} className="contract-metric">
                <label>{row.label}</label>
                <strong>{row.value}</strong>
                {index < bankFlow.length - 1 && <div className="progress-bar"><i style={{ width: index === 0 ? "78%" : index === 1 ? "42%" : index === 2 ? "86%" : "92%" }} /></div>}
              </div>
            ))}
            <button className="primary-button" onClick={exportPdf}>Consolidar saldos</button>
          </div>
        </aside>
      </div>

      <section className="panel module-table">
        <div className="panel-header"><div><h3>Financeiro por vendedor</h3><p>Volume, comissões e saldo líquido</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>VENDEDOR</th><th>VOLUME</th><th>COMISSÃO</th><th>SALDO</th></tr></thead>
          <tbody>{sellerFinance.map((row) => (
            <tr key={row.seller}>
              <td><strong>{row.seller}</strong></td>
              <td>{row.volume}</td>
              <td>{row.comission}</td>
              <td>{row.balance}</td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <div className="contract-stream" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Cobrança e inadimplência</h3><p>Recebíveis em atraso e risco de carteira</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>VALOR</th><th>VENCIMENTO</th><th>RISCO</th></tr></thead>
            <tbody>{overdueReceivables.map((row) => (
              <tr key={row.customer}>
                <td><strong>{row.customer}</strong></td>
                <td>{row.amount}</td>
                <td>{row.due}</td>
                <td><span className={`status ${row.risk === "Alta" ? "red" : row.risk === "Média" ? "yellow" : "green"}`}>{row.risk}</span></td>
              </tr>
            ))}</tbody></table></div>
        </section>

        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Alerta financeiro</h3><p>Monitoramento da carteira</p></div></div>
          <div className="contract-summary-card">
            <div className="contract-metric"><label>Dias em atraso</label><strong>19 dias</strong></div>
            <div className="contract-metric"><label>Valores em risco</label><strong>R$ 68.300</strong></div>
            <div className="contract-metric"><label>Taxa de recuperação</label><strong>61%</strong></div>
            <div className="contract-metric"><label>Última ação</label><strong>Contato com gerente</strong></div>
            <button className="primary-button">Acompanhar cobrança</button>
          </div>
        </aside>
      </div>

      <section className="panel module-table">
        <div className="panel-header"><div><h3>Contas a pagar</h3><p>Pagamentos programados e envio para aprovação</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>FORNECEDOR</th><th>VALOR</th><th>VENCIMENTO</th><th>STATUS</th></tr></thead>
          <tbody>{payableAccounts.map((row) => (
            <tr key={row.provider}>
              <td><strong>{row.provider}</strong></td>
              <td>{row.value}</td>
              <td>{row.due}</td>
              <td><span className={`status ${row.status === "Pendente" ? "yellow" : row.status === "Em revisão" ? "blue" : "green"}`}>{row.status}</span></td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <div className="contract-stream" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <section className="panel support-note contract-panel" style={{ display: "grid", gap: "1rem" }}>
          <div className="panel-header"><div><h3>Fluxo de caixa por mês</h3><p>Evolução do saldo líquido em comparação ao período anterior</p></div></div>
          <div style={{ display: "flex", alignItems: "end", gap: "0.9rem", height: "170px", padding: "0.5rem 0.2rem 0" }}>
            {cashFlowTrend.map((bar) => (
              <div key={bar.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: "100%", maxWidth: "52px", height: "110px", display: "flex", alignItems: "end", justifyContent: "center" }}>
                  <div style={{ width: "100%", height: `${bar.value}%`, background: "linear-gradient(180deg, #9bc0ff, #1d78ff)", borderRadius: "10px 10px 4px 4px", boxShadow: "inset 0 -10px 15px rgba(0,0,0,0.08)" }} />
                </div>
                <small style={{ color: "#53627a", fontWeight: 600 }}>{bar.month}</small>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Dashboard executivo</h3><p>Visão consolidada do financeiro</p></div></div>
          <div className="contract-summary-card">
            <div className="contract-metric"><label>Saldo em caixa</label><strong>R$ 1.428.300</strong></div>
            <div className="contract-metric"><label>Receitas x despesas</label><strong>+26,8%</strong></div>
            <div className="contract-metric"><label>Prazo médio de recebimento</label><strong>19 dias</strong></div>
            <div className="contract-metric"><label>Margem operacional</label><strong>31,4%</strong></div>
            <button className="primary-button" onClick={exportPdf}>Exportar painel</button>
          </div>
        </aside>
      </div>

      <section className="panel module-table">
        <div className="panel-header"><div><h3>Fila de aprovação financeira</h3><p>Pagamentos e pendências com risco de operação</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>ITEM</th><th>TIPO</th><th>VALOR</th><th>RESPONSÁVEL</th><th>STATUS</th><th>RISCO</th></tr></thead>
          <tbody>{approvalQueue.map((row) => (
            <tr key={row.label}>
              <td><strong>{row.label}</strong></td>
              <td>{row.type}</td>
              <td>{row.amount}</td>
              <td>{row.owner}</td>
              <td><span className={`status ${row.status === "Aprovado" ? "green" : row.status === "Em revisão" ? "blue" : "yellow"}`}>{row.status}</span></td>
              <td><span className={`status ${row.risk === "Alta" ? "red" : row.risk === "Média" ? "yellow" : "green"}`}>{row.risk}</span></td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <div className="contract-stream" style={{ gridTemplateColumns: "1.1fr 1.1fr" }}>
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Despesas por categoria</h3><p>Distribuição dos desembolsos por tipo de gasto</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>CATEGORIA</th><th>VALOR</th><th>PARTICIPAÇÃO</th></tr></thead>
            <tbody>{payablesByCategory.map((row) => (
              <tr key={row.category}>
                <td><strong>{row.category}</strong></td>
                <td>{row.amount}</td>
                <td>{row.share}</td>
              </tr>
            ))}</tbody></table></div>
        </section>

        <section className="panel module-table">
          <div className="panel-header"><div><h3>Cobrança ativa</h3><p>Clientes com acompanhamento financeiro em andamento</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>VALOR</th><th>ETAPA</th><th>STATUS</th></tr></thead>
            <tbody>{activeCollection.map((row) => (
              <tr key={row.client}>
                <td><strong>{row.client}</strong></td>
                <td>{row.amount}</td>
                <td>{row.stage}</td>
                <td><span className={`status ${row.status === "Em atraso" ? "red" : row.status === "Negociação" ? "yellow" : row.status === "Em revisão" ? "blue" : "green"}`}>{row.status}</span></td>
              </tr>
            ))}</tbody></table></div>
        </section>
      </div>

      <section className="panel module-table">
        <div className="panel-header"><div><h3>Rentabilidade por linha de negócio</h3><p>Receita, custo e margem dos segmentos principais</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>LINHA</th><th>MARGEM</th><th>RECEITA</th><th>CUSTO</th></tr></thead>
          <tbody>{profitability.map((row) => (
            <tr key={row.line}>
              <td><strong>{row.line}</strong></td>
              <td>{row.margin}</td>
              <td>{row.revenue}</td>
              <td>{row.cost}</td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <div className="contract-stream" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Centro de aprovação</h3><p>Pagamentos e solicitações aguardando liberação</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>ID</th><th>DESCRICAO</th><th>VALOR</th><th>DEPARTAMENTO</th><th>STATUS</th></tr></thead>
            <tbody>{approvalCenter.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.title}</td>
                <td>{row.amount}</td>
                <td>{row.department}</td>
                <td><span className={`status ${row.status === "Aprovado" ? "green" : row.status === "Pendência" ? "yellow" : row.status === "Em revisão" ? "blue" : "green"}`}>{row.status}</span></td>
              </tr>
            ))}</tbody></table></div>
        </section>

        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Indicadores da diretoria</h3><p>Visão executiva consolidada</p></div></div>
          <div className="contract-summary-card">
            <div className="contract-metric"><label>Capital disponível</label><strong>R$ 1.428.300</strong></div>
            <div className="contract-metric"><label>Taxa de aprovação</label><strong>89%</strong></div>
            <div className="contract-metric"><label>Margem consolidada</label><strong>27,5%</strong></div>
            <div className="contract-metric"><label>Risco financeiro</label><strong>Moderado</strong></div>
            <button className="primary-button" onClick={exportPdf}>Enviar relatório</button>
          </div>
        </aside>
      </div>

      <section className="panel module-table">
        <div className="panel-header"><div><h3>Dashboard por gerente</h3><p>Receita captada, aprovações e desempenho do time</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>GERENTE</th><th>COBRANÇA</th><th>APROVAÇÕES</th><th>RISCO</th><th>MARGEM</th></tr></thead>
          <tbody>{managerView.map((row) => (
            <tr key={row.manager}>
              <td><strong>{row.manager}</strong></td>
              <td>{row.collection}</td>
              <td>{row.approvals}</td>
              <td><span className={`status ${row.risk === "Baixo" ? "green" : "yellow"}`}>{row.risk}</span></td>
              <td>{row.margin}</td>
            </tr>
          ))}</tbody></table></div>
      </section>

      <div className="contract-stream" style={{ gridTemplateColumns: "1.15fr 0.85fr" }}>
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Fechamento mensal</h3><p>Resumo dos indicadores enviados para a gestão</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>ITEM</th><th>VALOR</th><th>STATUS</th></tr></thead>
            <tbody>{monthlyClosing.map((row) => (
              <tr key={row.item}>
                <td><strong>{row.item}</strong></td>
                <td>{row.value}</td>
                <td><span className={`status ${row.status === "Fechado" ? "green" : row.status === "Em revisão" ? "blue" : "yellow"}`}>{row.status}</span></td>
              </tr>
            ))}</tbody></table></div>
        </section>

        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Checklist de gestão</h3><p>Etapas do fechamento financeiro</p></div></div>
          <div className="contract-summary-card">
            <div className="document-list compact-list">
              {financeChecklist.map((item, index) => (
                <button key={item} type="button" className={index < 4 ? "document-item complete" : "document-item"}>
                  <span className="document-check"><Icon name={index < 4 ? "check" : "file"} size={16} /></span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
            <button className="primary-button">Encerrar mês</button>
          </div>
        </aside>
      </div>

      <div className="contract-stream" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Hierarquia de aprovação</h3><p>Limites por cargo para liberação de pagamentos</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>CARGO</th><th>LIMITE</th><th>RESPONSÁVEL</th></tr></thead>
            <tbody>{approvalHierarchy.map((row) => (
              <tr key={row.role}>
                <td><strong>{row.role}</strong></td>
                <td>{row.maxValue}</td>
                <td>{row.owner}</td>
              </tr>
            ))}</tbody></table></div>
        </section>

        <section className="panel module-table">
          <div className="panel-header"><div><h3>Resultado por unidade</h3><p>Desempenho de cada filial em resultado e eficiência</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>UNIDADE</th><th>RECEITA</th><th>MARGEM</th><th>ROI</th></tr></thead>
            <tbody>{unitResults.map((row) => (
              <tr key={row.unit}>
                <td><strong>{row.unit}</strong></td>
                <td>{row.revenue}</td>
                <td>{row.margin}</td>
                <td>{row.roi}</td>
              </tr>
            ))}</tbody></table></div>
        </section>
      </div>

      <div className="contract-stream" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Centro de custo</h3><p>Orçamento x execução por departamento</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>DEPARTAMENTO</th><th>ORÇAMENTO</th><th>GASTO</th><th>VARIAÇÃO</th></tr></thead>
            <tbody>{costCenters.map((row) => (
              <tr key={row.center}>
                <td><strong>{row.center}</strong></td>
                <td>{row.budget}</td>
                <td>{row.spend}</td>
                <td>{row.variance}</td>
              </tr>
            ))}</tbody></table></div>
        </section>

        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Resultado por mês</h3><p>Lucro líquido consolidado</p></div></div>
          <div className="contract-summary-card">
            {resultByMonth.map((row) => (
              <div key={row.month} className="contract-metric">
                <label>{row.month}</label>
                <strong>{row.result}</strong>
              </div>
            ))}
            <button className="primary-button" onClick={exportPdf}>Exportar indicadores</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReportsPage() {
  const payouts = [["Marcos Costa", "Vendedor", "8", "R$ 986.000", "R$ 14.790"], ["Juliana Castro", "Vendedor", "7", "R$ 842.000", "R$ 12.630"], ["Amanda Silva", "Gerente", "18", "R$ 2.480.000", "R$ 12.400"], ["Rafael Lima", "Vendedor", "6", "R$ 728.000", "R$ 10.920"]];
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const exportPdf = async () => {
    setExporting(true);
    setExportError("");
    try {
      await downloadCommissionReport(currentWeek);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Falha ao gerar o PDF.");
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="content module-content report-page">
      <ReportHeader title="Relatório de comissões" />
      <section className="module-heading"><div><p>FINANCEIRO</p><h1>Relatório de comissões</h1><span>Pagamentos calculados sobre contratos efetivados no período.</span></div><div className="heading-actions"><label className="period-picker"><Icon name="calendar" size={18}/><select><option>{currentWeekLabel}</option></select></label><button className="primary-button" onClick={exportPdf} disabled={exporting}><Icon name="file" size={17}/>{exporting ? "Gerando no servidor..." : "Exportar PDF"}</button></div></section>
      {exportError && <div className="export-error">{exportError} Verifique se a API de relatórios está disponível.</div>}
      <section className="report-hero"><div><span>Total de comissões</span><strong>R$ 50.740,00</strong><small>4 colaboradores elegíveis</small></div><div><p>Volume vendido<strong>R$ 5.036.000</strong></p><p>Contratos<strong>39</strong></p><p>Ticket médio<strong>R$ 129.128</strong></p></div></section>
      <section className="panel module-table"><div className="panel-header"><div><h3>Detalhamento por colaborador</h3><p>Valores sujeitos à validação financeira</p></div></div><div className="table-wrap"><table><thead><tr><th>COLABORADOR</th><th>PERFIL</th><th>CONTRATOS</th><th>BASE DE CÁLCULO</th><th>COMISSÃO A PAGAR</th></tr></thead><tbody>{payouts.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}><strong className={index === 4 ? "payout-value" : ""}>{cell}</strong></td>)}</tr>)}</tbody></table></div></section>
      <p className="report-footnote">Relatório gerado por {clientCompany} · Período de 01/06/2025 a 30/06/2025</p>
    </div>
  );
}

function ManagerDashboard() {
  const production = [
    { initials: "MC", name: "Marcos Costa", simulations: 18, proposals: 11, contracts: 8, sales: 986000, goal: 96 },
    { initials: "RL", name: "Rafael Lima", simulations: 15, proposals: 9, contracts: 6, sales: 728000, goal: 81 },
    { initials: "LF", name: "Lucas Freitas", simulations: 12, proposals: 7, contracts: 4, sales: 492000, goal: 68 },
    { initials: "BN", name: "Bianca Nunes", simulations: 9, proposals: 6, contracts: 3, sales: 371000, goal: 55 },
  ];
  const overrideCommission = 2480000 * 0.005;
  const directCommission = 486000 * 0.015;
  const managerCommission = overrideCommission + directCommission;
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>GESTÃO DA EQUIPE {clientCompany.toUpperCase()}</p><h1>Visão da gerência</h1><span>Acompanhe a produção dos seus vendedores e a evolução das metas.</span></div><label className="period-picker"><Icon name="calendar" size={18}/><select><option>{currentWeekLabel}</option><option>Período personalizado</option></select></label></section>
      <section className="stats-grid manager-stats">
        <article className="stat-card"><div className="stat-icon blue"><Icon name="proposal"/></div><div className="stat-title"><span>Simulações da equipe</span><strong className="up">+15,7%</strong></div><h2>54</h2><p>12 a mais que na semana anterior</p></article>
        <article className="stat-card"><div className="stat-icon purple"><Icon name="file"/></div><div className="stat-title"><span>Propostas enviadas</span><strong className="up">+9,4%</strong></div><h2>33</h2><p>61% de conversão das simulações</p></article>
        <article className="stat-card"><div className="stat-icon green"><Icon name="check"/></div><div className="stat-title"><span>Contratos efetivados</span><strong className="up">+21,1%</strong></div><h2>21</h2><p>R$ 2,48 milhões vendidos</p></article>
        <article className="stat-card commission-stat"><div className="stat-icon orange"><Icon name="percent"/></div><div className="stat-title"><span>Sua comissão estimada</span><strong>Dupla função</strong></div><h2>{managerCommission.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</h2><p>{overrideCommission.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} equipe + {directCommission.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} vendas próprias</p></article>
      </section>
      <div className="manager-grid">
        <section className="panel production-panel">
          <div className="panel-header"><div><h3>Produção por vendedor</h3><p>Resultados individuais no período selecionado</p></div><button className="plain-link">Relatório completo <Icon name="arrow" size={14}/></button></div>
          <div className="table-wrap"><table><thead><tr><th>VENDEDOR</th><th>SIMULAÇÕES</th><th>PROPOSTAS</th><th>CONTRATOS</th><th>VOLUME</th><th>META</th></tr></thead><tbody>{production.map((seller) => <tr key={seller.name}><td><div className="seller-cell"><div className="mini-avatar blue">{seller.initials}</div><strong>{seller.name}</strong></div></td><td>{seller.simulations}</td><td>{seller.proposals}</td><td><strong>{seller.contracts}</strong></td><td><strong>{seller.sales.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</strong></td><td><div className="goal-cell"><span>{seller.goal}%</span><div><i style={{ width: `${seller.goal}%` }}/></div></div></td></tr>)}</tbody></table></div>
        </section>
        <aside className="panel manager-goal">
          <div className="panel-header"><div><h3>Meta da equipe</h3><p>Junho de 2025</p></div></div>
          <div className="goal-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="49"/><circle className="goal-progress" cx="60" cy="60" r="49"/></svg><div><strong>83%</strong><span>atingido</span></div></div>
          <div className="goal-values"><span><em>Realizado</em><strong>R$ 2,48 mi</strong></span><span><em>Meta mensal</em><strong>R$ 3,00 mi</strong></span><span><em>Faltam</em><strong>R$ 520 mil</strong></span></div>
          <div className="goal-projection"><Icon name="trend" size={17}/><div><strong>Projeção acima da meta</strong><span>No ritmo atual, a equipe chegará a 108%.</span></div></div>
        </aside>
      </div>
    </div>
  );
}

function MyTeamPage() {
  const initialSellers = [
    { initials: "MC", name: "Marcos Costa", email: "marcos@proposta.com.br", since: "12/03/2023", sales: "R$ 986 mil", active: true },
    { initials: "RL", name: "Rafael Lima", email: "rafael@proposta.com.br", since: "08/08/2023", sales: "R$ 728 mil", active: true },
    { initials: "LF", name: "Lucas Freitas", email: "lucas@proposta.com.br", since: "17/01/2024", sales: "R$ 492 mil", active: true },
    { initials: "BN", name: "Bianca Nunes", email: "bianca@proposta.com.br", since: "03/04/2024", sales: "R$ 371 mil", active: true },
    { initials: "GP", name: "Gustavo Prado", email: "gustavo@proposta.com.br", since: "22/09/2022", sales: "R$ 0", active: false },
  ];
  const [sellers, setSellers] = useState(initialSellers);
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  const toggleSeller = (index: number) => {
    setSellers((current) => current.map((seller, sellerIndex) => sellerIndex === index ? { ...seller, active: !seller.active } : seller));
    setConfirmIndex(null);
  };
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>EQUIPE {clientCompany.toUpperCase()}</p><h1>Minha equipe</h1><span>Gerencie os vendedores sob sua responsabilidade sem perder o histórico.</span></div><button className="primary-button"><Icon name="plus" size={18}/>Adicionar vendedor</button></section>
      <section className="module-summary"><div><span>Vendedores ativos</span><strong>{sellers.filter((seller) => seller.active).length}</strong></div><div><span>Contratos no mês</span><strong>21</strong></div><div><span>Produção da equipe</span><strong>R$ 2,48 mi</strong></div></section>
      <div className="audit-notice"><div><Icon name="settings" size={18}/></div><p><strong>Histórico preservado</strong><span>Vendedores desligados não são excluídos. O acesso é revogado, mas propostas, contratos e registros permanecem disponíveis para auditoria.</span></p></div>
      <section className="panel module-table">
        <div className="module-toolbar"><div className="search-box"><Icon name="search" size={17}/><input placeholder="Buscar vendedor..."/></div><button><Icon name="settings" size={16}/>Todos os status</button></div>
        <div className="table-wrap"><table><thead><tr><th>VENDEDOR</th><th>E-MAIL</th><th>NA EQUIPE DESDE</th><th>VENDAS NO PERÍODO</th><th>ACESSO</th><th>AÇÃO</th></tr></thead>
          <tbody>{sellers.map((seller, index) => <tr key={seller.email} className={!seller.active ? "inactive-row" : ""}><td><div className="seller-cell"><div className={`mini-avatar ${seller.active ? "blue" : ""}`}>{seller.initials}</div><strong>{seller.name}</strong></div></td><td>{seller.email}</td><td>{seller.since}</td><td><strong>{seller.sales}</strong></td><td><span className={`status ${seller.active ? "green" : "red"}`}>{seller.active ? "Ativo" : "Desativado"}</span></td><td><button className={`staff-action ${seller.active ? "deactivate" : "activate"}`} onClick={() => seller.active ? setConfirmIndex(index) : toggleSeller(index)}>{seller.active ? "Desativar" : "Reativar acesso"}</button></td></tr>)}</tbody>
        </table></div>
      </section>
      {confirmIndex !== null && <div className="modal-layer" onMouseDown={() => setConfirmIndex(null)}><div className="modal-card confirm-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="confirm-symbol"><Icon name="users" size={24}/></div><h2>Desativar acesso?</h2><p>O acesso de <strong>{sellers[confirmIndex].name}</strong> será revogado imediatamente. Seus registros históricos serão preservados e poderão ser consultados normalmente.</p>
        <label>Motivo do desligamento<select><option>Desligamento da empresa</option><option>Transferência de equipe</option><option>Afastamento temporário</option></select></label>
        <div className="modal-actions"><button onClick={() => setConfirmIndex(null)}>Cancelar</button><button className="danger-button" onClick={() => toggleSeller(confirmIndex)}>Confirmar desativação</button></div>
      </div></div>}
    </div>
  );
}

function ApprovalsAndDocumentsPage() {
  const approvalQueue = [
    { id: "APR-1042", customer: "Ricardo Nunes", type: "Contrato de financiamento", amount: "R$ 98.500", owner: "Marcos Costa", status: "Pendente", risk: "Baixa" },
    { id: "APR-1043", customer: "Camila Rocha", type: "Acordo de consultoria", amount: "R$ 7.000", owner: "Rafael Lima", status: "Em revisão", risk: "Média" },
    { id: "APR-1044", customer: "Pedro Azevedo", type: "Pedido de garantia estendida", amount: "R$ 3.450", owner: "Juliana Castro", status: "Aprovado", risk: "Baixa" },
    { id: "APR-1045", customer: "Fernanda Dias", type: "Renegociação de dívida", amount: "R$ 18.900", owner: "Amanda Silva", status: "Pendente", risk: "Alta" },
  ];

  const documentArchive = [
    { doc: "Contrato assinado", customer: "Ricardo Nunes", channel: "e-Gov", version: "v3", status: "Arquivado", signed: true },
    { doc: "Proposta comercial", customer: "Camila Rocha", channel: "WhatsApp", version: "v2", status: "Aceito", signed: true },
    { doc: "Termo de consultoria", customer: "Pedro Azevedo", channel: "E-mail", version: "v1", status: "Pendente", signed: false },
    { doc: "Acordo de recuperação", customer: "Henrique Alves", channel: "e-Gov", version: "v1", status: "Em validação", signed: true },
  ];

  const complianceChecklist = [
    "Documentação do cliente validada",
    "Consulta de risco e crédito concluída",
    "Proposta assinada eletronicamente",
    "Cópia do PDF arquivada em segurança",
    "Envio para aprovação do gerente",
  ];

  return (
    <div className="content module-content report-page">
      <section className="module-heading">
        <div>
          <p>APROVAÇÕES E DOCUMENTOS</p>
          <h1>Centro de aprovação e juridico</h1>
          <span>Analise solicitações, valide documentos e acompanhe o arquivamento digital do cliente.</span>
        </div>
        <div className="heading-actions">
          <button className="primary-button"><Icon name="plus" size={18}/>Nova solicitação</button>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon blue"><Icon name="file" /></div>
          <div className="stat-title"><span>Solicitações pendentes</span><strong className="up">+12%</strong></div>
          <h2>14</h2><p>em fila de aprovação</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon green"><Icon name="check" /></div>
          <div className="stat-title"><span>Documentos validados</span><strong className="up">92%</strong></div>
          <h2>31</h2><p>assinaturas e arquivos concluídos</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon purple"><Icon name="contract" /></div>
          <div className="stat-title"><span>Contratos com cópia</span><strong>100%</strong></div>
          <h2>27</h2><p>arquivados no sistema jurídico</p>
        </article>
      </section>

      <div className="contract-stream" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Fila de aprovação</h3><p>Pedidos que exigem validação antes da continuidade do fluxo</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>ID</th><th>CLIENTE</th><th>DOCUMENTO</th><th>VALOR</th><th>STATUS</th><th>RISCO</th></tr></thead>
            <tbody>{approvalQueue.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.customer}</td>
                <td>{row.type}</td>
                <td>{row.amount}</td>
                <td><span className={`status ${row.status === "Aprovado" ? "green" : row.status === "Em revisão" ? "blue" : "yellow"}`}>{row.status}</span></td>
                <td><span className={`status ${row.risk === "Alta" ? "red" : row.risk === "Média" ? "yellow" : "green"}`}>{row.risk}</span></td>
              </tr>
            ))}</tbody></table></div>
        </section>

        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Checklist jurídico</h3><p>Validado antes do envio final</p></div></div>
          <div className="contract-summary-card">
            <div className="document-list compact-list">
              {complianceChecklist.map((item, index) => (
                <button key={item} type="button" className={index < 4 ? "document-item complete" : "document-item"}>
                  <span className="document-check"><Icon name={index < 4 ? "check" : "file"} size={16} /></span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
            <button className="primary-button">Enviar para aprovação</button>
          </div>
        </aside>
      </div>

      <section className="panel module-table">
        <div className="panel-header"><div><h3>Arquivo digital e assinatura</h3><p>Versões armazenadas, canais de envio e status de aceite</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>DOCUMENTO</th><th>CLIENTE</th><th>CANAL</th><th>VERSÃO</th><th>STATUS</th><th>ASSINATURA</th></tr></thead>
          <tbody>{documentArchive.map((row) => (
            <tr key={`${row.doc}-${row.customer}`}>
              <td><strong>{row.doc}</strong></td>
              <td>{row.customer}</td>
              <td>{row.channel}</td>
              <td>{row.version}</td>
              <td><span className={`status ${row.status === "Arquivado" ? "green" : row.status === "Aceito" ? "green" : row.status === "Em validação" ? "blue" : "yellow"}`}>{row.status}</span></td>
              <td><span className={`status ${row.signed ? "green" : "red"}`}>{row.signed ? "Registrada" : "Pendente"}</span></td>
            </tr>
          ))}</tbody></table></div>
      </section>
    </div>
  );
}

function SettingsPage() {
  const configRows = [
    { setting: "Validação automática de proposta", owner: "Operações", status: "Ativa" },
    { setting: "Notificação de aprovação financeira", owner: "Financeiro", status: "Ativa" },
    { setting: "Arquivamento eletrônico de contrato", owner: "Jurídico", status: "Ativa" },
    { setting: "Envio de lembrete via WhatsApp", owner: "CRM", status: "Ativa" },
  ];

  const integrationRows = [
    { name: "e-Gov", owner: "Jurídico", status: "Conectado" },
    { name: "WhatsApp Business", owner: "Marketing", status: "Conectado" },
    { name: "ERP Financeiro", owner: "Financeiro", status: "Simulado" },
    { name: "SAC / atendimento", owner: "Suporte", status: "Conectado" },
  ];

  return (
    <div className="content module-content report-page">
      <section className="module-heading">
        <div>
          <p>CONFIGURAÇÕES</p>
          <h1>Operações e permissões</h1>
          <span>Defina regras comerciais, automações e integrações que apoiam o dia a dia da operação.</span>
        </div>
        <div className="heading-actions">
          <button className="primary-button"><Icon name="plus" size={18}/>Nova regra</button>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon blue"><Icon name="settings" /></div>
          <div className="stat-title"><span>Configurações ativas</span><strong className="up">82%</strong></div>
          <h2>14</h2><p>regras em operação</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon green"><Icon name="check" /></div>
          <div className="stat-title"><span>Permissões válidas</span><strong className="up">96%</strong></div>
          <h2>26</h2><p>acessos sincronizados</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon purple"><Icon name="bell" /></div>
          <div className="stat-title"><span>Alertas automatizados</span><strong>11</strong></div>
          <h2>11</h2><p>notificações em execução</p>
        </article>
      </section>

      <div className="contract-stream" style={{ gridTemplateColumns: "1.15fr 0.85fr" }}>
        <section className="panel module-table">
          <div className="panel-header"><div><h3>Preferências operacionais</h3><p>Parâmetros e regras que definem o comportamento do sistema</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>REGRA</th><th>RESPONSÁVEL</th><th>STATUS</th></tr></thead>
            <tbody>{configRows.map((row) => (
              <tr key={row.setting}>
                <td><strong>{row.setting}</strong></td>
                <td>{row.owner}</td>
                <td><span className="status green">{row.status}</span></td>
              </tr>
            ))}</tbody></table></div>
        </section>

        <aside className="panel contract-summary">
          <div className="panel-header"><div><h3>Permissões por perfil</h3><p>Controle de acesso ao sistema</p></div></div>
          <div className="contract-summary-card">
            <div className="contract-metric"><label>Admin</label><strong>Todos os acessos</strong></div>
            <div className="contract-metric"><label>Gerente</label><strong>Financeiro + equipe</strong></div>
            <div className="contract-metric"><label>Vendedor</label><strong>Cadastro e propostas</strong></div>
            <div className="contract-metric"><label>Suporte</label><strong>CRM e atendimento</strong></div>
            <button className="primary-button">Gerenciar perfis</button>
          </div>
        </aside>
      </div>

      <section className="panel module-table">
        <div className="panel-header"><div><h3>Integrações ativas</h3><p>Conectores e integrações vinculadas à operação</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>PLATAFORMA</th><th>PROPRIETÁRIO</th><th>STATUS</th></tr></thead>
          <tbody>{integrationRows.map((row) => (
            <tr key={row.name}>
              <td><strong>{row.name}</strong></td>
              <td>{row.owner}</td>
              <td><span className={`status ${row.status === "Simulado" ? "yellow" : "green"}`}>{row.status}</span></td>
            </tr>
          ))}</tbody></table></div>
      </section>
    </div>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState(currentWeekLabel);
  const [customerHistoryMap, setCustomerHistoryMap] = useState<Record<number, CustomerHistoryEntry[]>>({
    1: [
      { date: "12/06/2025 · 14:32", title: "Simulação realizada", detail: "Jeep Compass Limited · Entrada de R$ 50.000 · 48 parcelas", tone: "blue", icon: "proposal" },
      { date: "10/06/2025 · 09:18", title: "Consulta de crédito", detail: "Score 782 · Risco baixo · Cliente sem restrições ativas", tone: "green", icon: "search" },
      { date: "22/03/2024 · 16:45", title: "Veículo adquirido", detail: "Honda City EXL 2023 · Contrato #CONT-2024-0148", tone: "purple", icon: "car" },
    ],
    2: [
      { date: "09/06/2025 · 10:10", title: "Proposta enviada", detail: "Banco Capital · Valor R$ 92.500 · Aguardando análise", tone: "blue", icon: "file" },
      { date: "04/06/2025 · 15:45", title: "Consulta de crédito", detail: "Score 714 · Aprovado para financiamento", tone: "green", icon: "check" },
    ],
    3: [
      { date: "11/06/2025 · 17:00", title: "Simulação iniciada", detail: "Toyota Corolla XEi · Entrada de R$ 40.000 · 48 parcelas", tone: "blue", icon: "proposal" },
    ],
    4: [
      { date: "18/03/2024 · 11:20", title: "Contrato de recuperação de crédito", detail: "Acordo concluído e baixado em 02/04/2024", tone: "orange", icon: "contract" },
    ],
  });
  const currentPeriodData = dashboardPeriodData[period] ?? dashboardPeriodData[currentWeekLabel];

  const addCustomerHistory = (customerName: string, title: string, detail: string, tone = "blue", icon: IconName = "proposal") => {
    const customerId = Object.keys(customerHistoryMap).find((key) => {
      const customer = [
        "Henrique Alves",
        "Camila Rocha",
        "Ricardo Nunes",
        "Fernanda Dias",
      ][Number(key) - 1];
      return customer === customerName;
    });

    if (!customerId) return;

    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    setCustomerHistoryMap((current) => ({
      ...current,
      [Number(customerId)]: [
        { date: formattedDate, title, detail, tone, icon },
        ...(current[Number(customerId)] ?? []),
      ],
    }));
  };

  if (!authenticated) return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><span /><span /><span /></div>
          <div className="brand-wordmark"><strong>VFC</strong><small>Multimarcas</small></div>
        </div>
        <nav>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className={active === item.label ? "active" : ""}
                  onClick={() => { setActive(item.label); setSidebarOpen(false); }}
                >
                  <Icon name={item.icon} size={19} />
                  <span>{item.label}</span>
                  {item.badge && <em>{item.badge}</em>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-help">
          <div className="help-icon">?</div>
          <div><strong>Precisa de ajuda?</strong><span>Acesse a central de suporte</span></div>
          <Icon name="arrow" size={16} />
        </div>
        <div className="sidebar-user">
          <div className="avatar">AM</div>
          <div><strong>André Martins</strong><span>Administrador</span></div>
          <button aria-label="Mais opções"><Icon name="more" size={18} /></button>
        </div>
      </aside>

      {sidebarOpen && <button className="backdrop" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" />}

      <main>
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><Icon name="menu" /></button>
          <div className="search-box">
            <Icon name="search" size={18} />
            <input aria-label="Busca" placeholder="Buscar clientes, propostas, veículos..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <button className="icon-button notification" aria-label="Notificações"><Icon name="bell" size={20} /><i /></button>
            <div className="top-divider" />
            <span className="store-label">Loja</span>
            <button className="store-select">{clientCompany} • São Paulo <span>⌄</span></button>
          </div>
        </header>

        {active === "Clientes" ? <CustomersPage customerHistoryMap={customerHistoryMap} onAddCustomerHistory={addCustomerHistory} /> : active === "Classificados" ? <ClassifiedsPage onSimulate={() => setActive("Simulações")}/> : active === "Simulações" ? <SimulationPage onAddCustomerHistory={addCustomerHistory} /> : active === "Usuários e perfis" ? <UsersPage/> : active === "Veículos" ? <VehiclesPage/> : active === "Painel do gerente" ? <ManagerDashboard/> : active === "Minha equipe" ? <MyTeamPage/> : active === "Aprovações e documentos" ? <ApprovalsAndDocumentsPage/> : active === "Painel de suporte" ? <SupportDashboard/> : active === "Propostas" ? <ProposalReviewPage onAddCustomerHistory={addCustomerHistory}/> : active === "Contratos" ? <ContractManagementPage/> : active === "Entrega e pós-venda" ? <DeliveryPage/> : active === "Garantia e pós-venda" ? <AfterSalesPage/> : active === "CRM pós-venda" ? <CustomerFollowUpPage/> : active === "Equipes e comissões" ? <TeamsCommissionsPage/> : active === "Sistema financeiro" ? <FinanceSystemPage/> : active === "Relatórios" ? <ReportsPage/> : active === "Configurações" ? <SettingsPage/> : active !== "Dashboard" ? <ModulePage name={active}/> : <div className="content">
          <section className="page-heading">
            <div>
              <p>{currentDateLabel}</p>
              <h1>Olá, André. <span>Seu desempenho está em alta.</span></h1>
            </div>
            <div className="heading-actions">
              <label className="period-picker">
                <Icon name="calendar" size={18} />
                <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option>{currentWeekLabel}</option>
                  <option>Últimos 30 dias</option>
                  <option>Últimos 90 dias</option>
                  <option>Período personalizado</option>
                </select>
              </label>
              <button className="primary-button"><Icon name="plus" size={18} /> Nova proposta</button>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon blue"><Icon name="proposal" /></div>
              <div className="stat-title"><span>Simulações</span><strong className={currentPeriodData.sims.tone}>{currentPeriodData.sims.delta}</strong></div>
              <h2>{currentPeriodData.sims.value}</h2><p>vs. período anterior</p>
              <div className="spark blue-spark">{currentPeriodData.spark.map((item, index) => <i key={`${item.height}-${index}`} style={{ height: item.height, opacity: index === 6 ? 0.7 : 0.19 }} />)}</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon purple"><Icon name="file" /></div>
              <div className="stat-title"><span>Propostas</span><strong className={currentPeriodData.proposals.tone}>{currentPeriodData.proposals.delta}</strong></div>
              <h2>{currentPeriodData.proposals.value}</h2><p>vs. período anterior</p>
              <div className="spark purple-spark">{currentPeriodData.spark.map((item, index) => <i key={`${item.height}-${index}`} style={{ height: item.height, opacity: index === 6 ? 0.7 : 0.19 }} />)}</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon green"><Icon name="check" /></div>
              <div className="stat-title"><span>Contratos efetivados</span><strong className={currentPeriodData.contracts.tone}>{currentPeriodData.contracts.delta}</strong></div>
              <h2>{currentPeriodData.contracts.value}</h2><p>vs. período anterior</p>
              <div className="spark green-spark">{currentPeriodData.spark.map((item, index) => <i key={`${item.height}-${index}`} style={{ height: item.height, opacity: index === 6 ? 0.7 : 0.19 }} />)}</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon red"><Icon name="close" /></div>
              <div className="stat-title"><span>Propostas recusadas</span><strong className={currentPeriodData.rejected.tone}>{currentPeriodData.rejected.delta}</strong></div>
              <h2>{currentPeriodData.rejected.value}</h2><p>vs. período anterior</p>
              <div className="spark red-spark">{currentPeriodData.spark.map((item, index) => <i key={`${item.height}-${index}`} style={{ height: item.height, opacity: index === 6 ? 0.7 : 0.19 }} />)}</div>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel performance-panel">
              <div className="panel-header">
                <div><h3>Desempenho comercial</h3><p>Evolução de simulações, propostas e contratos</p></div>
                <button>Últimas 6 semanas <span>⌄</span></button>
              </div>
              <div className="legend">
                <span><i className="dot-blue"/>Simulações</span>
                <span><i className="dot-purple"/>Propostas</span>
                <span><i className="dot-green"/>Contratos</span>
              </div>
              <div className="chart-area">
                <div className="y-axis"><span>60</span><span>45</span><span>30</span><span>15</span><span>0</span></div>
                <div className="chart">
                  <div className="gridline g1"/><div className="gridline g2"/><div className="gridline g3"/><div className="gridline g4"/>
                  <svg viewBox="0 0 650 205" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2867e8" stopOpacity=".16"/><stop offset="1" stopColor="#2867e8" stopOpacity="0"/></linearGradient>
                    </defs>
                    <path className="area-fill" d="M0,150 C55,139 68,122 130,130 S210,92 260,105 S340,72 390,84 S472,45 520,63 S602,28 650,38 L650,205 L0,205Z"/>
                    <path className="line line-blue" d="M0,150 C55,139 68,122 130,130 S210,92 260,105 S340,72 390,84 S472,45 520,63 S602,28 650,38"/>
                    <path className="line line-purple" d="M0,175 C60,160 74,153 130,157 S210,133 260,140 S335,113 390,125 S470,88 520,105 S605,70 650,76"/>
                    <path className="line line-green" d="M0,189 C58,183 75,175 130,180 S210,160 260,169 S340,144 390,154 S470,122 520,140 S605,106 650,116"/>
                  </svg>
                  <div className="x-axis"><span>05—11 mai</span><span>12—18 mai</span><span>19—25 mai</span><span>26 mai—01 jun</span><span>02—08 jun</span><span>09—15 jun</span></div>
                </div>
              </div>
            </article>

            <article className="panel activity-panel">
              <div className="panel-header"><div><h3>Atividade recente</h3><p>Atualizações da sua equipe</p></div><button className="plain-link">Ver todas <Icon name="arrow" size={14}/></button></div>
              <div className="activity-list">
                {activities.map((activity) => (
                  <div className="activity" key={activity.item}>
                    <div className={`mini-avatar ${activity.tone}`}>{activity.initials}</div>
                    <div><p><strong>{activity.name}</strong> {activity.action}</p><a>{activity.item}</a><span>{activity.time}</span></div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="panel proposals-panel">
            <div className="panel-header">
              <div><h3>Propostas recentes</h3><p>Acompanhe as últimas negociações da equipe</p></div>
              <button className="plain-link">Ver todas as propostas <Icon name="arrow" size={14}/></button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>PROPOSTA</th><th>CLIENTE</th><th>VEÍCULO</th><th>VENDEDOR</th><th>VALOR</th><th>STATUS</th><th></th></tr></thead>
                <tbody>
                  {proposals.map((proposal) => (
                    <tr key={proposal.id}>
                      <td><strong>{proposal.id}</strong></td><td>{proposal.client}</td><td>{proposal.car}</td><td>{proposal.seller}</td><td><strong>{proposal.value}</strong></td>
                      <td><span className={`status ${proposal.tone}`}><i/>{proposal.status}</span></td>
                      <td><button className="row-more" aria-label="Mais opções"><Icon name="more" size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>}
      </main>
    </div>
  );
}
