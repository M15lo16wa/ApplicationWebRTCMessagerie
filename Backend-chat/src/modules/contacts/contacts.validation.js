import { z } from "zod";

export const addContactSchema = z.object({
  contactId: z.string().uuid(),
});
