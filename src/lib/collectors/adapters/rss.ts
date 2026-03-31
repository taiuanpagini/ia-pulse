import Parser from "rss-parser";
import { CollectedItem, CollectorResult } from "../types";
import { RssFeedConfig } from "../config/rss-feeds.config";

const parser = new Parser({
  timeout: 8000,
  customFields: {
    item: [["content:encoded", "contentEncoded"]],
  },
});

/**
 * Palavras-chave de IA aplicada — item é mantido se título ou resumo
 * contiver ao menos uma. Filtra opinião pura, artigos genéricos e posts
 * sem aplicabilidade real (PoC, produto, ferramenta, regulação).
 */
const PRACTICAL_AI_KEYWORDS = [
  // Modelos e ferramentas
  "llm", "gpt", "claude", "gemini", "llama", "mistral", "phi", "qwen", "grok",
  "model release", "open-source", "open source", "sdk", "api",
  // Infraestrutura e produção
  "deploy", "production", "inference", "quantization", "fine-tuning", "fine tuning",
  "rag", "embeddings", "vector", "gpu", "tpu", "edge computing", "optimization",
  // Prática / negócio
  "enterprise", "startup", "implementation", "integration", "workflow", "automation",
  "agent", "poc", "benchmark", "performance", "cost", "roi", "efficiency",
  "tool", "platform", "framework", "library", "launch", "release", "available",
  // Regulação
  "regulation", "compliance", "ai act", "lgpd", "gdpr", "policy", "governance",
  "anpd", "nist", "law", "legislation", "framework",
  // Brasil
  "inteligência artificial", "regulamentação", "conformidade", "implementação",
  "ferramenta", "modelo", "agente", "automação",
];

function isRelevant(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  return PRACTICAL_AI_KEYWORDS.some((kw) => text.includes(kw));
}

export async function collectRssFeed(
  feed: RssFeedConfig,
  signal?: AbortSignal
): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  const controller = new AbortController();
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  const feedData = await parser.parseURL(feed.url);
  const items: CollectedItem[] = [];
  let skipped = 0;

  const MAX_ITEMS = feed.maxItems ?? 3;

  // Fontes curadas (The Batch, Import AI, NVIDIA etc.) já têm alta qualidade;
  // fontes de notícias abertas passam pelo filtro de relevância
  const shouldFilter = feed.relevanceFilter === true;

  for (const entry of feedData.items ?? []) {
    if (items.length >= MAX_ITEMS) break;

    const url = entry.link ?? entry.guid;
    const title = entry.title;
    if (!url || !title) continue;

    const summary = (
      entry.contentSnippet ??
      entry.summary ??
      (entry as unknown as Record<string, unknown>).contentEncoded as string | undefined ??
      ""
    )
      .replace(/<[^>]+>/g, "")
      .trim()
      .slice(0, 500);

    if (shouldFilter && !isRelevant(title, summary)) {
      skipped++;
      continue;
    }

    const publishedAt = entry.isoDate ? new Date(entry.isoDate) : undefined;

    items.push({
      title: title.trim(),
      summary: summary || title.trim(),
      url,
      source: feed.source,
      topicSlug: feed.topicSlug,
      collectedAt: new Date(),
      publishedAt,
    });
  }

  return {
    items,
    result: {
      source: feed.source,
      status: "success",
      itemsCollected: items.length,
      itemsSkipped: skipped,
    },
  };
}
