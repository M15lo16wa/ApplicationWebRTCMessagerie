import { prisma } from "../../lib/prisma.js";

export const usersRepository = {
  listExcept(userId, search) {
    return prisma.user.findMany({
      where: {
        id: { not: userId },
        ...(search
          ? {
              OR: [
                { displayName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: { id: true, displayName: true, avatarUrl: true, email: true },
      orderBy: { displayName: "asc" },
      take: 20,
    });
  },

  findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, displayName: true, avatarUrl: true, email: true },
    });
  },
};
