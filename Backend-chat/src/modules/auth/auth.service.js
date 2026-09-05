import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/httpError.js";
import { storageProvider } from "../files/storageProvider.js";
import { authRepository } from "./auth.repository.js";

const BCRYPT_COST = 12;

const ALLOWED_AVATAR_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    statusText: user.statusText,
  };
}

function issueTokens(userId) {
  const accessToken = jwt.sign({ sub: userId }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
  const refreshToken = jwt.sign({ sub: userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register({ email, password, displayName }) {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Un compte existe déjà avec cet email");
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const user = await authRepository.create({ email, passwordHash, displayName });
    return { user: toPublicUser(user), ...issueTokens(user.id) };
  },

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(401, "Email ou mot de passe incorrect");
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Email ou mot de passe incorrect");
    }
    return { user: toPublicUser(user), ...issueTokens(user.id) };
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new HttpError(401, "Session expirée, reconnecte-toi");
    }
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
    } catch {
      throw new HttpError(401, "Session expirée, reconnecte-toi");
    }
    const user = await authRepository.findById(payload.sub);
    if (!user) {
      throw new HttpError(401, "Session expirée, reconnecte-toi");
    }
    return issueTokens(user.id);
  },

  async me(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, "Utilisateur introuvable");
    }
    return toPublicUser(user);
  },

  async updateProfile(userId, data) {
    const user = await authRepository.update(userId, data);
    return toPublicUser(user);
  },

  async updateAvatar(userId, file) {
    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
      throw new HttpError(415, "Format d'image non autorisé");
    }
    const { url } = await storageProvider.save(file.buffer, file.mimetype);
    const user = await authRepository.update(userId, { avatarUrl: url });
    return toPublicUser(user);
  },
};
