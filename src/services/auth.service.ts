import { api } from "./axios.config";

export const authService = {
  login: (data: any) => api.post("/login", data, { skipAuth: true }),
  register: (data: any) => api.post("/registerUser", data, { skipAuth: true }),
  resendVerificationEmail: (data: { userName: string }) =>
    api.post("/resendVerificationEmail", data),
};
