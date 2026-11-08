import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}
import { CHAT_API_URL } from "@/lib/env";
import {
  getAccessToken,
  getRefreshToken,
  removeTokens,
  saveTokens,
} from "./tokenService";

export const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export const chatApi = axios.create({
  baseURL: CHAT_API_URL,
  headers: { "Content-Type": "application/json" },
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuth?: boolean;
};

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

const redirectToLogin = () => {
  removeTokens();
  if (typeof window !== "undefined") window.location.href = "/login";
};

const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryConfig | undefined;

      if (
        !originalRequest ||
        originalRequest.skipAuth ||
        error.response?.status !== 401 ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        });
      }

      const tokenUsed =
        originalRequest.headers.Authorization?.toString().replace(
          "Bearer ",
          "",
        );
      const current = getAccessToken();
      if (current && current !== tokenUsed) {
        originalRequest.headers.Authorization = `Bearer ${current}`;
        return instance(originalRequest);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        processQueue(error, null);
        redirectToLogin();
        return Promise.reject(error);
      }

      isRefreshing = true;
      if (current && current !== tokenUsed) {
        return instance(originalRequest);
      }

      if (!refreshToken) {
        processQueue(error, null);
        redirectToLogin();
        return Promise.reject(error);
      }

      isRefreshing = true;
      try {
        const response = await axios.post(
          `${baseURL}/refreshToken`,
          { accessToken: current, refreshToken },
          { skipAuth: true } as any,
        );

        const data = response.data?.data;
        if (!data?.token || !data?.refreshToken) {
          throw new Error("Invalid new tokens received from server.");
        }

        saveTokens(data.token, data.refreshToken);
        processQueue(null, data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        const status = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : undefined;
        if (status === 401 || status === 400 || status === 403) {
          redirectToLogin();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};

setupInterceptors(api);
setupInterceptors(chatApi);
