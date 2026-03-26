import OpenAI from "openai";
import { LLMAdapter } from "./types";
import { LLMScoreResponse, LLMScoreResponseSchema } from "@/lib/scoring/schemas";
import { buildScoringPrompt } from "./prompt";

export class OpenAIAdapter implements LLMAdapter {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async suggestScore(title: string, summary: string): Promise<LLMScoreResponse> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_tokens: 100,
      messages: [
        { role: "user", content: buildScoringPrompt(title, summary) },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("LLM_INVALID_RESPONSE");
    }

    const result = LLMScoreResponseSchema.safeParse(parsed);
    if (!result.success) throw new Error("LLM_INVALID_RESPONSE");

    return result.data;
  }
}
