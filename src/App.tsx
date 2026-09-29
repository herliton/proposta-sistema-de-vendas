import { useEffect, useState, type FormEvent } from "react";
import vfcLogo from "./assets/vfc-logo.png";
import { downloadCommissionReport } from "./api/reports";
import { formatWeekRange, getCurrentWeekRange, toApiDate } from "./utils/dateRange";
import { transitionSalesStage, type SalesStage } from "./utils/salesLifecycle";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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
      { label: "Recuperação de crédito", icon: "trend" as IconName },
      { label: "Classificados", icon: "car" as IconName },
    ],
  },
  {
    label: "CADASTROS",
    items: [
      { label: "Veículos", icon: "car" as IconName },
      { label: "Lojas", icon: "home" as IconName },
      { label: "Taxas e tabelas", icon: "percent" as IconName },
      { label: "Benefícios", icon: "gift" as IconName },
      { label: "Usuários e perfis", icon: "users" as IconName },
      { label: "Permissões de acesso", icon: "settings" as IconName },
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


const roleModules: Record<string, string[]> = {
  ADMIN: navGroups.flatMap((group) => group.items.map((item) => item.label)),
  SELLER: ["Simulações", "Propostas", "Contratos", "Clientes", "Recuperação de crédito", "Classificados", "Veículos", "Taxas e tabelas", "Benefícios"],
  MANAGER: ["Simulações", "Propostas", "Contratos", "Clientes", "Recuperação de crédito", "Classificados", "Veículos", "Taxas e tabelas", "Benefícios", "Painel do gerente", "Minha equipe", "Equipes e comissões", "Relatórios"],
  SUPPORT: ["Propostas", "Contratos", "Recuperação de crédito", "Taxas e tabelas", "Painel de suporte", "Equipes e comissões", "Relatórios"],
};

const normalizeRole = (role?: string) => {
  const normalized = String(role || "SELLER").trim().toUpperCase();
  if (["ADMIN", "ADMINISTRADOR"].includes(normalized)) return "ADMIN";
  if (["MANAGER", "GERENTE"].includes(normalized)) return "MANAGER";
  if (["SUPPORT", "SUPORTE"].includes(normalized)) return "SUPPORT";
  return "SELLER";
};

const roleNames: Record<string, string> = { ADMIN: "Administrador", MANAGER: "Gerente", SELLER: "Vendedor", SUPPORT: "Suporte" };

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

type AuthMode = "login" | "forgot" | "change" | "reset";

type AuthUser = { id: number; nome: string; email: string; perfil: string; firstAccess?: boolean; lojaId?: number | null; lojaNome?: string };

function AuthScreen({ onAuthenticated }: { onAuthenticated: (token: string, user: AuthUser) => void }) {
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get("resetToken") || "");
  const [mode, setMode] = useState<AuthMode>(() => resetToken ? "reset" : "login");
  const [email, setEmail] = useState("herliton@allos.net.br");
  const [password, setPassword] = useState(() => resetToken ? "" : "Proposta123");
  const [notice, setNotice] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice("");
    if (mode === "forgot") {
      if (!email.includes("@")) { setNotice("Informe um e-mail válido."); return; }
      setSubmitting(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || "Não foi possível solicitar a recuperação.");
        setNotice(payload?.message || "Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.");
      } catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Falha ao solicitar a recuperação."); }
      finally { setSubmitting(false); }
      return;
    }
    if (mode === "reset") {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) {
        setNotice("Use ao menos 8 caracteres, com maiúscula, minúscula e número."); return;
      }
      setSubmitting(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: resetToken, senha: password }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || "Não foi possível redefinir a senha.");
        setMode("login"); setPassword(""); setResetToken("");
        window.history.replaceState({}, document.title, window.location.pathname);
        setNotice(payload?.message || "Senha alterada com sucesso. Faça login com a nova senha.");
      } catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Falha ao redefinir a senha."); }
      finally { setSubmitting(false); }
      return;
    }
    if (mode === "change") {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) {
        setNotice("Use ao menos 8 caracteres, com maiúscula, minúscula e número.");
        return;
      }
      setSubmitting(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/first-access-change`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${pendingToken}` },
          body: JSON.stringify({ senha: password }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || "Não foi possível alterar a senha.");
        if (pendingUser) onAuthenticated(pendingToken, pendingUser);
      } catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Falha ao alterar a senha."); }
      finally { setSubmitting(false); }
      return;
    }
    if (!email.includes("@") || password.length < 8) {
      setNotice("Informe um e-mail válido e uma senha com pelo menos 8 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, senha: password }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "Não foi possível entrar.");
      const session = payload?.data;
      if (!session?.token || !session?.user?.nome) {
        throw new Error(payload?.message || "O servidor retornou uma sessão inválida.");
      }
      if (session.user.firstAccess) {
        setPendingToken(session.token); setPendingUser(session.user); setMode("change"); setPassword("");
      } else { onAuthenticated(session.token, session.user); }
    } catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Falha ao entrar no sistema."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <img src={vfcLogo} alt={clientCompany} className="brand-logo" />
      </div>
      <div className="auth-visual">
        <div className="auth-visual-copy">
          <span className="eyebrow">GESTÃO DE VENDAS AUTOMOTIVAS</span>
          <h1>Da simulação ao contrato, <em>tudo em um só lugar.</em></h1>
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
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Entrando..." : <>Entrar <Icon name="arrow" size={16}/></>}</button>
            <div className="demo-access"><strong>Demonstração ativa</strong><span>herliton@allos.net.br · Proposta123</span></div>
          </>}
          {mode === "forgot" && <>
            <button type="button" className="auth-back" onClick={() => { setMode("login"); setNotice(""); }}>‹ Voltar para o login</button>
            <div className="auth-symbol"><Icon name="file" size={25}/></div>
            <h2>Recupere sua senha</h2>
            <p>Enviaremos um link seguro para você criar uma nova senha.</p>
            <label>E-mail cadastrado<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com.br"/></label>
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Enviando..." : "Enviar link de recuperação"}</button>
          </>}
          {mode === "reset" && <>
            <button type="button" className="auth-back" onClick={() => { setMode("login"); setNotice(""); }}>‹ Voltar para o login</button>
            <div className="auth-symbol"><Icon name="settings" size={25}/></div>
            <span className="auth-kicker">RECUPERAÇÃO DE ACESSO</span>
            <h2>Crie uma nova senha</h2>
            <p>O link é válido por uma hora. Escolha uma senha segura para continuar.</p>
            <label>Nova senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite uma senha segura"/></label>
            <div className="password-rules"><span className={password.length >= 8 ? "valid" : ""}>8+ caracteres</span><span className={/[A-Z]/.test(password) ? "valid" : ""}>Uma maiúscula</span><span className={/[a-z]/.test(password) ? "valid" : ""}>Uma minúscula</span><span className={/\d/.test(password) ? "valid" : ""}>Um número</span></div>
            <button className="auth-submit" type="submit" disabled={submitting || !resetToken}>{submitting ? "Salvando..." : "Redefinir senha"}</button>
          </>}
          {mode === "change" && <>
            <div className="auth-symbol"><Icon name="settings" size={25}/></div>
            <span className="auth-kicker">PRIMEIRO ACESSO</span>
            <h2>Crie sua senha definitiva</h2>
            <p>Por segurança, substitua a senha temporária antes de continuar.</p>
            <label>Nova senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite uma senha segura"/></label>
            <div className="password-rules"><span className={password.length >= 8 ? "valid" : ""}>8+ caracteres</span><span className={/[A-Z]/.test(password) ? "valid" : ""}>Uma maiúscula</span><span className={/[a-z]/.test(password) ? "valid" : ""}>Uma minúscula</span><span className={/\d/.test(password) ? "valid" : ""}>Um número</span></div>
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Salvando..." : "Salvar nova senha"}</button>
          </>}
          {notice && <div className={`auth-notice ${notice.startsWith("Se o e-mail") || notice.startsWith("Senha alterada") ? "success" : ""}`}>{notice}</div>}
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

type ManagedUser = {
  id: number; nome: string; email: string; perfil: string; status: string; telefone: string;
  cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string; lojaId: number; lojaNome: string;
};

type ManagedUserForm = Omit<ManagedUser, "id">;

const emptyUserForm: ManagedUserForm = {
  nome: "", email: "", perfil: "SELLER", status: "ativo", telefone: "", cep: "", logradouro: "",
  numero: "", complemento: "", bairro: "", cidade: "", estado: "", lojaId: 1, lojaNome: "",
};

function UsersPage({ authToken }: { authToken: string }) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ManagedUserForm>(emptyUserForm);
  const [cepStatus, setCepStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const apiRequest = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${authToken}`);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || "Não foi possível concluir a operação.");
    return payload?.data;
  };

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const [records, storeRecords] = await Promise.all([apiRequest("/auth/users"), apiRequest("/stores")]);
      setUsers(Array.isArray(records) ? records : []); setStores(Array.isArray(storeRecords) ? storeRecords.filter((store: StoreRecord) => store.status === "ativo") : []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, [authToken]);

  const updateField = <K extends keyof ManagedUserForm>(field: K, value: ManagedUserForm[K]) => setForm((current) => ({ ...current, [field]: value }));
  const openForm = (user?: ManagedUser) => {
    setEditingId(user?.id ?? null);
    setForm(user ? {
      nome: user.nome, email: user.email, perfil: user.perfil.toUpperCase(), status: user.status,
      telefone: user.telefone || "", cep: user.cep || "", logradouro: user.logradouro || "", numero: user.numero || "",
      complemento: user.complemento || "", bairro: user.bairro || "", cidade: user.cidade || "", estado: user.estado || "", lojaId: user.lojaId || 1, lojaNome: user.lojaNome || "",
    } : { ...emptyUserForm, lojaId: stores[0]?.id || 1 });
    setNotice("");
    setError("");
    setCepStatus("");
    setShowForm(true);
  };

  const lookupCep = async () => {
    const normalized = form.cep.replace(/\D/g, "");
    if (normalized.length !== 8) { setCepStatus("Informe um CEP com 8 dígitos."); return; }
    setCepStatus("Consultando CEP...");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`);
      const result = await response.json();
      if (!response.ok || result.erro) throw new Error();
      setForm((current) => ({ ...current, logradouro: result.logradouro || "", bairro: result.bairro || "", cidade: result.localidade || "", estado: result.uf || "" }));
      setCepStatus("Endereço preenchido pela ViaCEP.");
    } catch { setCepStatus("CEP não encontrado. Preencha o endereço manualmente."); }
  };

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    const payload = { ...form };
    try {
      const saved = await apiRequest(editingId ? `/auth/users/${editingId}` : "/auth/users", {
        method: editingId ? "PUT" : "POST", body: JSON.stringify(payload),
      });
      await loadUsers();
      setShowForm(false);
      setNotice(editingId
        ? `Dados atualizados. As instruções de acesso foram enviadas para ${saved.email}.`
        : `Usuário criado. As instruções de acesso foram enviadas para ${saved.email}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao salvar usuário.");
    } finally { setSaving(false); }
  };

  const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
  const activeUsers = users.filter((user) => user.status !== "inativo").length;
  const managers = users.filter((user) => user.perfil.toUpperCase() === "MANAGER").length;

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>ADMINISTRAÇÃO E ACESSOS</p><h1>Usuários e perfis</h1><span>Gerencie dados pessoais, funções e acessos dos colaboradores.</span></div><button className="primary-button" onClick={() => openForm()}><Icon name="plus" size={18}/>Novo usuário</button></section>
      <section className="module-summary"><div><span>Usuários ativos</span><strong>{activeUsers}</strong></div><div><span>Gerentes</span><strong>{managers}</strong></div><div><span>Acessos desativados</span><strong>{users.length - activeUsers}</strong></div></section>
      {notice && <div className="auth-notice success">{notice}</div>}
      {error && !showForm && <div className="auth-notice">{error} <button onClick={() => void loadUsers()}>Tentar novamente</button></div>}
      <section className="panel module-table">
        <div className="module-toolbar"><div className="search-box"><Icon name="search" size={17}/><input placeholder="Buscar usuário, e-mail ou perfil..."/></div><button><Icon name="settings" size={16}/>Filtros</button></div>
        <div className="table-wrap"><table><thead><tr><th>USUÁRIO</th><th>CONTATO</th><th>PERFIL</th><th>LOJA</th><th>STATUS</th><th>ACESSOS HERDADOS</th><th></th></tr></thead><tbody>
          {loading ? <tr><td colSpan={6}>Carregando usuários...</td></tr> : users.map((user) => <tr key={user.id}><td><div className="seller-cell"><div className="mini-avatar blue">{initials(user.nome)}</div><div><strong>{user.nome}</strong><small className="table-subcopy">{user.email}</small></div></div></td><td>{user.telefone || "—"}</td><td><span className="role-pill">{user.perfil}</span></td><td>{user.lojaNome || "Loja Brasília"}</td><td><span className={`status ${user.status === "inativo" ? "red" : "green"}`}>{user.status === "inativo" ? "Inativo" : "Ativo"}</span></td><td>{user.perfil.toUpperCase() === "MANAGER" ? <span className="inheritance-pill">MANAGER + SELLER</span> : "—"}</td><td><button className="edit-link" onClick={() => openForm(user)}>Editar</button></td></tr>)}
          {!loading && users.length === 0 && <tr><td colSpan={6}>Nenhum usuário cadastrado.</td></tr>}
        </tbody></table></div>
      </section>
      {showForm && <div className="page-form-layer"><form onSubmit={saveUser} className="modal-card wide-modal user-modal page-form-card">
        <button type="button" className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para usuários</button>
        <div className="modal-title"><div><span>{editingId ? "EDIÇÃO DE USUÁRIO" : "NOVO USUÁRIO"}</span><h2>{editingId ? form.nome : "Cadastrar colaborador"}</h2><p>{editingId ? "Os dados serão carregados do cadastro atual. Ao salvar, uma senha temporária será enviada ao e-mail cadastrado." : "Preencha os dados de identificação, acesso e endereço do colaborador. As credenciais temporárias serão enviadas ao e-mail informado."}</p></div></div>
        <div className="form-section-title">Identificação e acesso</div>
        <div className="modal-row"><label>Nome completo<input required value={form.nome} onChange={(event) => updateField("nome", event.target.value)} placeholder="Nome e sobrenome"/></label><label>Telefone / WhatsApp<input value={form.telefone} onChange={(event) => updateField("telefone", event.target.value)} placeholder="(00) 00000-0000"/></label></div>
        <div className="modal-row"><label>E-mail de acesso<input required type="email" value={form.email} readOnly={Boolean(editingId)} onChange={(event) => updateField("email", event.target.value)} placeholder="usuario@empresa.com.br"/></label><label>Perfil<select value={form.perfil} onChange={(event) => updateField("perfil", event.target.value)}><option value="ADMIN">ADMIN</option><option value="MANAGER">MANAGER</option><option value="SELLER">SELLER</option><option value="SUPPORT">SUPPORT</option></select></label></div>
        {editingId && <div className="role-inheritance-note"><Icon name="settings" size={17}/><span>O e-mail é fixo. Ao salvar, uma senha temporária será enviada para esse endereço e deverá ser trocada no primeiro acesso.</span></div>}
        <div className="modal-row"><label>Status<select value={form.status} onChange={(event) => updateField("status", event.target.value)}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></label><label>Loja<select value={form.lojaId} onChange={(event) => updateField("lojaId", Number(event.target.value))}>{stores.map((store) => <option key={store.id} value={store.id}>{store.nome}</option>)}</select></label></div>
        <div className="form-section-title">Endereço completo</div>
        <div className="cep-row"><label>CEP<input value={form.cep} onChange={(event) => updateField("cep", event.target.value)} onBlur={() => { if (form.cep.replace(/\D/g, "").length === 8) void lookupCep(); }} placeholder="00000-000"/></label><button type="button" onClick={() => void lookupCep()}><Icon name="search" size={15}/>Buscar CEP</button><span>{cepStatus}</span></div>
        <div className="modal-row address-main"><label>Logradouro<input value={form.logradouro} onChange={(event) => updateField("logradouro", event.target.value)}/></label><label>Número<input value={form.numero} onChange={(event) => updateField("numero", event.target.value)} placeholder="Nº"/></label></div>
        <div className="modal-row"><label>Complemento<input value={form.complemento} onChange={(event) => updateField("complemento", event.target.value)} placeholder="Apto, bloco ou referência"/></label><label>Bairro<input value={form.bairro} onChange={(event) => updateField("bairro", event.target.value)}/></label></div>
        <div className="modal-row city-row"><label>Cidade<input value={form.cidade} onChange={(event) => updateField("cidade", event.target.value)}/></label><label>Estado<input maxLength={2} value={form.estado} onChange={(event) => updateField("estado", event.target.value.toUpperCase())}/></label></div>
        {error && <div className="auth-notice">{error}</div>}
        <div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar e gerar acesso"}</button></div>
      </form></div>}
    </div>
  );
}

type VehicleStatus = "AVAILABLE" | "IN_NEGOTIATION" | "SOLD";
type InventoryVehicle = {
  id: number; marca: string; modelo: string; placa?: string; anoFabricacao: number; anoModelo: number;
  codigoFipe?: string; valorFipe: number; precoSugerido: number; precoMinimo: number;
  status: VehicleStatus; simulacoesAtivas: number; fotos?: Record<string, string>; videoUrl?: string;
};
type VehicleForm = {
  marca: string; modelo: string; placa: string; anoFabricacao: string; anoModelo: string; codigoFipe: string;
  valorFipe: string; precoSugerido: string; precoMinimo: string;
  fotos: { right: string; left: string; front: string; rear: string; interior: string };
  videoUrl: string; videoDuracaoSegundos: string;
};
const emptyVehicleForm: VehicleForm = {
  marca: "", modelo: "", placa: "", anoFabricacao: "", anoModelo: "", codigoFipe: "",
  valorFipe: "", precoSugerido: "", precoMinimo: "",
  fotos: { right: "", left: "", front: "", rear: "", interior: "" }, videoUrl: "", videoDuracaoSegundos: "",
};
const moneyLabel = (value: number) => value ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value) : "—";

function VehiclesPage({ authToken, profile }: { authToken: string; profile: string }) {
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [mfgYearFilter, setMfgYearFilter] = useState("ALL");
  const [modelYearFilter, setModelYearFilter] = useState("ALL");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<VehicleForm>(emptyVehicleForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lookingUpFipe, setLookingUpFipe] = useState(false);
  const [uploading, setUploading] = useState("");
  const canManage = ["ADMIN", "MANAGER", "SUPPORT"].includes(profile);
  const apiRequest = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${authToken}`);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || "Não foi possível concluir a operação.");
    return payload?.data;
  };
  const loadVehicles = async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (brandFilter !== "ALL") params.set("brand", brandFilter);
    if (mfgYearFilter !== "ALL") params.set("mfg_year", mfgYearFilter);
    if (modelYearFilter !== "ALL") params.set("model_year", modelYearFilter);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    try {
      const records = await apiRequest(`/veiculos?${params.toString()}`);
      setVehicles(Array.isArray(records) ? records : []);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao carregar veículos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadVehicles(); }, [authToken, search, brandFilter, mfgYearFilter, modelYearFilter, statusFilter]);
  const uploadMedia = async (file: File, kind: "photo" | "video") => {
    setError(""); setUploading(kind);
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch(`${API_BASE_URL}/veiculos/media/${kind}`, { method: "POST", headers: { Authorization: `Bearer ${authToken}` }, body });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "Falha ao enviar arquivo.");
      return String(payload?.data?.url || "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao enviar arquivo.");
      return "";
    } finally { setUploading(""); }
  };
  const inspectVideoDuration = (file: File) => new Promise<number>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    const cleanup = () => URL.revokeObjectURL(objectUrl);
    video.onloadedmetadata = () => { const duration = video.duration; cleanup(); resolve(duration); };
    video.onerror = () => { cleanup(); reject(new Error("Não foi possível ler a duração do vídeo.")); };
    video.src = objectUrl;
  });
  const choosePhoto = async (key: keyof VehicleForm["fotos"], file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Cada foto deve ter no máximo 10 MB."); return; }
    const url = await uploadMedia(file, "photo");
    if (url) setForm((current) => ({ ...current, fotos: { ...current.fotos, [key]: url } }));
  };
  const chooseVideo = async (file?: File) => {
    if (!file) return;
    try {
      const duration = await inspectVideoDuration(file);
      if (!Number.isFinite(duration) || duration <= 0 || duration > 60) { setError("O vídeo deve ter no máximo 60 segundos."); return; }
      const url = await uploadMedia(file, "video");
      if (url) setForm((current) => ({ ...current, videoUrl: url, videoDuracaoSegundos: String(Math.ceil(duration)) }));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível validar o vídeo."); }
  };
  const allBrands = [...new Set(vehicles.map((vehicle) => vehicle.marca).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const statusLabel: Record<VehicleStatus, string> = { AVAILABLE: "Disponível", IN_NEGOTIATION: "Em negociação", SOLD: "Vendido" };
  const submitVehicle = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const body = {
      ...form, anoFabricacao: Number(form.anoFabricacao), anoModelo: Number(form.anoModelo),
      valorFipe: Number(form.valorFipe), precoSugerido: Number(form.precoSugerido), precoMinimo: Number(form.precoMinimo),
      videoDuracaoSegundos: form.videoUrl ? Number(form.videoDuracaoSegundos) : 0, status: "AVAILABLE",
    };
    try {
      await apiRequest("/veiculos", { method: "POST", body: JSON.stringify(body) });
      setShowForm(false); setForm(emptyVehicleForm); setNotice("Veículo cadastrado no estoque."); await loadVehicles();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao cadastrar veículo."); }
    finally { setSaving(false); }
  };
  const lookupFipe = async () => {
    setLookingUpFipe(true); setError("");
    try {
      const result = await apiRequest(`/veiculos/fipe/${encodeURIComponent(form.codigoFipe)}`);
      setForm((current) => ({ ...current, marca: result.marca || current.marca, modelo: result.modelo || current.modelo,
        anoModelo: String(result.anoModelo || current.anoModelo), valorFipe: String(result.valorNumerico || current.valorFipe), codigoFipe: result.codigoFipe || current.codigoFipe }));
      setNotice(`Valor FIPE atualizado${result.mesReferencia ? ` (${String(result.mesReferencia).trim()})` : ""}.`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao consultar a FIPE."); }
    finally { setLookingUpFipe(false); }
  };
  const closeForm = () => { setShowForm(false); setError(""); setForm(emptyVehicleForm); };

  return <div className="content module-content">
    <section className="module-heading"><div><p>GESTÃO DE ESTOQUE</p><h1>Veículos</h1><span>Controle preços, mídias e disponibilidade do estoque.</span></div>{canManage && <button className="primary-button" onClick={() => { setError(""); setShowForm(true); }}><Icon name="plus" size={18}/>Cadastrar veículo</button>}</section>
    {notice && <div className="auth-notice success">{notice}</div>}{error && !showForm && <div className="auth-notice">{error}</div>}
    <section className="module-summary"><div><span>Disponíveis</span><strong>{vehicles.filter((v) => v.status === "AVAILABLE").length}</strong></div><div><span>Em negociação</span><strong>{vehicles.filter((v) => v.status === "IN_NEGOTIATION").length}</strong></div><div><span>Vendidos</span><strong>{vehicles.filter((v) => v.status === "SOLD").length}</strong></div></section>
    <section className="panel module-table">
      <div className="module-toolbar vehicle-toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar marca, modelo ou placa..."/></div><div className="filter-fields"><select value={mfgYearFilter} onChange={(event) => setMfgYearFilter(event.target.value)}><option value="ALL">Todos os anos fab.</option>{[...new Set(vehicles.map((v) => v.anoFabricacao).filter(Boolean))].sort((a, b) => b - a).map((year) => <option key={year}>{year}</option>)}</select><select value={modelYearFilter} onChange={(event) => setModelYearFilter(event.target.value)}><option value="ALL">Todos os anos mod.</option>{[...new Set(vehicles.map((v) => v.anoModelo).filter(Boolean))].sort((a, b) => b - a).map((year) => <option key={year}>{year}</option>)}</select><select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}><option value="ALL">Todas as marcas</option>{allBrands.map((brand) => <option key={brand}>{brand}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">Todos os status</option><option value="AVAILABLE">Disponível</option><option value="IN_NEGOTIATION">Em negociação</option><option value="SOLD">Vendido</option></select></div></div>
      <div className="table-wrap"><table><thead><tr><th>VEÍCULO</th><th>ANO FAB. / MOD.</th><th>VALOR FIPE</th><th>PREÇO SUGERIDO</th><th>PREÇO MÍNIMO</th><th>SIMULAÇÕES ATIVAS</th><th>STATUS</th></tr></thead><tbody>
        {loading ? <tr><td colSpan={7}>Carregando estoque...</td></tr> : vehicles.map((vehicle) => <tr key={vehicle.id}><td><div className="vehicle-cell"><div><Icon name="car" size={20}/></div><span><strong>{vehicle.marca} {vehicle.modelo}</strong><small>{vehicle.placa || vehicle.codigoFipe || ""}</small></span></div></td><td>{vehicle.anoFabricacao} / {vehicle.anoModelo}</td><td>{moneyLabel(vehicle.valorFipe)}</td><td><strong>{moneyLabel(vehicle.precoSugerido)}</strong></td><td>{moneyLabel(vehicle.precoMinimo)}</td><td><span className={`simulation-count ${vehicle.simulacoesAtivas ? "has-count" : ""}`}>{vehicle.simulacoesAtivas}</span></td><td><span className={`status ${vehicle.status === "AVAILABLE" ? "green" : vehicle.status === "SOLD" ? "red" : "yellow"}`}>{statusLabel[vehicle.status]}</span></td></tr>)}
        {!loading && !vehicles.length && <tr><td colSpan={7}>Nenhum veículo encontrado para esses filtros.</td></tr>}
      </tbody></table></div>
    </section>
    {showForm && <div className="page-form-layer"><form onSubmit={submitVehicle} className="modal-card wide-modal vehicle-modal page-form-card">
      <button type="button" className="page-back" onClick={closeForm}><Icon name="arrow" size={16}/>Voltar para veículos</button>
      <div className="modal-title"><div><span>NOVO ITEM DO ESTOQUE</span><h2>Cadastrar veículo</h2><p>Informe os dados e URLs das cinco fotos obrigatórias.</p></div></div>
      <div className="form-section-title">Identificação</div>
      <div className="modal-row"><label>Marca<input required value={form.marca} onChange={(event) => setForm({ ...form, marca: event.target.value })} placeholder="Ex.: Jeep"/></label><label>Modelo<input required value={form.modelo} onChange={(event) => setForm({ ...form, modelo: event.target.value })} placeholder="Ex.: Compass Limited"/></label></div>
      <div className="modal-row"><label>Ano de fabricação<input required type="number" min="1900" max={new Date().getFullYear() + 2} value={form.anoFabricacao} onChange={(event) => setForm({ ...form, anoFabricacao: event.target.value })}/></label><label>Ano do modelo<input required type="number" min="1900" max={new Date().getFullYear() + 2} value={form.anoModelo} onChange={(event) => setForm({ ...form, anoModelo: event.target.value })}/></label></div>
      <div className="modal-row"><label>Código FIPE<input value={form.codigoFipe} onChange={(event) => setForm({ ...form, codigoFipe: event.target.value })} placeholder="000000-0"/></label><label>Placa<input value={form.placa} onChange={(event) => setForm({ ...form, placa: event.target.value.toUpperCase() })} placeholder="ABC1D23"/></label></div>
      <div className="form-section-title">Precificação</div>
      <div className="pricing-grid"><label>Valor FIPE<div className="input-action"><input required type="number" min="0" step="0.01" value={form.valorFipe} onChange={(event) => setForm({ ...form, valorFipe: event.target.value })} placeholder="R$ 0,00"/><button type="button" disabled={lookingUpFipe || !form.codigoFipe} onClick={() => void lookupFipe()}>{lookingUpFipe ? "Consultando..." : "Consultar FIPE"}</button></div></label><label>Preço sugerido<input required type="number" min="0.01" step="0.01" value={form.precoSugerido} onChange={(event) => setForm({ ...form, precoSugerido: event.target.value })} placeholder="R$ 0,00"/></label><label>Preço mínimo<input required type="number" min="0.01" step="0.01" value={form.precoMinimo} onChange={(event) => setForm({ ...form, precoMinimo: event.target.value })} placeholder="R$ 0,00"/></label></div>
      <div className="form-section-title">Fotos obrigatórias · até 10 MB cada</div>
      <div className="media-grid vehicle-upload-grid">
        {([{ key: "front", label: "Frente" }, { key: "right", label: "Lateral direita" }, { key: "left", label: "Lateral esquerda" }, { key: "rear", label: "Traseira" }, { key: "interior", label: "Interior" }] as const).map(({ key, label }) => <label className={form.fotos[key] ? "uploaded" : ""} key={key}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void choosePhoto(key, event.target.files?.[0])}/><Icon name={form.fotos[key] ? "check" : "plus"} size={18}/><span>{uploading === "photo" ? "Enviando foto..." : form.fotos[key] ? `${label} enviada` : label}</span></label>)}
        <label className={`video-upload ${form.videoUrl ? "uploaded" : ""}`}><input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => void chooseVideo(event.target.files?.[0])}/><Icon name={form.videoUrl ? "check" : "plus"} size={18}/><span>{uploading === "video" ? "Enviando vídeo..." : form.videoUrl ? "Vídeo enviado" : "Vídeo · até 60 s"}</span></label>
      </div>
      {form.videoUrl && <p className="table-subcopy">Duração validada: {form.videoDuracaoSegundos} segundos.</p>}
      {error && <div className="auth-notice">{error}</div>}
      <div className="modal-actions"><button type="button" onClick={closeForm}>Cancelar</button><button type="submit" className="primary-button" disabled={saving || Boolean(uploading)}>{saving ? "Salvando..." : "Cadastrar veículo"}</button></div>
    </form></div>}
  </div>;
}

function ModulePage({ name, profile, userName }: { name: string; profile: string; userName: string }) {
  const teamByManager: Record<string, string[]> = {
    "Amanda Silva": ["Amanda Silva", "Marcos Costa", "Rafael Lima"],
    "Bruno Tavares": ["Bruno Tavares", "Juliana Castro"],
    "Patrícia Melo": ["Patrícia Melo"],
  };
  const scope = profile === "MANAGER" ? teamByManager[userName] || [userName] : [userName];
  const sourceProposals = profile === "ADMIN" || profile === "SUPPORT"
    ? proposals
    : proposals.filter((proposal) => scope.includes(proposal.seller));
  const data = moduleData[name] ?? {
    title: name, subtitle: "Consulte e gerencie os registros deste módulo.", action: `Novo registro`,
    columns: ["REGISTRO", "RESPONSÁVEL", "DATA", "VALOR", "STATUS"],
    rows: sourceProposals.map((p) => [p.id, p.client, p.seller, p.value, p.status]),
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

type CustomerRecord = {
  id: number; tipoPessoa: "pf" | "pj"; nome: string; razaoSocial: string; nomeFantasia: string;
  documento: string; email: string; telefone: string; cep: string; logradouro: string; numero: string;
  complemento: string; bairro: string; cidade: string; estado: string; rendaMensal: number; ocupacao: string;
  status: string; vendedorId?: number;
};
type CustomerForm = Omit<CustomerRecord, "id" | "status" | "vendedorId">;
const emptyCustomerForm: CustomerForm = {
  tipoPessoa: "pf", nome: "", razaoSocial: "", nomeFantasia: "", documento: "", email: "", telefone: "",
  cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", rendaMensal: 0, ocupacao: "",
};

function CustomersPage({ profile, userName, authToken }: { profile: string; userName: string; authToken: string }) {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyCustomerForm);
  const [cepStatus, setCepStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const apiRequest = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${authToken}`);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || "Não foi possível concluir a operação.");
    return payload?.data;
  };
  const loadCustomers = async () => {
    setLoading(true); setError("");
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
      const records = await apiRequest(`/clientes${query}`);
      setCustomers(Array.isArray(records) ? records : []);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao carregar clientes."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadCustomers(); }, [authToken, search]);

  const openCustomerForm = (customer: CustomerRecord | null) => {
    setEditingCustomer(customer);
    setForm(customer ? { ...emptyCustomerForm, ...customer } : { ...emptyCustomerForm });
    setCepStatus(""); setNotice(""); setError(""); setShowForm(true);
  };
  const lookupCep = async () => {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) { setCepStatus("Informe um CEP com 8 dígitos."); return; }
    setCepStatus("Consultando ViaCEP...");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const address = await response.json();
      if (!response.ok || address.erro) throw new Error("CEP não encontrado.");
      setForm((current) => ({ ...current, cep, logradouro: address.logradouro || current.logradouro, bairro: address.bairro || current.bairro, cidade: address.localidade || current.cidade, estado: address.uf || current.estado }));
      setCepStatus("Endereço encontrado e preenchido.");
    } catch (requestError) { setCepStatus(requestError instanceof Error ? requestError.message : "Não foi possível consultar o CEP. Preencha o endereço manualmente."); }
  };
  const saveCustomer = async () => {
    setSaving(true); setError(""); setNotice("");
    try {
      const path = editingCustomer ? `/clientes/${editingCustomer.id}` : "/clientes";
      await apiRequest(path, { method: editingCustomer ? "PUT" : "POST", body: JSON.stringify(form) });
      setNotice(editingCustomer ? "Cadastro atualizado." : "Cliente cadastrado.");
      setShowForm(false); await loadCustomers();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao salvar cliente."); }
    finally { setSaving(false); }
  };
  const removeCustomer = async (customer: CustomerRecord) => {
    if (!window.confirm(`Arquivar o cadastro de ${customer.nome}?`)) return;
    try { await apiRequest(`/clientes/${customer.id}`, { method: "DELETE" }); await loadCustomers(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao arquivar cliente."); }
  };
  const formatDocument = (customer: CustomerRecord) => customer.tipoPessoa === "pj" ? customer.documento : customer.documento;
  const money = (value: number) => value ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value) : "—";

  return <div className="content module-content">
    <section className="module-heading"><div><p>OPERAÇÃO COMERCIAL</p><h1>Clientes</h1><span>Cadastre clientes pessoa física ou jurídica e acompanhe os atendimentos de {userName}.</span></div><button className="primary-button" onClick={() => openCustomerForm(null)}><Icon name="plus" size={18}/>Novo cliente</button></section>
    <section className="module-summary"><div><span>Clientes visíveis</span><strong>{customers.length}</strong></div><div><span>Pessoa física</span><strong>{customers.filter((c) => c.tipoPessoa === "pf").length}</strong></div><div><span>Pessoa jurídica</span><strong>{customers.filter((c) => c.tipoPessoa === "pj").length}</strong></div></section>
    {error && <div className="auth-notice">{error}</div>}{notice && <div className="auth-notice success">{notice}</div>}
    <section className="panel module-table"><div className="module-toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."/></div><button onClick={() => void loadCustomers()}><Icon name="search" size={16}/>Atualizar</button></div>
      <div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>CPF/CNPJ</th><th>CONTATO</th><th>RENDA</th><th>LOCALIDADE</th><th>TIPO</th><th></th></tr></thead><tbody>
        {loading ? <tr><td colSpan={7}>Carregando clientes...</td></tr> : customers.length ? customers.map((customer) => <tr key={customer.id}><td>{customer.nome}</td><td>{formatDocument(customer)}</td><td>{customer.telefone}<br/><small>{customer.email}</small></td><td>{money(customer.rendaMensal)}</td><td>{customer.cidade}/{customer.estado}</td><td><span className="status blue">{customer.tipoPessoa.toUpperCase()}</span></td><td><button className="edit-customer-button" onClick={() => openCustomerForm(customer)}>Editar <Icon name="arrow" size={14}/></button><button className="edit-customer-button" onClick={() => void removeCustomer(customer)}>Arquivar</button></td></tr>) : <tr><td colSpan={7}>Nenhum cliente encontrado.</td></tr>}
      </tbody></table></div>
    </section>
    {showForm && <div className="page-form-layer"><div className="modal-card wide-modal page-form-card"><button className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para clientes</button>
      <div className="modal-title"><div><span>CADASTRO COMERCIAL</span><h2>{editingCustomer ? "Editar cliente" : "Novo cliente"}</h2><p>Dados pessoais, documento e endereço necessários para propostas e contratos.</p></div></div>
      <div className="form-section-title">Identificação</div><div className="modal-row"><label>Tipo de pessoa<select value={form.tipoPessoa} onChange={(event) => setForm({ ...form, tipoPessoa: event.target.value as "pf" | "pj", documento: "" })}><option value="pf">Pessoa física</option><option value="pj">Pessoa jurídica</option></select></label><label>{form.tipoPessoa === "pf" ? "CPF" : "CNPJ"}<input value={form.documento} onChange={(event) => setForm({ ...form, documento: event.target.value })} placeholder={form.tipoPessoa === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}/></label></div>
      {form.tipoPessoa === "pf" ? <div className="modal-row"><label>Nome completo<input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} placeholder="Nome conforme documento"/></label><label>Ocupação<input value={form.ocupacao} onChange={(event) => setForm({ ...form, ocupacao: event.target.value })} placeholder="Profissão ou atividade"/></label></div> : <div className="modal-row"><label>Razão social<input value={form.razaoSocial} onChange={(event) => setForm({ ...form, razaoSocial: event.target.value })} placeholder="Razão social registrada"/></label><label>Nome fantasia<input value={form.nomeFantasia} onChange={(event) => setForm({ ...form, nomeFantasia: event.target.value })} placeholder="Nome fantasia"/></label></div>}
      <div className="modal-row"><label>E-mail<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="cliente@email.com"/></label><label>Telefone<input value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} placeholder="(00) 00000-0000"/></label></div>
      <div className="form-section-title">Endereço completo</div><div className="cep-row"><label>CEP<input value={form.cep} onChange={(event) => setForm({ ...form, cep: event.target.value })} onBlur={() => void lookupCep()} placeholder="00000-000"/></label><button type="button" onClick={() => void lookupCep()}><Icon name="search" size={15}/>Buscar ViaCEP</button><span>{cepStatus}</span></div>
      <div className="modal-row address-main"><label>Logradouro<input value={form.logradouro} onChange={(event) => setForm({ ...form, logradouro: event.target.value })} placeholder="Rua, avenida ou travessa"/></label><label>Número<input value={form.numero} onChange={(event) => setForm({ ...form, numero: event.target.value })} placeholder="Nº"/></label></div>
      <div className="modal-row"><label>Complemento<input value={form.complemento} onChange={(event) => setForm({ ...form, complemento: event.target.value })} placeholder="Apto, bloco ou referência"/></label><label>Bairro<input value={form.bairro} onChange={(event) => setForm({ ...form, bairro: event.target.value })} placeholder="Bairro"/></label></div>
      <div className="modal-row city-row"><label>Cidade<input value={form.cidade} onChange={(event) => setForm({ ...form, cidade: event.target.value })} placeholder="Cidade"/></label><label>Estado<input maxLength={2} value={form.estado} onChange={(event) => setForm({ ...form, estado: event.target.value.toUpperCase() })} placeholder="UF"/></label></div>
      <div className="form-section-title">Informações comerciais</div><div className="modal-row"><label>Renda mensal<input type="number" min="0" value={form.rendaMensal || ""} onChange={(event) => setForm({ ...form, rendaMensal: Number(event.target.value) })} placeholder="0,00"/></label><label>Status do atendimento<input value={editingCustomer?.status || "Ativo"} disabled/></label></div>
      {error && <div className="auth-notice">{error}</div>}<div className="modal-actions"><button onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" disabled={saving} onClick={() => void saveCustomer()}>{saving ? "Salvando..." : editingCustomer ? "Salvar alterações" : "Cadastrar cliente"}</button></div>
    </div></div>}
  </div>;
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

type SaleVehicle = { id: number; marca: string; modelo: string; anoFabricacao: number; anoModelo: number; precoSugerido: number; precoMinimo: number; status: string; simulacoesAtivas: number };
type SaleCustomer = { id: number; nome: string; tipoPessoa: string; documento: string; status: string };
function SimulationPage({ profile, userName, authToken }: { profile: string; userName: string; authToken: string }) {
  const [customers, setCustomers] = useState<SaleCustomer[]>([]);
  const [vehicles, setVehicles] = useState<SaleVehicle[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [downPayment, setDownPayment] = useState("0");
  const [months, setMonths] = useState("48");
  const [rate, setRate] = useState("1.39");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const apiRequest = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers); headers.set("Authorization", `Bearer ${authToken}`);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || "Não foi possível concluir a operação.");
    return payload?.data;
  };
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    Promise.all([apiRequest("/clientes"), apiRequest("/veiculos")]).then(([clientRows, vehicleRows]) => {
      if (cancelled) return;
      const availableClients = Array.isArray(clientRows) ? clientRows.filter((item) => !item.deletedAt) : [];
      const availableVehicles = Array.isArray(vehicleRows) ? vehicleRows.filter((item) => !item.deletedAt && item.status !== "SOLD") : [];
      setCustomers(availableClients); setVehicles(availableVehicles);
      if (availableClients.length) setCustomerId(String(availableClients[0].id));
      if (availableVehicles.length) { setVehicleId(String(availableVehicles[0].id)); setSalePrice(String(availableVehicles[0].precoSugerido || "")); }
    }).catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Falha ao carregar dados para simulação."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authToken]);
  const currentVehicle = vehicles.find((item) => String(item.id) === vehicleId);
  const isBelowMinimum = Boolean(currentVehicle && Number(salePrice) < Number(currentVehicle.precoMinimo || 0));
  const principal = Math.max(Number(salePrice || 0) - Number(downPayment || 0), 0);
  const monthlyRate = Number(rate) / 100; const count = Number(months);
  const installment = monthlyRate > 0 && count > 0 ? principal * (monthlyRate * (1 + monthlyRate) ** count) / ((1 + monthlyRate) ** count - 1) : count ? principal / count : 0;
  const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const toggleBenefit = (benefit: string) => setBenefits((current) => current.includes(benefit) ? current.filter((item) => item !== benefit) : [...current, benefit]);
  const submitSimulation = async () => {
    setSaving(true); setError(""); setNotice("");
    try {
      const proposal = await apiRequest("/propostas", { method: "POST", body: JSON.stringify({ clienteId: Number(customerId), veiculoId: Number(vehicleId), valorProposta: Number(salePrice), entrada: Number(downPayment), parcelas: count, taxaJuros: Number(rate), observacoes: benefits.length ? `Benefícios: ${benefits.join(", ")}` : "" }) });
      setNotice(`Proposta #${proposal.id} criada. Parcela estimada: ${brl(proposal.valorParcela)}.`);
      setVehicles((current) => current.map((item) => item.id === Number(vehicleId) ? { ...item, status: "IN_NEGOTIATION", simulacoesAtivas: item.simulacoesAtivas + 1 } : item));
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Falha ao gerar proposta."); }
    finally { setSaving(false); }
  };
  return <div className="content module-content">
    <section className="module-heading"><div><p>OPERAÇÃO COMERCIAL</p><h1>Nova simulação</h1><span>Negociação vinculada à carteira de {userName}; preço mínimo validado no servidor.</span></div></section>
    {loading && <div className="support-note">Carregando clientes e estoque...</div>}{error && <div className="auth-notice">{error}</div>}{notice && <div className="auth-notice success">{notice}</div>}
    <div className="simulation-layout"><div className="simulation-form">
      <section className="panel form-panel"><div className="step-title"><span>1</span><div><h3>Cliente</h3><p>Selecione um cliente autorizado na sua carteira.</p></div></div><label>Cliente cadastrado<select value={customerId} onChange={(event) => setCustomerId(event.target.value)}><option value="">Selecione um cliente</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.nome} · {item.tipoPessoa.toUpperCase()} · {item.documento}</option>)}</select></label>{customers.length === 0 && <small>Nenhum cliente disponível. Cadastre um cliente antes.</small>}</section>
      <section className="panel form-panel"><div className="step-title"><span>2</span><div><h3>Veículo</h3><p>Estoque real com propostas ativas.</p></div></div><label>Veículo do estoque<select value={vehicleId} onChange={(event) => { const selected = vehicles.find((item) => String(item.id) === event.target.value); setVehicleId(event.target.value); setSalePrice(String(selected?.precoSugerido || "")); }}><option value="">Selecione um veículo</option>{vehicles.map((item) => <option key={item.id} value={item.id}>{item.marca} {item.modelo} · {item.anoFabricacao}/{item.anoModelo} · {item.status === "AVAILABLE" ? "Disponível" : "Em negociação"} · {item.simulacoesAtivas} simulações</option>)}</select></label>{currentVehicle && <div className="vehicle-selection-meta"><span><Icon name="check" size={15}/> Aceita simulações</span><span><Icon name="proposal" size={15}/> {currentVehicle.simulacoesAtivas} simulações ativas</span><span>Status: <strong>{currentVehicle.status === "AVAILABLE" ? "Disponível" : "Em negociação"}</strong></span></div>}<label className="sale-price-field">Preço negociado<input type="number" min="0" value={salePrice} onChange={(event) => setSalePrice(event.target.value)}/><small>Preço mínimo autorizado: {brl(Number(currentVehicle?.precoMinimo || 0))}</small></label>{isBelowMinimum && <div className="price-alert">O valor não pode ser menor que o preço mínimo.</div>}</section>
      <section className="panel form-panel"><div className="step-title"><span>3</span><div><h3>Benefícios</h3><p>Registre os benefícios negociados.</p></div></div><div className="benefit-grid">{["IPVA pago", "Tanque cheio", "Transferência", "Seguro 3 meses"].map((benefit) => <button type="button" className={benefits.includes(benefit) ? "selected" : ""} onClick={() => toggleBenefit(benefit)} key={benefit}><span><Icon name="gift" size={18}/>{benefit}</span><i>{benefits.includes(benefit) ? "✓" : "+"}</i></button>)}</div></section>
    </div><aside className="finance-card"><span className="finance-kicker">RESUMO DO FINANCIAMENTO</span><h2>{brl(Number(salePrice || 0))}</h2><p>Valor negociado do veículo</p><div className="finance-fields"><label>Valor de entrada<input type="number" min="0" value={downPayment} onChange={(event) => setDownPayment(event.target.value)}/></label><div className="finance-row"><label>Parcelas<select value={months} onChange={(event) => setMonths(event.target.value)}><option value="24">24x</option><option value="36">36x</option><option value="48">48x</option><option value="60">60x</option></select></label><label>Taxa a.m.<select value={rate} onChange={(event) => setRate(event.target.value)}><option value="0.99">0,99%</option><option value="1.39">1,39%</option><option value="1.59">1,59%</option></select></label></div></div><div className="finance-result"><span>Financiamento em {months}x de</span><strong>{brl(installment)}</strong><small>Valor financiado: {brl(principal)}</small></div><div className="finance-breakdown"><span><em>Total financiado</em><strong>{brl(installment * count)}</strong></span><span><em>Custo efetivo estimado</em><strong>{brl(installment * count + Number(downPayment || 0))}</strong></span><span><em>Benefícios incluídos</em><strong>{benefits.length}</strong></span></div><button disabled={loading || saving || !customerId || !vehicleId || !salePrice || isBelowMinimum} className="auth-submit" onClick={() => void submitSimulation()}>{saving ? "Salvando..." : "Gerar proposta"} <Icon name="arrow" size={16}/></button></aside></div>
  </div>;
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

type ProposalRecord = { id: number; clienteId: number; vendedorId: number; veiculoId: number; valorProposta: number; valorParcela?: number; parcelas?: number; status: string; createdAt: string; cliente?: SaleCustomer; vendedor?: { nome: string }; veiculo?: SaleVehicle };
function SellerProposalsPage({ profile, userName, authToken }: { profile: string; userName: string; authToken: string }) {
  const [rows, setRows] = useState<ProposalRecord[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { let cancelled = false; const load = async () => { try { const response = await fetch(`${API_BASE_URL}/propostas`, { headers: { Authorization: `Bearer ${authToken}` } }); const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar propostas."); if (!cancelled) setRows(Array.isArray(payload?.data) ? payload.data : []); } catch (requestError) { if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Falha ao carregar propostas."); } finally { if (!cancelled) setLoading(false); } }; void load(); return () => { cancelled = true; }; }, [authToken]);
  const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  const downloadProposalPdf = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/propostas/${id}/pdf`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) throw new Error("Não foi possível gerar o PDF da proposta.");
      const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `proposta-${id}.pdf`; anchor.click(); URL.revokeObjectURL(url);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao baixar PDF."); }
  };
  return <div className="content module-content"><section className="module-heading"><div><p>{profile === "MANAGER" ? "CARTEIRA DA EQUIPE" : "MINHA CARTEIRA"}</p><h1>{profile === "MANAGER" ? "Propostas da equipe" : "Minhas propostas"}</h1><span>Propostas vinculadas à carteira de {userName}.</span></div></section>{error && <div className="auth-notice">{error}</div>}<section className="panel module-table"><div className="table-wrap"><table><thead><tr><th>PROPOSTA</th><th>CLIENTE</th><th>VEÍCULO</th><th>VALOR</th><th>PARCELAS</th><th>STATUS</th><th>DOCUMENTO</th></tr></thead><tbody>{loading ? <tr><td colSpan={7}>Carregando propostas...</td></tr> : rows.length ? rows.map((row) => <tr key={row.id}><td>#{String(row.id).padStart(4, "0")}</td><td>{row.cliente?.nome || "Cliente"}</td><td>{row.veiculo ? `${row.veiculo.marca} ${row.veiculo.modelo}` : "—"}</td><td>{money(row.valorProposta)}</td><td>{row.parcelas ? `${row.parcelas}x ${money(row.valorParcela || 0)}` : "—"}</td><td><span className={`status ${["CONTRACT_EFFECTIVE", "approved"].includes(row.status) ? "green" : ["CREDIT_REJECTED", "REJECTED", "CANCELLED"].includes(row.status) ? "red" : "blue"}`}>{row.status}</span></td><td><button className="submit-bank" onClick={() => void downloadProposalPdf(row.id)}>Baixar PDF</button></td></tr>) : <tr><td colSpan={7}>Nenhuma proposta vinculada a esta carteira.</td></tr>}</tbody></table></div></section></div>;
}

function ProposalReviewPage({ authToken }: { authToken: string }) {
  const [rows, setRows] = useState<ProposalRecord[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [busyId, setBusyId] = useState<number | null>(null);
  const load = async () => { setLoading(true); setError(""); try { const response = await fetch(`${API_BASE_URL}/propostas`, { headers: { Authorization: `Bearer ${authToken}` } }); const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar propostas."); setRows(Array.isArray(payload?.data) ? payload.data : []); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao carregar propostas."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [authToken]);
  const changeStatus = async (id: number, status: string) => { setBusyId(id); setError(""); try { const response = await fetch(`${API_BASE_URL}/propostas/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ status }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível atualizar o status."); await load(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao atualizar proposta."); } finally { setBusyId(null); } };
  const review = rows.filter((row) => ["pendente", "em análise", "em analise", "aguardando", "proposal", "PROPOSAL", "SIMULATION"].includes(row.status));
  const downloadPdf = async (id: number) => {
    try { const response = await fetch(`${API_BASE_URL}/propostas/${id}/pdf`, { headers: { Authorization: `Bearer ${authToken}` } }); if (!response.ok) throw new Error("Não foi possível gerar o PDF da proposta."); const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `proposta-${id}.pdf`; anchor.click(); URL.revokeObjectURL(url); }
    catch (downloadError) { setError(downloadError instanceof Error ? downloadError.message : "Falha ao baixar PDF."); }
  };
  const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  return <div className="content module-content"><section className="module-heading"><div><p>OPERAÇÃO BANCÁRIA</p><h1>Análise de propostas</h1><span>Revise propostas pendentes e registre aprovação ou recusa.</span></div><button className="secondary-button" onClick={() => void load()}>Atualizar fila</button></section>{error && <div className="auth-notice">{error}</div>}<section className="review-tabs"><button className="active">Aguardando análise <span>{review.length}</span></button></section><section className="panel module-table"><div className="table-wrap"><table><thead><tr><th>PROPOSTA</th><th>CLIENTE</th><th>VENDEDOR</th><th>VEÍCULO</th><th>VALOR</th><th>STATUS</th><th>PDF</th><th>AÇÃO</th></tr></thead><tbody>{loading ? <tr><td colSpan={8}>Carregando fila...</td></tr> : review.length ? review.map((row) => <tr key={row.id}><td><strong>#{String(row.id).padStart(4, "0")}</strong></td><td>{row.cliente?.nome || "—"}</td><td>{row.vendedor?.nome || "—"}</td><td>{row.veiculo ? `${row.veiculo.marca} ${row.veiculo.modelo}` : "—"}</td><td><strong>{money(row.valorProposta)}</strong></td><td><span className="status blue">{row.status}</span></td><td><button className="submit-bank" onClick={() => void downloadPdf(row.id)}>Baixar PDF</button></td><td><button className="submit-bank done" disabled={busyId === row.id} onClick={() => void changeStatus(row.id, "CONTRACT_EFFECTIVE")}>{busyId === row.id ? "Salvando..." : "Aprovar"}</button> <button className="submit-bank" disabled={busyId === row.id} onClick={() => void changeStatus(row.id, "CREDIT_REJECTED")}>Recusar</button></td></tr>) : <tr><td colSpan={8}>Não há propostas aguardando análise.</td></tr>}</tbody></table></div></section></div>;
}

function TeamsCommissionsPage({ profile, userName, authToken }: { profile: string; userName: string; authToken: string }) {
  const [sellerRate, setSellerRate] = useState("1.5");
  const [managerRate, setManagerRate] = useState("0.5");
  const [commissionNotice, setCommissionNotice] = useState("");
  const [commissionError, setCommissionError] = useState("");
  const [savingRules, setSavingRules] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/reports/commission-rules`, { headers: { Authorization: `Bearer ${authToken}` } }).then(async (response) => {
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar as regras.");
      if (!cancelled) { setSellerRate(String(payload.data.sellerPercent)); setManagerRate(String(payload.data.managerPercent)); }
    }).catch((loadError) => { if (!cancelled) setCommissionError(loadError instanceof Error ? loadError.message : "Falha ao carregar regras."); });
    return () => { cancelled = true; };
  }, [authToken]);
  const saveCommissionRules = async () => {
    setSavingRules(true); setCommissionError(""); setCommissionNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/reports/commission-rules`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ sellerPercent: Number(sellerRate), managerPercent: Number(managerRate) }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível salvar as regras.");
      setCommissionNotice(payload?.message || "Regras de comissão atualizadas.");
    } catch (saveError) { setCommissionError(saveError instanceof Error ? saveError.message : "Falha ao salvar regras."); }
    finally { setSavingRules(false); }
  };
  const allTeams = [["Horizonte", "Amanda Silva", "5 vendedores", "R$ 2,48 mi"], ["Impulso", "Bruno Tavares", "4 vendedores", "R$ 1,96 mi"], ["Vértice", "Patrícia Melo", "3 vendedores", "R$ 1,54 mi"]];
  const visibleTeams = profile === "MANAGER" ? allTeams.filter((team) => team[1] === userName) : allTeams;
  const salesByManager: Record<string, number> = { "Amanda Silva": 2480000, "Bruno Tavares": 1960000, "Patrícia Melo": 1540000 };
  const sales = profile === "MANAGER" ? salesByManager[userName] || 0 : 2480000;
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>GESTÃO DE EQUIPES</p><h1>Equipes e comissões</h1><span>Organize a estrutura comercial e configure regras de remuneração.</span></div><button className="primary-button"><Icon name="plus" size={18}/>Nova equipe</button></section>
      <div className="commissions-layout">
        <section className="panel teams-list">
          <div className="panel-header"><div><h3>Equipes de vendas</h3><p>3 equipes · 12 vendedores ativos</p></div></div>
          {visibleTeams.map((team, index) => <div className="team-card" key={team[0]}><div className={`team-icon team-${index + 1}`}><Icon name="users" size={19}/></div><div><strong>Equipe {team[0]}</strong><span>Gerente: {team[1]} · {team[2]}</span></div><div><strong>{team[3]}</strong><span>Vendas no período</span></div><button><Icon name="arrow" size={17}/></button></div>)}
        </section>
        <section className="panel commission-config">
          <div className="panel-header"><div><h3>Regras de comissão</h3><p>Percentuais sobre contratos efetivados</p></div></div>
          <div className="commission-body">
            <label>Comissão do vendedor<div className="percent-input"><input type="number" step=".1" value={sellerRate} onChange={(e) => setSellerRate(e.target.value)}/><span>%</span></div><small>Aplicada sobre o valor total vendido pelo vendedor.</small></label>
            <label>Comissão do gerente<div className="percent-input"><input type="number" step=".1" value={managerRate} onChange={(e) => setManagerRate(e.target.value)}/><span>%</span></div><small>Aplicada sobre as vendas de toda a equipe gerenciada.</small></label>
            {commissionError && <div className="auth-notice">{commissionError}</div>}{commissionNotice && <div className="auth-notice success">{commissionNotice}</div>}
            <div className="commission-preview"><span>Simulação · Equipe Horizonte</span><div><p>Volume vendido<strong>R$ 2.480.000</strong></p><p>Vendedores<strong>R$ {(sales * Number(sellerRate) / 100).toLocaleString("pt-BR")}</strong></p><p>Gerência<strong>R$ {(sales * Number(managerRate) / 100).toLocaleString("pt-BR")}</strong></p></div></div>
            <button className="auth-submit" disabled={savingRules || profile !== "ADMIN"} onClick={() => void saveCommissionRules()}>{savingRules ? "Salvando..." : profile === "ADMIN" ? "Salvar regras de comissão" : "Somente administrador pode alterar"}</button>
          </div>
        </section>
      </div>
    </div>
  );
}

type CommissionSummary = { items: { colaborador: string; perfil: string; contratos: number; baseCalculo: number; comissao: number }[]; summary: { totalComissoes: number; colaboradores: number; volumeVendido: number; contratos: number } };
function CreditRecoveryPage({ authToken, profile }: { authToken: string; profile: string }) {
  type RecoveryRow = { id: number; cliente: { id: number; nome: string; telefone?: string }; proposta?: { id: number; veiculo?: { marca: string; modelo: string } } | null; responsavel?: { nome: string } | null; tipo: string; status: string; motivo?: string; proximoContatoEm?: string; observacoes?: string };
  type CustomerOption = { id: number; nome: string };
  const [rows, setRows] = useState<RecoveryRow[]>([]); const [customers, setCustomers] = useState<CustomerOption[]>([]); const [customerId, setCustomerId] = useState(""); const [tipo, setTipo] = useState("REANALISE_CREDITO"); const [nextDate, setNextDate] = useState(""); const [notes, setNotes] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const opRes = await fetch(`${API_BASE_URL}/credit-recovery`, { headers: { Authorization: `Bearer ${authToken}` } }); const opPayload = await opRes.json(); if (!opRes.ok) throw new Error(opPayload.message || "Não foi possível carregar as oportunidades."); setRows(opPayload.data || []); if (profile !== "SUPPORT") { const clientRes = await fetch(`${API_BASE_URL}/clientes`, { headers: { Authorization: `Bearer ${authToken}` } }); const clientPayload = await clientRes.json(); if (!clientRes.ok) throw new Error(clientPayload.message || "Não foi possível carregar os clientes da carteira."); setCustomers(clientPayload.data || []); } } catch (e) { setError(e instanceof Error ? e.message : "Falha ao carregar oportunidades."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [authToken, profile]);
  const create = async (event: FormEvent) => { event.preventDefault(); setError(""); setNotice(""); try { const response = await fetch(`${API_BASE_URL}/credit-recovery`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ clienteId: Number(customerId), tipo, proximoContatoEm: nextDate || null, observacoes: notes }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Não foi possível registrar a oportunidade."); setNotice("Oportunidade registrada."); setCustomerId(""); setNotes(""); setNextDate(""); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao salvar."); } };
  const changeStatus = async (id: number, status: string) => { try { const response = await fetch(`${API_BASE_URL}/credit-recovery/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ status }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Não foi possível atualizar o atendimento."); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao atualizar."); } };
  const closeConsultancy = async (proposalId: number) => { const rawValue = window.prompt("Valor da consultoria (ex.: 1250,00)"); if (rawValue === null) return; const valorConsultoria = Number(rawValue.trim().replace(",", ".")); if (!Number.isFinite(valorConsultoria) || valorConsultoria <= 0) { setError("Informe um valor válido para a consultoria."); return; } try { const response = await fetch(`${API_BASE_URL}/deals/${proposalId}/credit-consultancy`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ valorConsultoria }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Não foi possível efetivar a consultoria."); setNotice("Contrato de consultoria efetivado e comissões registradas."); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao efetivar consultoria."); } };
  const labelFor = (value: string) => ({ REANALISE_CREDITO: "Reanálise de crédito", TROCA_VEICULO: "Alternativa de veículo", AUMENTO_ENTRADA: "Revisão de entrada", CONSORCIO: "Consórcio", OUTRO: "Outra alternativa", ABERTA: "Aberta", EM_CONTATO: "Em contato", EM_NEGOCIACAO: "Em negociação", CONVERTIDA: "Convertida", SEM_INTERESSE: "Sem interesse" } as Record<string, string>)[value] || value;
  return <div className="content module-content"><section className="module-heading"><div><p>PÓS-ANÁLISE DE CRÉDITO</p><h1>Recuperação de crédito</h1><span>Acompanhe clientes com crédito recusado e registre alternativas comerciais.</span></div><button className="secondary-button" onClick={() => void load()}>Atualizar</button></section>{error && <div className="auth-notice">{error}</div>}{notice && <div className="auth-notice">{notice}</div>}{profile !== "SUPPORT" && <form className="panel form-panel" onSubmit={(event) => void create(event)}><div className="step-title"><span>+</span><div><h3>Nova oportunidade</h3><p>Registre um retorno de crédito ou uma venda cruzada para sua carteira.</p></div></div><div className="customer-form-grid"><label>Cliente<select required value={customerId} onChange={(event) => setCustomerId(event.target.value)}><option value="">Selecione</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label><label>Alternativa<select value={tipo} onChange={(event) => setTipo(event.target.value)}><option value="REANALISE_CREDITO">Reanálise de crédito</option><option value="TROCA_VEICULO">Alternativa de veículo</option><option value="AUMENTO_ENTRADA">Revisão de entrada</option><option value="CONSORCIO">Consórcio</option><option value="OUTRO">Outra alternativa</option></select></label><label>Próximo contato<input type="date" value={nextDate} onChange={(event) => setNextDate(event.target.value)}/></label><label>Observações<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contexto e próximo passo"/></label></div><button className="auth-submit" type="submit" disabled={!customerId}>Registrar oportunidade</button></form>}<section className="panel module-table"><div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>ORIGEM / ALTERNATIVA</th><th>RESPONSÁVEL</th><th>PRÓXIMO CONTATO</th><th>STATUS</th><th>ACOMPANHAMENTO</th></tr></thead><tbody>{loading ? <tr><td colSpan={6}>Carregando oportunidades...</td></tr> : rows.length ? rows.map((row) => <tr key={row.id}><td><strong>{row.cliente.nome}</strong><br/><small>{row.cliente.telefone || "Sem telefone"}</small></td><td>{row.proposta ? `Proposta #${row.proposta.id} · ${row.proposta.veiculo?.marca || ""} ${row.proposta.veiculo?.modelo || ""}` : "Cadastro manual"}<br/><small>{labelFor(row.tipo)}</small></td><td>{row.responsavel?.nome || "Equipe de suporte"}</td><td>{row.proximoContatoEm ? new Date(row.proximoContatoEm).toLocaleDateString("pt-BR") : "Não agendado"}</td><td><span className="status blue">{labelFor(row.status)}</span></td><td>{row.status === "ABERTA" ? <button className="submit-bank" onClick={() => void changeStatus(row.id, "EM_CONTATO")}>Iniciar contato</button> : row.status === "EM_CONTATO" ? <button className="submit-bank" onClick={() => void changeStatus(row.id, "EM_NEGOCIACAO")}>Em negociação</button> : row.status === "EM_NEGOCIACAO" ? <>{row.proposta && <button className="submit-bank done" onClick={() => void closeConsultancy(row.proposta!.id)}>Efetivar consultoria</button>} <button className="submit-bank" onClick={() => void changeStatus(row.id, "SEM_INTERESSE")}>Encerrar</button></> : "—"}</td></tr>) : <tr><td colSpan={6}>Nenhuma oportunidade registrada.</td></tr>}</tbody></table></div></section></div>;
}

function ReportsPage({ profile, userName, authToken }: { profile: string; userName: string; authToken: string }) {
  const [report, setReport] = useState<CommissionSummary | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [reportError, setReportError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ startDate: toApiDate(currentWeek.startDate), endDate: toApiDate(currentWeek.endDate) });
    fetch(`${API_BASE_URL}/reports/commissions?${query}`, { headers: { Authorization: `Bearer ${authToken}` } }).then(async (response) => {
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar o relatório.");
      if (!cancelled) setReport(payload.data);
    }).catch((requestError) => { if (!cancelled) setReportError(requestError instanceof Error ? requestError.message : "Falha ao carregar o relatório."); })
      .finally(() => { if (!cancelled) setLoadingReport(false); });
    return () => { cancelled = true; };
  }, [authToken]);
  const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  const exportPdf = async () => {
    setExporting(true); setExportError("");
    try { await downloadCommissionReport(currentWeek, authToken); }
    catch (error) { setExportError(error instanceof Error ? error.message : "Falha ao gerar o PDF."); }
    finally { setExporting(false); }
  };
  return <div className="content module-content report-page">
    <section className="module-heading"><div><p>FINANCEIRO</p><h1>Relatório de comissões</h1><span>Pagamentos sobre contratos efetivados no escopo de {userName}.</span></div><div className="heading-actions"><label className="period-picker"><Icon name="calendar" size={18}/><select><option>{currentWeekLabel}</option></select></label><button className="primary-button" onClick={() => void exportPdf()} disabled={exporting}><Icon name="file" size={17}/>{exporting ? "Gerando no servidor..." : "Exportar PDF"}</button></div></section>
    {(reportError || exportError) && <div className="export-error">{reportError || exportError}</div>}
    <section className="report-hero"><div><span>Total de comissões</span><strong>{loadingReport ? "Carregando..." : money(report?.summary.totalComissoes || 0)}</strong><small>{report?.summary.colaboradores || 0} colaboradores com lançamentos</small></div><div><p>Volume vendido<strong>{money(report?.summary.volumeVendido || 0)}</strong></p><p>Contratos<strong>{report?.summary.contratos || 0}</strong></p><p>Ticket médio<strong>{money(report?.summary.contratos ? (report.summary.volumeVendido / report.summary.contratos) : 0)}</strong></p></div></section>
    <section className="panel module-table"><div className="panel-header"><div><h3>Detalhamento por colaborador</h3><p>Valores apurados no ledger de comissões do PostgreSQL.</p></div></div><div className="table-wrap"><table><thead><tr><th>COLABORADOR</th><th>PERFIL</th><th>CONTRATOS</th><th>BASE DE CÁLCULO</th><th>COMISSÃO A PAGAR</th></tr></thead><tbody>{loadingReport ? <tr><td colSpan={5}>Carregando registros...</td></tr> : report?.items.length ? report.items.map((row) => <tr key={`${row.colaborador}-${row.perfil}`}><td><strong>{row.colaborador}</strong></td><td>{row.perfil}</td><td>{row.contratos}</td><td>{money(row.baseCalculo)}</td><td><strong className="payout-value">{money(row.comissao)}</strong></td></tr>) : <tr><td colSpan={5}>Nenhuma comissão registrada neste período.</td></tr>}</tbody></table></div></section>
    <p className="report-footnote">Relatório gerado por {clientCompany} · Período de {currentWeekLabel}</p>
  </div>;
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

type StoreRecord = { id: number; nome: string; cnpj?: string | null; cidade?: string | null; status: string; usuariosCount: number; clientesCount: number; veiculosCount: number };
function StoresPage({ authToken }: { authToken: string }) {
  const [stores, setStores] = useState<StoreRecord[]>([]); const [nome, setNome] = useState(""); const [cnpj, setCnpj] = useState(""); const [cidade, setCidade] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const load = async () => { setLoading(true); try { const response = await fetch(`${API_BASE_URL}/stores`, { headers: { Authorization: `Bearer ${authToken}` } }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Não foi possível carregar as lojas."); setStores(payload.data || []); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao carregar lojas."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [authToken]);
  const create = async (event: FormEvent) => { event.preventDefault(); setError(""); setNotice(""); const response = await fetch(`${API_BASE_URL}/stores`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ nome, cnpj, cidade }) }); const payload = await response.json(); if (!response.ok) { setError(payload.message || "Não foi possível cadastrar a loja."); return; } setNotice("Loja cadastrada. Ela já pode ser vinculada a usuários."); setNome(""); setCnpj(""); setCidade(""); await load(); };
  const toggle = async (store: StoreRecord) => { const response = await fetch(`${API_BASE_URL}/stores/${store.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ status: store.status === "ativo" ? "inativo" : "ativo" }) }); const payload = await response.json(); if (!response.ok) { setError(payload.message || "Não foi possível atualizar a loja."); return; } await load(); };
  return <div className="content module-content"><section className="module-heading"><div><p>ESTRUTURA DA OPERAÇÃO</p><h1>Lojas</h1><span>Cadastre filiais e acompanhe os registros vinculados a cada unidade.</span></div><button className="secondary-button" onClick={() => void load()}>Atualizar</button></section>{error && <div className="auth-notice">{error}</div>}{notice && <div className="auth-notice success">{notice}</div>}<form className="panel form-panel" onSubmit={(event) => void create(event)}><div className="step-title"><span>+</span><div><h3>Nova loja</h3><p>O cadastro cria a unidade para receber usuários e operações.</p></div></div><div className="customer-form-grid"><label>Nome da loja<input required value={nome} onChange={(event) => setNome(event.target.value)}/></label><label>CNPJ<input value={cnpj} onChange={(event) => setCnpj(event.target.value)} placeholder="Somente números ou formatado"/></label><label>Cidade<input value={cidade} onChange={(event) => setCidade(event.target.value)}/></label><div><button className="auth-submit" type="submit">Cadastrar loja</button></div></div></form><section className="panel module-table"><div className="table-wrap"><table><thead><tr><th>LOJA</th><th>USUÁRIOS</th><th>CLIENTES</th><th>VEÍCULOS</th><th>STATUS</th><th>AÇÃO</th></tr></thead><tbody>{loading ? <tr><td colSpan={6}>Carregando lojas...</td></tr> : stores.map((store) => <tr key={store.id}><td><strong>{store.nome}</strong><br/><small>{store.cnpj || store.cidade || "Sem documento/endereço"}</small></td><td>{store.usuariosCount}</td><td>{store.clientesCount}</td><td>{store.veiculosCount}</td><td><span className={`status ${store.status === "ativo" ? "green" : "red"}`}>{store.status}</span></td><td><button className="edit-customer-button" disabled={store.status === "ativo" && store.id === 1} onClick={() => void toggle(store)}>{store.status === "ativo" ? "Desativar" : "Reativar"}</button></td></tr>)}{!loading && stores.length === 0 && <tr><td colSpan={6}>Nenhuma loja cadastrada.</td></tr>}</tbody></table></div></section></div>;
}

type SystemModule = { id: string; label: string; defaultRoles: string[] };

function PermissionsPage({ authToken }: { authToken: string }) {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [roleAccess, setRoleAccess] = useState<Record<string, string[]>>({});
  const [role, setRole] = useState("SELLER");
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const request = async (path: string, method = "GET", body?: unknown) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method, headers: { Authorization: `Bearer ${authToken}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar as permissões.");
    return payload?.data;
  };

  useEffect(() => {
    void request("/permissions/modules").then((data) => {
      setModules(data.modules || []); setRoleAccess(data.roleAccess || {}); setSelected(data.roleAccess?.SELLER || []);
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Falha ao carregar módulos."))
      .finally(() => setLoading(false));
  }, [authToken]);

  const changeRole = async (nextRole: string) => {
    setRole(nextRole); setNotice(""); setError("");
    try {
      const data = await request(`/permissions/role/${nextRole}`);
      setSelected(data.moduleIds || []);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao carregar o perfil."); }
  };

  const save = async () => {
    setSaving(true); setNotice(""); setError("");
    try {
      const data = await request(`/permissions/role/${role}`, "PUT", { moduleIds: selected });
      setSelected(data.moduleIds || []); setRoleAccess((current) => ({ ...current, [role]: data.moduleIds || [] }));
      setNotice(`Permissões do perfil ${role} salvas.`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao salvar permissões."); }
    finally { setSaving(false); }
  };

  const sellerModules = new Set(roleAccess.SELLER || []);
  return <div className="content module-content">
    <section className="module-heading"><div><p>ADMINISTRAÇÃO</p><h1>Permissões de acesso</h1><span>Defina os módulos disponíveis para cada perfil.</span></div></section>
    {notice && <div className="auth-notice success">{notice}</div>}{error && <div className="auth-notice">{error}</div>}
    <section className="panel permissions-panel">
      <div className="permissions-toolbar"><label>Perfil<select value={role} onChange={(event) => void changeRole(event.target.value)}><option value="SELLER">Vendedor</option><option value="MANAGER">Gerente</option><option value="SUPPORT">Suporte</option><option value="ADMIN">Administrador (acesso total)</option></select></label><p>O administrador mantém acesso total e não pode ser bloqueado.</p></div>
      {role === "MANAGER" && <div className="role-inheritance-note">O gerente herda automaticamente todas as permissões do vendedor.</div>}
      {loading ? <p>Carregando módulos...</p> : <div className="permission-list">{modules.map((module) => {
        const inherited = role === "MANAGER" && sellerModules.has(module.id);
        const checked = role === "ADMIN" || selected.includes(module.id) || inherited;
        return <label className="permission-row" key={module.id}><span><strong>{module.label}</strong><small>{module.id}</small></span><input type="checkbox" checked={checked} disabled={role === "ADMIN" || inherited} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, module.id])] : current.filter((id) => id !== module.id))}/></label>;
      })}</div>}
      <div className="modal-actions"><button className="primary-button" disabled={saving || loading || role === "ADMIN"} onClick={() => void save()}>{saving ? "Salvando..." : "Salvar permissões"}</button></div>
    </section>
  </div>;
}

type EmailSettingsForm = {
  host: string; port: string; secure: boolean; user: string; password: string;
  from: string; appUrl: string; hasPassword: boolean;
};

const emptyEmailSettings: EmailSettingsForm = {
  host: "smtp.titan.email", port: "465", secure: true, user: "", password: "",
  from: "", appUrl: "http://localhost:4173/", hasPassword: false,
};

function EmailSettingsPage({ authToken }: { authToken: string }) {
  const [form, setForm] = useState<EmailSettingsForm>(emptyEmailSettings);
  const [recipient, setRecipient] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [configurationSaved, setConfigurationSaved] = useState(false);

  const request = async (path: string, method = "GET", body?: unknown) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${authToken}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || "Não foi possível concluir a operação.");
    return payload?.data;
  };

  useEffect(() => {
    void request("/auth/email-settings").then((settings) => setForm({
      host: settings.host || "smtp.titan.email", port: String(settings.port || 465),
      secure: Boolean(settings.secure), user: settings.user || "", password: "",
      from: settings.from || "", appUrl: settings.appUrl || "http://localhost:4173/",
      hasPassword: Boolean(settings.hasPassword),
    })).then(() => setConfigurationSaved(true)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Falha ao carregar a configuração."))
      .finally(() => setLoading(false));
  }, [authToken]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const settings = await request("/auth/email-settings", "PUT", { ...form, port: Number(form.port) });
      setForm((current) => ({ ...current, password: "", hasPassword: Boolean(settings.hasPassword) }));
      setConfigurationSaved(true);
      setNotice("Configuração salva. Ela é aplicada imediatamente, sem reiniciar o servidor.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao salvar a configuração."); }
    finally { setSaving(false); }
  };

  const sendTest = async () => {
    setTesting(true); setError(""); setNotice("");
    try {
      await request("/auth/email-settings/test", "POST", { email: recipient });
      setNotice(`E-mail de teste enviado para ${recipient}.`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao enviar o e-mail de teste."); }
    finally { setTesting(false); }
  };

  return <div className="content module-content">
    <section className="module-heading"><div><p>ADMINISTRAÇÃO</p><h1>Configurações de e-mail</h1><span>Configure SMTP e envie um teste sem reiniciar o backend.</span></div></section>
    {notice && <div className="auth-notice success">{notice}</div>}
    {error && <div className="auth-notice">{error}</div>}
    {loading ? <section className="panel">Carregando configuração...</section> : <>
      <form onSubmit={save} className="panel email-settings-form" style={{ padding: 24, marginBottom: 20 }}>
        <div className="panel-header"><div><h3>Servidor de saída SMTP</h3><p>A senha é armazenada criptografada no arquivo de dados local.</p></div></div>
        <div className="form-section-title">Conexão</div>
        <div className="modal-row">
          <label>Servidor SMTP<input required value={form.host} onChange={(event) => { setConfigurationSaved(false); setForm({ ...form, host: event.target.value }); }} placeholder="smtp.titan.email" /></label>
          <label>Porta<input required type="number" min="1" max="65535" value={form.port} onChange={(event) => { setConfigurationSaved(false); setForm({ ...form, port: event.target.value }); }} /></label>
        </div>
        <div className="modal-row">
          <label>Usuário da caixa postal<input required type="email" value={form.user} onChange={(event) => { setConfigurationSaved(false); setForm({ ...form, user: event.target.value }); }} placeholder="conta@seudominio.com.br" /></label>
          <label>Remetente<input required value={form.from} onChange={(event) => { setConfigurationSaved(false); setForm({ ...form, from: event.target.value }); }} placeholder="Sistema de Vendas <conta@seudominio.com.br>" /></label>
        </div>
        <div className="modal-row">
          <label>Senha SMTP<input type="password" autoComplete="new-password" value={form.password} onChange={(event) => { setConfigurationSaved(false); setForm({ ...form, password: event.target.value }); }} placeholder={form.hasPassword ? "Senha já configurada; deixe em branco para manter" : "Senha da caixa Titan"} required={!form.hasPassword} /></label>
          <label>Link de acesso do sistema<input required type="url" value={form.appUrl} onChange={(event) => { setConfigurationSaved(false); setForm({ ...form, appUrl: event.target.value }); }} placeholder="https://sistema.suaempresa.com.br" /></label>
        </div>
        <label className="checkbox-row"><input type="checkbox" checked={form.secure} onChange={(event) => { setConfigurationSaved(false); setForm({ ...form, secure: event.target.checked }); }} /> Usar SSL direto (marque para a porta 465; deixe desmarcado para STARTTLS na porta 587)</label>
        <p className="table-subcopy">A porta 993 é IMAP (recebimento), não SMTP. Para Titan, use smtp.titan.email na porta 465 com SSL ou 587 com STARTTLS.</p>
        <div className="modal-actions"><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : "Salvar configuração"}</button></div>
      </form>
      <section className="panel email-test-panel">
        <div className="panel-header"><div><h3>Testar envio</h3><p>Salve a configuração antes de enviar uma mensagem de teste.</p></div></div>
        <div className="modal-row"><label>Enviar teste para<input type="email" required value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="destinatario@exemplo.com" /></label><div className="form-actions"><button type="button" className="primary-button" disabled={testing || !recipient || !form.hasPassword || !configurationSaved} onClick={() => void sendTest()}>{testing ? "Enviando..." : "Enviar e-mail de teste"}</button></div></div>
      </section>
    </>}
  </div>;
}

export default function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("vfcAuthToken") || "");
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem("vfcAuthUser") || "null") as AuthUser | null; }
    catch { return null; }
  });
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem("vfcAuthToken") && localStorage.getItem("vfcAuthUser")));
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState(currentWeekLabel);
  const [serverPermissions, setServerPermissions] = useState<{ role: string; allowedModules: string[] } | null>(null);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const profile = normalizeRole(sessionUser?.perfil);
  const allowedModules = new Set(serverPermissions?.role === profile ? serverPermissions.allowedModules : roleModules[profile] || roleModules.SELLER);
  const visibleNavGroups = navGroups.map((group) => ({
    ...group, items: group.items.filter((item) => allowedModules.has(item.label)),
  })).filter((group) => group.items.length > 0);
  const defaultModule = profile === "SUPPORT" ? "Painel de suporte" : profile === "MANAGER" ? "Painel do gerente" : profile === "ADMIN" ? "Dashboard" : "Simulações";
  const visibleActive = allowedModules.has(active) ? active : defaultModule;

  useEffect(() => {
    if (active !== visibleActive) setActive(visibleActive);
  }, [active, visibleActive]);

  useEffect(() => {
    if (!authToken || !["ADMIN", "SUPPORT"].includes(profile)) { setStores([]); return; }
    let cancelled = false;
    fetch(`${API_BASE_URL}/stores`, { headers: { Authorization: `Bearer ${authToken}` } }).then((response) => response.ok ? response.json() : null).then((payload) => { if (!cancelled) setStores(payload?.data || []); }).catch(() => {});
    return () => { cancelled = true; };
  }, [authToken, profile]);

  const selectStoreContext = async (value: string) => {
    const lojaId = value === "ALL" ? null : Number(value);
    const response = await fetch(`${API_BASE_URL}/stores/select`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ lojaId }) });
    const payload = await response.json();
    if (!response.ok) return;
    const nextUser = { ...sessionUser!, lojaId: payload.data.lojaId, lojaNome: payload.data.lojaNome };
    localStorage.setItem("vfcAuthToken", payload.data.token); localStorage.setItem("vfcAuthUser", JSON.stringify(nextUser));
    setAuthToken(payload.data.token); setSessionUser(nextUser);
  };

  useEffect(() => {
    if (!authToken || !profile) return;
    let cancelled = false;
    const refreshPermissions = () => {
      void fetch(`${API_BASE_URL}/permissions/role/${profile}`, { headers: { Authorization: `Bearer ${authToken}` } })
        .then((response) => response.ok ? response.json() : null)
        .then((payload) => { if (!cancelled && payload?.data?.allowedModules) setServerPermissions({ role: profile, allowedModules: payload.data.allowedModules }); })
        .catch(() => {});
    };
    refreshPermissions();
    const interval = window.setInterval(refreshPermissions, 15000);
    window.addEventListener("focus", refreshPermissions);
    return () => { cancelled = true; window.clearInterval(interval); window.removeEventListener("focus", refreshPermissions); };
  }, [authToken, profile]);

  const passwordResetRequested = new URLSearchParams(window.location.search).has("resetToken");
  if (passwordResetRequested || !authenticated || !sessionUser) return <AuthScreen onAuthenticated={(token, user) => {
    localStorage.setItem("vfcAuthToken", token);
    localStorage.setItem("vfcAuthUser", JSON.stringify(user));
    setAuthToken(token); setSessionUser(user); setAuthenticated(true);
  }} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <img src={vfcLogo} alt={clientCompany} className="brand-logo sidebar-logo" />
        </div>
        <nav>
          {visibleNavGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className={visibleActive === item.label ? "active" : ""}
                  onClick={() => { if (allowedModules.has(item.label)) setActive(item.label); setSidebarOpen(false); }}
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
          <div className="avatar">{sessionUser.nome.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase()}</div>
          <div><strong>{sessionUser.nome}</strong><span>{roleNames[profile]}</span></div>
          <button aria-label="Sair da conta" title="Sair da conta" onClick={() => { localStorage.removeItem("vfcAuthToken"); localStorage.removeItem("vfcAuthUser"); setAuthToken(""); setSessionUser(null); setAuthenticated(false); setActive("Dashboard"); }}><Icon name="more" size={18} /></button>
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
            {["ADMIN", "SUPPORT"].includes(profile) ? <select className="store-select" value={sessionUser.lojaId == null ? "ALL" : String(sessionUser.lojaId)} onChange={(event) => void selectStoreContext(event.target.value)}><option value="ALL">Todas as lojas</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.nome}</option>)}</select> : <span className="store-select">{sessionUser.lojaNome || clientCompany}</span>}
          </div>
        </header>

        {visibleActive === "Recuperação de crédito" ? <CreditRecoveryPage authToken={authToken} profile={profile}/> : visibleActive === "Clientes" ? <CustomersPage profile={profile} userName={sessionUser.nome} authToken={authToken}/> : visibleActive === "Classificados" ? <ClassifiedsPage onSimulate={() => setActive("Simulações")}/> : visibleActive === "Simulações" ? <SimulationPage profile={profile} userName={sessionUser.nome} authToken={authToken}/> : visibleActive === "Usuários e perfis" && profile === "ADMIN" ? <UsersPage authToken={authToken}/> : visibleActive === "Lojas" && profile === "ADMIN" ? <StoresPage authToken={authToken}/> : visibleActive === "Permissões de acesso" && profile === "ADMIN" ? <PermissionsPage authToken={authToken}/> : visibleActive === "Configurações" && profile === "ADMIN" ? <EmailSettingsPage authToken={authToken}/> : visibleActive === "Veículos" ? <VehiclesPage authToken={authToken} profile={profile}/> : visibleActive === "Painel do gerente" && profile === "MANAGER" ? <ManagerDashboard/> : visibleActive === "Minha equipe" && profile === "MANAGER" ? <MyTeamPage/> : visibleActive === "Painel de suporte" && profile === "SUPPORT" ? <SupportDashboard/> : visibleActive === "Propostas" && ["ADMIN", "SUPPORT"].includes(profile) ? <ProposalReviewPage authToken={authToken}/> : visibleActive === "Propostas" ? <SellerProposalsPage profile={profile} userName={sessionUser.nome} authToken={authToken}/> : visibleActive === "Equipes e comissões" && ["ADMIN", "MANAGER", "SUPPORT"].includes(profile) ? <TeamsCommissionsPage profile={profile} userName={sessionUser.nome} authToken={authToken}/> : visibleActive === "Relatórios" && ["ADMIN", "MANAGER", "SUPPORT"].includes(profile) ? <ReportsPage profile={profile} userName={sessionUser.nome} authToken={authToken}/> : visibleActive !== "Dashboard" ? <ModulePage name={visibleActive} profile={profile} userName={sessionUser.nome}/> : <div className="content">
          <section className="page-heading">
            <div>
              <p>{currentDateLabel}</p>
              <h1>Olá, {sessionUser.nome}. <span>Seu desempenho está em alta.</span></h1>
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
