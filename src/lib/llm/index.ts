import { LLMAdapter } from "./types";

export function createLLMAdapter(): LLMAdapter | null {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return null;

  const provider = process.env.LLM_PROVIDER ?? "openai";

  if (provider === "gemini") {
    const { GeminiAdapter } = require("./gemini") as { GeminiAdapter: new (k: string) => LLMAdapter };
    return new GeminiAdapter(apiKey);
  }

  const { OpenAIAdapter } = require("./openai") as { OpenAIAdapter: new (k: string) => LLMAdapter };
  return new OpenAIAdapter(apiKey);
}

export type { LLMAdapter };
