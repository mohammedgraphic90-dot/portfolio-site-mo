import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  message: z.string().trim().min(10).max(2000),

  company: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
