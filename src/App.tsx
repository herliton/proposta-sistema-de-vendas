import { useState } from "react";
import vfcLogo from "./assets/vfc-logo.png";
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
      { label: "Painel de suporte", icon: "trend" as IconName },
      { label: "Equipes e comissões", icon: "chart" as IconName },
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
        <img src={vfcLogo} alt={clientCompany} className="brand-logo" />
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
  const [editingName, setEditingName] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState({ street: "", neighborhood: "", city: "", state: "" });
  const [cepStatus, setCepStatus] = useState("");
  const users = [
    { initials: "MC", name: "Marcos Costa", email: "marcos@proposta.com.br", phone: "(11) 98722-1840", role: "SELLER", active: true },
    { initials: "AS", name: "Amanda Silva", email: "amanda@proposta.com.br", phone: "(11) 99188-4201", role: "MANAGER", active: true },
    { initials: "RL", name: "Rafael Lima", email: "rafael@proposta.com.br", phone: "(11) 99854-1770", role: "SELLER", active: true },
    { initials: "BS", name: "Beatriz Souza", email: "beatriz@proposta.com.br", phone: "(11) 98231-9802", role: "SUPPORT", active: false },
  ];
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
  const openForm = (name = "") => {
    setEditingName(name);
    setCep("");
    setAddress({ street: "", neighborhood: "", city: "", state: "" });
    setCepStatus("");
    setShowForm(true);
  };
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>ADMINISTRAÇÃO E ACESSOS</p><h1>Usuários e perfis</h1><span>Gerencie dados pessoais, funções e acessos dos colaboradores.</span></div><button className="primary-button" onClick={() => openForm()}><Icon name="plus" size={18}/>Novo usuário</button></section>
      <section className="module-summary"><div><span>Usuários ativos</span><strong>18</strong></div><div><span>Gerentes-vendedores</span><strong>3</strong></div><div><span>Acessos desativados</span><strong>2</strong></div></section>
      <section className="panel module-table">
        <div className="module-toolbar"><div className="search-box"><Icon name="search" size={17}/><input placeholder="Buscar usuário, e-mail ou perfil..."/></div><button><Icon name="settings" size={16}/>Filtros</button></div>
        <div className="table-wrap"><table><thead><tr><th>USUÁRIO</th><th>CONTATO</th><th>PERFIL</th><th>STATUS</th><th>ACESSOS HERDADOS</th><th></th></tr></thead><tbody>{users.map((user) => <tr key={user.email}><td><div className="seller-cell"><div className="mini-avatar blue">{user.initials}</div><div><strong>{user.name}</strong><small className="table-subcopy">{user.email}</small></div></div></td><td>{user.phone}</td><td><span className="role-pill">{user.role}</span></td><td><span className={`status ${user.active ? "green" : "red"}`}>{user.active ? "Ativo" : "Inativo"}</span></td><td>{user.role === "MANAGER" ? <span className="inheritance-pill">MANAGER + SELLER</span> : "—"}</td><td><button className="edit-link" onClick={() => openForm(user.name)}>Editar</button></td></tr>)}</tbody></table></div>
      </section>
      {showForm && <div className="page-form-layer"><div className="modal-card wide-modal user-modal page-form-card">
        <button className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para usuários</button>
        <div className="modal-title"><div><span>{editingName ? "EDIÇÃO DE USUÁRIO" : "NOVO USUÁRIO"}</span><h2>{editingName || "Cadastrar colaborador"}</h2><p>Preencha os dados de identificação, acesso e endereço do colaborador.</p></div></div>
        <div className="profile-upload"><label><input type="file" accept="image/*"/><span><Icon name="plus" size={17}/></span></label><div><strong>Foto de perfil</strong><small>JPG ou PNG · máximo de 5 MB</small></div></div>
        <div className="form-section-title">Identificação e acesso</div>
        <div className="modal-row"><label>Nome completo<input defaultValue={editingName} placeholder="Nome e sobrenome"/></label><label>Telefone / WhatsApp<input placeholder="(00) 00000-0000"/></label></div>
        <div className="modal-row"><label>E-mail de acesso<input type="email" placeholder="usuario@empresa.com.br"/></label><label>Perfil<select defaultValue={editingName === "Amanda Silva" ? "MANAGER" : "SELLER"}><option>ADMIN</option><option>MANAGER</option><option>SELLER</option><option>SUPPORT</option></select></label></div>
        <div className="role-inheritance-note"><Icon name="users" size={17}/><span>O perfil <strong>MANAGER</strong> herda automaticamente todos os acessos operacionais de <strong>SELLER</strong>.</span></div>
        <div className="form-section-title">Endereço completo</div>
        <div className="cep-row"><label>CEP<input value={cep} onChange={(event) => setCep(event.target.value)} onBlur={lookupCep} placeholder="00000-000"/></label><button type="button" onClick={lookupCep}><Icon name="search" size={15}/>Buscar CEP</button><span>{cepStatus}</span></div>
        <div className="modal-row address-main"><label>Logradouro<input value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })}/></label><label>Número<input placeholder="Nº"/></label></div>
        <div className="modal-row"><label>Complemento<input placeholder="Apto, bloco ou referência"/></label><label>Bairro<input value={address.neighborhood} onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })}/></label></div>
        <div className="modal-row city-row"><label>Cidade<input value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })}/></label><label>Estado<input value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })}/></label></div>
        <div className="modal-actions"><button onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" onClick={() => setShowForm(false)}>{editingName ? "Salvar alterações" : "Cadastrar e enviar acesso"}</button></div>
      </div></div>}
    </div>
  );
}

type VehicleStatus = "AVAILABLE" | "IN_NEGOTIATION" | "SOLD";

function VehiclesPage() {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const vehicles: { name: string; detail: string; years: string; fipe: string; suggested: string; minimum: string; status: VehicleStatus; simulations: number }[] = [
    { name: "Jeep Compass Limited", detail: "RZY-4J82 · Flex · Automático", years: "2024 / 2025", fipe: "R$ 163.420", suggested: "R$ 168.900", minimum: "R$ 160.000", status: "IN_NEGOTIATION", simulations: 4 },
    { name: "VW T-Cross Highline", detail: "KLP-2D67 · Flex · Automático", years: "2024 / 2024", fipe: "R$ 132.110", suggested: "R$ 134.900", minimum: "R$ 128.500", status: "AVAILABLE", simulations: 0 },
    { name: "Hyundai Creta Platinum", detail: "EJM-7K31 · Flex · Automático", years: "2023 / 2024", fipe: "R$ 96.870", suggested: "R$ 98.500", minimum: "R$ 93.000", status: "IN_NEGOTIATION", simulations: 2 },
    { name: "Honda HR-V Touring", detail: "BRA-9F21 · Gasolina · Automático", years: "2024 / 2025", fipe: "R$ 171.800", suggested: "R$ 176.200", minimum: "R$ 168.000", status: "SOLD", simulations: 0 },
  ];
  const visible = vehicles.filter((vehicle) => statusFilter === "ALL" || vehicle.status === statusFilter);
  const statusLabel = { AVAILABLE: "Disponível", IN_NEGOTIATION: "Em negociação", SOLD: "Vendido" };
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>GESTÃO DE ESTOQUE</p><h1>Veículos</h1><span>Controle preços, mídia e disponibilidade do estoque.</span></div><button className="primary-button" onClick={() => setShowForm(true)}><Icon name="plus" size={18}/>Cadastrar veículo</button></section>
      <section className="module-summary"><div><span>Disponíveis</span><strong>24</strong></div><div><span>Em negociação</span><strong>7</strong></div><div><span>Vendidos no mês</span><strong>13</strong></div></section>
      <section className="panel module-table">
        <div className="module-toolbar vehicle-toolbar"><div className="search-box"><Icon name="search" size={17}/><input placeholder="Buscar marca, modelo ou placa..."/></div><div className="filter-fields"><select><option>Todos os anos</option><option>2025</option><option>2024</option><option>2023</option></select><select><option>Todas as marcas</option><option>Jeep</option><option>Volkswagen</option><option>Hyundai</option></select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">Todos os status</option><option value="AVAILABLE">Disponível</option><option value="IN_NEGOTIATION">Em negociação</option><option value="SOLD">Vendido</option></select></div></div>
        <div className="table-wrap"><table><thead><tr><th>VEÍCULO</th><th>ANO FAB. / MOD.</th><th>VALOR FIPE</th><th>PREÇO SUGERIDO</th><th>PREÇO MÍNIMO</th><th>SIMULAÇÕES ATIVAS</th><th>STATUS</th><th></th></tr></thead><tbody>{visible.map((vehicle) => <tr key={vehicle.name}><td><div className="vehicle-cell"><div><Icon name="car" size={20}/></div><span><strong>{vehicle.name}</strong><small>{vehicle.detail}</small></span></div></td><td>{vehicle.years}</td><td>{vehicle.fipe}</td><td><strong>{vehicle.suggested}</strong></td><td>{vehicle.minimum}</td><td><span className={`simulation-count ${vehicle.simulations ? "has-count" : ""}`}>{vehicle.simulations}</span></td><td><span className={`status ${vehicle.status === "AVAILABLE" ? "green" : vehicle.status === "SOLD" ? "red" : "yellow"}`}>{statusLabel[vehicle.status]}</span></td><td><button className="row-more"><Icon name="more" size={18}/></button></td></tr>)}</tbody></table></div>
      </section>
      {showForm && <div className="page-form-layer"><div className="modal-card wide-modal vehicle-modal page-form-card">
        <button className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para veículos</button>
        <div className="modal-title"><div><span>NOVO ITEM DO ESTOQUE</span><h2>Cadastrar veículo</h2><p>Adicione os dados, valores e arquivos de mídia do veículo.</p></div></div>
        <div className="form-section-title">Identificação</div>
        <div className="modal-row"><label>Marca<input placeholder="Ex.: Jeep"/></label><label>Modelo<input placeholder="Ex.: Compass Limited"/></label></div>
        <div className="modal-row"><label>Ano de fabricação<input placeholder="2024"/></label><label>Ano do modelo<input placeholder="2025"/></label></div>
        <div className="modal-row"><label>Código FIPE<input placeholder="000000-0"/></label><label>Placa<input placeholder="ABC-1D23"/></label></div>
        <div className="form-section-title">Precificação</div>
        <div className="pricing-grid"><label>Valor FIPE<div className="input-action"><input placeholder="R$ 0,00"/><button>Consultar FIPE</button></div></label><label>Preço sugerido<input placeholder="R$ 0,00"/></label><label>Preço mínimo<input placeholder="R$ 0,00"/></label></div>
        <div className="form-section-title">Fotos e vídeo</div>
        <div className="media-grid">{["Frente", "Lateral direita", "Lateral esquerda", "Traseira", "Interior"].map((label) => <label key={label}><input type="file" accept="image/*"/><Icon name="plus" size={18}/><span>{label}</span></label>)}<label className="video-upload"><input type="file" accept="video/*"/><Icon name="plus" size={18}/><span>Vídeo · máx. 1 min</span></label></div>
        <div className="modal-actions"><button onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" onClick={() => setShowForm(false)}>Cadastrar veículo</button></div>
      </div></div>}
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

function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const [cpf, setCpf] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<number | null>(null);
  const [customerCep, setCustomerCep] = useState("");
  const [customerAddress, setCustomerAddress] = useState({ street: "", neighborhood: "", city: "", state: "" });
  const [customerCepStatus, setCustomerCepStatus] = useState("");
  const [creditResult, setCreditResult] = useState<"idle" | "loading" | "approved">("idle");
  const customers = [
    ["Henrique Alves", "123.456.789-10", "(11) 98722-1840", "R$ 12.500", "Juliana Castro", "Em atendimento"],
    ["Camila Rocha", "298.441.720-09", "(11) 99134-5531", "R$ 18.900", "Rafael Lima", "Em proposta"],
    ["Ricardo Nunes", "442.807.116-34", "(11) 98802-4260", "R$ 9.800", "Marcos Costa", "Em simulação"],
  ];

  const checkCredit = () => {
    setCreditResult("loading");
    window.setTimeout(() => setCreditResult("approved"), 700);
  };
  const openCustomerForm = (index: number | null) => {
    setEditingCustomer(index);
    setCpf(index === null ? "" : customers[index][1]);
    setCustomerCep(index === null ? "" : "01310-100");
    setCustomerAddress(index === null ? { street: "", neighborhood: "", city: "", state: "" } : { street: "Avenida Paulista", neighborhood: "Bela Vista", city: "São Paulo", state: "SP" });
    setCustomerCepStatus("");
    setCreditResult("idle");
    setShowForm(true);
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
  const customerHistory = [
    { date: "12/06/2025 · 14:32", title: "Simulação realizada", detail: "Jeep Compass Limited · Entrada de R$ 50.000 · 48 parcelas", tone: "blue", icon: "proposal" as IconName },
    { date: "10/06/2025 · 09:18", title: "Consulta de crédito", detail: "Score 782 · Risco baixo · Cliente sem restrições ativas", tone: "green", icon: "search" as IconName },
    { date: "22/03/2024 · 16:45", title: "Veículo adquirido", detail: "Honda City EXL 2023 · Contrato #CONT-2024-0148", tone: "purple", icon: "car" as IconName },
    { date: "18/03/2024 · 11:20", title: "Contrato de recuperação de crédito", detail: "Acordo concluído e baixado em 02/04/2024", tone: "orange", icon: "contract" as IconName },
  ];

  return (
    <div className="content module-content">
      <section className="module-heading">
        <div><p>OPERAÇÃO COMERCIAL</p><h1>Clientes</h1><span>Cadastre clientes e acompanhe o responsável por cada atendimento.</span></div>
        <button className="primary-button" onClick={() => openCustomerForm(null)}><Icon name="plus" size={18}/>Novo cliente</button>
      </section>
      <section className="module-summary">
        <div><span>Clientes ativos</span><strong>184</strong></div><div><span>Novos esta semana</span><strong>12</strong></div><div><span>Em negociação</span><strong>27</strong></div>
      </section>
      <section className="panel module-table">
        <div className="module-toolbar"><div className="search-box"><Icon name="search" size={17}/><input placeholder="Buscar por nome ou CPF..."/></div><button><Icon name="settings" size={16}/>Filtros</button></div>
        <div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>CPF</th><th>CONTATO</th><th>RENDA</th><th>VENDEDOR RESPONSÁVEL</th><th>STATUS</th><th></th></tr></thead>
          <tbody>{customers.map((row, customerIndex) => <tr key={row[1]}>{row.map((cell, index) => <td key={cell}>{index === 5 ? <span className="status blue">{cell}</span> : cell}</td>)}<td><button className="edit-customer-button" onClick={() => openCustomerForm(customerIndex)}>Editar <Icon name="arrow" size={14}/></button></td></tr>)}</tbody>
        </table></div>
      </section>
      {showForm && <div className="page-form-layer"><div className="modal-card wide-modal page-form-card">
        <button className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para clientes</button>
        <div className="modal-title"><div><span>{editingCustomer === null ? "CADASTRO COMERCIAL" : "EDIÇÃO E RELACIONAMENTO"}</span><h2>{editingCustomer === null ? "Novo cliente" : customers[editingCustomer][0]}</h2><p>{editingCustomer === null ? "Informe os dados necessários para contratos e análise de crédito." : "Atualize os dados cadastrais e consulte o histórico de relacionamento."}</p></div></div>
        <div className="form-section-title">Dados pessoais</div>
        <div className="modal-row"><label>Nome completo<input autoFocus defaultValue={editingCustomer === null ? "" : customers[editingCustomer][0]} placeholder="Nome conforme documento"/></label><label>CPF<input value={cpf} onChange={(e) => { setCpf(e.target.value); setCreditResult("idle"); }} placeholder="000.000.000-00"/></label></div>
        <div className="modal-row"><label>E-mail<input type="email" defaultValue={editingCustomer === null ? "" : `${customers[editingCustomer][0].toLowerCase().replace(" ", ".")}@email.com`} placeholder="cliente@email.com"/></label><label>Telefone<input defaultValue={editingCustomer === null ? "" : customers[editingCustomer][2]} placeholder="(00) 00000-0000"/></label></div>
        <div className="form-section-title">Endereço completo</div>
        <div className="cep-row"><label>CEP<input value={customerCep} onChange={(event) => setCustomerCep(event.target.value)} onBlur={lookupCustomerCep} placeholder="00000-000"/></label><button type="button" onClick={lookupCustomerCep}><Icon name="search" size={15}/>Buscar ViaCEP</button><span>{customerCepStatus}</span></div>
        <div className="modal-row address-main"><label>Logradouro<input value={customerAddress.street} onChange={(event) => setCustomerAddress({ ...customerAddress, street: event.target.value })} placeholder="Rua, avenida ou travessa"/></label><label>Número<input defaultValue={editingCustomer === null ? "" : "1000"} placeholder="Nº"/></label></div>
        <div className="modal-row"><label>Complemento<input defaultValue={editingCustomer === null ? "" : "Apto 42"} placeholder="Apto, bloco ou referência"/></label><label>Bairro<input value={customerAddress.neighborhood} onChange={(event) => setCustomerAddress({ ...customerAddress, neighborhood: event.target.value })}/></label></div>
        <div className="modal-row city-row"><label>Cidade<input value={customerAddress.city} onChange={(event) => setCustomerAddress({ ...customerAddress, city: event.target.value })}/></label><label>Estado<input value={customerAddress.state} onChange={(event) => setCustomerAddress({ ...customerAddress, state: event.target.value })}/></label></div>
        <div className="form-section-title">Renda e ocupação</div>
        <div className="modal-row"><label>Renda mensal<input placeholder="R$ 0,00"/></label><label>Ocupação<input placeholder="Profissão ou atividade"/></label></div>
        <div className="credit-check">
          <div className="credit-icon"><Icon name={creditResult === "approved" ? "check" : "search"} size={19}/></div>
          <div><strong>Consulta de crédito</strong><span>{creditResult === "approved" ? "CPF consultado · Score 782 · Risco baixo" : "Consulte o CPF nos bureaus de proteção ao crédito."}</span></div>
          <button type="button" onClick={checkCredit} disabled={!cpf || creditResult === "loading"}>{creditResult === "loading" ? "Consultando..." : creditResult === "approved" ? "Consultar novamente" : "Consultar CPF"}</button>
        </div>
        {editingCustomer !== null && <div className="customer-history"><div className="form-section-title">Histórico de relacionamento</div><div className="timeline">{customerHistory.map((event) => <div className="timeline-event" key={event.date}><div className={`timeline-icon ${event.tone}`}><Icon name={event.icon} size={16}/></div><div><span>{event.date}</span><strong>{event.title}</strong><p>{event.detail}</p></div></div>)}</div></div>}
        <div className="modal-actions"><button onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" onClick={() => setShowForm(false)}>{editingCustomer === null ? "Cadastrar cliente" : "Salvar alterações"}</button></div>
      </div></div>}
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

function SimulationPage() {
  const [customer, setCustomer] = useState("");
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
    setConflict(value === "Henrique Alves" ? "O cliente está sendo atendido por Juliana Castro desde 09/06/2025." : "");
  };
  const toggleBenefit = (benefit: string) => setBenefits((current) => current.includes(benefit) ? current.filter((item) => item !== benefit) : [...current, benefit]);

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>OPERAÇÃO COMERCIAL</p><h1>Nova simulação</h1><span>Configure os dados da negociação e calcule o financiamento.</span></div><button className="secondary-button">Salvar rascunho</button></section>
      <div className="simulation-layout">
        <div className="simulation-form">
          <section className="panel form-panel">
            <div className="step-title"><span>1</span><div><h3>Cliente</h3><p>Selecione o cliente desta negociação.</p></div></div>
            <label>Cliente cadastrado<select value={customer} onChange={(e) => selectCustomer(e.target.value)}><option value="">Selecione um cliente</option><option>Ricardo Nunes</option><option>Camila Rocha</option><option>Henrique Alves</option></select></label>
            {conflict && <div className="conflict-alert"><strong>Atendimento em andamento</strong><span>{conflict}</span><small>Para prosseguir, solicite a transferência ao gerente.</small></div>}
          </section>
          <section className="panel form-panel">
            <div className="step-title"><span>2</span><div><h3>Veículo</h3><p>Apenas veículos disponíveis podem ser selecionados.</p></div></div>
            <label>Veículo do estoque<select value={vehicle} onChange={(e) => { setVehicle(e.target.value); setSalePrice(e.target.value === "169000" ? "168900" : e.target.value); }}><option value="169000">Jeep Compass Limited · Em negociação · 4 simulações</option><option value="134900">VW T-Cross Highline · Disponível · 0 simulações</option><option value="98500">Hyundai Creta Platinum · Em negociação · 2 simulações</option></select></label>
            <div className="vehicle-selection-meta"><span><Icon name="check" size={15}/> Aceita novas simulações</span><span><Icon name="proposal" size={15}/> {currentVehicle.simulations} simulações ativas</span><span>Status: <strong>{currentVehicle.status === "AVAILABLE" ? "Disponível" : "Em negociação"}</strong></span></div>
            <label className="sale-price-field">Preço negociado<input type="number" value={salePrice} onChange={(event) => setSalePrice(event.target.value)}/><small>Preço mínimo autorizado: {brl(currentVehicle.minimum)}</small></label>
            {isBelowMinimum && <div className="price-alert">O valor de venda não pode ser menor que o preço mínimo cadastrado.</div>}
          </section>
          <section className="panel form-panel">
            <div className="step-title"><span>3</span><div><h3>Benefícios</h3><p>Escolha os benefícios autorizados para esta proposta.</p></div></div>
            <div className="benefit-grid">{["IPVA pago", "Tanque cheio", "Transferência", "Seguro 3 meses"].map((benefit) => <button type="button" className={benefits.includes(benefit) ? "selected" : ""} onClick={() => toggleBenefit(benefit)} key={benefit}><span><Icon name="gift" size={18}/>{benefit}</span><i>{benefits.includes(benefit) ? "✓" : "+"}</i></button>)}</div>
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
            onClick={() => setStage((current) => transitionSalesStage(current, "PROPOSAL"))}
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
    { name: "Equipe Horizonte", manager: "Amanda Silva", contracts: 18, sales: "R$ 2,48 mi", goal: 92 },
    { name: "Equipe Impulso", manager: "Bruno Tavares", contracts: 15, sales: "R$ 1,96 mi", goal: 81 },
    { name: "Equipe Vértice", manager: "Patrícia Melo", contracts: 12, sales: "R$ 1,54 mi", goal: 74 },
  ];
  const sellers = [
    { initials: "MC", name: "Marcos Costa", team: "Horizonte", contracts: 8, sales: "R$ 986 mil" },
    { initials: "JC", name: "Juliana Castro", team: "Impulso", contracts: 7, sales: "R$ 842 mil" },
    { initials: "RL", name: "Rafael Lima", team: "Horizonte", contracts: 6, sales: "R$ 728 mil" },
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

function ProposalReviewPage() {
  const [submitted, setSubmitted] = useState<string[]>([]);
  const reviewRows = [
    { id: "#0842", customer: "Ricardo Nunes", seller: "Marcos Costa", bank: "Banco Alfa", amount: "R$ 118.900", score: "782" },
    { id: "#0841", customer: "Camila Rocha", seller: "Rafael Lima", bank: "Banco Capital", amount: "R$ 92.500", score: "714" },
    { id: "#0838", customer: "Pedro Azevedo", seller: "Juliana Castro", bank: "Banco União", amount: "R$ 106.200", score: "698" },
  ];
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>OPERAÇÃO BANCÁRIA</p><h1>Análise de propostas</h1><span>Revise a documentação e envie propostas para aprovação bancária.</span></div></section>
      <div className="review-tabs"><button className="active">Aguardando envio <span>3</span></button><button>Em análise bancária <span>8</span></button><button>Aprovadas <span>14</span></button><button>Recusadas <span>5</span></button></div>
      <section className="panel module-table">
        <div className="module-toolbar"><div className="search-box"><Icon name="search" size={17}/><input placeholder="Buscar proposta ou cliente..."/></div><button><Icon name="settings" size={16}/>Filtros</button></div>
        <div className="table-wrap"><table><thead><tr><th>PROPOSTA</th><th>CLIENTE</th><th>VENDEDOR</th><th>BANCO SELECIONADO</th><th>FINANCIADO</th><th>SCORE</th><th>AÇÃO</th></tr></thead>
          <tbody>{reviewRows.map((row) => <tr key={row.id}><td><strong>{row.id}</strong></td><td>{row.customer}</td><td>{row.seller}</td><td>{row.bank}</td><td><strong>{row.amount}</strong></td><td><span className="score-pill">{row.score}</span></td><td><button className={`submit-bank ${submitted.includes(row.id) ? "done" : ""}`} onClick={() => setSubmitted((current) => [...current, row.id])}>{submitted.includes(row.id) ? "Enviada ao banco" : "Revisar e enviar"}</button></td></tr>)}</tbody>
        </table></div>
      </section>
      <div className="support-note"><Icon name="settings" size={18}/><div><strong>Integração com portais bancários</strong><span>O envio está em modo demonstrativo. Em produção, cada banco utilizará seu conector de API ou portal homologado.</span></div></div>
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
          {[["Horizonte", "Amanda Silva", "5 vendedores", "R$ 2,48 mi"], ["Impulso", "Bruno Tavares", "4 vendedores", "R$ 1,96 mi"], ["Vértice", "Patrícia Melo", "3 vendedores", "R$ 1,54 mi"]].map((team, index) => <div className="team-card" key={team[0]}><div className={`team-icon team-${index + 1}`}><Icon name="users" size={19}/></div><div><strong>Equipe {team[0]}</strong><span>Gerente: {team[1]} · {team[2]}</span></div><div><strong>{team[3]}</strong><span>Vendas no período</span></div><button><Icon name="arrow" size={17}/></button></div>)}
        </section>
        <section className="panel commission-config">
          <div className="panel-header"><div><h3>Regras de comissão</h3><p>Percentuais sobre contratos efetivados</p></div></div>
          <div className="commission-body">
            <label>Comissão do vendedor<div className="percent-input"><input type="number" step=".1" value={sellerRate} onChange={(e) => setSellerRate(e.target.value)}/><span>%</span></div><small>Aplicada sobre o valor total vendido pelo vendedor.</small></label>
            <label>Comissão do gerente<div className="percent-input"><input type="number" step=".1" value={managerRate} onChange={(e) => setManagerRate(e.target.value)}/><span>%</span></div><small>Aplicada sobre as vendas de toda a equipe gerenciada.</small></label>
            <div className="commission-preview"><span>Simulação · Equipe Horizonte</span><div><p>Volume vendido<strong>R$ 2.480.000</strong></p><p>Vendedores<strong>R$ {(sales * Number(sellerRate) / 100).toLocaleString("pt-BR")}</strong></p><p>Gerência<strong>R$ {(sales * Number(managerRate) / 100).toLocaleString("pt-BR")}</strong></p></div></div>
            <button className="auth-submit">Salvar regras de comissão</button>
          </div>
        </section>
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
      <section className="module-heading"><div><p>GESTÃO DA EQUIPE HORIZONTE</p><h1>Visão da gerência</h1><span>Acompanhe a produção dos seus vendedores e a evolução das metas.</span></div><label className="period-picker"><Icon name="calendar" size={18}/><select><option>{currentWeekLabel}</option><option>Período personalizado</option></select></label></section>
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
      <section className="module-heading"><div><p>EQUIPE HORIZONTE</p><h1>Minha equipe</h1><span>Gerencie os vendedores sob sua responsabilidade sem perder o histórico.</span></div><button className="primary-button"><Icon name="plus" size={18}/>Adicionar vendedor</button></section>
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

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState(currentWeekLabel);

  if (!authenticated) return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <img src={vfcLogo} alt={clientCompany} className="brand-logo sidebar-logo" />
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

        {active === "Clientes" ? <CustomersPage/> : active === "Classificados" ? <ClassifiedsPage onSimulate={() => setActive("Simulações")}/> : active === "Simulações" ? <SimulationPage/> : active === "Usuários e perfis" ? <UsersPage/> : active === "Veículos" ? <VehiclesPage/> : active === "Painel do gerente" ? <ManagerDashboard/> : active === "Minha equipe" ? <MyTeamPage/> : active === "Painel de suporte" ? <SupportDashboard/> : active === "Propostas" ? <ProposalReviewPage/> : active === "Equipes e comissões" ? <TeamsCommissionsPage/> : active === "Relatórios" ? <ReportsPage/> : active !== "Dashboard" ? <ModulePage name={active}/> : <div className="content">
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
                  <option>Período personalizado</option>
                </select>
              </label>
              <button className="primary-button"><Icon name="plus" size={18} /> Nova proposta</button>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon blue"><Icon name="proposal" /></div>
              <div className="stat-title"><span>Simulações</span><strong className="up">+12,5%</strong></div>
              <h2>48</h2><p>vs. 42 na semana anterior</p>
              <div className="spark blue-spark"><i/><i/><i/><i/><i/><i/><i/></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon purple"><Icon name="file" /></div>
              <div className="stat-title"><span>Propostas</span><strong className="up">+8,3%</strong></div>
              <h2>26</h2><p>vs. 24 na semana anterior</p>
              <div className="spark purple-spark"><i/><i/><i/><i/><i/><i/><i/></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon green"><Icon name="check" /></div>
              <div className="stat-title"><span>Contratos efetivados</span><strong className="up">+18,2%</strong></div>
              <h2>13</h2><p>vs. 11 na semana anterior</p>
              <div className="spark green-spark"><i/><i/><i/><i/><i/><i/><i/></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon red"><Icon name="close" /></div>
              <div className="stat-title"><span>Propostas recusadas</span><strong className="down">−2,1%</strong></div>
              <h2>5</h2><p>vs. 6 na semana anterior</p>
              <div className="spark red-spark"><i/><i/><i/><i/><i/><i/><i/></div>
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
