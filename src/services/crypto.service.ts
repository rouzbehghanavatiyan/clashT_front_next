import { api } from "./axios.config";

export type TicketPackage = {
  id: string;
  count: number;
  priceUsd: string;
};

export type CryptoNetwork = "bsc" | "tron";

export type CryptoOrder = {
  orderId: string;
  amount: string;
  packageId: string;
  ticketCount: number;
  priceUsd: string;
  network: CryptoNetwork | string;
  wallet: string;
  expiresAt: string;
};

export const cryptoService = {
  packages: () => api.get("/cryptoPackages"),
  tickets: () => api.get("/cryptoTickets"),
  createOrder: (packageId: string, network: CryptoNetwork) =>
    api.post("/cryptoOrder", { packageId, network }),
  verify: (orderId: string, txHash: string, network: string) =>
    api.post("/cryptoVerify", { orderId, txHash, network }),
};
