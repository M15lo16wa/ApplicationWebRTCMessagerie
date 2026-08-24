import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../lib/httpError.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentification requise"));
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    req.userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "Token invalide ou expiré"));
  }
}
