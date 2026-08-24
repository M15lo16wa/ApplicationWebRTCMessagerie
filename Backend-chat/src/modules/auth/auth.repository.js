import { prisma } from "../../lib/prisma.js";

export const authRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  create({ email, passwordHash, displayName }) {
    return prisma.user.create({
      data: { email, passwordHash, displayName },
    });
  },

  update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },
};
