import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { messagesService } from "./messages.service.js";

export const messagesRouter = Router();
messagesRouter.use(authMiddleware);

messagesRouter.get("/:conversationId", async (req, res, next) => {
  try {
    const messages = await messagesService.history(req.params.conversationId, req.userId, {
      cursor: req.query.cursor,
    });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

messagesRouter.delete("/:conversationId/all", async (req, res, next) => {
  try {
    const result = await messagesService.clearConversation({
      conversationId: req.params.conversationId,
      userId: req.userId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

messagesRouter.delete("/:conversationId/bulk", async (req, res, next) => {
  try {
    const result = await messagesService.deleteMessages({
      conversationId: req.params.conversationId,
      messageIds: Array.isArray(req.body?.messageIds) ? req.body.messageIds : [],
      userId: req.userId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

messagesRouter.delete("/:conversationId/:messageId", async (req, res, next) => {
  try {
    const result = await messagesService.deleteMessage({
      conversationId: req.params.conversationId,
      messageId: req.params.messageId,
      userId: req.userId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});
