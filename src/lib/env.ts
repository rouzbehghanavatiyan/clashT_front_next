export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8585";

export const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_SOCKET ||
  "https://api.clashtalent.com";

export const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL || SOCKET_URL;

export const NOTIF_API_URL =
  process.env.NEXT_PUBLIC_NOTIF_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";
