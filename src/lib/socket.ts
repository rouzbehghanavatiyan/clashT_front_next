import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8585";

export const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // اتصال دستی در صورت نیاز
  transports: ["websocket"],
  withCredentials: true,
});
