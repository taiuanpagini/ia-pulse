import { z } from "zod";
import { TOPIC_COLOR_PALETTE } from "@/lib/mongodb/models/Topic";

export const CreateTopicSchema = z.object({
  name: z.string().min(2).max(60),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug deve ser lowercase, sem espaços ou caracteres especiais")
    .min(2)
    .max(60)
    .optional(),
  description: z.string().max(500).default(""),
});

export const UpdateTopicSchema = z.object({
  description: z.string().max(500),
});

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;
export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;

export const TopicResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  color: z.enum(TOPIC_COLOR_PALETTE),
});

export type TopicResponse = z.infer<typeof TopicResponseSchema>;
