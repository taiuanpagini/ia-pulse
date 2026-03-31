import { z } from "zod";

const criteriaField = z.coerce.number().int().min(1).max(5);

export const ScoreInputSchema = z.object({
  maturity: criteriaField,
  applicability: criteriaField,
  competitiveImpact: criteriaField,
  strategicAlignment: criteriaField,
  adoptionComplexity: criteriaField,
  notes: z.string().max(2000).optional(),
  scoredBy: z.enum(["manual", "llm"]),
});

export const ScoreFormSchema = z.object({
  maturity: criteriaField,
  applicability: criteriaField,
  competitiveImpact: criteriaField,
  strategicAlignment: criteriaField,
  adoptionComplexity: criteriaField,
  notes: z.string().max(2000).optional(),
});

export type ScoreFormValues = z.infer<typeof ScoreFormSchema>;

export const LLMScoreResponseSchema = z.object({
  maturity: z.number().int().min(1).max(5),
  applicability: z.number().int().min(1).max(5),
  competitiveImpact: z.number().int().min(1).max(5),
  strategicAlignment: z.number().int().min(1).max(5),
  adoptionComplexity: z.number().int().min(1).max(5),
});

export type LLMScoreResponse = z.infer<typeof LLMScoreResponseSchema>;
