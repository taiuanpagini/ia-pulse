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

interface TaggedCollector {
  source: string;
  fn: CollectorFn;
}

function withTimeout(tagged: TaggedCollector): () => Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  return async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ADAPTER_TIMEOUT_MS);
    try {
      return await tagged.fn(controller.signal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`[${tagged.source}] ${msg}`);
    } finally {
      clearTimeout(timer);
    }
  };
}

export async function runCollectors(): Promise<OrchestratorReport> {
  const start = Date.now();

  const tagged: TaggedCollector[] = [
    { source: "arXiv", fn: collectArxiv },
    { source: "HackerNews", fn: collectHackerNews },
    { source: "Reddit", fn: collectReddit },
    { source: "Semantic Scholar", fn: collectSemanticScholar },
    { source: "Papers With Code", fn: collectPapersWithCode },
    ...RSS_FEEDS.map((feed) => ({
      source: feed.source,
      fn: (signal?: AbortSignal) => collectRssFeed(feed, signal),
    })),
  ];

  const runners = tagged.map(withTimeout);
  const settled = await Promise.allSettled(runners.map((fn) => fn()));

  const allItems: CollectedItem[] = [];
  const sourceResults: CollectorResult[] = [];

  settled.forEach((outcome, i) => {
    const sourceName = tagged[i].source;
    if (outcome.status === "fulfilled") {
      allItems.push(...outcome.value.items);
      sourceResults.push(outcome.value.result);
    } else {
      const errMsg = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      console.error(`[IAPulse] Collector failed: ${sourceName} — ${errMsg}`);
      sourceResults.push({
        source: sourceName,
        status: "error",
        itemsCollected: 0,
        itemsSkipped: 0,
        error: errMsg,
      });
    }
  });

  const { inserted, skipped } = await upsertTrends(allItems);

  return {
    totalItems: allItems.length,
    inserted,
    skipped,
    sources: sourceResults,
    durationMs: Date.now() - start,
  };
}
