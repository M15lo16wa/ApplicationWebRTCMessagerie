import { HttpError } from "../../lib/httpError.js";
import { messagesRepository } from "../messages/messages.repository.js";
import { conversationsRepository } from "./conversations.repository.js";

export const conversationsService = {
  list(userId) {
    return conversationsRepository.listForUser(userId);
  },

  async openPrivate(userId, otherUserId) {
    if (userId === otherUserId) {
      throw new HttpError(400, "Impossible de démarrer une discussion avec soi-même");
    }
    const existing = await conversationsRepository.findPrivateBetween(userId, otherUserId);
    const conversation = existing ?? (await conversationsRepository.createPrivate(userId, otherUserId));
    if (existing) {
      await conversationsRepository.unhideForUser(conversation.id, userId);
    }
    return conversation;
  },

  async deleteConversation(conversationId, userId) {
    await conversationsService.assertParticipant(conversationId, userId);
    await messagesRepository.hideAllForConversation(conversationId, userId);
    await conversationsRepository.hideForUser(conversationId, userId);
  },

  createGroup(userId, { name, memberIds }) {
    if (!memberIds?.length) {
      throw new HttpError(400, "Un groupe nécessite au moins un autre membre");
    }
    return conversationsRepository.createGroup({ name, creatorId: userId, memberIds });
  },

  async assertParticipant(conversationId, userId) {
    const isParticipant = await conversationsRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new HttpError(403, "Tu ne fais pas partie de cette conversation");
    }
  },

  async otherParticipantIds(conversationId, excludingUserId) {
    const ids = await conversationsRepository.listParticipantIds(conversationId);
    return ids.filter((id) => id !== excludingUserId);
  },

  reactivateForAllParticipants(conversationId) {
    return conversationsRepository.unhideAllParticipants(conversationId);
  },
};
