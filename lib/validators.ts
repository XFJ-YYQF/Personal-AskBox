import { z } from "zod";

export const questionSchema = z.object({
  nickname: z.string().trim().max(40).optional().default(""),
  content: z.string().trim().min(5).max(1000),
  turnstileToken: z.string().optional().nullable()
});

export const answerSchema = z.object({
  answer: z.string().trim().min(1).max(4000),
  publish: z.boolean().default(true)
});
