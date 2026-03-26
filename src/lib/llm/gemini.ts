import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMAdapter } from "./types";
import { LLMScoreResponse, LLMScoreResponseSchema } from "@/lib/scoring/schemas";
import { buildScoringPrompt } from "./prompt";

export class GeminiAdapter implements LLMAdapter {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async suggestScore(title: string, summary: string): Promise<LLMScoreResponse> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(buildScoringPrompt(title, summary));
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("LLM_INVALID_RESPONSE");

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("LLM_INVALID_RESPONSE");
    }

    const validated = LLMScoreResponseSchema.safeParse(parsed);
    if (!validated.success) throw new Error("LLM_INVALID_RESPONSE");

    return validated.data;
  }
}
