import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { conversationsController } from "./conversations.controller.js";

export const conversationsRouter = Router();
conversationsRouter.use(authMiddleware);

conversationsRouter.get("/", conversationsController.list);
conversationsRouter.post("/private", conversationsController.openPrivate);
conversationsRouter.post("/group", conversationsController.createGroup);
conversationsRouter.delete("/:conversationId", conversationsController.deleteConversation);
