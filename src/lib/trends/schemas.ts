import { z } from "zod";

export const TrendFiltersSchema = z.object({
  topic: z.union([z.string(), z.array(z.string())]).optional(),
  source: z.string().optional(),
  period: z.enum(["1d", "7d", "30d", "90d"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type TrendFilters = z.infer<typeof TrendFiltersSchema>;

export const TrendListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  url: z.string(),
  source: z.string(),
  topicSlug: z.string(),
  topicName: z.string(),
  topicColor: z.string(),
  collectedAt: z.string(),
  score: z
    .object({
      total: z.number(),
      scoredBy: z.enum(["manual", "llm"]),
    })
    .nullable(),
});

export type TrendListItem = z.infer<typeof TrendListItemSchema>;

export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const TrendListResponseSchema = z.object({
  data: z.array(TrendListItemSchema),
  pagination: PaginationSchema,
});

export type TrendListResponse = z.infer<typeof TrendListResponseSchema>;
