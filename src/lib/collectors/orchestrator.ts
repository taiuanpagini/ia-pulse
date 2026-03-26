import { CollectedItem, CollectorResult } from "./types";
import { collectArxiv } from "./adapters/arxiv";
import { collectHackerNews } from "./adapters/hackernews";
import { collectReddit } from "./adapters/reddit";
import { collectSemanticScholar } from "./adapters/semantic-scholar";
import { collectPapersWithCode } from "./adapters/papers-with-code";
import { collectRssFeed } from "./adapters/rss";
import { RSS_FEEDS } from "./config/rss-feeds.config";
import { upsertTrends } from "@/lib/mongodb/repositories/trend.repository";

const ADAPTER_TIMEOUT_MS = 8000;

export interface OrchestratorReport {
  totalItems: number;
  inserted: number;
  skipped: number;
  sources: CollectorResult[];
  durationMs: number;
}

type CollectorFn = (signal?: AbortSignal) => Promise<{ items: CollectedItem[]; result: CollectorResult }>;

function withTimeout(fn: CollectorFn): () => Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  return async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ADAPTER_TIMEOUT_MS);
    try {
      return await fn(controller.signal);
    } finally {
      clearTimeout(timer);
    }
  };
}

export async function runCollectors(): Promise<OrchestratorReport> {
  const start = Date.now();

  const apiCollectors: CollectorFn[] = [
    collectArxiv,
    collectHackerNews,
    collectReddit,
    collectSemanticScholar,
    collectPapersWithCode,
  ];

  const rssCollectors: CollectorFn[] = RSS_FEEDS.map(
    (feed) => (signal?: AbortSignal) => collectRssFeed(feed, signal)
  );

  const allCollectors = [...apiCollectors, ...rssCollectors].map(withTimeout);

  const settled = await Promise.allSettled(allCollectors.map((fn) => fn()));

  const allItems: CollectedItem[] = [];
  const sourceResults: CollectorResult[] = [];

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      allItems.push(...outcome.value.items);
      sourceResults.push(outcome.value.result);
    } else {
      const errMsg = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      const sourceName = errMsg.includes("arXiv")
        ? "arXiv"
        : errMsg.includes("HackerNews")
        ? "HackerNews"
        : errMsg.includes("Reddit")
        ? "Reddit"
        : errMsg.includes("Semantic Scholar")
        ? "Semantic Scholar"
        : errMsg.includes("Papers With Code")
        ? "Papers With Code"
        : "Unknown RSS";

      console.error(`[IAPulse] Collector failed: ${sourceName} — ${errMsg}`);
      sourceResults.push({
        source: sourceName,
        status: "error",
        itemsCollected: 0,
        itemsSkipped: 0,
        error: errMsg,
      });
    }
  }

  const { inserted, skipped } = await upsertTrends(allItems);

  return {
    totalItems: allItems.length,
    inserted,
    skipped,
    sources: sourceResults,
    durationMs: Date.now() - start,
  };
}
