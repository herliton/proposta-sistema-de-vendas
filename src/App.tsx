import { createContext, useContext, useEffect, useState, type FormEvent } from "react";
import logoSemFundo from "../logo-sem-fundo.png";
import { API_BASE_URL, apiAssetUrl } from "./api/baseUrl";
import { downloadCommissionReport } from "./api/reports";
import { dateFromInput, formatDateRange, getCurrentWeekRange, isDateRangeValid, toApiDate, type DateRange } from "./utils/dateRange";
import { transitionSalesStage, type SalesStage } from "./utils/salesLifecycle";
import MoneyInput from "./MoneyInput";
import CreditRecoveryFichas from "./CreditRecoveryFichas";

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

type DashboardSummary = {
  simulations: number;
  proposals: number;
  pendingProposals: number;
  rejectedProposals: number;
  contracts: number;
  salesVolume: number;
  commissionAmount: number;
};
type DashboardSeller = { id: number | null; name: string; managerName: string; simulations: number; proposals: number; contracts: number; sales: number };
type DashboardTeam = { managerId: number | null; name: string; sellers: number; contracts: number; sales: number };
type DashboardProposal = { id: number; cliente: string; veiculo: string; vendedor: string; valor: number; status: string; createdAt: string };
type DashboardData = {
  summary: DashboardSummary;
  timeline: { label: string; simulations: number; proposals: number; contracts: number }[];
  sellers: DashboardSeller[];
  teams: DashboardTeam[];
  recentProposals: DashboardProposal[];
};

function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  const valid = isDateRangeValid(value);
  const inputValue = (date: Date) => Number.isNaN(date.getTime()) ? "" : toApiDate(date);

  return (
    <div className="period-picker">
      <Icon name="calendar" size={18} />
      <label>De<input aria-label="Data inicial" type="date" value={inputValue(value.startDate)} onChange={(event) => onChange({ ...value, startDate: dateFromInput(event.target.value) })} /></label>
      <span aria-hidden="true">—</span>
      <label>Até<input aria-label="Data final" type="date" value={inputValue(value.endDate)} onChange={(event) => onChange({ ...value, endDate: dateFromInput(event.target.value) })} /></label>
      {!valid && <small role="alert">Informe um intervalo válido de até um ano.</small>}
    </div>
  );
}

function useDashboardSummary(authToken: string, dateRange: DateRange, enabled: boolean) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const valid = isDateRangeValid(dateRange);

  useEffect(() => {
    if (!authToken || !enabled || !valid) return;
    let cancelled = false;
    const query = new URLSearchParams({ startDate: toApiDate(dateRange.startDate), endDate: toApiDate(dateRange.endDate) });
    setLoading(true);
    setError("");
    fetch(`${API_BASE_URL}/reports/dashboard-summary?${query}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar os indicadores do período.");
        if (!cancelled) setDashboard(payload.data);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Falha ao carregar os indicadores.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authToken, dateRange.startDate, dateRange.endDate, enabled, valid]);

  return { dashboard, loading, error, valid };
}

const DateRangeContext = createContext<{ dateRange: DateRange; setDateRange: (range: DateRange) => void } | null>(null);
const DashboardContext = createContext<ReturnType<typeof useDashboardSummary> | null>(null);

function useDateRangeContext() {
  const context = useContext(DateRangeContext);
  if (!context) throw new Error("O filtro de período não foi configurado.");
  return context;
}

function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("Os indicadores do painel não foram configurados.");
  return context;
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
  SUPPORT: ["Propostas", "Contratos", "Recuperação de crédito", "Taxas e tabelas", "Benefícios", "Painel de suporte", "Equipes e comissões", "Relatórios"],
};

const normalizeRole = (role?: string) => {
  const normalized = String(role || "SELLER").trim().toUpperCase();
  if (["ADMIN", "ADMINISTRADOR"].includes(normalized)) return "ADMIN";
  if (["MANAGER", "GERENTE"].includes(normalized)) return "MANAGER";
  if (["SUPPORT", "SUPORTE"].includes(normalized)) return "SUPPORT";
  return "SELLER";
};

const roleNames: Record<string, string> = { ADMIN: "Administrador", MANAGER: "Gerente", SELLER: "Vendedor", SUPPORT: "Suporte" };

type AuthMode = "checking" | "setup" | "login" | "forgot" | "change" | "reset";

type AuthUser = { id: number; nome: string; email: string; perfil: string; firstAccess?: boolean; lojaId?: number | null; lojaNome?: string };

function AuthScreen({ onAuthenticated }: { onAuthenticated: (token: string, user: AuthUser) => void }) {
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get("resetToken") || "");
  const [mode, setMode] = useState<AuthMode>(() => resetToken ? "reset" : "checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupName, setSetupName] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (resetToken) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/auth/initial-admin/status`)
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || "Não foi possível verificar a configuração inicial.");
        if (typeof payload?.data?.pending !== "boolean") throw new Error("Resposta inválida ao verificar a configuração inicial.");
        if (!cancelled) setMode(payload.data.pending ? "setup" : "login");
      })
      .catch((requestError) => {
        if (!cancelled) {
          setMode("login");
          setNotice(requestError instanceof Error ? requestError.message : "Não foi possível verificar a configuração inicial.");
        }
      });
    return () => { cancelled = true; };
  }, [resetToken]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice("");
    if (mode === "setup") {
      if (!setupName.trim() || !setupEmail.includes("@") || !setupToken) {
        setNotice("Preencha nome, e-mail e código de configuração.");
        return;
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}/.test(password)) {
        setNotice("Use ao menos 12 caracteres, com maiúscula, minúscula e número.");
        return;
      }
      if (new TextEncoder().encode(password).length > 72) {
        setNotice("A senha deve ter no máximo 72 bytes.");
        return;
      }
      if (password !== passwordConfirmation) {
        setNotice("A confirmação de senha não corresponde.");
        return;
      }
      setSubmitting(true);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/initial-admin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: setupName, email: setupEmail, senha: password, setupToken }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || "Não foi possível criar o administrador inicial.");
        const session = payload?.data;
        if (!session?.token || !session?.user?.nome) throw new Error("O servidor retornou uma sessão inválida.");
        setPassword("");
        setPasswordConfirmation("");
        setSetupToken("");
        onAuthenticated(session.token, session.user);
      } catch (requestError) {
        setNotice(requestError instanceof Error ? requestError.message : "Falha ao criar o administrador inicial.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
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
        <img src={logoSemFundo} alt={clientCompany} className="brand-logo" />
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
          {mode === "checking" && <>
            <span className="auth-kicker">VERIFICANDO CONFIGURAÇÃO</span>
            <h2>Preparando o acesso</h2>
            <p>Estamos verificando se este sistema precisa da configuração inicial.</p>
          </>}
          {mode === "setup" && <>
            <span className="auth-kicker">PRIMEIRO ACESSO</span>
            <h2>Configuração inicial</h2>
            <p>Crie a conta do administrador responsável por este sistema.</p>
            <label>Nome completo<input required autoComplete="name" value={setupName} onChange={(event) => setSetupName(event.target.value)} placeholder="Nome do administrador"/></label>
            <label>E-mail<input required type="email" autoComplete="email" value={setupEmail} onChange={(event) => setSetupEmail(event.target.value)} placeholder="administrador@empresa.com.br"/></label>
            <label>Senha<input required type="password" autoComplete="new-password" maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Crie uma senha forte"/></label>
            <div className="password-rules"><span className={password.length >= 12 ? "valid" : ""}>12+ caracteres</span><span className={/[A-Z]/.test(password) ? "valid" : ""}>Uma maiúscula</span><span className={/[a-z]/.test(password) ? "valid" : ""}>Uma minúscula</span><span className={/\d/.test(password) ? "valid" : ""}>Um número</span></div>
            <label>Confirmar senha<input required type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Digite a senha novamente"/></label>
            <label>Código temporário de configuração<input required type="password" autoComplete="off" value={setupToken} onChange={(event) => setSetupToken(event.target.value)} placeholder="Código fornecido pelo responsável técnico"/></label>
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Criando administrador..." : "Criar administrador e entrar"}</button>
          </>}
          {mode === "login" && <>
            <span className="auth-kicker">BEM-VINDO DE VOLTA</span>
            <h2>Acesse o painel comercial</h2>
            <p>Entre com suas credenciais para continuar a operação.</p>
            <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com.br"/></label>
            <label>Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha"/></label>
            <button type="button" className="forgot-link" onClick={() => { setMode("forgot"); setNotice(""); }}>Esqueci minha senha</button>
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Entrando..." : <>Entrar <Icon name="arrow" size={16}/></>}</button>
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

type ManagedUser = {
  id: number; nome: string; email: string; perfil: string; status: string; telefone: string;
  cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string; lojaId: number; lojaNome: string;
  gerenteId?: number | null; equipeId?: number | null; equipeNome?: string | null; equipeGerenteNome?: string | null;
};

type ManagedUserForm = Omit<ManagedUser, "id">;

const emptyUserForm: ManagedUserForm = {
  nome: "", email: "", perfil: "SELLER", status: "ativo", telefone: "", cep: "", logradouro: "",
  numero: "", complemento: "", bairro: "", cidade: "", estado: "", lojaId: 1, lojaNome: "",
};

function UsersPage({ authToken }: { authToken: string }) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 0 });
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
      const params = new URLSearchParams({ page: String(page), pageSize: "25" });
      if (search.trim()) params.set("search", search.trim());
      if (profileFilter) params.set("perfil", profileFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (storeFilter) params.set("lojaId", storeFilter);
      const records = await apiRequest(`/auth/users?${params.toString()}`);
      setUsers(Array.isArray(records?.items) ? records.items : []);
      setPagination(records?.pagination || { page: 1, pageSize: 25, total: 0, totalPages: 0 });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, [authToken, search, profileFilter, statusFilter, storeFilter, page]);
  useEffect(() => {
    void apiRequest("/stores").then((records) => {
      setStores(Array.isArray(records) ? records.filter((store: StoreRecord) => store.status === "ativo") : []);
    }).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : "Falha ao carregar lojas.");
    });
  }, [authToken]);

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
        ? `Dados de ${saved.nome} atualizados.`
        : `Usuário criado. As instruções de acesso foram enviadas para ${saved.email}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao salvar usuário.");
    } finally { setSaving(false); }
  };

  const changeUserStatus = async (user: ManagedUser) => {
    const activating = user.status === "inativo";
    const confirmation = activating
      ? `Deseja reativar o acesso de ${user.nome}?`
      : `Deseja desativar ${user.nome}? O usuário perderá o acesso imediatamente.`;
    if (!window.confirm(confirmation)) return;
    setError("");
    setNotice("");
    try {
      await apiRequest(activating ? `/auth/users/${user.id}` : `/auth/users/${user.id}`, {
        method: activating ? "PUT" : "DELETE",
        ...(activating ? { body: JSON.stringify({ status: "ativo" }) } : {}),
      });
      await loadUsers();
      setNotice(activating ? `${user.nome} foi reativado.` : `${user.nome} foi desativado.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao alterar o status do usuário.");
    }
  };

  const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
  const activeUsers = users.filter((user) => user.status !== "inativo").length;
  const managers = users.filter((user) => user.perfil.toUpperCase() === "MANAGER").length;

  if (showAuditLogs) return <AuditLogsPage authToken={authToken} onBack={() => setShowAuditLogs(false)} />;

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>ADMINISTRAÇÃO E ACESSOS</p><h1>Usuários e perfis</h1><span>Gerencie dados pessoais, funções e acessos dos colaboradores.</span></div><div className="users-heading-actions"><button className="secondary-button" type="button" onClick={() => setShowAuditLogs(true)}>Ver auditoria</button><button className="primary-button" onClick={() => openForm()}><Icon name="plus" size={18}/>Novo usuário</button></div></section>
      <section className="module-summary"><div><span>Usuários encontrados</span><strong>{pagination.total}</strong></div><div><span>Gerentes nesta página</span><strong>{managers}</strong></div><div><span>Inativos nesta página</span><strong>{users.length - activeUsers}</strong></div></section>
      {notice && <div className="auth-notice success">{notice}</div>}
      {error && !showForm && <div className="auth-notice">{error} <button onClick={() => void loadUsers()}>Tentar novamente</button></div>}
      <section className="panel module-table">
        <div className="module-toolbar users-toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar usuário ou e-mail..."/></div><label className="users-filter">Perfil<select value={profileFilter} onChange={(event) => { setProfileFilter(event.target.value); setPage(1); }}><option value="">Todos os perfis</option><option value="ADMIN">ADMIN</option><option value="MANAGER">MANAGER</option><option value="SELLER">SELLER</option><option value="SUPPORT">SUPPORT</option></select></label><label className="users-filter">Status<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="">Todos os status</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option></select></label><label className="users-filter">Loja<select value={storeFilter} onChange={(event) => { setStoreFilter(event.target.value); setPage(1); }}><option value="">Todas as lojas</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.nome}</option>)}</select></label></div>
        <div className="table-wrap"><table><thead><tr><th>USUÁRIO</th><th>CONTATO</th><th>PERFIL</th><th>LOJA</th><th>STATUS</th><th>ACESSOS HERDADOS</th><th></th></tr></thead><tbody>
          {loading ? <tr><td colSpan={7}>Carregando usuários...</td></tr> : users.map((user) => <tr key={user.id}><td><div className="seller-cell"><div className="mini-avatar blue">{initials(user.nome)}</div><div><strong>{user.nome}</strong><small className="table-subcopy">{user.email}</small></div></div></td><td>{user.telefone || "—"}</td><td><span className="role-pill">{user.perfil}</span></td><td>{user.lojaNome || "Loja Brasília"}</td><td><span className={`status ${user.status === "inativo" ? "red" : "green"}`}>{user.status === "inativo" ? "Inativo" : "Ativo"}</span></td><td>{user.perfil.toUpperCase() === "MANAGER" ? <span className="inheritance-pill">MANAGER + SELLER</span> : "—"}</td><td><button className="edit-link" onClick={() => openForm(user)}>Editar</button><button className="edit-link" onClick={() => void changeUserStatus(user)}>{user.status === "inativo" ? "Reativar" : "Inativar"}</button></td></tr>)}
          {!loading && users.length === 0 && <tr><td colSpan={7}>Nenhum usuário cadastrado.</td></tr>}
        </tbody></table></div>
        <div className="pagination-controls"><span>{pagination.total ? `${(page - 1) * pagination.pageSize + 1}–${Math.min(page * pagination.pageSize, pagination.total)} de ${pagination.total}` : "Nenhum resultado"}</span><button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Anterior</button><span>Página {page} de {Math.max(pagination.totalPages, 1)}</span><button disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Próxima</button></div>
      </section>
      {showForm && <div className="page-form-layer"><form onSubmit={saveUser} className="modal-card wide-modal user-modal page-form-card">
        <button type="button" className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar para usuários</button>
        <div className="modal-title"><div><span>{editingId ? "EDIÇÃO DE USUÁRIO" : "NOVO USUÁRIO"}</span><h2>{editingId ? form.nome : "Cadastrar colaborador"}</h2><p>{editingId ? "Atualize os dados do cadastro. A senha atual não será alterada." : "Preencha os dados de identificação, acesso e endereço do colaborador. As credenciais temporárias serão enviadas ao e-mail informado."}</p></div></div>
        <div className="form-section-title">Identificação e acesso</div>
        <div className="modal-row"><label>Nome completo<input required value={form.nome} onChange={(event) => updateField("nome", event.target.value)} placeholder="Nome e sobrenome"/></label><label>Telefone / WhatsApp<input value={form.telefone} onChange={(event) => updateField("telefone", event.target.value)} placeholder="(00) 00000-0000"/></label></div>
        <div className="modal-row"><label>E-mail de acesso<input required type="email" value={form.email} readOnly={Boolean(editingId)} onChange={(event) => updateField("email", event.target.value)} placeholder="usuario@empresa.com.br"/></label><label>Perfil<select value={form.perfil} onChange={(event) => updateField("perfil", event.target.value)}><option value="ADMIN">ADMIN</option><option value="MANAGER">MANAGER</option><option value="SELLER">SELLER</option><option value="SUPPORT">SUPPORT</option></select></label></div>
        {editingId && <div className="role-inheritance-note"><Icon name="settings" size={17}/><span>O e-mail é fixo. O status de acesso pode ser alterado na lista de usuários.</span></div>}
        <div className="modal-row"><label>Status<select disabled={Boolean(editingId)} value={form.status} onChange={(event) => updateField("status", event.target.value)}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></label><label>Loja<select value={form.lojaId} onChange={(event) => updateField("lojaId", Number(event.target.value))}>{stores.map((store) => <option key={store.id} value={store.id}>{store.nome}</option>)}</select></label></div>
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

type AuditLogRecord = {
  id: number;
  actorId: number;
  action: string;
  details: unknown;
  createdAt: string;
  actor: { id: number; nome: string; email: string; perfil: string };
};
type AuditLogFilters = { actorId: string; action: string; from: string; to: string };

function AuditLogsPage({ authToken, onBack }: { authToken: string; onBack: () => void }) {
  const [filters, setFilters] = useState<AuditLogFilters>({ actorId: "", action: "", from: "", to: "" });
  const [appliedFilters, setAppliedFilters] = useState<AuditLogFilters>({ actorId: "", action: "", from: "", to: "" });
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (appliedFilters.actorId) query.set("actorId", appliedFilters.actorId);
    if (appliedFilters.action) query.set("action", appliedFilters.action);
    if (appliedFilters.from) query.set("from", appliedFilters.from);
    if (appliedFilters.to) query.set("to", appliedFilters.to);
    setLoading(true);
    setError("");
    fetch(`${API_BASE_URL}/audit-logs?${query.toString()}`, { headers: { Authorization: "Bearer " + authToken } })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar o histórico de auditoria.");
        return payload?.data;
      })
      .then((data) => {
        if (cancelled) return;
        setLogs(Array.isArray(data?.items) ? data.items : []);
        setPagination(data?.pagination || { page: 1, pageSize: 25, total: 0, totalPages: 0 });
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Falha ao carregar o histórico.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authToken, appliedFilters, page]);

  const updateFilter = (field: keyof AuditLogFilters, value: string) => setFilters((current) => ({ ...current, [field]: value }));
  const applyFilters = (event: FormEvent) => {
    event.preventDefault();
    const actorId = filters.actorId.trim();
    if (actorId && (!/^\d+$/.test(actorId) || !Number.isSafeInteger(Number(actorId)) || Number(actorId) < 1)) {
      setError("Informe um ID de usuário válido.");
      return;
    }
    if (filters.from && filters.to && filters.from > filters.to) {
      setError("A data inicial deve ser anterior ou igual à data final.");
      return;
    }
    setError("");
    setPage(1);
    setAppliedFilters({ ...filters, actorId });
  };
  const clearFilters = () => {
    const emptyFilters = { actorId: "", action: "", from: "", to: "" };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
    setError("");
  };
  const formatTimestamp = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
  };

  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>ADMINISTRAÇÃO E ACESSOS</p><h1>Histórico de auditoria</h1><span>Consulte ações registradas pelos usuários no sistema.</span></div><button className="secondary-button" type="button" onClick={onBack}><Icon name="arrow" size={16}/>Voltar aos usuários</button></section>
      <section className="panel audit-log-panel">
        <form className="audit-log-filters" onSubmit={applyFilters}>
          <label>ID do usuário<input type="number" min="1" step="1" value={filters.actorId} onChange={(event) => updateFilter("actorId", event.target.value)} placeholder="Todos"/></label>
          <label>Ação<input value={filters.action} onChange={(event) => updateFilter("action", event.target.value)} placeholder="Ex.: USER_UPDATED"/></label>
          <label>Data inicial<input type="date" value={filters.from} onChange={(event) => updateFilter("from", event.target.value)}/></label>
          <label>Data final<input type="date" value={filters.to} onChange={(event) => updateFilter("to", event.target.value)}/></label>
          <div className="audit-filter-actions"><button type="button" className="secondary-button" onClick={clearFilters}>Limpar</button><button type="submit" className="primary-button">Aplicar filtros</button></div>
        </form>
        {error && <div className="auth-notice">{error}</div>}
        <div className="table-wrap audit-log-table-wrap"><table><thead><tr><th>DATA E HORA</th><th>USUÁRIO</th><th>AÇÃO</th><th>DETALHES</th></tr></thead><tbody>
          {loading ? <tr><td colSpan={4}>Carregando histórico...</td></tr> : logs.map((log) => <tr key={log.id}><td>{formatTimestamp(log.createdAt)}</td><td><strong>{log.actor?.nome || `Usuário ${log.actorId}`}</strong><small className="table-subcopy">{log.actor?.email || "Ator indisponível"}</small></td><td><span className="audit-action-pill">{log.action}</span></td><td><details className="audit-details"><summary>Ver detalhes</summary><pre>{JSON.stringify(log.details, null, 2) || "Sem detalhes"}</pre></details></td></tr>)}
          {!loading && logs.length === 0 && <tr><td colSpan={4}>Nenhum registro encontrado para os filtros selecionados.</td></tr>}
        </tbody></table></div>
        <div className="pagination-controls"><span>{pagination.total ? `${(page - 1) * pagination.pageSize + 1}–${Math.min(page * pagination.pageSize, pagination.total)} de ${pagination.total}` : "Nenhum registro"}</span><button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Anterior</button><span>Página {page} de {Math.max(pagination.totalPages, 1)}</span><button disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Próxima</button></div>
      </section>
    </div>
  );
}

type VehicleStatus = "AVAILABLE" | "IN_NEGOTIATION" | "SOLD";
type InventoryVehicle = {
  id: number; marca: string; modelo: string; placa?: string; anoFabricacao: number; anoModelo: number;
  codigoFipe?: string; valorFipe: number; precoSugerido: number; precoMinimo: number;
  status: VehicleStatus; simulacoesAtivas: number; fotos?: Record<string, string>; videoUrl?: string; videoDuracao?: number; observacoes?: string;
};
type VehicleForm = {
  marca: string; modelo: string; placa: string; anoFabricacao: string; anoModelo: string; codigoFipe: string;
  valorFipe: string; precoSugerido: string; precoMinimo: string;
  fotos: { right: string; left: string; front: string; rear: string; interior: string };
  videoUrl: string; videoDuracaoSegundos: string; observacoes: string;
};
const emptyVehicleForm: VehicleForm = {
  marca: "", modelo: "", placa: "", anoFabricacao: "", anoModelo: "", codigoFipe: "",
  valorFipe: "", precoSugerido: "", precoMinimo: "",
  fotos: { right: "", left: "", front: "", rear: "", interior: "" }, videoUrl: "", videoDuracaoSegundos: "", observacoes: "",
};
const moneyLabel = (value: number) => value ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value) : "—";
const moneyValue = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value || 0);
const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

function VehiclesPage({ authToken, profile }: { authToken: string; profile: string }) {
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<InventoryVehicle | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [mfgYearFilter, setMfgYearFilter] = useState("ALL");
  const [modelYearFilter, setModelYearFilter] = useState("ALL");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [summary, setSummary] = useState({ available: 0, inNegotiation: 0, sold: 0 });
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
  const loadVehicles = async (requestedPage = page) => {
    setLoading(true); setError("");
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (brandFilter !== "ALL") params.set("brand", brandFilter);
    if (mfgYearFilter !== "ALL") params.set("mfg_year", mfgYearFilter);
    if (modelYearFilter !== "ALL") params.set("model_year", modelYearFilter);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (minimumPrice) params.set("minPrice", minimumPrice);
    if (maximumPrice) params.set("maxPrice", maximumPrice);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", String(requestedPage));
    params.set("pageSize", String(pageSize));
    try {
      const records = await apiRequest(`/veiculos?${params.toString()}`);
      const result = records && !Array.isArray(records) ? records as { items?: InventoryVehicle[]; pagination?: { total?: number; totalPages?: number }; summary?: { available?: number; inNegotiation?: number; sold?: number } } : null;
      setVehicles(Array.isArray(records) ? records : Array.isArray(result?.items) ? result.items : []);
      setPagination({ total: Number(result?.pagination?.total || 0), totalPages: Number(result?.pagination?.totalPages || 0) });
      setSummary({ available: Number(result?.summary?.available || 0), inNegotiation: Number(result?.summary?.inNegotiation || 0), sold: Number(result?.summary?.sold || 0) });
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao carregar veículos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadVehicles(); }, [authToken, search, brandFilter, mfgYearFilter, modelYearFilter, statusFilter, minimumPrice, maximumPrice, sortBy, sortOrder, page, pageSize]);
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
      videoDuracaoSegundos: form.videoUrl ? Number(form.videoDuracaoSegundos) : 0,
    };
    try {
      await apiRequest(editingVehicle ? `/veiculos/${editingVehicle.id}` : "/veiculos", { method: editingVehicle ? "PUT" : "POST", body: JSON.stringify(body) });
      setShowForm(false); setEditingVehicle(null); setForm(emptyVehicleForm); setNotice(editingVehicle ? "Veículo atualizado no estoque." : "Veículo cadastrado no estoque."); setPage(1); await loadVehicles(1);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao salvar veículo."); }
    finally { setSaving(false); }
  };
  const editVehicle = (vehicle: InventoryVehicle) => {
    setError(""); setEditingVehicle(vehicle);
    setForm({
      marca: vehicle.marca, modelo: vehicle.modelo, placa: vehicle.placa || "",
      anoFabricacao: String(vehicle.anoFabricacao), anoModelo: String(vehicle.anoModelo),
      codigoFipe: vehicle.codigoFipe || "", valorFipe: String(vehicle.valorFipe || ""),
      precoSugerido: String(vehicle.precoSugerido || ""), precoMinimo: String(vehicle.precoMinimo || ""),
      fotos: { right: vehicle.fotos?.right || "", left: vehicle.fotos?.left || "", front: vehicle.fotos?.front || "", rear: vehicle.fotos?.rear || "", interior: vehicle.fotos?.interior || "" },
      videoUrl: vehicle.videoUrl || "", videoDuracaoSegundos: String(vehicle.videoDuracao || ""), observacoes: vehicle.observacoes || "",
    });
    setShowForm(true);
  };
  const archiveVehicle = async (vehicle: InventoryVehicle) => {
    if (!window.confirm(`Arquivar ${vehicle.marca} ${vehicle.modelo}? Veículos com histórico comercial não podem ser arquivados.`)) return;
    setError(""); setNotice("");
    try {
      await apiRequest(`/veiculos/${vehicle.id}`, { method: "DELETE" });
      setNotice("Veículo arquivado."); setPage(1); await loadVehicles(1);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao arquivar veículo."); }
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
  const closeForm = () => { setShowForm(false); setEditingVehicle(null); setError(""); setForm(emptyVehicleForm); };

  return <div className="content module-content">
    <section className="module-heading"><div><p>GESTÃO DE ESTOQUE</p><h1>Veículos</h1><span>Controle preços, mídias e disponibilidade do estoque.</span></div>{canManage && <button className="primary-button" onClick={() => { setError(""); setShowForm(true); }}><Icon name="plus" size={18}/>Cadastrar veículo</button>}</section>
    {notice && <div className="auth-notice success">{notice}</div>}{error && !showForm && <div className="auth-notice">{error}</div>}
    <section className="module-summary"><div><span>Disponíveis</span><strong>{summary.available}</strong></div><div><span>Em negociação</span><strong>{summary.inNegotiation}</strong></div><div><span>Vendidos</span><strong>{summary.sold}</strong></div></section>
    <section className="panel module-table">
      <div className="module-toolbar vehicle-toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Buscar marca, modelo ou placa..."/></div><div className="filter-fields"><select value={mfgYearFilter} onChange={(event) => { setPage(1); setMfgYearFilter(event.target.value); }}><option value="ALL">Todos os anos fab.</option>{[...new Set(vehicles.map((v) => v.anoFabricacao).filter(Boolean))].sort((a, b) => b - a).map((year) => <option key={year}>{year}</option>)}</select><select value={modelYearFilter} onChange={(event) => { setPage(1); setModelYearFilter(event.target.value); }}><option value="ALL">Todos os anos mod.</option>{[...new Set(vehicles.map((v) => v.anoModelo).filter(Boolean))].sort((a, b) => b - a).map((year) => <option key={year}>{year}</option>)}</select><select value={brandFilter} onChange={(event) => { setPage(1); setBrandFilter(event.target.value); }}><option value="ALL">Todas as marcas</option>{allBrands.map((brand) => <option key={brand}>{brand}</option>)}</select><select value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }}><option value="ALL">Todos os status</option><option value="AVAILABLE">Disponível</option><option value="IN_NEGOTIATION">Em negociação</option><option value="SOLD">Vendido</option></select><MoneyInput aria-label="Preço mínimo" placeholder="Preço mín." value={minimumPrice} onValueChange={(value) => { setPage(1); setMinimumPrice(value); }}/><MoneyInput aria-label="Preço máximo" placeholder="Preço máx." value={maximumPrice} onValueChange={(value) => { setPage(1); setMaximumPrice(value); }}/><select value={sortBy} onChange={(event) => { setPage(1); setSortBy(event.target.value); }}><option value="createdAt">Mais recentes</option><option value="suggestedPrice">Preço sugerido</option><option value="minimumPrice">Preço mínimo</option><option value="manufacturingYear">Ano fabricação</option><option value="model">Modelo</option></select><select value={sortOrder} onChange={(event) => { setPage(1); setSortOrder(event.target.value); }}><option value="desc">Decrescente</option><option value="asc">Crescente</option></select></div></div>
      <div className="table-wrap"><table><thead><tr><th>VEÍCULO</th><th>ANO FAB. / MOD.</th><th>VALOR FIPE</th><th>PREÇO SUGERIDO</th><th>PREÇO MÍNIMO</th><th>SIMULAÇÕES ATIVAS</th><th>STATUS</th>{canManage && <th>AÇÕES</th>}</tr></thead><tbody>
        {loading ? <tr><td colSpan={canManage ? 8 : 7}>Carregando estoque...</td></tr> : vehicles.map((vehicle) => <tr key={vehicle.id}><td><div className="vehicle-cell"><div><Icon name="car" size={20}/></div><span><strong>{vehicle.marca} {vehicle.modelo}</strong><small>{vehicle.placa || vehicle.codigoFipe || ""}</small></span></div></td><td>{vehicle.anoFabricacao} / {vehicle.anoModelo}</td><td>{moneyLabel(vehicle.valorFipe)}</td><td><strong>{moneyLabel(vehicle.precoSugerido)}</strong></td><td>{moneyLabel(vehicle.precoMinimo)}</td><td><span className={`simulation-count ${vehicle.simulacoesAtivas ? "has-count" : ""}`}>{vehicle.simulacoesAtivas}</span></td><td><span className={`status ${vehicle.status === "AVAILABLE" ? "green" : vehicle.status === "SOLD" ? "red" : "yellow"}`}>{statusLabel[vehicle.status]}</span></td>{canManage && <td><div className="flex gap-2"><button type="button" className="text-blue-700" onClick={() => editVehicle(vehicle)}>Editar</button><button type="button" className="text-red-600" onClick={() => void archiveVehicle(vehicle)}>Arquivar</button></div></td>}</tr>)}
        {!loading && !vehicles.length && <tr><td colSpan={canManage ? 8 : 7}>Nenhum veículo encontrado para esses filtros.</td></tr>}
      </tbody></table></div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-600"><span>{pagination.total} veículo(s) · Página {page} de {Math.max(1, pagination.totalPages)}</span><div className="flex items-center gap-2"><select aria-label="Itens por página" value={pageSize} onChange={(event) => { setPage(1); setPageSize(Number(event.target.value)); }}><option value={10}>10 por página</option><option value={20}>20 por página</option><option value={50}>50 por página</option></select><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Anterior</button><button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Próxima</button></div></div>
    </section>
    {showForm && <div className="page-form-layer"><form onSubmit={submitVehicle} className="modal-card wide-modal vehicle-modal page-form-card">
      <button type="button" className="page-back" onClick={closeForm}><Icon name="arrow" size={16}/>Voltar para veículos</button>
      <div className="modal-title"><div><span>{editingVehicle ? "EDITAR ESTOQUE" : "NOVO ITEM DO ESTOQUE"}</span><h2>{editingVehicle ? `Editar ${editingVehicle.marca} ${editingVehicle.modelo}` : "Cadastrar veículo"}</h2><p>Informe os dados e URLs das cinco fotos obrigatórias.</p></div></div>
      <div className="form-section-title">Identificação</div>
      <div className="modal-row"><label>Marca<input required value={form.marca} onChange={(event) => setForm({ ...form, marca: event.target.value })} placeholder="Ex.: Jeep"/></label><label>Modelo<input required value={form.modelo} onChange={(event) => setForm({ ...form, modelo: event.target.value })} placeholder="Ex.: Compass Limited"/></label></div>
      <div className="modal-row"><label>Ano de fabricação<input required type="number" min="1900" max={new Date().getFullYear() + 2} value={form.anoFabricacao} onChange={(event) => setForm({ ...form, anoFabricacao: event.target.value })}/></label><label>Ano do modelo<input required type="number" min="1900" max={new Date().getFullYear() + 2} value={form.anoModelo} onChange={(event) => setForm({ ...form, anoModelo: event.target.value })}/></label></div>
      <div className="modal-row"><label>Código FIPE<input value={form.codigoFipe} onChange={(event) => setForm({ ...form, codigoFipe: event.target.value })} placeholder="000000-0"/></label><label>Placa<input value={form.placa} onChange={(event) => setForm({ ...form, placa: event.target.value.toUpperCase() })} placeholder="ABC1D23"/></label></div>
      <div className="form-section-title">Precificação</div>
      <div className="pricing-grid"><label>Valor FIPE<div className="input-action"><MoneyInput required value={form.valorFipe} onValueChange={(value) => setForm({ ...form, valorFipe: value })} placeholder="R$ 0,00"/><button type="button" disabled={lookingUpFipe || !form.codigoFipe} onClick={() => void lookupFipe()}>{lookingUpFipe ? "Consultando..." : "Consultar FIPE"}</button></div></label><label>Preço sugerido<MoneyInput required value={form.precoSugerido} onValueChange={(value) => setForm({ ...form, precoSugerido: value })} placeholder="R$ 0,00"/></label><label>Preço mínimo<MoneyInput required value={form.precoMinimo} onValueChange={(value) => setForm({ ...form, precoMinimo: value })} placeholder="R$ 0,00"/></label></div>
      <label>Observações<textarea value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} rows={3}/></label>
      <div className="form-section-title">Fotos obrigatórias · até 10 MB cada</div>
      <div className="media-grid vehicle-upload-grid">
        {([{ key: "front", label: "Frente" }, { key: "right", label: "Lateral direita" }, { key: "left", label: "Lateral esquerda" }, { key: "rear", label: "Traseira" }, { key: "interior", label: "Interior" }] as const).map(({ key, label }) => <label className={form.fotos[key] ? "uploaded" : ""} key={key}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void choosePhoto(key, event.target.files?.[0])}/><Icon name={form.fotos[key] ? "check" : "plus"} size={18}/><span>{uploading === "photo" ? "Enviando foto..." : form.fotos[key] ? `${label} enviada` : label}</span></label>)}
        <label className={`video-upload ${form.videoUrl ? "uploaded" : ""}`}><input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => void chooseVideo(event.target.files?.[0])}/><Icon name={form.videoUrl ? "check" : "plus"} size={18}/><span>{uploading === "video" ? "Enviando vídeo..." : form.videoUrl ? "Vídeo enviado" : "Vídeo · até 60 s"}</span></label>
      </div>
      {form.videoUrl && <p className="table-subcopy">Duração validada: {form.videoDuracaoSegundos} segundos.</p>}
      {error && <div className="auth-notice">{error}</div>}
      <div className="modal-actions"><button type="button" onClick={closeForm}>Cancelar</button><button type="submit" className="primary-button" disabled={saving || Boolean(uploading)}>{saving ? "Salvando..." : editingVehicle ? "Salvar alterações" : "Cadastrar veículo"}</button></div>
    </form></div>}
  </div>;
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
  const [customerTypeFilter, setCustomerTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [summary, setSummary] = useState({ total: 0, pf: 0, pj: 0 });
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
  const loadCustomers = async (requestedPage = page) => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(requestedPage), pageSize: String(pageSize), sortBy: "createdAt", sortOrder: "desc" });
      if (search.trim()) params.set("search", search.trim());
      if (customerTypeFilter !== "ALL") params.set("tipo", customerTypeFilter);
      const result = await apiRequest(`/clientes?${params.toString()}`) as { items?: CustomerRecord[]; pagination?: { total?: number; totalPages?: number }; summary?: { total?: number; pf?: number; pj?: number } } | null;
      setCustomers(Array.isArray(result?.items) ? result.items : []);
      setPagination({ total: Number(result?.pagination?.total || 0), totalPages: Number(result?.pagination?.totalPages || 0) });
      setSummary({ total: Number(result?.summary?.total || 0), pf: Number(result?.summary?.pf || 0), pj: Number(result?.summary?.pj || 0) });
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao carregar clientes."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadCustomers(); }, [authToken, search, customerTypeFilter, page, pageSize]);

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
      setShowForm(false); setPage(1); await loadCustomers(1);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao salvar cliente."); }
    finally { setSaving(false); }
  };
  const removeCustomer = async (customer: CustomerRecord) => {
    if (!window.confirm(`Arquivar o cadastro de ${customer.nome}?`)) return;
    try { await apiRequest(`/clientes/${customer.id}`, { method: "DELETE" }); setPage(1); await loadCustomers(1); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao arquivar cliente."); }
  };
  const formatDocument = (customer: CustomerRecord) => {
    const digits = customer.documento.replace(/\D/g, "");
    return customer.tipoPessoa === "pj"
      ? digits.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2")
      : digits.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
  };
  const money = (value: number) => value ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value) : "—";

  return <div className="content module-content">
    <section className="module-heading"><div><p>OPERAÇÃO COMERCIAL</p><h1>Clientes</h1><span>Cadastre clientes pessoa física ou jurídica e acompanhe os atendimentos de {userName}.</span></div><button className="primary-button" onClick={() => openCustomerForm(null)}><Icon name="plus" size={18}/>Novo cliente</button></section>
    <section className="module-summary"><div><span>Clientes visíveis</span><strong>{summary.total}</strong></div><div><span>Pessoa física</span><strong>{summary.pf}</strong></div><div><span>Pessoa jurídica</span><strong>{summary.pj}</strong></div></section>
    {error && <div className="auth-notice">{error}</div>}{notice && <div className="auth-notice success">{notice}</div>}
    <section className="panel module-table"><div className="module-toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Buscar nome, CPF/CNPJ, telefone ou e-mail..."/></div><div className="flex gap-2"><select aria-label="Filtrar tipo de pessoa" value={customerTypeFilter} onChange={(event) => { setPage(1); setCustomerTypeFilter(event.target.value); }}><option value="ALL">Todas as pessoas</option><option value="pf">Pessoa física</option><option value="pj">Pessoa jurídica</option></select><button onClick={() => void loadCustomers()}><Icon name="search" size={16}/>Atualizar</button></div></div>
      <div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>CPF/CNPJ</th><th>CONTATO</th><th>RENDA</th><th>LOCALIDADE</th><th>TIPO</th><th></th></tr></thead><tbody>
        {loading ? <tr><td colSpan={7}>Carregando clientes...</td></tr> : customers.length ? customers.map((customer) => <tr key={customer.id}><td>{customer.nome}</td><td>{formatDocument(customer)}</td><td>{customer.telefone}<br/><small>{customer.email}</small></td><td>{money(customer.rendaMensal)}</td><td>{customer.cidade}/{customer.estado}</td><td><span className="status blue">{customer.tipoPessoa.toUpperCase()}</span></td><td><button className="edit-customer-button" onClick={() => openCustomerForm(customer)}>Editar <Icon name="arrow" size={14}/></button><button className="edit-customer-button" onClick={() => void removeCustomer(customer)}>Arquivar</button></td></tr>) : <tr><td colSpan={7}>Nenhum cliente encontrado.</td></tr>}
      </tbody></table></div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-600"><span>{pagination.total} cliente(s) · Página {page} de {Math.max(1, pagination.totalPages)}</span><div className="flex items-center gap-2"><select aria-label="Clientes por página" value={pageSize} onChange={(event) => { setPage(1); setPageSize(Number(event.target.value)); }}><option value={10}>10 por página</option><option value={20}>20 por página</option><option value={50}>50 por página</option></select><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Anterior</button><button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Próxima</button></div></div>
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
      <div className="form-section-title">Informações comerciais</div><div className="modal-row"><label>Renda mensal<MoneyInput value={form.rendaMensal || ""} onValueChange={(value) => setForm({ ...form, rendaMensal: Number(value || 0) })} placeholder="0,00"/></label><label>Status do atendimento<input value={editingCustomer?.status || "Ativo"} disabled/></label></div>
      {error && <div className="auth-notice">{error}</div>}<div className="modal-actions"><button onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" disabled={saving} onClick={() => void saveCustomer()}>{saving ? "Salvando..." : editingCustomer ? "Salvar alterações" : "Cadastrar cliente"}</button></div>
    </div></div>}
  </div>;
}

function ClassifiedsPage({ authToken, onSimulate }: { authToken: string; onSimulate: (vehicleId: number) => void }) {
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryVehicle | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 12;

  useEffect(() => {
    let cancelled = false;
    const loadVehicles = async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sortBy: "createdAt", sortOrder: "desc" });
      if (query.trim()) params.set("search", query.trim());
      if (status !== "ALL") params.set("status", status);
      try {
        const response = await fetch(`${API_BASE_URL}/veiculos?${params}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar os classificados.");
        if (cancelled) return;
        const result = payload?.data;
        const records = Array.isArray(result) ? result : result?.items;
        setVehicles(Array.isArray(records) ? records : []);
        setPagination({
          total: Number(result?.pagination?.total || 0),
          totalPages: Number(result?.pagination?.totalPages || 0),
        });
      } catch (requestError) {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Falha ao carregar classificados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadVehicles();
    return () => { cancelled = true; };
  }, [authToken, page, query, status]);

  const statusLabel: Record<VehicleStatus, string> = {
    AVAILABLE: "Disponível",
    IN_NEGOTIATION: "Em negociação",
    SOLD: "Vendido",
  };
  const vehicleName = (vehicle: InventoryVehicle) => `${vehicle.marca} ${vehicle.modelo}`;
  const vehicleYear = (vehicle: InventoryVehicle) => `${vehicle.anoFabricacao} / ${vehicle.anoModelo}`;
  const vehiclePhotos = (vehicle: InventoryVehicle) => Object.values(vehicle.fotos || {}).filter(Boolean).map(apiAssetUrl);
  const firstPhoto = (vehicle: InventoryVehicle) => vehiclePhotos(vehicle)[0] || "";
  const formatVehiclePrice = (price: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price || 0);

  if (selectedVehicle) {
    const gallery = vehiclePhotos(selectedVehicle);
    return (
      <div className="content module-content classified-detail">
        <button className="standalone-back" onClick={() => setSelectedVehicle(null)}><Icon name="arrow" size={16}/>Voltar aos classificados</button>
        <div className="detail-heading"><div><span>{statusLabel[selectedVehicle.status]}</span><h1>{vehicleName(selectedVehicle)}</h1><p>{vehicleYear(selectedVehicle)}</p></div><div><span>Preço sugerido</span><strong>{formatVehiclePrice(selectedVehicle.precoSugerido)}</strong></div></div>
        <div className="vehicle-gallery">
          {gallery.length ? gallery.map((photo, index) => index === 0
            ? <div className="gallery-main" key={photo}><img src={photo} alt={`${vehicleName(selectedVehicle)} - foto ${index + 1}`}/><span>Foto principal</span></div>
            : <button type="button" key={photo}><img src={photo} alt={`${vehicleName(selectedVehicle)} - foto ${index + 1}`}/></button>) : <div className="gallery-main gallery-empty">Sem fotos cadastradas</div>}
          {selectedVehicle.videoUrl && <video controls preload="metadata" src={apiAssetUrl(selectedVehicle.videoUrl)} style={{ width: "100%", height: "100%", objectFit: "cover" }}>Seu navegador não suporta a reprodução de vídeo.</video>}
        </div>
        <div className="classified-detail-grid">
          <section className="panel vehicle-information">
            <h3>Informações do veículo</h3>
            <div className="specification-grid"><div><span>Ano / Modelo</span><strong>{vehicleYear(selectedVehicle)}</strong></div><div><span>Preço mínimo</span><strong>{formatVehiclePrice(selectedVehicle.precoMinimo)}</strong></div><div><span>Referência FIPE</span><strong>{formatVehiclePrice(selectedVehicle.valorFipe)}</strong></div><div><span>Código FIPE</span><strong>{selectedVehicle.codigoFipe || "Não informado"}</strong></div></div>
            <h3>Sobre este veículo</h3><p>{selectedVehicle.observacoes || "Nenhuma descrição adicional cadastrada."}</p>
          </section>
          <aside className="panel seller-action-card">
            <span>DISPONIBILIDADE</span><div className={`availability ${selectedVehicle.status === "AVAILABLE" ? "available" : ""}`}><i/>{statusLabel[selectedVehicle.status]}</div>
            <p>Este veículo possui <strong>{selectedVehicle.simulacoesAtivas} {selectedVehicle.simulacoesAtivas === 1 ? "simulação ativa" : "simulações ativas"}</strong> no momento.</p>
            <button className="auth-submit" disabled={selectedVehicle.status === "SOLD"} onClick={() => onSimulate(selectedVehicle.id)}>Iniciar simulação <Icon name="arrow" size={16}/></button>
            <small>Os dados e a disponibilidade são carregados do estoque cadastrado.</small>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="content module-content">
      <section className="module-heading classified-heading"><div><p>ESTOQUE PARA VENDA</p><h1>Classificados de veículos</h1><span>Veículos cadastrados no estoque e disponíveis para negociação.</span></div><div className="classified-total"><strong>{pagination.total}</strong><span>veículos encontrados</span></div></section>
      {error && <div className="auth-notice" role="alert">{error}</div>}
      <section className="classified-filters"><div className="search-box"><Icon name="search" size={17}/><input value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} placeholder="Buscar por marca ou modelo..."/></div><select aria-label="Filtrar classificados por status" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}><option value="ALL">Todos os status</option><option value="AVAILABLE">Disponível</option><option value="IN_NEGOTIATION">Em negociação</option><option value="SOLD">Vendido</option></select></section>
      <section className="classified-grid">
        {loading ? <div className="classified-empty">Carregando veículos cadastrados...</div> : vehicles.map((vehicle) => <article className="classified-card" key={vehicle.id}>
          <button className="classified-image" onClick={() => setSelectedVehicle(vehicle)}>{firstPhoto(vehicle) ? <img src={firstPhoto(vehicle)} alt={vehicleName(vehicle)}/> : <span className="classified-image-placeholder">Sem foto cadastrada</span>}<span className={`classified-status ${vehicle.status === "AVAILABLE" ? "available" : ""}`}>{statusLabel[vehicle.status]}</span><span className="media-badge"><Icon name="play" size={12}/> {vehicle.videoUrl ? "Fotos e vídeo" : "Fotos"}</span></button>
          <div className="classified-body"><span>{vehicleYear(vehicle)}</span><h2>{vehicleName(vehicle)}</h2><div className="compact-specs"><span>{vehicle.placa || "Placa não informada"}</span><span>{vehicle.codigoFipe ? `FIPE ${vehicle.codigoFipe}` : "Sem código FIPE"}</span></div><div className="classified-price"><div><small>Preço sugerido</small><strong>{formatVehiclePrice(vehicle.precoSugerido)}</strong></div><span><Icon name="proposal" size={14}/>{vehicle.simulacoesAtivas} ativas</span></div><button onClick={() => setSelectedVehicle(vehicle)}>Ver veículo <Icon name="arrow" size={15}/></button></div>
        </article>)}
        {!loading && !error && vehicles.length === 0 && <div className="classified-empty">Nenhum veículo disponível para os filtros selecionados.</div>}
      </section>
      <div className="pagination-controls"><span>{pagination.total} veículo(s) · Página {page} de {Math.max(pagination.totalPages, 1)}</span><button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Anterior</button><button disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Próxima</button></div>
    </div>
  );
}

type SaleVehicle = { id: number; marca: string; modelo: string; anoFabricacao: number; anoModelo: number; precoSugerido: number; precoMinimo: number; status: string; simulacoesAtivas: number; placa?: string; codigoFipe?: string };
type SaleCustomer = { id: number; nome: string; tipoPessoa: string; documento: string; status: string; nomeFantasia?: string; razaoSocial?: string };
function SimulationPage({ profile, userName, authToken, initialVehicleId }: { profile: string; userName: string; authToken: string; initialVehicleId: number | null }) {
  const [customers, setCustomers] = useState<SaleCustomer[]>([]);
  const [vehicles, setVehicles] = useState<SaleVehicle[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [downPayment, setDownPayment] = useState("0");
  const [months, setMonths] = useState("48");
  const [rateTables, setRateTables] = useState<FinancingRate[]>([]);
  const [rateTableId, setRateTableId] = useState("");
  const [benefitOptions, setBenefitOptions] = useState<BenefitRecord[]>([]);
  const [benefits, setBenefits] = useState<number[]>([]);
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
    Promise.all([apiRequest("/clientes"), apiRequest("/veiculos"), apiRequest("/financing-rates").catch(() => []), apiRequest("/benefits").catch(() => [])]).then(([clientRows, vehicleRows, rateRows, benefitRows]) => {
      if (cancelled) return;
      const availableClients = Array.isArray(clientRows) ? clientRows.filter((item) => !item.deletedAt) : [];
      const availableVehicles = Array.isArray(vehicleRows) ? vehicleRows.filter((item) => !item.deletedAt && item.status !== "SOLD") : [];
      setCustomers(availableClients); setVehicles(availableVehicles);
      const today = new Date().toISOString().slice(0, 10);
      const activeRates: FinancingRate[] = (Array.isArray(rateRows) ? rateRows : []).filter((item: FinancingRate) => item.status === "ativo" && item.periodicidade === "mensal" && item.vigenciaInicio <= today && (!item.vigenciaFim || item.vigenciaFim >= today));
      setRateTables(activeRates);
      if (activeRates.length) { setRateTableId(String(activeRates[0].id)); setMonths(String(Math.min(Math.max(48, activeRates[0].parcelasMin), activeRates[0].parcelasMax))); }
      setBenefitOptions((Array.isArray(benefitRows) ? benefitRows : []).filter((item: BenefitRecord) => item.status === "ativo"));
      if (availableClients.length) setCustomerId(String(availableClients[0].id));
      const selectedVehicle = availableVehicles.find((item) => item.id === initialVehicleId) || availableVehicles[0];
      if (selectedVehicle) { setVehicleId(String(selectedVehicle.id)); setSalePrice(String(selectedVehicle.precoSugerido || "")); }
    }).catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Falha ao carregar dados para simulação."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authToken, initialVehicleId]);
  const normalizeSearch = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
  const customerSearchTerm = normalizeSearch(customerSearch);
  const customerSearchDigits = customerSearch.replace(/\D/g, "");
  const filteredCustomers = customers.filter((item) => {
    const searchableText = normalizeSearch(`${item.nome} ${item.nomeFantasia || ""} ${item.razaoSocial || ""} ${item.documento} ${item.tipoPessoa}`);
    const documentMatches = /^[\d\s./-]+$/.test(customerSearch.trim()) && customerSearchDigits.length > 0
      && String(item.documento || "").replace(/\D/g, "").includes(customerSearchDigits);
    return !customerSearchTerm || searchableText.includes(customerSearchTerm) || documentMatches;
  });
  const selectedCustomer = customers.find((item) => String(item.id) === customerId);
  const visibleCustomers = selectedCustomer && !filteredCustomers.some((item) => item.id === selectedCustomer.id)
    ? [selectedCustomer, ...filteredCustomers]
    : filteredCustomers;
  const vehicleSearchTerm = normalizeSearch(vehicleSearch);
  const filteredVehicles = vehicles.filter((item) => normalizeSearch([
    item.marca, item.modelo, item.placa, item.codigoFipe, item.anoFabricacao, item.anoModelo,
  ].join(" ")).includes(vehicleSearchTerm));
  const selectedVehicle = vehicles.find((item) => String(item.id) === vehicleId);
  const visibleVehicles = selectedVehicle && !filteredVehicles.some((item) => item.id === selectedVehicle.id)
    ? [selectedVehicle, ...filteredVehicles]
    : filteredVehicles;
  const currentVehicle = vehicles.find((item) => String(item.id) === vehicleId);
  const isBelowMinimum = Boolean(currentVehicle && Number(salePrice) < Number(currentVehicle.precoMinimo || 0));
  const principal = Math.max(Number(salePrice || 0) - Number(downPayment || 0), 0);
  const selectedTable = rateTables.find((item) => String(item.id) === rateTableId);
  const rate = selectedTable ? String(selectedTable.taxa) : "0";
  const monthOptions = selectedTable ? Array.from(new Set([selectedTable.parcelasMin, selectedTable.parcelasMax, ...[12, 24, 36, 48, 60, 72, 84, 96, 108, 120].filter((value) => value >= selectedTable.parcelasMin && value <= selectedTable.parcelasMax)])).sort((a, b) => a - b) : [];
  const monthlyRate = Number(rate) / 100; const count = Number(months);
  const installment = monthlyRate > 0 && count > 0 ? principal * (monthlyRate * (1 + monthlyRate) ** count) / ((1 + monthlyRate) ** count - 1) : count ? principal / count : 0;
  const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const toggleBenefit = (benefit: number) => setBenefits((current) => current.includes(benefit) ? current.filter((item) => item !== benefit) : [...current, benefit]);
  const submitSimulation = async () => {
    setSaving(true); setError(""); setNotice("");
    try {
      const proposal = await apiRequest("/propostas", { method: "POST", body: JSON.stringify({ clienteId: Number(customerId), veiculoId: Number(vehicleId), valorProposta: Number(salePrice), entrada: Number(downPayment), parcelas: count, taxaJuros: Number(rate), beneficioIds: benefits }) });
      setNotice(`Proposta #${proposal.id} criada. Parcela estimada: ${brl(proposal.valorParcela)}.`);
      setVehicles((current) => current.map((item) => item.id === Number(vehicleId) ? { ...item, status: "IN_NEGOTIATION", simulacoesAtivas: item.simulacoesAtivas + 1 } : item));
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Falha ao gerar proposta."); }
    finally { setSaving(false); }
  };
  return <div className="content module-content">
    <section className="module-heading"><div><p>OPERAÇÃO COMERCIAL</p><h1>Nova simulação</h1><span>Negociação vinculada à carteira de {userName}; preço mínimo validado no servidor.</span></div></section>
    {loading && <div className="support-note">Carregando clientes e estoque...</div>}{error && <div className="auth-notice">{error}</div>}{notice && <div className="auth-notice success">{notice}</div>}
    <div className="simulation-layout"><div className="simulation-form">
      <section className="panel form-panel"><div className="step-title"><span>1</span><div><h3>Cliente</h3><p>Selecione um cliente autorizado na sua carteira.</p></div></div><label className="simulation-search-label" htmlFor="simulation-customer-search">Buscar cliente</label><input id="simulation-customer-search" className="simulation-search-input" type="search" value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Digite nome, CPF ou CNPJ"/><label>Cliente cadastrado<select value={customerId} onChange={(event) => setCustomerId(event.target.value)}><option value="">Selecione um cliente</option>{visibleCustomers.map((item) => <option key={item.id} value={item.id}>{item.nome} · {item.tipoPessoa.toUpperCase()} · {item.documento}</option>)}</select></label>{customers.length === 0 ? <small>Nenhum cliente disponível. Cadastre um cliente antes.</small> : filteredCustomers.length === 0 ? <small role="status">Nenhum cliente encontrado para essa busca.</small> : <small role="status">{filteredCustomers.length} cliente(s) encontrado(s).</small>}</section>
      <section className="panel form-panel"><div className="step-title"><span>2</span><div><h3>Veículo</h3><p>Estoque real com propostas ativas.</p></div></div><label className="simulation-search-label" htmlFor="simulation-vehicle-search">Buscar veículo</label><input id="simulation-vehicle-search" className="simulation-search-input" type="search" value={vehicleSearch} onChange={(event) => setVehicleSearch(event.target.value)} placeholder="Digite placa, marca, modelo, ano ou código FIPE"/><label>Veículo do estoque<select value={vehicleId} onChange={(event) => { const selected = vehicles.find((item) => String(item.id) === event.target.value); setVehicleId(event.target.value); setSalePrice(String(selected?.precoSugerido || "")); }}><option value="">Selecione um veículo</option>{visibleVehicles.map((item) => <option key={item.id} value={item.id}>{item.marca} {item.modelo} · {item.placa || `${item.anoFabricacao}/${item.anoModelo}`} · {item.status === "AVAILABLE" ? "Disponível" : "Em negociação"} · {item.simulacoesAtivas} simulações</option>)}</select></label>{vehicles.length > 0 && filteredVehicles.length === 0 && <small role="status">Nenhum veículo encontrado para essa busca.</small>}{currentVehicle && <div className="vehicle-selection-meta"><span><Icon name="check" size={15}/> Aceita simulações</span><span><Icon name="proposal" size={15}/> {currentVehicle.simulacoesAtivas} simulações ativas</span><span>Status: <strong>{currentVehicle.status === "AVAILABLE" ? "Disponível" : "Em negociação"}</strong></span></div>}<label className="sale-price-field">Preço negociado<MoneyInput value={salePrice} onValueChange={setSalePrice}/><small>Preço mínimo autorizado: {brl(Number(currentVehicle?.precoMinimo || 0))}</small></label>{isBelowMinimum && <div className="price-alert">O valor não pode ser menor que o preço mínimo.</div>}</section>
      <section className="panel form-panel"><div className="step-title"><span>3</span><div><h3>Benefícios</h3><p>Registre os benefícios negociados.</p></div></div><div className="benefit-grid">{benefitOptions.length === 0 && <p className="support-note">Nenhum benefício ativo cadastrado.</p>}{benefitOptions.map((benefit) => <button type="button" className={benefits.includes(benefit.id) ? "selected" : ""} onClick={() => toggleBenefit(benefit.id)} key={benefit.id} title={benefit.descricao || undefined}><span><Icon name="gift" size={18}/>{benefit.nome}</span><i>{benefits.includes(benefit.id) ? "✓" : "+"}</i></button>)}</div></section>
    </div><aside className="finance-card"><span className="finance-kicker">RESUMO DO FINANCIAMENTO</span><h2>{brl(Number(salePrice || 0))}</h2><p>Valor negociado do veículo</p><div className="finance-fields"><label>Valor de entrada<MoneyInput value={downPayment} onValueChange={setDownPayment}/></label><div className="finance-row"><label>Tabela de taxa<select value={rateTableId} onChange={(event) => { const table = rateTables.find((item) => String(item.id) === event.target.value); setRateTableId(event.target.value); if (table) setMonths(String(Math.min(Math.max(Number(months), table.parcelasMin), table.parcelasMax))); }}>{rateTables.length === 0 && <option value="">Nenhuma tabela vigente</option>}{rateTables.map((item) => <option key={item.id} value={item.id}>{item.instituicao} - {Number(item.taxa).toLocaleString("pt-BR")}% a.m.</option>)}</select></label><label>Parcelas<select value={months} onChange={(event) => setMonths(event.target.value)}>{monthOptions.map((value) => <option key={value} value={value}>{value}x</option>)}</select></label></div></div><div className="finance-result"><span>Financiamento em {months}x de</span><strong>{brl(installment)}</strong><small>Valor financiado: {brl(principal)}</small></div><div className="finance-breakdown"><span><em>Total financiado</em><strong>{brl(installment * count)}</strong></span><span><em>Custo efetivo estimado</em><strong>{brl(installment * count + Number(downPayment || 0))}</strong></span><span><em>Benefícios incluídos</em><strong>{benefits.length}</strong></span></div><button disabled={loading || saving || !customerId || !vehicleId || !salePrice || !selectedTable || isBelowMinimum} className="auth-submit" onClick={() => void submitSimulation()}>{saving ? "Salvando..." : "Gerar proposta"} <Icon name="arrow" size={16}/></button></aside></div>
  </div>;
}

function SupportDashboard() {
  const { dateRange, setDateRange } = useDateRangeContext();
  const { dashboard, loading, error } = useDashboardContext();
  const summary = dashboard?.summary;
  const teams = dashboard?.teams || [];
  const sellers = dashboard?.sellers || [];
  const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value || 0);
  const approvalRate = (summary?.contracts || 0) + (summary?.rejectedProposals || 0)
    ? Math.round((summary?.contracts || 0) * 100 / ((summary?.contracts || 0) + (summary?.rejectedProposals || 0)))
    : 0;
  const maxTeamSales = Math.max(...teams.map((team) => team.sales), 1);
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>SUPORTE E OPERAÇÕES</p><h1>Performance comercial</h1><span>Acompanhe equipes, vendedores e propostas enviadas aos bancos.</span></div><DateRangePicker value={dateRange} onChange={setDateRange}/></section>
      {error && <div className="auth-notice">{error}</div>}
      <section className="stats-grid support-stats">
        <article className="stat-card"><div className="stat-icon blue"><Icon name="proposal"/></div><div className="stat-title"><span>Propostas em análise</span><strong>{loading ? "Atualizando" : "No período"}</strong></div><h2>{summary?.pendingProposals ?? "—"}</h2><p>Em análise no intervalo selecionado</p></article>
        <article className="stat-card"><div className="stat-icon green"><Icon name="check"/></div><div className="stat-title"><span>Aprovações</span><strong>{approvalRate}%</strong></div><h2>{summary?.contracts ?? "—"}</h2><p>Contratos efetivados no período</p></article>
        <article className="stat-card"><div className="stat-icon purple"><Icon name="trend"/></div><div className="stat-title"><span>Volume vendido</span><strong>{loading ? "Atualizando" : "No período"}</strong></div><h2>{summary ? money(summary.salesVolume) : "—"}</h2><p>{summary?.contracts ?? 0} contratos efetivados</p></article>
        <article className="stat-card"><div className="stat-icon red"><Icon name="percent"/></div><div className="stat-title"><span>Comissões registradas</span><strong>{loading ? "Atualizando" : "No período"}</strong></div><h2>{summary ? money(summary.commissionAmount) : "—"}</h2><p>Valores lançados no período</p></article>
      </section>
      <div className="support-grid">
        <section className="panel ranking-panel">
          <div className="panel-header"><div><h3>Resultado por gerente</h3><p>Consolidado de vendedores associados no período</p></div></div>
          <div className="team-ranking">{teams.length ? teams.map((team, index) => <div className="rank-row" key={team.name}><span className={`rank-number rank-${index + 1}`}>{index + 1}</span><div className="rank-main"><strong>{team.name}</strong><small>{team.sellers} vendedores associados</small><div><i style={{ width: `${Math.max(2, team.sales / maxTeamSales * 100)}%` }}/></div></div><div className="rank-metric"><strong>{money(team.sales)}</strong><span>{team.contracts} contratos</span></div></div>) : <p className="empty-state">{loading ? "Carregando resultados..." : "Sem resultados de equipe neste período."}</p>}</div>
        </section>
        <section className="panel seller-ranking">
          <div className="panel-header"><div><h3>Vendedores em destaque</h3><p>Maiores volumes no intervalo selecionado</p></div></div>
          {sellers.length ? sellers.slice(0, 5).map((seller, index) => <div className="seller-row" key={seller.name}><span className="seller-position">{index + 1}</span><div className="mini-avatar blue">{seller.name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase()}</div><div><strong>{seller.name}</strong><small>{seller.managerName || "Sem gerente associado"}</small></div><div><strong>{money(seller.sales)}</strong><small>{seller.contracts} contratos</small></div></div>) : <p className="empty-state">{loading ? "Carregando resultados..." : "Sem vendas registradas neste período."}</p>}
        </section>
      </div>
    </div>
  );
}

type ProposalRecord = { id: number; clienteId: number; vendedorId: number; veiculoId: number; valorProposta: number; valorParcela?: number; parcelas?: number; status: string; createdAt: string; cliente?: SaleCustomer; vendedor?: { nome: string }; veiculo?: SaleVehicle };
type ContractRecord = { id: number; propostaId: number; valorTotal: number; status: string; dataAssinatura?: string | null; createdAt: string; cliente?: SaleCustomer; vendedor?: { nome: string }; proposta?: { parcelas?: number; valorParcela?: number; veiculo?: SaleVehicle } };
type FinancingRate = { id: number; instituicao: string; produto: string; taxa: number; periodicidade: string; parcelasMin: number; parcelasMax: number; vigenciaInicio: string; vigenciaFim: string | null; status: string };
type BenefitRecord = { id: number; nome: string; descricao: string | null; status: string };

function RatesBenefitsPage({ kind, profile, authToken }: { kind: "rates" | "benefits"; profile: string; authToken: string }) {
  const isRates = kind === "rates";
  const endpoint = isRates ? "/financing-rates" : "/benefits";
  const canEdit = ["ADMIN", "SUPPORT"].includes(profile);
  const emptyRate = { instituicao: "", produto: "", taxa: "", periodicidade: "mensal", parcelasMin: "24", parcelasMax: "60", vigenciaInicio: new Date().toISOString().slice(0, 10), vigenciaFim: "", status: "ativo" };
  const emptyBenefit = { nome: "", descricao: "", status: "ativo" };
  const [rows, setRows] = useState<Array<FinancingRate & BenefitRecord>>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(isRates ? emptyRate : emptyBenefit);
  const setField = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const apiRequest = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers); headers.set("Authorization", `Bearer ${authToken}`);
    if (options.body) headers.set("Content-Type", "application/json");
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || "Não foi possível concluir a operação.");
    return payload?.data;
  };
  const load = async () => {
    setLoading(true); setError("");
    try { const data = await apiRequest(endpoint); setRows(Array.isArray(data) ? data : []); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao carregar."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [authToken, kind]);
  const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
  const formatDate = (value?: string | null) => value ? value.split("-").reverse().join("/") : "—";
  const term = normalize(search);
  const filtered = rows.filter((row) => (statusFilter === "ALL" || row.status === statusFilter) && (!term || normalize(isRates ? `${row.instituicao} ${row.produto}` : `${row.nome} ${row.descricao}`).includes(term)));
  const openForm = (row?: FinancingRate & BenefitRecord) => {
    setError(""); setNotice(""); setEditingId(row?.id ?? null);
    setForm(row ? (isRates
      ? { instituicao: row.instituicao, produto: row.produto, taxa: String(row.taxa).replace(".", ","), periodicidade: row.periodicidade, parcelasMin: String(row.parcelasMin), parcelasMax: String(row.parcelasMax), vigenciaInicio: row.vigenciaInicio, vigenciaFim: row.vigenciaFim || "", status: row.status }
      : { nome: row.nome, descricao: row.descricao || "", status: row.status }) : (isRates ? emptyRate : emptyBenefit));
    setShowForm(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      await apiRequest(editingId ? `${endpoint}/${editingId}` : endpoint, { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) });
      setShowForm(false); setNotice(editingId ? "Registro atualizado." : "Registro criado."); await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Falha ao salvar."); }
    finally { setSaving(false); }
  };
  const remove = async (row: FinancingRate & BenefitRecord) => {
    if (!window.confirm(`Remover "${isRates ? `${row.instituicao} - ${row.produto}` : row.nome}"?`)) return;
    try { await apiRequest(`${endpoint}/${row.id}`, { method: "DELETE" }); setNotice("Registro removido."); await load(); }
    catch (removeError) { setError(removeError instanceof Error ? removeError.message : "Falha ao remover."); }
  };
  const title = isRates ? "Taxas e tabelas" : "Benefícios do contrato";
  const subtitle = isRates ? "Condições de financiamento utilizadas nas simulações e propostas." : "Vantagens que podem ser incluídas nas negociações.";
  return <div className="content module-content">
    <section className="module-heading"><div><p>CADASTROS</p><h1>{title}</h1><span>{subtitle}</span></div>{canEdit && <button className="primary-action" onClick={() => openForm()}>{isRates ? "Nova tabela" : "Novo benefício"}</button>}</section>
    {notice && <div className="auth-notice success">{notice}</div>}{error && !showForm && <div className="auth-notice">{error}</div>}
    <section className="panel simulation-search-panel"><input className="simulation-search-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isRates ? "Buscar por instituição ou produto" : "Buscar por nome ou descrição"}/><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">Todas as situações</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option></select></section>
    <section className="panel module-table"><div className="table-wrap"><table><thead><tr>{isRates ? <><th>INSTITUIÇÃO</th><th>PRODUTO</th><th>TAXA</th><th>PARCELAS</th><th>VIGÊNCIA</th></> : <><th>BENEFÍCIO</th><th>DESCRIÇÃO</th></>}<th>STATUS</th>{canEdit && <th>AÇÕES</th>}</tr></thead><tbody>
      {loading ? <tr><td colSpan={7}>Carregando...</td></tr> : filtered.length ? filtered.map((row) => <tr key={row.id}>
        {isRates ? <><td>{row.instituicao}</td><td>{row.produto}</td><td>{Number(row.taxa).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}% {row.periodicidade === "anual" ? "a.a." : "a.m."}</td><td>{row.parcelasMin} a {row.parcelasMax}x</td><td>{formatDate(row.vigenciaInicio)} até {row.vigenciaFim ? formatDate(row.vigenciaFim) : "sem fim"}</td></> : <><td>{row.nome}</td><td>{row.descricao || "—"}</td></>}
        <td>{row.status === "ativo" ? "Ativo" : "Inativo"}</td>
        {canEdit && <td><button className="table-link" onClick={() => openForm(row)}>Editar</button> <button className="table-link" onClick={() => void remove(row)}>Remover</button></td>}
      </tr>) : <tr><td colSpan={7}>Nenhum registro encontrado.</td></tr>}
    </tbody></table></div></section>
    {showForm && <div className="page-form-layer"><form onSubmit={submit} className="modal-card wide-modal page-form-card">
      <button type="button" className="page-back" onClick={() => setShowForm(false)}><Icon name="arrow" size={16}/>Voltar</button>
      <div className="modal-title"><div><span>{editingId ? "EDIÇÃO" : "NOVO CADASTRO"}</span><h2>{isRates ? "Tabela de financiamento" : "Benefício"}</h2></div></div>
      {error && <div className="auth-notice">{error}</div>}
      {isRates ? <>
        <div className="modal-row"><label>Instituição financeira<input required maxLength={120} value={form.instituicao} onChange={(event) => setField("instituicao", event.target.value)}/></label><label>Produto/modalidade<input required maxLength={120} value={form.produto} onChange={(event) => setField("produto", event.target.value)}/></label></div>
        <div className="modal-row"><label>Taxa (%)<input required inputMode="decimal" placeholder="Ex.: 1,39" value={form.taxa} onChange={(event) => setField("taxa", event.target.value.replace(/[^\d,]/g, ""))}/></label><label>Periodicidade<select value={form.periodicidade} onChange={(event) => setField("periodicidade", event.target.value)}><option value="mensal">Mensal (a.m.)</option><option value="anual">Anual (a.a.)</option></select></label></div>
        <div className="modal-row"><label>Parcelas mínimas<input required type="number" min={1} max={120} value={form.parcelasMin} onChange={(event) => setField("parcelasMin", event.target.value)}/></label><label>Parcelas máximas<input required type="number" min={1} max={120} value={form.parcelasMax} onChange={(event) => setField("parcelasMax", event.target.value)}/></label></div>
        <div className="modal-row"><label>Vigência inicial<input required type="date" value={form.vigenciaInicio} onChange={(event) => setField("vigenciaInicio", event.target.value)}/></label><label>Vigência final (opcional)<input type="date" value={form.vigenciaFim} onChange={(event) => setField("vigenciaFim", event.target.value)}/></label></div>
      </> : <>
        <label>Nome<input required maxLength={120} value={form.nome} onChange={(event) => setField("nome", event.target.value)}/></label>
        <label>Descrição<textarea maxLength={255} value={form.descricao} onChange={(event) => setField("descricao", event.target.value)}/></label>
      </>}
      <label>Situação<select value={form.status} onChange={(event) => setField("status", event.target.value)}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></label>
      <div className="modal-actions"><button type="button" className="secondary-action" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-action" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button></div>
    </form></div>}
  </div>;
}

function ContractsPage({ profile, userName, authToken }: { profile: string; userName: string; authToken: string }) {
  const [rows, setRows] = useState<ContractRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const canChangeStatus = profile === "ADMIN" || profile === "SUPPORT";
  const headers = { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" };
  const load = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/contratos`, { headers });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar os contratos.");
      setRows(Array.isArray(payload?.data) ? payload.data : []);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao carregar contratos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [authToken]);
  const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
  const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat("pt-BR").format(new Date(value)) : "—";
  const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
  const statusLabel: Record<string, string> = { ativo: "Ativo", efetivado: "Efetivado", inativo: "Inativo", cancelado: "Cancelado" };
  const term = normalize(search);
  const digits = search.replace(/\D/g, "");
  const filtered = rows.filter((row) => {
    if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
    if (!term) return true;
    const text = normalize([row.id, row.cliente?.nome, row.cliente?.documento, row.vendedor?.nome, row.proposta?.veiculo?.marca, row.proposta?.veiculo?.modelo, row.proposta?.veiculo?.placa].join(" "));
    return text.includes(term) || (digits.length > 0 && /^[\d\s./#-]+$/.test(search.trim()) && (String(row.cliente?.documento || "").replace(/\D/g, "").includes(digits) || String(row.id).padStart(4, "0").includes(digits)));
  });
  const totalValue = filtered.filter((row) => row.status !== "cancelado").reduce((sum, row) => sum + Number(row.valorTotal || 0), 0);
  const changeStatus = async (row: ContractRecord, status: string) => {
    if (!window.confirm(`Alterar o contrato #${String(row.id).padStart(4, "0")} para "${statusLabel[status]}"?`)) return;
    setBusyId(row.id); setError(""); setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/${row.id}/status`, { method: "PATCH", headers, body: JSON.stringify({ status }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "Não foi possível atualizar o contrato.");
      setNotice("Status do contrato atualizado.");
      await load();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao atualizar o contrato."); }
    finally { setBusyId(null); }
  };
  const scopeLabel = profile === "MANAGER" ? "CARTEIRA DA EQUIPE" : profile === "SELLER" ? "MINHA CARTEIRA" : "OPERAÇÃO";
  return <div className="content module-content">
    <section className="module-heading"><div><p>{scopeLabel}</p><h1>Contratos</h1><span>{profile === "SELLER" ? `Contratos efetivados na carteira de ${userName}.` : "Contratos efetivados a partir de propostas aprovadas."}</span></div><button className="secondary-button" onClick={() => void load()}>Atualizar</button></section>
    {error && <div className="auth-notice" role="alert">{error}</div>}{notice && <div className="auth-notice success">{notice}</div>}
    <section className="stats-grid support-stats">
      <article className="stat-card"><div className="stat-title"><span>Contratos listados</span></div><h2>{filtered.length}</h2><p>De {rows.length} no total</p></article>
      <article className="stat-card"><div className="stat-title"><span>Valor total</span></div><h2>{money(totalValue)}</h2><p>Exclui cancelados</p></article>
    </section>
    <section className="classified-filters"><div className="search-box"><Icon name="search" size={17}/><input aria-label="Buscar contratos" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nº, cliente, CPF/CNPJ, veículo ou placa..."/></div><select aria-label="Filtrar contratos por status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">Todos os status</option>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></section>
    <section className="panel module-table"><div className="table-wrap"><table><thead><tr><th>CONTRATO</th><th>CLIENTE</th><th>VEÍCULO</th>{profile !== "SELLER" && <th>VENDEDOR</th>}<th>VALOR</th><th>ASSINATURA</th><th>STATUS</th>{canChangeStatus && <th>AÇÃO</th>}</tr></thead><tbody>
      {loading ? <tr><td colSpan={8}>Carregando contratos...</td></tr> : filtered.length ? filtered.map((row) => <tr key={row.id}>
        <td>#{String(row.id).padStart(4, "0")}<br/><small>Proposta #{String(row.propostaId).padStart(4, "0")}</small></td>
        <td>{row.cliente?.nome || "—"}<br/><small>{row.cliente?.documento || ""}</small></td>
        <td>{row.proposta?.veiculo ? `${row.proposta.veiculo.marca} ${row.proposta.veiculo.modelo}` : "—"}<br/><small>{row.proposta?.veiculo?.placa || ""}</small></td>
        {profile !== "SELLER" && <td>{row.vendedor?.nome || "—"}</td>}
        <td>{money(row.valorTotal)}{row.proposta?.parcelas ? <><br/><small>{row.proposta.parcelas}x {money(row.proposta.valorParcela || 0)}</small></> : null}</td>
        <td>{formatDate(row.dataAssinatura || row.createdAt)}</td>
        <td><span className={`status ${row.status === "cancelado" || row.status === "inativo" ? "red" : "green"}`}>{statusLabel[row.status] || row.status}</span></td>
        {canChangeStatus && <td><select aria-label={`Alterar status do contrato ${row.id}`} disabled={busyId === row.id} value={row.status} onChange={(event) => void changeStatus(row, event.target.value)}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>}
      </tr>) : <tr><td colSpan={8}>{rows.length ? "Nenhum contrato encontrado para os filtros." : "Nenhum contrato efetivado ainda."}</td></tr>}
    </tbody></table></div></section>
  </div>;
}

function SellerProposalsPage({ profile, userName, authToken }: { profile: string; userName: string; authToken: string }) {
  const [rows, setRows] = useState<ProposalRecord[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [search, setSearch] = useState(""); const [statusFilter, setStatusFilter] = useState("ALL");
  useEffect(() => { let cancelled = false; const load = async () => { try { const response = await fetch(`${API_BASE_URL}/propostas`, { headers: { Authorization: `Bearer ${authToken}` } }); const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar propostas."); if (!cancelled) setRows(Array.isArray(payload?.data) ? payload.data : []); } catch (requestError) { if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Falha ao carregar propostas."); } finally { if (!cancelled) setLoading(false); } }; void load(); return () => { cancelled = true; }; }, [authToken]);
  const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  const normalizeSearch = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
  const searchTerm = normalizeSearch(search);
  const searchDigits = search.replace(/\D/g, "");
  const statusOptions = Array.from(new Set(rows.map((row) => row.status)));
  const filteredRows = rows.filter((row) => {
    if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const text = normalizeSearch([row.id, row.cliente?.nome, row.cliente?.nomeFantasia, row.cliente?.razaoSocial, row.cliente?.documento, row.veiculo?.marca, row.veiculo?.modelo, row.veiculo?.placa, row.veiculo?.codigoFipe, row.vendedor?.nome].join(" "));
    const documentMatches = searchDigits.length > 0 && /^[\d\s./#-]+$/.test(search.trim()) && (String(row.cliente?.documento || "").replace(/\D/g, "").includes(searchDigits) || String(row.id).padStart(4, "0").includes(searchDigits));
    return text.includes(searchTerm) || documentMatches;
  });
  const downloadProposalPdf = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/propostas/${id}/pdf`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) throw new Error("Não foi possível gerar o PDF da proposta.");
      const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `proposta-${id}.pdf`; anchor.click(); URL.revokeObjectURL(url);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao baixar PDF."); }
  };
  return <div className="content module-content"><section className="module-heading"><div><p>{profile === "MANAGER" ? "CARTEIRA DA EQUIPE" : "MINHA CARTEIRA"}</p><h1>{profile === "MANAGER" ? "Propostas da equipe" : "Minhas propostas"}</h1><span>Propostas vinculadas à carteira de {userName}.</span></div></section>{error && <div className="auth-notice">{error}</div>}<section className="classified-filters"><div className="search-box"><Icon name="search" size={17}/><input aria-label="Buscar propostas" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nº, cliente, CPF/CNPJ, veículo ou placa..."/></div><select aria-label="Filtrar propostas por status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">Todos os status</option>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></section><section className="panel module-table"><div className="table-wrap"><table><thead><tr><th>PROPOSTA</th><th>CLIENTE</th><th>VEÍCULO</th><th>VALOR</th><th>PARCELAS</th><th>STATUS</th><th>DOCUMENTO</th></tr></thead><tbody>{loading ? <tr><td colSpan={7}>Carregando propostas...</td></tr> : filteredRows.length ? filteredRows.map((row) => <tr key={row.id}><td>#{String(row.id).padStart(4, "0")}</td><td>{row.cliente?.nome || "Cliente"}</td><td>{row.veiculo ? `${row.veiculo.marca} ${row.veiculo.modelo}` : "—"}</td><td>{money(row.valorProposta)}</td><td>{row.parcelas ? `${row.parcelas}x ${money(row.valorParcela || 0)}` : "—"}</td><td><span className={`status ${["CONTRACT_EFFECTIVE", "approved"].includes(row.status) ? "green" : ["CREDIT_REJECTED", "REJECTED", "CANCELLED"].includes(row.status) ? "red" : "blue"}`}>{row.status}</span></td><td><button className="submit-bank" onClick={() => void downloadProposalPdf(row.id)}>Baixar PDF</button></td></tr>) : <tr><td colSpan={7}>{rows.length ? "Nenhuma proposta encontrada para os filtros." : "Nenhuma proposta vinculada a esta carteira."}</td></tr>}</tbody></table></div></section></div>;
}

function ProposalReviewPage({ authToken }: { authToken: string }) {
  const [rows, setRows] = useState<ProposalRecord[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [busyId, setBusyId] = useState<number | null>(null); const [search, setSearch] = useState(""); const [statusFilter, setStatusFilter] = useState("QUEUE");
  const load = async () => { setLoading(true); setError(""); try { const response = await fetch(`${API_BASE_URL}/propostas`, { headers: { Authorization: `Bearer ${authToken}` } }); const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar propostas."); setRows(Array.isArray(payload?.data) ? payload.data : []); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao carregar propostas."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [authToken]);
  const changeStatus = async (id: number, status: string) => { setBusyId(id); setError(""); try { const response = await fetch(`${API_BASE_URL}/propostas/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ status }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível atualizar o status."); await load(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao atualizar proposta."); } finally { setBusyId(null); } };
  const queueStatuses = ["pendente", "em análise", "em analise", "aguardando", "proposal", "PROPOSAL", "SIMULATION"];
  const queue = rows.filter((row) => queueStatuses.includes(row.status));
  const normalizeSearch = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
  const searchTerm = normalizeSearch(search);
  const searchDigits = search.replace(/\D/g, "");
  const statusOptions = Array.from(new Set(rows.map((row) => row.status)));
  const review = rows.filter((row) => {
    if (statusFilter === "QUEUE" ? !queueStatuses.includes(row.status) : statusFilter !== "ALL" && row.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const text = normalizeSearch([row.id, row.cliente?.nome, row.cliente?.nomeFantasia, row.cliente?.razaoSocial, row.cliente?.documento, row.veiculo?.marca, row.veiculo?.modelo, row.veiculo?.placa, row.veiculo?.codigoFipe, row.vendedor?.nome].join(" "));
    const numericMatch = searchDigits.length > 0 && /^[\d\s./#-]+$/.test(search.trim()) && (String(row.cliente?.documento || "").replace(/\D/g, "").includes(searchDigits) || String(row.id).padStart(4, "0").includes(searchDigits));
    return text.includes(searchTerm) || numericMatch;
  });
  const downloadPdf = async (id: number) => {
    try { const response = await fetch(`${API_BASE_URL}/propostas/${id}/pdf`, { headers: { Authorization: `Bearer ${authToken}` } }); if (!response.ok) throw new Error("Não foi possível gerar o PDF da proposta."); const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `proposta-${id}.pdf`; anchor.click(); URL.revokeObjectURL(url); }
    catch (downloadError) { setError(downloadError instanceof Error ? downloadError.message : "Falha ao baixar PDF."); }
  };
  const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  return <div className="content module-content"><section className="module-heading"><div><p>OPERAÇÃO BANCÁRIA</p><h1>Análise de propostas</h1><span>Revise propostas pendentes e registre aprovação ou recusa.</span></div><button className="secondary-button" onClick={() => void load()}>Atualizar fila</button></section>{error && <div className="auth-notice">{error}</div>}<section className="review-tabs"><button className="active">Aguardando análise <span>{queue.length}</span></button></section><section className="classified-filters"><div className="search-box"><Icon name="search" size={17}/><input aria-label="Buscar propostas" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nº, cliente, CPF/CNPJ, veículo, placa ou vendedor..."/></div><select aria-label="Filtrar propostas por status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="QUEUE">Aguardando análise</option><option value="ALL">Todos os status</option>{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></section><section className="panel module-table"><div className="table-wrap"><table><thead><tr><th>PROPOSTA</th><th>CLIENTE</th><th>VENDEDOR</th><th>VEÍCULO</th><th>VALOR</th><th>STATUS</th><th>PDF</th><th>AÇÃO</th></tr></thead><tbody>{loading ? <tr><td colSpan={8}>Carregando fila...</td></tr> : review.length ? review.map((row) => <tr key={row.id}><td><strong>#{String(row.id).padStart(4, "0")}</strong></td><td>{row.cliente?.nome || "—"}</td><td>{row.vendedor?.nome || "—"}</td><td>{row.veiculo ? `${row.veiculo.marca} ${row.veiculo.modelo}` : "—"}</td><td><strong>{money(row.valorProposta)}</strong></td><td><span className="status blue">{row.status}</span></td><td><button className="submit-bank" onClick={() => void downloadPdf(row.id)}>Baixar PDF</button></td><td>{queueStatuses.includes(row.status) ? <><button className="submit-bank done" disabled={busyId === row.id} onClick={() => void changeStatus(row.id, "CONTRACT_EFFECTIVE")}>{busyId === row.id ? "Salvando..." : "Aprovar"}</button> <button className="submit-bank" disabled={busyId === row.id} onClick={() => void changeStatus(row.id, "CREDIT_REJECTED")}>Recusar</button></> : "—"}</td></tr>) : <tr><td colSpan={8}>{rows.length ? "Nenhuma proposta encontrada para os filtros." : "Não há propostas aguardando análise."}</td></tr>}</tbody></table></div></section></div>;
}

type TeamRecord = {
  id: number;
  nome: string;
  gerenteId: number;
  lojaId: number;
  status: string;
  gerente: { id: number; nome: string; email: string; status: string };
  loja: { id: number; nome: string };
  _count: { membros: number };
  membros: { id: number; nome: string; email: string; perfil: string; status: string; gerenteId: number | null }[];
  historicoMembros: {
    id: number;
    iniciadoEm: string;
    encerradoEm: string | null;
    vendedor: { id: number; nome: string; email: string };
    atribuidoPor: { id: number; nome: string } | null;
    removidoPor: { id: number; nome: string } | null;
  }[];
};

function TeamsCommissionsPage({ profile, userId, userName, authToken }: { profile: string; userId: number; userName: string; authToken: string }) {
  const { dateRange, setDateRange } = useDateRangeContext();
  const { dashboard, loading: dashboardLoading } = useDashboardContext();
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [managers, setManagers] = useState<ManagedUser[]>([]);
  const [memberOptions, setMemberOptions] = useState<ManagedUser[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamError, setTeamError] = useState("");
  const [teamNotice, setTeamNotice] = useState("");
  const [teamSaving, setTeamSaving] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamRecord | null>(null);
  const [teamForm, setTeamForm] = useState({ nome: "", gerenteId: "", lojaId: "", memberIds: [] as number[] });
  const [sellerRate, setSellerRate] = useState("1.5");
  const [managerRate, setManagerRate] = useState("0.5");
  const [commissionNotice, setCommissionNotice] = useState("");
  const [commissionError, setCommissionError] = useState("");
  const [savingRules, setSavingRules] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setTeamsLoading(true);
    setTeamError("");
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/teams`, { headers: { Authorization: `Bearer ${authToken}` } });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar as equipes.");
        if (!cancelled) setTeams(payload.data || []);
        if (profile === "ADMIN") {
          const usersResponse = await fetch(`${API_BASE_URL}/auth/users`, { headers: { Authorization: `Bearer ${authToken}` } });
          const usersPayload = await usersResponse.json();
          if (!usersResponse.ok) throw new Error(usersPayload?.message || "Não foi possível carregar os gerentes.");
          if (!cancelled) {
            setManagers((usersPayload.data || []).filter((user: ManagedUser) => user.perfil.toUpperCase() === "MANAGER" && user.status === "ativo"));
            setMemberOptions((usersPayload.data || []).filter((user: ManagedUser) => user.perfil.toUpperCase() === "SELLER"));
          }
        } else if (profile === "MANAGER") {
          const sellersResponse = await fetch(`${API_BASE_URL}/teams/seller-options`, { headers: { Authorization: `Bearer ${authToken}` } });
          const sellersPayload = await sellersResponse.json();
          if (!sellersResponse.ok) throw new Error(sellersPayload?.message || "Não foi possível carregar os vendedores da loja.");
          if (!cancelled) setMemberOptions((sellersPayload.data || []).map((seller: { id: number; nome: string; email: string; gerenteId: number | null; equipeId: number | null; equipeNome: string | null; equipeGerenteNome: string | null }) => ({ id: seller.id, nome: seller.nome, email: seller.email, perfil: "SELLER", status: "ativo", telefone: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", lojaId: 0, lojaNome: "", gerenteId: seller.gerenteId, equipeId: seller.equipeId, equipeNome: seller.equipeNome, equipeGerenteNome: seller.equipeGerenteNome })));
        }
      } catch (loadError) {
        if (!cancelled) setTeamError(loadError instanceof Error ? loadError.message : "Falha ao carregar equipes.");
      } finally {
        if (!cancelled) setTeamsLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [authToken, profile]);

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
  const visibleTeams = teams.filter((team) => team.status === "ativo");
  const salesForTeam = (team: TeamRecord) => dashboard?.teams.find((row) => row.managerId === team.gerenteId);
  const totalSales = visibleTeams.reduce((total, team) => total + (salesForTeam(team)?.sales || 0), 0);
  const activeSellers = visibleTeams.reduce((total, team) => total + team._count.membros, 0);
  const openTeamForm = (team?: TeamRecord) => {
    setTeamError("");
    setTeamNotice("");
    setEditingTeam(team || null);
    setTeamForm(team
      ? { nome: team.nome, gerenteId: String(team.gerenteId), lojaId: String(team.lojaId), memberIds: team.membros.map((member) => member.id) }
      : profile === "MANAGER"
        ? { nome: "", gerenteId: String(userId), lojaId: "", memberIds: memberOptions.filter((member) => member.gerenteId === userId && !member.equipeId && member.status === "ativo").map((member) => member.id) }
        : { nome: "", gerenteId: "", lojaId: "", memberIds: [] });
    setShowTeamForm(true);
  };
  const [newSeller, setNewSeller] = useState({ nome: "", email: "", telefone: "" });
  const [sellerSaving, setSellerSaving] = useState(false);
  const registerSeller = async () => {
    setSellerSaving(true); setTeamError("");
    try {
      const response = await fetch(`${API_BASE_URL}/teams/sellers`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify(newSeller) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "Não foi possível cadastrar o vendedor.");
      const created = payload.data;
      setMemberOptions((current) => [...current, { ...(created as ManagedUser), perfil: "SELLER", status: "ativo", gerenteId: userId, equipeId: created.equipeId ?? null, equipeNome: created.equipeId ? "sua equipe" : null }]);
      setTeamForm((current) => ({ ...current, memberIds: [...current.memberIds, created.id] }));
      setNewSeller({ nome: "", email: "", telefone: "" });
      setTeamNotice(payload.message || "Vendedor cadastrado.");
    } catch (sellerError) { setTeamError(sellerError instanceof Error ? sellerError.message : "Falha ao cadastrar vendedor."); }
    finally { setSellerSaving(false); }
  };
  const saveTeam = async (event: FormEvent) => {
    event.preventDefault();
    setTeamSaving(true);
    setTeamError("");
    setTeamNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/teams${editingTeam ? `/${editingTeam.id}` : ""}`, {
        method: editingTeam ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ nome: teamForm.nome, gerenteId: Number(teamForm.gerenteId), ...(profile === "ADMIN" ? { lojaId: Number(teamForm.lojaId) } : {}), memberIds: teamForm.memberIds }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "Não foi possível salvar a equipe.");
      setTeams((current) => editingTeam
        ? current.map((team) => team.id === editingTeam.id ? payload.data : team)
        : [...current, payload.data].sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR")));
      setShowTeamForm(false);
      setTeamNotice(payload.message || "Equipe salva.");
    } catch (saveError) {
      setTeamError(saveError instanceof Error ? saveError.message : "Falha ao salvar equipe.");
    } finally {
      setTeamSaving(false);
    }
  };
  const deactivateTeam = async (team: TeamRecord) => {
    if (!window.confirm(`Desativar a equipe “${team.nome}”? A operação só é permitida quando não houver membros vinculados.`)) return;
    setTeamError("");
    setTeamNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${team.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${authToken}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "Não foi possível desativar a equipe.");
      setTeams((current) => current.filter((item) => item.id !== team.id));
      setTeamNotice(payload.message || "Equipe desativada.");
    } catch (deleteError) {
      setTeamError(deleteError instanceof Error ? deleteError.message : "Falha ao desativar equipe.");
    }
  };
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>GESTÃO DE EQUIPES</p><h1>Equipes e comissões</h1><span>Organize a estrutura comercial e configure regras de remuneração.</span></div><div className="heading-actions"><DateRangePicker value={dateRange} onChange={setDateRange}/>{profile !== "SUPPORT" && <button className="primary-button" onClick={() => openTeamForm()} disabled={profile === "MANAGER" && teams.some((team) => team.gerenteId === userId && team.status === "ativo")}><Icon name="plus" size={18}/>Nova equipe</button>}</div></section>
      {teamNotice && <div className="auth-notice success" role="status">{teamNotice}</div>}
      {teamError && !showTeamForm && <div className="auth-notice" role="alert">{teamError}</div>}
      <div className="commissions-layout">
        <section className="panel teams-list">
          <div className="panel-header"><div><h3>Equipes de vendas</h3><p>{teamsLoading ? "Carregando equipes..." : `${visibleTeams.length} equipes ativas · ${activeSellers} membros`}</p></div></div>
          {teamsLoading ? <p className="empty-state">Carregando equipes...</p> : visibleTeams.length ? visibleTeams.map((team, index) => {
            const results = salesForTeam(team);
            return <div className="team-card" key={team.id}><div className={`team-icon team-${(index % 3) + 1}`}><Icon name="users" size={19}/></div><div><strong>{team.nome}</strong><span>Gerente: {team.gerente.nome} · {team._count.membros} membros</span></div><div><strong>{formatCurrency(results?.sales || 0)}</strong><span>{dashboardLoading ? "Atualizando..." : `${results?.contracts || 0} contratos no período`}</span></div>{profile !== "SUPPORT" && (profile === "ADMIN" || team.gerenteId === userId) && <div className="team-actions"><button className="edit-link" onClick={() => openTeamForm(team)}>Editar</button>{profile === "ADMIN" && <button className="staff-action deactivate" onClick={() => void deactivateTeam(team)}>Desativar</button>}</div>}</div>;
          }) : <p className="empty-state">{teamError || "Nenhuma equipe cadastrada."}</p>}
        </section>
        <section className="panel commission-config">
          <div className="panel-header"><div><h3>Regras de comissão</h3><p>Percentuais sobre contratos efetivados</p></div></div>
          <div className="commission-body">
            <label>Comissão do vendedor<div className="percent-input"><input type="number" step=".1" value={sellerRate} onChange={(e) => setSellerRate(e.target.value)}/><span>%</span></div><small>Aplicada sobre o valor total vendido pelo vendedor.</small></label>
            <label>Comissão do gerente<div className="percent-input"><input type="number" step=".1" value={managerRate} onChange={(e) => setManagerRate(e.target.value)}/><span>%</span></div><small>Aplicada sobre as vendas de toda a equipe gerenciada.</small></label>
            {commissionError && <div className="auth-notice">{commissionError}</div>}{commissionNotice && <div className="auth-notice success">{commissionNotice}</div>}
            <div className="commission-preview"><span>Simulação · Resultado no período</span><div><p>Volume vendido<strong>{formatCurrency(totalSales)}</strong></p><p>Vendedores<strong>{formatCurrency(totalSales * Number(sellerRate) / 100)}</strong></p><p>Gerência<strong>{formatCurrency(totalSales * Number(managerRate) / 100)}</strong></p></div></div>
            <button className="auth-submit" disabled={savingRules || profile !== "ADMIN"} onClick={() => void saveCommissionRules()}>{savingRules ? "Salvando..." : profile === "ADMIN" ? "Salvar regras de comissão" : "Somente administrador pode alterar"}</button>
          </div>
        </section>
      </div>
      {showTeamForm && <div className="page-form-layer"><form onSubmit={(event) => void saveTeam(event)} className="modal-card wide-modal user-modal page-form-card">
        <button type="button" className="page-back" onClick={() => setShowTeamForm(false)}><Icon name="arrow" size={16}/>Voltar para equipes</button>
        <div className="modal-title"><div><span>{editingTeam ? "EDITAR EQUIPE" : "NOVA EQUIPE"}</span><h2>{editingTeam ? editingTeam.nome : "Cadastrar equipe"}</h2><p>Selecione os vendedores que farão parte da equipe. As transferências atualizam o gerente responsável.</p></div></div>
        <div className="modal-row"><label>Nome da equipe<input required maxLength={120} value={teamForm.nome} onChange={(event) => setTeamForm((current) => ({ ...current, nome: event.target.value }))} placeholder="Ex.: Equipe Centro"/></label>
          {profile === "ADMIN" ? <label>Gerente responsável<select required value={teamForm.gerenteId} onChange={(event) => { const selected = managers.find((manager) => manager.id === Number(event.target.value)); setTeamForm((current) => ({ ...current, gerenteId: event.target.value, lojaId: selected ? String(selected.lojaId) : "", memberIds: memberOptions.filter((member) => member.gerenteId === selected?.id && member.status === "ativo").map((member) => member.id) })); }}><option value="">Selecione um gerente ativo</option>{managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.nome} · {manager.lojaNome || `Loja ${manager.lojaId}`}</option>)}</select></label> : <label>Gerente responsável<input readOnly value={userName}/></label>}
        </div>
        <fieldset className="team-member-options"><legend>Vendedores da equipe</legend><small>Marque vendedores sem equipe para associar. Desmarque um membro atual para encerrar o vínculo; o período ficará registrado no histórico.</small>{memberOptions.filter((member) => (member.status === "ativo" || editingTeam?.membros.some((current) => current.id === member.id)) && (profile === "MANAGER" || member.lojaId === Number(teamForm.lojaId))).map((member) => { const belongsToOtherTeam = Boolean(member.equipeId && member.equipeId !== editingTeam?.id); return <label key={member.id}><input type="checkbox" disabled={profile === "MANAGER" && belongsToOtherTeam} checked={teamForm.memberIds.includes(member.id)} onChange={(event) => setTeamForm((current) => ({ ...current, memberIds: event.target.checked ? [...current.memberIds, member.id] : current.memberIds.filter((id) => id !== member.id) }))}/><span>{member.nome} · {member.email}{belongsToOtherTeam ? <em className="member-other-team"> — atualmente na equipe {member.equipeNome}{member.equipeGerenteNome ? ` (${member.equipeGerenteNome})` : ""}; solicite a desassociação antes de vincular a outra equipe</em> : !member.equipeId && teamForm.memberIds.includes(member.id) ? <em> — será associado a esta equipe</em> : null}</span></label>; })}{!memberOptions.some((member) => profile === "MANAGER" || member.lojaId === Number(teamForm.lojaId)) && <small>Não há vendedores ativos disponíveis para esta equipe.</small>}</fieldset>
        {editingTeam && <fieldset className="team-member-options"><legend>Histórico de vendedores</legend>{editingTeam.historicoMembros.length ? <div className="table-wrap"><table><thead><tr><th>VENDEDOR</th><th>INÍCIO</th><th>FIM</th><th>ASSOCIADO POR</th><th>ENCERRADO POR</th></tr></thead><tbody>{editingTeam.historicoMembros.map((link) => <tr key={link.id}><td>{link.vendedor.nome}</td><td>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(link.iniciadoEm))}</td><td>{link.encerradoEm ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(link.encerradoEm)) : "Vínculo atual"}</td><td>{link.atribuidoPor?.nome || "Registro inicial"}</td><td>{link.removidoPor?.nome || "—"}</td></tr>)}</tbody></table></div> : <small>Nenhum vínculo registrado ainda.</small>}</fieldset>}
        {profile === "MANAGER" && <fieldset className="team-member-options"><legend>Cadastrar novo vendedor</legend>
          <div className="modal-row"><label>Nome<input maxLength={191} value={newSeller.nome} onChange={(event) => setNewSeller((current) => ({ ...current, nome: event.target.value }))}/></label><label>E-mail<input type="email" maxLength={191} value={newSeller.email} onChange={(event) => setNewSeller((current) => ({ ...current, email: event.target.value }))}/></label><label>Telefone<input maxLength={30} value={newSeller.telefone} onChange={(event) => setNewSeller((current) => ({ ...current, telefone: event.target.value }))}/></label></div>
          <button type="button" className="secondary-action" disabled={sellerSaving || !newSeller.nome.trim() || !newSeller.email.trim()} onClick={() => void registerSeller()}>{sellerSaving ? "Cadastrando..." : "Cadastrar vendedor e incluir na equipe"}</button>
          <small>O vendedor recebe o acesso por e-mail e fica vinculado ao seu time.</small>
        </fieldset>}
        {teamError && <div className="auth-notice" role="alert">{teamError}</div>}
        <div className="modal-actions"><button type="button" onClick={() => setShowTeamForm(false)}>Cancelar</button><button className="primary-button" disabled={teamSaving || (profile === "ADMIN" && managers.length === 0)}>{teamSaving ? "Salvando..." : editingTeam ? "Salvar alterações" : "Cadastrar equipe"}</button></div>
      </form></div>}
    </div>
  );
}

type CommissionSummary = { items: { colaborador: string; perfil: string; contratos: number; baseCalculo: number; comissao: number }[]; summary: { totalComissoes: number; colaboradores: number; volumeVendido: number; contratos: number } };
function CreditRecoveryPage({ authToken, profile, userName }: { authToken: string; profile: string; userName: string }) {
  const [tab, setTab] = useState<"fichas" | "oportunidades">("fichas");
  const [fichaOpen, setFichaOpen] = useState(false);
  type RecoveryRow = { id: number; cliente: { id: number; nome: string; telefone?: string }; proposta?: { id: number; veiculo?: { marca: string; modelo: string } } | null; responsavel?: { nome: string } | null; tipo: string; status: string; motivo?: string; proximoContatoEm?: string; observacoes?: string };
  type CustomerOption = { id: number; nome: string };
  const [rows, setRows] = useState<RecoveryRow[]>([]); const [customers, setCustomers] = useState<CustomerOption[]>([]); const [customerId, setCustomerId] = useState(""); const [tipo, setTipo] = useState("REANALISE_CREDITO"); const [nextDate, setNextDate] = useState(""); const [notes, setNotes] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const opRes = await fetch(`${API_BASE_URL}/credit-recovery`, { headers: { Authorization: `Bearer ${authToken}` } }); const opPayload = await opRes.json(); if (!opRes.ok) throw new Error(opPayload.message || "Não foi possível carregar as oportunidades."); setRows(opPayload.data || []); if (profile !== "SUPPORT") { const clientRes = await fetch(`${API_BASE_URL}/clientes`, { headers: { Authorization: `Bearer ${authToken}` } }); const clientPayload = await clientRes.json(); if (!clientRes.ok) throw new Error(clientPayload.message || "Não foi possível carregar os clientes da carteira."); setCustomers(clientPayload.data || []); } } catch (e) { setError(e instanceof Error ? e.message : "Falha ao carregar oportunidades."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [authToken, profile]);
  const create = async (event: FormEvent) => { event.preventDefault(); setError(""); setNotice(""); try { const response = await fetch(`${API_BASE_URL}/credit-recovery`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ clienteId: Number(customerId), tipo, proximoContatoEm: nextDate || null, observacoes: notes }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Não foi possível registrar a oportunidade."); setNotice("Oportunidade registrada."); setCustomerId(""); setNotes(""); setNextDate(""); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao salvar."); } };
  const changeStatus = async (id: number, status: string) => { try { const response = await fetch(`${API_BASE_URL}/credit-recovery/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ status }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Não foi possível atualizar o atendimento."); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao atualizar."); } };
  const closeConsultancy = async (proposalId: number) => { const rawValue = window.prompt("Valor da consultoria (ex.: 1250,00)"); if (rawValue === null) return; const valorConsultoria = Number(rawValue.trim().replace(",", ".")); if (!Number.isFinite(valorConsultoria) || valorConsultoria <= 0) { setError("Informe um valor válido para a consultoria."); return; } try { const response = await fetch(`${API_BASE_URL}/deals/${proposalId}/credit-consultancy`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ valorConsultoria }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Não foi possível efetivar a consultoria."); setNotice("Contrato de consultoria efetivado e comissões registradas."); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Falha ao efetivar consultoria."); } };
  const labelFor = (value: string) => ({ REANALISE_CREDITO: "Reanálise de crédito", TROCA_VEICULO: "Alternativa de veículo", AUMENTO_ENTRADA: "Revisão de entrada", CONSORCIO: "Consórcio", OUTRO: "Outra alternativa", ABERTA: "Aberta", EM_CONTATO: "Em contato", EM_NEGOCIACAO: "Em negociação", CONVERTIDA: "Convertida", SEM_INTERESSE: "Sem interesse" } as Record<string, string>)[value] || value;
  return <div className="content module-content">{!fichaOpen && <><section className="module-heading"><div><p>PÓS-ANÁLISE DE CRÉDITO</p><h1>Recuperação de crédito</h1><span>Fichas dos clientes com crédito recusado e oportunidades comerciais.</span></div>{tab === "oportunidades" && <button className="secondary-button" onClick={() => void load()}>Atualizar</button>}</section><div className="ficha-tabs"><button className={tab === "fichas" ? "active" : ""} onClick={() => setTab("fichas")}>Fichas de recuperação</button><button className={tab === "oportunidades" ? "active" : ""} onClick={() => setTab("oportunidades")}>Oportunidades e consultoria</button></div></>}{tab === "fichas" ? <CreditRecoveryFichas authToken={authToken} profile={profile} userName={userName} onOpenChange={setFichaOpen}/> : <>{error && <div className="auth-notice">{error}</div>}{notice && <div className="auth-notice">{notice}</div>}{profile !== "SUPPORT" && <form className="panel form-panel" onSubmit={(event) => void create(event)}><div className="step-title"><span>+</span><div><h3>Nova oportunidade</h3><p>Registre um retorno de crédito ou uma venda cruzada para sua carteira.</p></div></div><div className="customer-form-grid"><label>Cliente<select required value={customerId} onChange={(event) => setCustomerId(event.target.value)}><option value="">Selecione</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label><label>Alternativa<select value={tipo} onChange={(event) => setTipo(event.target.value)}><option value="REANALISE_CREDITO">Reanálise de crédito</option><option value="TROCA_VEICULO">Alternativa de veículo</option><option value="AUMENTO_ENTRADA">Revisão de entrada</option><option value="CONSORCIO">Consórcio</option><option value="OUTRO">Outra alternativa</option></select></label><label>Próximo contato<input type="date" value={nextDate} onChange={(event) => setNextDate(event.target.value)}/></label><label>Observações<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contexto e próximo passo"/></label></div><button className="auth-submit" type="submit" disabled={!customerId}>Registrar oportunidade</button></form>}<section className="panel module-table"><div className="table-wrap"><table><thead><tr><th>CLIENTE</th><th>ORIGEM / ALTERNATIVA</th><th>RESPONSÁVEL</th><th>PRÓXIMO CONTATO</th><th>STATUS</th><th>ACOMPANHAMENTO</th></tr></thead><tbody>{loading ? <tr><td colSpan={6}>Carregando oportunidades...</td></tr> : rows.length ? rows.map((row) => <tr key={row.id}><td><strong>{row.cliente.nome}</strong><br/><small>{row.cliente.telefone || "Sem telefone"}</small></td><td>{row.proposta ? `Proposta #${row.proposta.id} · ${row.proposta.veiculo?.marca || ""} ${row.proposta.veiculo?.modelo || ""}` : "Cadastro manual"}<br/><small>{labelFor(row.tipo)}</small></td><td>{row.responsavel?.nome || "Equipe de suporte"}</td><td>{row.proximoContatoEm ? new Date(row.proximoContatoEm).toLocaleDateString("pt-BR") : "Não agendado"}</td><td><span className="status blue">{labelFor(row.status)}</span></td><td>{row.status === "ABERTA" ? <button className="submit-bank" onClick={() => void changeStatus(row.id, "EM_CONTATO")}>Iniciar contato</button> : row.status === "EM_CONTATO" ? <button className="submit-bank" onClick={() => void changeStatus(row.id, "EM_NEGOCIACAO")}>Em negociação</button> : row.status === "EM_NEGOCIACAO" ? <>{row.proposta && <button className="submit-bank done" onClick={() => void closeConsultancy(row.proposta!.id)}>Efetivar consultoria</button>} <button className="submit-bank" onClick={() => void changeStatus(row.id, "SEM_INTERESSE")}>Encerrar</button></> : "—"}</td></tr>) : <tr><td colSpan={6}>Nenhuma oportunidade registrada.</td></tr>}</tbody></table></div></section></>}</div>;
}

function ReportsPage({ profile, userName, authToken }: { profile: string; userName: string; authToken: string }) {
  const { dateRange, setDateRange } = useDateRangeContext();
  const [report, setReport] = useState<CommissionSummary | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [reportError, setReportError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  useEffect(() => {
    if (!isDateRangeValid(dateRange)) {
      setReport(null);
      setLoadingReport(false);
      setReportError("");
      return;
    }
    let cancelled = false;
    const query = new URLSearchParams({ startDate: toApiDate(dateRange.startDate), endDate: toApiDate(dateRange.endDate) });
    setLoadingReport(true);
    setReportError("");
    fetch(`${API_BASE_URL}/reports/commissions?${query}`, { headers: { Authorization: `Bearer ${authToken}` } }).then(async (response) => {
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Não foi possível carregar o relatório.");
      if (!cancelled) setReport(payload.data);
    }).catch((requestError) => { if (!cancelled) { setReport(null); setReportError(requestError instanceof Error ? requestError.message : "Falha ao carregar o relatório."); } })
      .finally(() => { if (!cancelled) setLoadingReport(false); });
    return () => { cancelled = true; };
  }, [authToken, dateRange.startDate, dateRange.endDate]);
  const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  const exportPdf = async () => {
    if (!isDateRangeValid(dateRange)) {
      setExportError("Informe um intervalo válido de até um ano antes de exportar.");
      return;
    }
    setExporting(true); setExportError("");
    try { await downloadCommissionReport(dateRange, authToken); }
    catch (error) { setExportError(error instanceof Error ? error.message : "Falha ao gerar o PDF."); }
    finally { setExporting(false); }
  };
  return <div className="content module-content report-page">
    <section className="module-heading"><div><p>FINANCEIRO</p><h1>Relatório de comissões</h1><span>Pagamentos sobre contratos efetivados no escopo de {userName}.</span></div><div className="heading-actions"><DateRangePicker value={dateRange} onChange={setDateRange}/><button className="primary-button" onClick={() => void exportPdf()} disabled={exporting || !isDateRangeValid(dateRange)}><Icon name="file" size={17}/>{exporting ? "Gerando no servidor..." : "Exportar PDF"}</button></div></section>
    {(reportError || exportError) && <div className="export-error">{reportError || exportError}</div>}
    <section className="report-hero"><div><span>Total de comissões</span><strong>{loadingReport ? "Carregando..." : money(report?.summary.totalComissoes || 0)}</strong><small>{report?.summary.colaboradores || 0} colaboradores com lançamentos</small></div><div><p>Volume vendido<strong>{money(report?.summary.volumeVendido || 0)}</strong></p><p>Contratos<strong>{report?.summary.contratos || 0}</strong></p><p>Ticket médio<strong>{money(report?.summary.contratos ? (report.summary.volumeVendido / report.summary.contratos) : 0)}</strong></p></div></section>
    <section className="panel module-table"><div className="panel-header"><div><h3>Detalhamento por colaborador</h3><p>Valores apurados no ledger de comissões do MySQL.</p></div></div><div className="table-wrap"><table><thead><tr><th>COLABORADOR</th><th>PERFIL</th><th>CONTRATOS</th><th>BASE DE CÁLCULO</th><th>COMISSÃO A PAGAR</th></tr></thead><tbody>{loadingReport ? <tr><td colSpan={5}>Carregando registros...</td></tr> : report?.items.length ? report.items.map((row) => <tr key={`${row.colaborador}-${row.perfil}`}><td><strong>{row.colaborador}</strong></td><td>{row.perfil}</td><td>{row.contratos}</td><td>{money(row.baseCalculo)}</td><td><strong className="payout-value">{money(row.comissao)}</strong></td></tr>) : <tr><td colSpan={5}>Nenhuma comissão registrada neste período.</td></tr>}</tbody></table></div></section>
    <p className="report-footnote">Relatório gerado por {clientCompany} · Período de {formatDateRange(dateRange)}</p>
  </div>;
}

function ManagerDashboard() {
  const { dateRange, setDateRange } = useDateRangeContext();
  const { dashboard, loading, error } = useDashboardContext();
  const production = dashboard?.sellers || [];
  const summary = dashboard?.summary;
  const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value || 0);
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>GESTÃO DA EQUIPE</p><h1>Visão da gerência</h1><span>Acompanhe a produção dos seus vendedores e a evolução das metas.</span></div><DateRangePicker value={dateRange} onChange={setDateRange}/></section>
      {error && <div className="auth-notice">{error}</div>}
      <section className="stats-grid manager-stats">
        <article className="stat-card"><div className="stat-icon blue"><Icon name="proposal"/></div><div className="stat-title"><span>Simulações da equipe</span><strong>{loading ? "Atualizando" : "No período"}</strong></div><h2>{summary?.simulations ?? "—"}</h2><p>Registros criados no intervalo selecionado</p></article>
        <article className="stat-card"><div className="stat-icon purple"><Icon name="file"/></div><div className="stat-title"><span>Propostas em andamento</span><strong>{loading ? "Atualizando" : "No período"}</strong></div><h2>{summary?.proposals ?? "—"}</h2><p>Em análise ou aguardando decisão</p></article>
        <article className="stat-card"><div className="stat-icon green"><Icon name="check"/></div><div className="stat-title"><span>Contratos efetivados</span><strong>{loading ? "Atualizando" : "No período"}</strong></div><h2>{summary?.contracts ?? "—"}</h2><p>{summary ? money(summary.salesVolume) : "—"} em vendas</p></article>
        <article className="stat-card commission-stat"><div className="stat-icon orange"><Icon name="percent"/></div><div className="stat-title"><span>Comissões registradas</span><strong>{loading ? "Atualizando" : "No período"}</strong></div><h2>{summary ? money(summary.commissionAmount) : "—"}</h2><p>Comissões associadas à equipe</p></article>
      </section>
      <div className="manager-grid">
        <section className="panel production-panel">
          <div className="panel-header"><div><h3>Produção por vendedor</h3><p>Resultados individuais no período selecionado</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>VENDEDOR</th><th>SIMULAÇÕES</th><th>PROPOSTAS EM ANDAMENTO</th><th>CONTRATOS</th><th>VOLUME</th></tr></thead><tbody>{loading ? <tr><td colSpan={5}>Carregando resultados...</td></tr> : production.length ? production.map((seller) => <tr key={seller.name}><td><div className="seller-cell"><div className="mini-avatar blue">{seller.name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase()}</div><strong>{seller.name}</strong></div></td><td>{seller.simulations}</td><td>{seller.proposals}</td><td><strong>{seller.contracts}</strong></td><td><strong>{money(seller.sales)}</strong></td></tr>) : <tr><td colSpan={5}>Sem produção registrada neste período.</td></tr>}</tbody></table></div>
        </section>
        <aside className="panel manager-goal">
          <div className="panel-header"><div><h3>Resumo do período</h3><p>Produção real da equipe</p></div></div>
          <div className="goal-values"><span><em>Vendedores com atividade</em><strong>{production.length}</strong></span><span><em>Vendas efetivadas</em><strong>{summary?.contracts ?? "—"}</strong></span><span><em>Propostas recusadas</em><strong>{summary?.rejectedProposals ?? "—"}</strong></span><span><em>Volume vendido</em><strong>{summary ? money(summary.salesVolume) : "—"}</strong></span></div>
        </aside>
      </div>
    </div>
  );
}

type TeamSeller = { id: number; nome: string; email: string; status: string; createdAt: string; usuario?: { id: number; status: string; gerenteId: number | null } | null };

function MyTeamPage({ authToken }: { authToken: string }) {
  const { dateRange, setDateRange } = useDateRangeContext();
  const { dashboard, loading: dashboardLoading } = useDashboardContext();
  const [sellers, setSellers] = useState<TeamSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savingSeller, setSavingSeller] = useState(false);
  const [newSeller, setNewSeller] = useState({ nome: "", email: "", telefone: "" });
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`${API_BASE_URL}/vendedores`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Não foi possível carregar a equipe.");
        if (!cancelled) setSellers(payload.data || []);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Falha ao carregar a equipe.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authToken]);

  const toggleSeller = async (seller: TeamSeller) => {
    setError("");
    setNotice("");
    try {
      const active = seller.status === "ativo" && seller.usuario?.status !== "inativo";
      const status = active ? "inativo" : "ativo";
      const response = await fetch(`${API_BASE_URL}/vendedores/${seller.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Não foi possível atualizar o vendedor.");
      setSellers((current) => current.map((item) => item.id === seller.id ? { ...item, status, usuario: item.usuario ? { ...item.usuario, status } : null } : item));
      setConfirmIndex(null);
      setNotice(status === "inativo" ? "Acesso do vendedor desativado." : "Acesso do vendedor reativado.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Falha ao atualizar o vendedor.");
    }
  };
  const createSeller = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingSeller(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vendedores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(newSeller),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Não foi possível cadastrar o vendedor.");
      setSellers((current) => [...current, payload.data].sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR")));
      setNewSeller({ nome: "", email: "", telefone: "" });
      setShowCreateForm(false);
      setNotice(payload.message || "Vendedor cadastrado e instruções de acesso enviadas.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Falha ao cadastrar vendedor.");
    } finally {
      setSavingSeller(false);
    }
  };
  const visibleSellers = sellers.filter((seller) => {
    const matchesSearch = `${seller.nome} ${seller.email}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"));
    const active = seller.status === "ativo" && seller.usuario?.status !== "inativo";
    const matchesStatus = statusFilter === "todos" || (active ? "ativo" : "inativo") === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const activeSellers = sellers.filter((seller) => seller.status === "ativo" && seller.usuario?.status !== "inativo").length;
  return (
    <div className="content module-content">
      <section className="module-heading"><div><p>GESTÃO DA EQUIPE</p><h1>Minha equipe</h1><span>Gerencie os vendedores sob sua responsabilidade sem perder o histórico.</span></div><div className="heading-actions"><DateRangePicker value={dateRange} onChange={setDateRange}/><button className="primary-button" onClick={() => { setError(""); setShowCreateForm(true); }}><Icon name="plus" size={18}/>Adicionar vendedor</button></div></section>
      <section className="module-summary"><div><span>Vendedores ativos</span><strong>{loading ? "…" : activeSellers}</strong></div><div><span>Contratos no período</span><strong>{dashboardLoading ? "…" : dashboard?.summary.contracts ?? "—"}</strong></div><div><span>Produção da equipe</span><strong>{dashboardLoading ? "Atualizando..." : dashboard ? formatCurrency(dashboard.summary.salesVolume) : "—"}</strong></div></section>
      <div className="audit-notice"><div><Icon name="settings" size={18}/></div><p><strong>Histórico preservado</strong><span>Vendedores desligados não são excluídos. O acesso é revogado, mas propostas, contratos e registros permanecem disponíveis para auditoria.</span></p></div>
      {notice && <div className="auth-notice success" role="status">{notice}</div>}
      {error && !showCreateForm && <div className="auth-notice" role="alert">{error}</div>}
      <section className="panel module-table">
        <div className="module-toolbar"><div className="search-box"><Icon name="search" size={17}/><input aria-label="Buscar vendedor" placeholder="Buscar vendedor..." value={search} onChange={(event) => setSearch(event.target.value)}/></div><select aria-label="Filtrar por status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="todos">Todos os status</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option></select></div>
        <div className="table-wrap"><table><thead><tr><th>VENDEDOR</th><th>E-MAIL</th><th>NA EQUIPE DESDE</th><th>VENDAS NO PERÍODO</th><th>ACESSO</th><th>AÇÃO</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={6}>Carregando vendedores...</td></tr> : visibleSellers.length ? visibleSellers.map((seller, index) => {
            const sales = dashboard?.sellers.find((row) => row.id === seller.id)?.sales ?? 0;
            const initials = seller.nome.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("pt-BR");
            const active = seller.status === "ativo" && seller.usuario?.status !== "inativo";
            return <tr key={seller.id} className={!active ? "inactive-row" : ""}><td><div className="seller-cell"><div className={`mini-avatar ${active ? "blue" : ""}`}>{initials}</div><strong>{seller.nome}</strong></div></td><td>{seller.email}</td><td>{new Date(seller.createdAt).toLocaleDateString("pt-BR")}</td><td><strong>{dashboardLoading ? "…" : formatCurrency(sales)}</strong></td><td><span className={`status ${active ? "green" : "red"}`}>{active ? "Ativo" : "Inativo"}</span></td><td><button className={`staff-action ${active ? "deactivate" : "activate"}`} onClick={() => active ? setConfirmIndex(index) : void toggleSeller(seller)}>{active ? "Desativar" : "Reativar acesso"}</button></td></tr>;
          }) : <tr><td colSpan={6}>{error ? "Não foi possível carregar os vendedores." : "Nenhum vendedor encontrado."}</td></tr>}</tbody>
        </table></div>
      </section>
      {showCreateForm && <div className="page-form-layer"><form onSubmit={(event) => void createSeller(event)} className="modal-card wide-modal user-modal page-form-card">
        <button type="button" className="page-back" onClick={() => setShowCreateForm(false)}><Icon name="arrow" size={16}/>Voltar para minha equipe</button>
        <div className="modal-title"><div><span>NOVO VENDEDOR</span><h2>Cadastrar vendedor</h2><p>Será criada uma conta individual vinculada à sua equipe. As instruções de acesso serão enviadas ao e-mail cadastrado.</p></div></div>
        <div className="modal-row"><label>Nome completo<input required maxLength={120} autoComplete="name" value={newSeller.nome} onChange={(event) => setNewSeller((current) => ({ ...current, nome: event.target.value }))} placeholder="Nome e sobrenome"/></label><label>Telefone / WhatsApp<input type="tel" autoComplete="tel" value={newSeller.telefone} onChange={(event) => setNewSeller((current) => ({ ...current, telefone: event.target.value }))} placeholder="(00) 00000-0000"/></label></div>
        <div className="modal-row"><label>E-mail de acesso<input required type="email" maxLength={254} autoComplete="email" value={newSeller.email} onChange={(event) => setNewSeller((current) => ({ ...current, email: event.target.value }))} placeholder="vendedor@empresa.com.br"/></label></div>
        {error && <div className="auth-notice" role="alert">{error}</div>}
        <div className="modal-actions"><button type="button" onClick={() => setShowCreateForm(false)}>Cancelar</button><button className="primary-button" disabled={savingSeller}>{savingSeller ? "Cadastrando..." : "Cadastrar e enviar acesso"}</button></div>
      </form></div>}
      {confirmIndex !== null && visibleSellers[confirmIndex] && <div className="modal-layer" onMouseDown={() => setConfirmIndex(null)}><div className="modal-card confirm-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="confirm-symbol"><Icon name="users" size={24}/></div><h2>Desativar acesso?</h2><p>O acesso de <strong>{visibleSellers[confirmIndex].nome}</strong> será revogado imediatamente. Seus registros históricos serão preservados e poderão ser consultados normalmente.</p>
        <label>Motivo do desligamento<select><option>Desligamento da empresa</option><option>Transferência de equipe</option><option>Afastamento temporário</option></select></label>
        <div className="modal-actions"><button onClick={() => setConfirmIndex(null)}>Cancelar</button><button className="danger-button" onClick={() => void toggleSeller(visibleSellers[confirmIndex])}>Confirmar desativação</button></div>
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

type ProposalSettingsForm = { validadeDias: string; prazoEntrega: string; documentacaoTransferencia: string; textoPrazos: string; textoGarantia: string };
function ProposalSettingsPanel({ authToken }: { authToken: string }) {
  const [stores, setStores] = useState<{ id: number; nome: string }[]>([]);
  const [storeId, setStoreId] = useState("");
  const [form, setForm] = useState<ProposalSettingsForm | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const request = async (path: string, method = "GET", body?: unknown) => {
    const response = await fetch(`${API_BASE_URL}${path}`, { method, headers: { Authorization: `Bearer ${authToken}`, ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.message || "Não foi possível concluir a operação.");
    return payload?.data;
  };
  useEffect(() => {
    void request("/stores").then((rows) => { setStores(rows); if (rows.length) setStoreId(String(rows[0].id)); })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Falha ao carregar lojas."));
  }, [authToken]);
  useEffect(() => {
    if (!storeId) return;
    setForm(null); setNotice(""); setError("");
    void request(`/stores/${storeId}/proposal-settings`).then((data) => setForm({ ...data, validadeDias: String(data.validadeDias) }))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Falha ao carregar a configuração."));
  }, [storeId, authToken]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (!form) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const data = await request(`/stores/${storeId}/proposal-settings`, "PUT", { ...form, validadeDias: Number(form.validadeDias) });
      setForm({ ...data, validadeDias: String(data.validadeDias) });
      setNotice("Configurações salvas. As próximas propostas em PDF já usarão estes textos.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Falha ao salvar."); }
    finally { setSaving(false); }
  };
  const update = (field: keyof ProposalSettingsForm, value: string) => { setNotice(""); setForm((current) => current ? { ...current, [field]: value } : current); };
  return <form onSubmit={save} className="panel email-settings-form" style={{ padding: 24, marginTop: 20 }}>
    <div className="panel-header"><div><h3>Proposta comercial (PDF)</h3><p>Prazos, logística, garantia e validade exibidos na proposta de cada loja.</p></div></div>
    {notice && <div className="auth-notice success">{notice}</div>}
    {error && <div className="auth-notice">{error}</div>}
    <div className="modal-row">
      <label>Loja<select value={storeId} onChange={(event) => setStoreId(event.target.value)}>{stores.map((store) => <option key={store.id} value={store.id}>{store.nome}</option>)}</select></label>
      <label>Validade da proposta (dias)<input required type="number" min="1" max="365" value={form?.validadeDias ?? ""} onChange={(event) => update("validadeDias", event.target.value)} disabled={!form}/></label>
    </div>
    {form ? <>
      <div className="modal-row">
        <label>Entrega do veículo<input required maxLength={255} value={form.prazoEntrega} onChange={(event) => update("prazoEntrega", event.target.value)}/></label>
        <label>Documentação e transferência<input required maxLength={255} value={form.documentacaoTransferencia} onChange={(event) => update("documentacaoTransferencia", event.target.value)}/></label>
      </div>
      <label>Texto de prazos e logística<textarea required rows={3} maxLength={2000} value={form.textoPrazos} onChange={(event) => update("textoPrazos", event.target.value)}/></label>
      <label style={{ marginTop: 12 }}>Texto de garantia e pós-venda<textarea required rows={4} maxLength={2000} value={form.textoGarantia} onChange={(event) => update("textoGarantia", event.target.value)}/></label>
      <div className="modal-actions"><button type="submit" className="primary-button" disabled={saving}>{saving ? "Salvando..." : "Salvar proposta"}</button></div>
    </> : !error && <p className="table-subcopy">Carregando configuração...</p>}
  </form>;
}

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
    <section className="module-heading"><div><p>ADMINISTRAÇÃO</p><h1>Configurações</h1><span>E-mail (SMTP) e textos padrão da proposta comercial.</span></div></section>
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
    <ProposalSettingsPanel authToken={authToken}/>
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
  const [simulationVehicleId, setSimulationVehicleId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => getCurrentWeekRange());
  const [serverPermissions, setServerPermissions] = useState<{ role: string; allowedModules: string[] } | null>(null);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const profile = normalizeRole(sessionUser?.perfil);
  const dashboardState = useDashboardSummary(authToken, dateRange, ["ADMIN", "MANAGER", "SUPPORT"].includes(profile));
  const allowedModules = new Set(serverPermissions?.role === profile ? serverPermissions.allowedModules : roleModules[profile] || roleModules.SELLER);
  const visibleNavGroups = navGroups.map((group) => ({
    ...group, items: group.items.filter((item) => allowedModules.has(item.label)),
  })).filter((group) => group.items.length > 0);
  const defaultModule = profile === "SUPPORT" ? "Painel de suporte" : profile === "MANAGER" ? "Painel do gerente" : profile === "ADMIN" ? "Dashboard" : "Simulações";
  const visibleActive = allowedModules.has(active) ? active : defaultModule;

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']") ?? document.createElement("link");
    favicon.setAttribute("rel", "icon");
    favicon.setAttribute("type", "image/png");
    favicon.setAttribute("href", logoSemFundo);
    if (!favicon.parentNode) {
      document.head.appendChild(favicon);
    }
  }, []);

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

  const dashboardTimeline = dashboardState.dashboard?.timeline || [];
  const timelineMax = Math.max(1, ...dashboardTimeline.flatMap((bucket) => [bucket.simulations, bucket.proposals, bucket.contracts]));
  const passwordResetRequested = new URLSearchParams(window.location.search).has("resetToken");
  if (passwordResetRequested || !authenticated || !sessionUser) return <AuthScreen onAuthenticated={(token, user) => {
    localStorage.setItem("vfcAuthToken", token);
    localStorage.setItem("vfcAuthUser", JSON.stringify(user));
    setAuthToken(token); setSessionUser(user); setAuthenticated(true);
  }} />;

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      <DashboardContext.Provider value={dashboardState}>
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <img src={logoSemFundo} alt={clientCompany} className="brand-logo sidebar-logo" />
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

        {visibleActive === "Taxas e tabelas" ? <RatesBenefitsPage kind="rates" profile={profile} authToken={authToken}/> : visibleActive === "Benefícios" ? <RatesBenefitsPage kind="benefits" profile={profile} authToken={authToken}/> : visibleActive === "Recuperação de crédito" ? <CreditRecoveryPage authToken={authToken} profile={profile} userName={sessionUser.nome}/> : visibleActive === "Clientes" ? <CustomersPage profile={profile} userName={sessionUser.nome} authToken={authToken}/> : visibleActive === "Classificados" ? <ClassifiedsPage authToken={authToken} onSimulate={(vehicleId) => { setSimulationVehicleId(vehicleId); setActive("Simulações"); }}/> : visibleActive === "Simulações" ? <SimulationPage profile={profile} userName={sessionUser.nome} authToken={authToken} initialVehicleId={simulationVehicleId}/> : visibleActive === "Usuários e perfis" && profile === "ADMIN" ? <UsersPage authToken={authToken}/> : visibleActive === "Lojas" && profile === "ADMIN" ? <StoresPage authToken={authToken}/> : visibleActive === "Permissões de acesso" && profile === "ADMIN" ? <PermissionsPage authToken={authToken}/> : visibleActive === "Configurações" && profile === "ADMIN" ? <EmailSettingsPage authToken={authToken}/> : visibleActive === "Veículos" ? <VehiclesPage authToken={authToken} profile={profile}/> : visibleActive === "Painel do gerente" && profile === "MANAGER" ? <ManagerDashboard/> : visibleActive === "Minha equipe" && profile === "MANAGER" ? <MyTeamPage authToken={authToken}/> : visibleActive === "Painel de suporte" && profile === "SUPPORT" ? <SupportDashboard/> : visibleActive === "Propostas" && ["ADMIN", "SUPPORT"].includes(profile) ? <ProposalReviewPage authToken={authToken}/> : visibleActive === "Contratos" ? <ContractsPage profile={profile} userName={sessionUser.nome} authToken={authToken}/> : visibleActive === "Propostas" ? <SellerProposalsPage profile={profile} userName={sessionUser.nome} authToken={authToken}/> : visibleActive === "Equipes e comissões" && ["ADMIN", "MANAGER", "SUPPORT"].includes(profile) ? <TeamsCommissionsPage profile={profile} userId={sessionUser.id} userName={sessionUser.nome} authToken={authToken}/> : visibleActive === "Relatórios" && ["ADMIN", "MANAGER", "SUPPORT"].includes(profile) ? <ReportsPage profile={profile} userName={sessionUser.nome} authToken={authToken}/> : visibleActive !== "Dashboard" ? <div className="content module-content"><div className="support-note">Módulo indisponível.</div></div> : <div className="content">
          <section className="page-heading">
            <div>
              <p>{currentDateLabel}</p>
              <h1>Olá, {sessionUser.nome}. <span>Seu desempenho está em alta.</span></h1>
            </div>
            <div className="heading-actions">
              <DateRangePicker value={dateRange} onChange={setDateRange}/>
              <button className="primary-button"><Icon name="plus" size={18} /> Nova proposta</button>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon blue"><Icon name="proposal" /></div>
              <div className="stat-title"><span>Simulações</span><strong>{dashboardState.loading ? "Atualizando" : "No período"}</strong></div>
              <h2>{dashboardState.dashboard?.summary.simulations ?? "—"}</h2><p>Registros criados no intervalo selecionado</p>
              <div className="spark blue-spark"><i/><i/><i/><i/><i/><i/><i/></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon purple"><Icon name="file" /></div>
              <div className="stat-title"><span>Propostas em andamento</span><strong>{dashboardState.loading ? "Atualizando" : "No período"}</strong></div>
              <h2>{dashboardState.dashboard?.summary.proposals ?? "—"}</h2><p>Aguardando análise ou decisão</p>
              <div className="spark purple-spark"><i/><i/><i/><i/><i/><i/><i/></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon green"><Icon name="check" /></div>
              <div className="stat-title"><span>Contratos efetivados</span><strong>{dashboardState.loading ? "Atualizando" : "No período"}</strong></div>
              <h2>{dashboardState.dashboard?.summary.contracts ?? "—"}</h2><p>Vendas: {dashboardState.dashboard ? moneyValue(dashboardState.dashboard.summary.salesVolume) : "—"}</p>
              <div className="spark green-spark"><i/><i/><i/><i/><i/><i/><i/></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon red"><Icon name="close" /></div>
              <div className="stat-title"><span>Propostas recusadas</span><strong>{dashboardState.loading ? "Atualizando" : "No período"}</strong></div>
              <h2>{dashboardState.dashboard?.summary.rejectedProposals ?? "—"}</h2><p>Recusas registradas no intervalo</p>
              <div className="spark red-spark"><i/><i/><i/><i/><i/><i/><i/></div>
            </article>
          </section>
          {dashboardState.error && <div className="auth-notice">{dashboardState.error}</div>}

          <section className="dashboard-grid">
            <article className="panel performance-panel">
              <div className="panel-header">
                <div><h3>Desempenho comercial</h3><p>Simulações, propostas e contratos · {formatDateRange(dateRange)}</p></div>
                <span className="table-subcopy">6 intervalos no período</span>
              </div>
              <div className="legend">
                <span><i className="dot-blue"/>Simulações</span>
                <span><i className="dot-purple"/>Propostas</span>
                <span><i className="dot-green"/>Contratos</span>
              </div>
              <div className="chart-area">
                <div className="y-axis"><span>{timelineMax}</span><span>{Math.round(timelineMax * .75)}</span><span>{Math.round(timelineMax * .5)}</span><span>{Math.round(timelineMax * .25)}</span><span>0</span></div>
                <div className="chart">
                  <div className="gridline g1"/><div className="gridline g2"/><div className="gridline g3"/><div className="gridline g4"/>
                  <div className="dashboard-timeline">
                    {dashboardTimeline.map((bucket) => <div className="timeline-column" key={bucket.label} title={`${bucket.label}: ${bucket.simulations} simulações, ${bucket.proposals} propostas, ${bucket.contracts} contratos`}>
                      <div className="timeline-bars">
                        <i className="timeline-bar blue" style={{ height: `${bucket.simulations / timelineMax * 100}%` }}/>
                        <i className="timeline-bar purple" style={{ height: `${bucket.proposals / timelineMax * 100}%` }}/>
                        <i className="timeline-bar green" style={{ height: `${bucket.contracts / timelineMax * 100}%` }}/>
                      </div>
                      <span>{bucket.label}</span>
                    </div>)}
                    {!dashboardTimeline.length && <p className="empty-state">{dashboardState.loading ? "Carregando período..." : "Sem atividades neste período."}</p>}
                  </div>
                </div>
              </div>
            </article>

            <article className="panel activity-panel">
              <div className="panel-header"><div><h3>Atividade recente</h3><p>Atualizações da sua equipe</p></div><button className="plain-link">Ver todas <Icon name="arrow" size={14}/></button></div>
              <div className="activity-list">
                {dashboardState.dashboard?.recentProposals.map((proposal, index) => (
                  <div className="activity" key={proposal.id}>
                    <div className={`mini-avatar ${["blue", "purple", "orange", "green"][index % 4]}`}>{proposal.vendedor.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase()}</div>
                    <div><p><strong>{proposal.vendedor}</strong> criou uma proposta para {proposal.cliente}</p><a>#{String(proposal.id).padStart(4, "0")} · {proposal.veiculo}</a><span>{new Date(proposal.createdAt).toLocaleString("pt-BR")}</span></div>
                  </div>
                ))}
                {!dashboardState.loading && !dashboardState.dashboard?.recentProposals.length && <p className="empty-state">Nenhuma proposta neste período.</p>}
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
                  {(dashboardState.dashboard?.recentProposals || []).map((proposal) => (
                    <tr key={proposal.id}>
                      <td><strong>#{String(proposal.id).padStart(4, "0")}</strong></td><td>{proposal.cliente}</td><td>{proposal.veiculo}</td><td>{proposal.vendedor}</td><td><strong>{moneyValue(proposal.valor)}</strong></td>
                      <td><span className={`status ${["CONTRACT_EFFECTIVE", "APROVADA", "APPROVED"].includes(proposal.status.toUpperCase()) ? "green" : ["CREDIT_REJECTED", "REJECTED", "RECUSADA"].includes(proposal.status.toUpperCase()) ? "red" : "blue"}`}><i/>{proposal.status}</span></td>
                      <td><button className="row-more" aria-label="Mais opções"><Icon name="more" size={18}/></button></td>
                    </tr>
                  ))}
                  {!dashboardState.loading && !dashboardState.dashboard?.recentProposals.length && <tr><td colSpan={7}>Nenhuma proposta registrada neste período.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>}
      </main>
    </div>
      </DashboardContext.Provider>
    </DateRangeContext.Provider>
  );
}
