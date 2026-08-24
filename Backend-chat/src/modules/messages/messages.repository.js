import { prisma } from "../../lib/prisma.js";

export const messagesRepository = {
  create({ conversationId, senderId, content }) {
    return prisma.message.create({
      data: { conversationId, senderId, content },
      include: { sender: true },
    });
  },

  createWithMedia({ conversationId, senderId, mediaFile }) {
    return prisma.message.create({
      data: { conversationId, senderId, mediaFile: { create: mediaFile } },
      include: { sender: true, mediaFile: true },
    });
  },

  listByConversation(conversationId, viewerId, { cursor, take = 30 } = {}) {
    return prisma.message.findMany({
      where: { conversationId, hiddenFor: { none: { userId: viewerId } } },
      include: { sender: true, mediaFile: true },
      orderBy: { sentAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
  },

  async markConversationRead(conversationId, readerId) {
    const unread = await prisma.message.findMany({
      where: { conversationId, senderId: { not: readerId }, status: { not: "read" } },
      select: { id: true },
    });
    if (unread.length === 0) return [];
    const ids = unread.map((m) => m.id);
    await prisma.message.updateMany({ where: { id: { in: ids } }, data: { status: "read" } });
    return ids;
  },

  markDelivered(messageId) {
    return prisma.message.update({
      where: { id: messageId },
      data: { status: "delivered" },
      include: { sender: true, mediaFile: true },
    });
  },

  async markDeliveredForRecipient(recipientId) {
    const pending = await prisma.message.findMany({
      where: {
        status: "sent",
        senderId: { not: recipientId },
        conversation: { participants: { some: { userId: recipientId } } },
      },
      select: { id: true, conversationId: true },
    });
    if (pending.length === 0) return [];
    await prisma.message.updateMany({
      where: { id: { in: pending.map((m) => m.id) } },
      data: { status: "delivered" },
    });
    return pending;
  },

  findById(id) {
    return prisma.message.findUnique({ where: { id } });
  },

  findManyByIds(ids) {
    return prisma.message.findMany({ where: { id: { in: ids } } });
  },

  async hideForUser(messageIds, userId) {
    if (messageIds.length === 0) return;
    await prisma.messageDeletion.createMany({
      data: messageIds.map((messageId) => ({ messageId, userId })),
      skipDuplicates: true,
    });
  },

  async hideAllForConversation(conversationId, userId) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      select: { id: true },
    });
    await messagesRepository.hideForUser(messages.map((m) => m.id), userId);
    return messages.map((m) => m.id);
  },
};
