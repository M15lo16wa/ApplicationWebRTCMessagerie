import { z } from "zod";

export const openPrivateSchema = z.object({
  otherUserId: z.string().uuid(),
});

export const createGroupSchema = z.object({
  name: z.string().min(2).max(80),
  memberIds: z.array(z.string().uuid()).min(1),
});
