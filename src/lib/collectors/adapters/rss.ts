import Parser from "rss-parser";
import { CollectedItem, CollectorResult } from "../types";
import { RssFeedConfig } from "../config/rss-feeds.config";

const parser = new Parser({
  timeout: 8000,
  customFields: {
    item: [["content:encoded", "contentEncoded"]],
  },
});

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

  for (const entry of feedData.items ?? []) {
    const url = entry.link ?? entry.guid;
    const title = entry.title;

    if (!url || !title) continue;

    const summary = (
      entry.contentSnippet ??
      entry.summary ??
      (entry as Record<string, unknown>).contentEncoded as string | undefined ??
      ""
    )
      .replace(/<[^>]+>/g, "")
      .trim()
      .slice(0, 500);

    items.push({
      title: title.trim(),
      summary: summary || title.trim(),
      url,
      source: feed.source,
      topicSlug: feed.topicSlug,
      collectedAt: new Date(),
    });
  }

  return {
    items,
    result: {
      source: feed.source,
      status: "success",
      itemsCollected: items.length,
      itemsSkipped: 0,
    },
  };
}
