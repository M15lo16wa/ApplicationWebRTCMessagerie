import { create } from "zustand";
import { connectSocket, disconnectSocket } from "../api/socket.js";
import { http } from "../api/http.js";

const REMEMBER_ME_KEY = "chat.rememberMe";
export const REMEMBERED_EMAIL_KEY = "chat.rememberedEmail";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  status: "idle",

  setAccessToken(accessToken) {
    set({ accessToken });
  },

  async login(email, password, rememberMe = true) {
    const { data } = await http.post("/auth/login", { email, password });
    localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "1" : "0");
    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
    set({ user: data.user, accessToken: data.accessToken, status: "ready" });
    connectSocket(data.accessToken);
  },

  async register(email, password, displayName) {
    const { data } = await http.post("/auth/register", { email, password, displayName });
    localStorage.setItem(REMEMBER_ME_KEY, "1");
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    set({ user: data.user, accessToken: data.accessToken, status: "ready" });
    connectSocket(data.accessToken);
  },

  async logout() {
    try {
      await http.post("/auth/logout");
    } finally {
      localStorage.removeItem(REMEMBER_ME_KEY);
      disconnectSocket();
      set({ user: null, accessToken: null, status: "ready" });
    }
  },

  async updateProfile(fields) {
    const { data } = await http.patch("/auth/me", fields);
    set({ user: data.user });
    return data.user;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await http.post("/auth/me/avatar", formData);
    set({ user: data.user });
    return data.user;
  },

  async restoreSession() {
    if (localStorage.getItem(REMEMBER_ME_KEY) !== "1") {
      set({ status: "ready" });
      return;
    }
    set({ status: "loading" });
    try {
      const { data: refreshed } = await http.post("/auth/refresh");
      set({ accessToken: refreshed.accessToken });
      const { data } = await http.get("/auth/me");
      set({ user: data.user, status: "ready" });
      connectSocket(refreshed.accessToken);
    } catch {
      set({ user: null, accessToken: null, status: "ready" });
    }
  },
}));
