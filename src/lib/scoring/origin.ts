import { ScoreCriteria } from "./formula";

export function determineScoredBy(
  submitted: ScoreCriteria,
  llmSuggestion: ScoreCriteria | null
): "manual" | "llm" {
  if (!llmSuggestion) return "manual";

  const fields: (keyof ScoreCriteria)[] = [
    "maturity",
    "applicability",
    "competitiveImpact",
    "strategicAlignment",
    "adoptionComplexity",
  ];

  const allEqual = fields.every((f) => submitted[f] === llmSuggestion[f]);
  return allEqual ? "llm" : "manual";
}
