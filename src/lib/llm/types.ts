import { LLMScoreResponse } from "@/lib/scoring/schemas";

export interface LLMAdapter {
  suggestScore(title: string, summary: string): Promise<LLMScoreResponse>;
}
