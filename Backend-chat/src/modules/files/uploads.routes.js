import { Router } from "express";
import { storageProvider } from "./storageProvider.js";

const STORED_NAME_PATTERN = /^[0-9a-f-]{36}\.[a-z0-9]{1,10}$/i;

export const uploadsRouter = Router();

uploadsRouter.get("/:filename", async (req, res) => {
  const { filename } = req.params;
  if (!STORED_NAME_PATTERN.test(filename)) {
    return res.status(404).json({ error: "Fichier introuvable" });
  }
  try {
    const stat = await storageProvider.statObject(filename);
    const stream = await storageProvider.getObjectStream(filename);
    res.setHeader("Content-Type", stat.metaData?.["content-type"] ?? "application/octet-stream");
    res.setHeader("Content-Length", stat.size);
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  } catch {
    res.status(404).json({ error: "Fichier introuvable" });
  }
});
