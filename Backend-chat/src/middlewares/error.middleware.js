import { HttpError } from "../lib/httpError.js";

export function errorMiddleware(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Requête invalide", details: err.issues });
  }
  return res.status(500).json({ error: "Erreur interne du serveur" });
}
