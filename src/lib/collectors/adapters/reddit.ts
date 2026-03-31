import { CollectedItem, CollectorResult } from "../types";

const SOURCE = "Reddit";

const SUBREDDITS = [
  { name: "MachineLearning", topicSlug: "infraestrutura" },
  { name: "LocalLLaMA", topicSlug: "infraestrutura" },
  { name: "artificial", topicSlug: "geral" },
];

// >= 500 upvotes = post amplamente validado pela comunidade; filtra opinião e ruído
const MIN_SCORE = 500;
const LIMIT_PER_SUB = 25;
const MAX_KEEP = 3;

// Janela de 8 dias para garantir apenas posts genuinamente novos
const SINCE_UTC = Math.floor((Date.now() - 8 * 24 * 60 * 60 * 1000) / 1000);

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext?: string;
    url?: string;
    permalink: string;
    is_self: boolean;
    score: number;
    link_flair_text?: string;
    created_utc?: number;
  };
}

interface RedditListing {
  data: { children: RedditPost[] };
}

export async function collectReddit(
  signal?: AbortSignal
): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  const items: CollectedItem[] = [];

  for (const sub of SUBREDDITS) {
    const url = `https://www.reddit.com/r/${sub.name}/hot.json?limit=${LIMIT_PER_SUB}`;
    const response = await fetch(url, {
      signal,
      headers: { "User-Agent": "IAPulse/1.0 (monitoring bot)" },
    });
    if (!response.ok) throw new Error(`Reddit HTTP ${response.status} for r/${sub.name}`);

    const data = (await response.json()) as RedditListing;

    const filtered = data.data.children
      .filter((p) => p.data.score >= MIN_SCORE && (p.data.created_utc ?? 0) >= SINCE_UTC)
      .sort((a, b) => b.data.score - a.data.score)
      .slice(0, MAX_KEEP);

    for (const post of filtered) {
      const { title, selftext, url: postUrl, permalink, is_self, created_utc } = post.data;
      const finalUrl = is_self
        ? `https://reddit.com${permalink}`
        : (postUrl ?? `https://reddit.com${permalink}`);

      const publishedAt = created_utc ? new Date(created_utc * 1000) : undefined;

      items.push({
        title,
        summary: (selftext ?? "").slice(0, 500) || title,
        url: finalUrl,
        source: SOURCE,
        topicSlug: sub.topicSlug,
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
