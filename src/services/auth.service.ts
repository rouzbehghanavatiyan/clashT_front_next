import { api } from "./axios.config";

export const authService = {
  login: (data: any) => api.post("/login", data),
  register: (data: any) => api.post("/registerUser", data),
};
