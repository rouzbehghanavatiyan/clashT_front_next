import { notifApi } from "./axios.config";

export const notifyService = {
  publicKey: () => notifApi.get("/api/notifications/public-key"),
  subscribe: (data: any) => notifApi.post("/api/notifications/subscribe", data),
  sendAll: (data: any) => notifApi.post("/api/Notifications/send-all", data),
  sendToUser: (data: any) => notifApi.post("/api/Notifications/send", data),
  addScore: (data: any) => notifApi.post("/addScoure", data),
};
