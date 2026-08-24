import { prisma } from "../../lib/prisma.js";

export const callsRepository = {
  create({ conversationId, initiatorId, type }) {
    return prisma.call.create({
      data: {
        conversationId,
        initiatorId,
        type,
        participants: { create: [{ userId: initiatorId, joinedAt: new Date() }] },
      },
    });
  },

  addParticipant(callId, userId) {
    return prisma.callParticipant.upsert({
      where: { callId_userId: { callId, userId } },
      update: { joinedAt: new Date() },
      create: { callId, userId, joinedAt: new Date() },
    });
  },

  markLeft(callId, userId) {
    return prisma.callParticipant.update({
      where: { callId_userId: { callId, userId } },
      data: { leftAt: new Date() },
    });
  },

  setState(callId, state) {
    return prisma.call.update({
      where: { id: callId },
      data: { state, ...(state === "ended" ? { endedAt: new Date() } : {}) },
    });
  },

  listForUser(userId) {
    return prisma.call.findMany({
      where: { participants: { some: { userId } }, hiddenFor: { none: { userId } } },
      include: {
        initiator: true,
        conversation: { include: { participants: { include: { user: true } } } },
      },
      orderBy: { startedAt: "desc" },
      take: 50,
    });
  },

  findById(callId) {
    return prisma.call.findUnique({ where: { id: callId }, include: { participants: true } });
  },

  findManyByIds(ids) {
    return prisma.call.findMany({ where: { id: { in: ids } }, include: { participants: true } });
  },

  async hideForUser(callIds, userId) {
    if (callIds.length === 0) return;
    await prisma.callDeletion.createMany({
      data: callIds.map((callId) => ({ callId, userId })),
      skipDuplicates: true,
    });
  },

  async hideAllForUser(userId) {
    const calls = await prisma.call.findMany({
      where: { participants: { some: { userId } } },
      select: { id: true },
    });
    const ids = calls.map((c) => c.id);
    await callsRepository.hideForUser(ids, userId);
    return ids;
  },
};
