import { Router } from "express";
import multer from "multer";
import { env } from "../../config/env.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authController } from "./auth.controller.js";

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.uploadMaxSizeMb * 1024 * 1024 },
});

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authMiddleware, authController.me);
authRouter.patch("/me", authMiddleware, authController.updateProfile);
authRouter.post("/me/avatar", authMiddleware, uploadAvatar.single("avatar"), authController.updateAvatar);
