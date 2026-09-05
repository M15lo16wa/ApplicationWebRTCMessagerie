import { env } from "../config/env.js";
import { HttpError } from "../lib/httpError.js";

export function errorMiddleware(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Requête invalide", details: err.issues });
  }
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: `Ce fichier dépasse la taille maximale autorisée (${env.uploadMaxSizeMb} Mo).`,
      });
    }
    return res.status(400).json({ error: "Fichier invalide" });
  }
  return res.status(500).json({ error: "Erreur interne du serveur" });
}
