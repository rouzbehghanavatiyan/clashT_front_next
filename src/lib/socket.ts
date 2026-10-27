import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/env";

export { SITE_URL, API_URL, SOCKET_URL } from "@/lib/env";

function createSocket(): Socket {
  return io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true,
  });
}

export const socket: Socket =
  typeof window === "undefined"
    ? ({
        on() {
          return this;
        },
        off() {
          return this;
        },
        once() {
          return this;
        },
        emit() {
          return this;
        },
        connect() {
          return this;
        },
        disconnect() {
          return this;
        },
        connected: false,
      } as unknown as Socket)
    : createSocket();
