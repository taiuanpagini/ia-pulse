import { CollectedItem, CollectorResult } from "../types";

const HN_API = "https://hn.algolia.com/api/v1/search";
const SOURCE = "HackerNews";
const TOPIC_SLUG = "geral";

// Queries focadas em IA aplicada — ferramentas, lançamentos, casos reais
const QUERIES = [
  "LLM production deployment",
  "AI tool launch enterprise",
  "machine learning open source release",
];

// >= 300 pontos = post com engajamento real e validado pela comunidade HN
const MIN_POINTS = 300;
const HITS_PER_QUERY = 4;

// Janela de 8 dias — cobre a semana + margem para horários de cron
function sinceTimestamp(): number {
  return Math.floor((Date.now() - 8 * 24 * 60 * 60 * 1000) / 1000);
}

interface HNHit {
  objectID: string;
  title?: string;
  story_title?: string;
  story_text?: string;
  comment_text?: string;
  url?: string;
  story_url?: string;
  points?: number;
  num_comments?: number;
  created_at?: string;
}

export async function collectHackerNews(
  signal?: AbortSignal
): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  const seen = new Set<string>();
  const items: CollectedItem[] = [];

  for (const query of QUERIES) {
    const url =
      `${HN_API}?query=${encodeURIComponent(query)}` +
      `&tags=story` +
      `&hitsPerPage=${HITS_PER_QUERY}` +
      `&numericFilters=points>=${MIN_POINTS},num_comments>=20,created_at_i>=${sinceTimestamp()}`;

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HackerNews HTTP ${response.status}`);

    const data = (await response.json()) as { hits: HNHit[] };

    for (const hit of data.hits) {
      const itemUrl =
        hit.url ?? hit.story_url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`;

      if (seen.has(itemUrl)) continue;
      seen.add(itemUrl);

      const title = hit.title ?? hit.story_title ?? "";
      if (!title) continue;

      const summary = (hit.story_text ?? hit.comment_text ?? "").slice(0, 500);
      const publishedAt = hit.created_at ? new Date(hit.created_at) : undefined;

      items.push({
        title,
        summary: summary || title,
        url: itemUrl,
        source: SOURCE,
        topicSlug: TOPIC_SLUG,
        collectedAt: new Date(),
        publishedAt,
      });
    }
  }

  return {
    items,
    result: { source: SOURCE, status: "success", itemsCollected: items.length, itemsSkipped: 0 },
  };
}
