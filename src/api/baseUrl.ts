export const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

const API_ORIGIN = /^https?:\/\//.test(API_BASE_URL) ? new URL(API_BASE_URL).origin : "";

export const apiAssetUrl = (url: string) =>
  url.startsWith("/uploads/") && API_ORIGIN ? `${API_ORIGIN}${url}` : url;
