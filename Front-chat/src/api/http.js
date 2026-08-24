import axios from "axios";
import { useAuthStore } from "../store/authStore.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshInFlight = null;

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response?.status !== 401 || config.__isRetry) {
      throw error;
    }
    config.__isRetry = true;

    refreshInFlight ??= http
      .post("/auth/refresh")
      .then(({ data }) => {
        useAuthStore.getState().setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        useAuthStore.getState().logout();
        throw error;
      })
      .finally(() => {
        refreshInFlight = null;
      });

    const accessToken = await refreshInFlight;
    config.headers.Authorization = `Bearer ${accessToken}`;
    return http(config);
  },
);
