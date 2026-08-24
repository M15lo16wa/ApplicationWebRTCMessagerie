import { HttpError } from "../../lib/httpError.js";
import { conversationsService } from "../conversations/conversations.service.js";
import { isOnline } from "../presence/presence.gateway.js";
import { messagesRepository } from "./messages.repository.js";

export const messagesService = {
  async send({ conversationId, senderId, content }) {
    await conversationsService.assertParticipant(conversationId, senderId);
    const message = await messagesRepository.create({ conversationId, senderId, content });
    await conversationsService.reactivateForAllParticipants(conversationId);
    return messagesService.applyDeliveredIfOnline(conversationId, senderId, message);
  },

  async sendFile({ conversationId, senderId, mediaFile }) {
    await conversationsService.assertParticipant(conversationId, senderId);
    const message = await messagesRepository.createWithMedia({ conversationId, senderId, mediaFile });
    await conversationsService.reactivateForAllParticipants(conversationId);
    return messagesService.applyDeliveredIfOnline(conversationId, senderId, message);
  },

  async applyDeliveredIfOnline(conversationId, senderId, message) {
    const otherIds = await conversationsService.otherParticipantIds(conversationId, senderId);
    const someoneOnline = otherIds.some((id) => isOnline(id));
    return someoneOnline ? messagesRepository.markDelivered(message.id) : message;
  },

  async history(conversationId, userId, pagination) {
    await conversationsService.assertParticipant(conversationId, userId);
    return messagesRepository.listByConversation(conversationId, userId, pagination);
  },

  async markRead(conversationId, userId) {
    await conversationsService.assertParticipant(conversationId, userId);
    return messagesRepository.markConversationRead(conversationId, userId);
  },

  async markDeliveredOnConnect(userId) {
    const updated = await messagesRepository.markDeliveredForRecipient(userId);
    const byConversation = new Map();
    for (const { id, conversationId } of updated) {
      if (!byConversation.has(conversationId)) byConversation.set(conversationId, []);
      byConversation.get(conversationId).push(id);
    }
    return byConversation;
  },

  async deleteMessage({ conversationId, messageId, userId }) {
    await conversationsService.assertParticipant(conversationId, userId);
    const message = await messagesRepository.findById(messageId);
    if (!message || message.conversationId !== conversationId) {
      throw new HttpError(404, "Message introuvable");
    }
    await messagesRepository.hideForUser([messageId], userId);
    return { messageIds: [messageId] };
  },

  async deleteMessages({ conversationId, messageIds, userId }) {
    await conversationsService.assertParticipant(conversationId, userId);
    const messages = await messagesRepository.findManyByIds(messageIds);
    const validIds = messages.filter((m) => m.conversationId === conversationId).map((m) => m.id);
    await messagesRepository.hideForUser(validIds, userId);
    return { messageIds: validIds };
  },

  async clearConversation({ conversationId, userId }) {
    await conversationsService.assertParticipant(conversationId, userId);
    const messageIds = await messagesRepository.hideAllForConversation(conversationId, userId);
    return { messageIds };
  },
};
