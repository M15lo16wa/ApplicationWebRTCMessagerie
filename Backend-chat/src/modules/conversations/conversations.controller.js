import { conversationsService } from "./conversations.service.js";
import { createGroupSchema, openPrivateSchema } from "./conversations.validation.js";

export const conversationsController = {
  async list(req, res, next) {
    try {
      const conversations = await conversationsService.list(req.userId);
      res.json({ conversations });
    } catch (err) {
      next(err);
    }
  },

  async openPrivate(req, res, next) {
    try {
      const { otherUserId } = openPrivateSchema.parse(req.body);
      const conversation = await conversationsService.openPrivate(req.userId, otherUserId);
      res.status(201).json({ conversation });
    } catch (err) {
      next(err);
    }
  },

  async createGroup(req, res, next) {
    try {
      const body = createGroupSchema.parse(req.body);
      const conversation = await conversationsService.createGroup(req.userId, body);
      res.status(201).json({ conversation });
    } catch (err) {
      next(err);
    }
  },

  async deleteConversation(req, res, next) {
    try {
      await conversationsService.deleteConversation(req.params.conversationId, req.userId);
      res.json({ conversationId: req.params.conversationId });
    } catch (err) {
      next(err);
    }
  },
};
