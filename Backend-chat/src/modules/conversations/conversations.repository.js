import { prisma } from "../../lib/prisma.js";

export const conversationsRepository = {
  findById(id) {
    return prisma.conversation.findUnique({
      where: { id },
      include: { participants: true },
    });
  },

  findPrivateBetween(userIdA, userIdB) {
    return prisma.conversation.findFirst({
      where: {
        type: "private",
        AND: [
          { participants: { some: { userId: userIdA } } },
          { participants: { some: { userId: userIdB } } },
        ],
      },
      include: { participants: true },
    });
  },

  createPrivate(userIdA, userIdB) {
    return prisma.conversation.create({
      data: {
        type: "private",
        participants: { create: [{ userId: userIdA }, { userId: userIdB }] },
      },
      include: { participants: true },
    });
  },

  createGroup({ name, creatorId, memberIds }) {
    const otherMemberIds = [...new Set(memberIds)].filter((id) => id !== creatorId);
    return prisma.conversation.create({
      data: {
        type: "group",
        name,
        participants: {
          create: [
            { userId: creatorId, role: "admin" },
            ...otherMemberIds.map((userId) => ({ userId, role: "member" })),
          ],
        },
      },
      include: { participants: true },
    });
  },

  listForUser(userId) {
    return prisma.conversation.findMany({
      where: { participants: { some: { userId, hiddenAt: null } } },
      include: {
        participants: { include: { user: true } },
        messages: { orderBy: { sentAt: "desc" }, take: 1, include: { sender: true, mediaFile: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  hideForUser(conversationId, userId) {
    return prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { hiddenAt: new Date() },
    });
  },

  unhideForUser(conversationId, userId) {
    return prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { hiddenAt: null },
    });
  },

  unhideAllParticipants(conversationId) {
    return prisma.conversationParticipant.updateMany({
      where: { conversationId, hiddenAt: { not: null } },
      data: { hiddenAt: null },
    });
  },

  async isParticipant(conversationId, userId) {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    return Boolean(participant);
  },

  async listParticipantIds(conversationId) {
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    return participants.map((p) => p.userId);
  },
};
