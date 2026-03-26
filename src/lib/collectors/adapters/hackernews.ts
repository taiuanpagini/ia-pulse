import { CollectedItem, CollectorResult } from "../types";

const HN_API = "https://hn.algolia.com/api/v1/search";
const SOURCE = "HackerNews";
const TOPIC_SLUG = "geral";
const QUERIES = ["machine learning", "artificial intelligence", "LLM"];

interface HNHit {
  objectID: string;
  title?: string;
  story_title?: string;
  story_text?: string;
  comment_text?: string;
  url?: string;
  story_url?: string;
}

export async function collectHackerNews(signal?: AbortSignal): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  const seen = new Set<string>();
  const items: CollectedItem[] = [];

  for (const query of QUERIES) {
    const url = `${HN_API}?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=15`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HackerNews HTTP ${response.status}`);

    const data = (await response.json()) as { hits: HNHit[] };

    for (const hit of data.hits) {
      const itemUrl = hit.url ?? hit.story_url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`;
      if (seen.has(itemUrl)) continue;
      seen.add(itemUrl);

      const title = hit.title ?? hit.story_title ?? "";
      if (!title) continue;

      const summary = (hit.story_text ?? hit.comment_text ?? "").slice(0, 500);

      items.push({
        title,
        summary: summary || title,
        url: itemUrl,
        source: SOURCE,
        topicSlug: TOPIC_SLUG,
        collectedAt: new Date(),
      });
    }
  }

  return {
    items,
    result: {
      source: SOURCE,
      status: "success",
      itemsCollected: items.length,
      itemsSkipped: 0,
    },
  };
}
