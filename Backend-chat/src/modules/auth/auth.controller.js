import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from "../../lib/authCookie.js";
import { authService } from "./auth.service.js";
import { loginSchema, registerSchema, updateProfileSchema } from "./auth.validation.js";

export const authController = {
  async register(req, res, next) {
    try {
      const body = registerSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.register(body);
      setRefreshCookie(req, res, refreshToken);
      res.status(201).json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const body = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.login(body);
      setRefreshCookie(req, res, refreshToken);
      res.json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const { accessToken, refreshToken } = await authService.refresh(readRefreshCookie(req));
      setRefreshCookie(req, res, refreshToken);
      res.json({ accessToken });
    } catch (err) {
      next(err);
    }
  },

  logout(req, res) {
    clearRefreshCookie(res);
    res.status(204).end();
  },

  async me(req, res, next) {
    try {
      const user = await authService.me(req.userId);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const body = updateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(req.userId, body);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  async updateAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucune image reçue" });
      }
      const user = await authService.updateAvatar(req.userId, req.file);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
};
