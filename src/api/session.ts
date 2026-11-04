import { API_BASE_URL } from "./baseUrl";

export const TOKEN_KEY = "vfcAuthToken";
export const USER_KEY = "vfcAuthUser";
export const SESSION_EXPIRED_MESSAGE = "Sua sessão expirou. Faça login novamente.";

// Rotas públicas: um 401 aqui significa credencial inválida, não sessão expirada.
const publicAuthPaths = ["/auth/login", "/auth/forgot-password", "/auth/reset-password", "/auth/first-access-change", "/auth/initial-admin"];

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Milissegundos até o token expirar (negativo se já expirou); null se não for um JWT legível.
export const msUntilTokenExpires = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 - Date.now() : null;
  } catch {
    return null;
  }
};

const bearerToken = (init: RequestInit | undefined, input: RequestInfo | URL) => {
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  const value = headers.get("Authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
};

const requestPath = (input: RequestInfo | URL) => {
  const url = input instanceof Request ? input.url : String(input);
  const base = /^https?:\/\//.test(API_BASE_URL) ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
  const absolute = new URL(url, window.location.origin).href;
  return absolute.startsWith(base) ? absolute.slice(base.length).split("?")[0] : null;
};

let installed = false;

// Intercepta qualquer chamada autenticada à API que volte 401 e dispara onExpire uma única vez por sessão.
export const installSessionGuard = (onExpire: () => void) => {
  if (installed) return;
  installed = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    if (response.status !== 401) return response;
    const path = requestPath(input);
    const sentToken = bearerToken(init, input);
    if (path === null || !sentToken || publicAuthPaths.some((publicPath) => path.startsWith(publicPath))) return response;
    // Ignora respostas atrasadas de uma sessão anterior (o usuário já entrou de novo).
    if (localStorage.getItem(TOKEN_KEY) === sentToken) onExpire();
    return response;
  };
};
