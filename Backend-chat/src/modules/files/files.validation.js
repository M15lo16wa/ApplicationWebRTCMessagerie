import { z } from "zod";

export const uploadParamsSchema = z.object({
  conversationId: z.string().uuid(),
});
