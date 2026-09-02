import { getSocketIds } from "../presence/presence.gateway.js";
import { conversationRoom } from "../../sockets/rooms.js";
import { conversationsService } from "./conversations.service.js";
import { createGroupSchema, openPrivateSchema } from "./conversations.validation.js";

function joinOtherParticipants(req, conversation) {
  const io = req.app.get("io");
  if (!io) return;
  const room = conversationRoom(conversation.id);
  for (const participant of conversation.participants) {
    if (participant.userId === req.userId) continue;
    for (const socketId of getSocketIds(participant.userId)) {
      io.sockets.sockets.get(socketId)?.join(room);
    }
  }
}

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
      joinOtherParticipants(req, conversation);
      res.status(201).json({ conversation });
    } catch (err) {
      next(err);
    }
  },

  async createGroup(req, res, next) {
    try {
      const body = createGroupSchema.parse(req.body);
      const conversation = await conversationsService.createGroup(req.userId, body);
      joinOtherParticipants(req, conversation);
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
