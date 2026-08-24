import { Router } from "express";
import multer from "multer";
import { env } from "../../config/env.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { conversationRoom } from "../../sockets/rooms.js";
import { filesService } from "./files.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.uploadMaxSizeMb * 1024 * 1024 },
});

export const filesRouter = Router();
filesRouter.use(authMiddleware);

filesRouter.post("/:conversationId", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }
    const { conversationId } = req.params;
    const message = await filesService.upload({
      conversationId,
      senderId: req.userId,
      file: req.file,
    });

    req.app.get("io")?.to(conversationRoom(conversationId)).emit("message:new", message);

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});
