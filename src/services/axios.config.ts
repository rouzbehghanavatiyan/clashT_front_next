import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;
const notifURL = process.env.NEXT_PUBLIC_NOTIF_API;

export const api = axios.create({
  baseURL,
});

export const notifApi = axios.create({
  baseURL: notifURL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
