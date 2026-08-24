import { prisma } from "../../lib/prisma.js";

export const contactsRepository = {
  listForOwner(ownerId) {
    return prisma.contact.findMany({
      where: { ownerId },
      include: { contact: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async exists(ownerId, contactId) {
    const contact = await prisma.contact.findUnique({
      where: { ownerId_contactId: { ownerId, contactId } },
    });
    return Boolean(contact);
  },

  create(ownerId, contactId) {
    return prisma.contact.create({
      data: { ownerId, contactId },
      include: { contact: true },
    });
  },
};
