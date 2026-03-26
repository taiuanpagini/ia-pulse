import { CollectedItem, CollectorResult } from "../types";

const SOURCE = "Reddit";

const SUBREDDITS = [
  { name: "MachineLearning", topicSlug: "infraestrutura" },
  { name: "artificial", topicSlug: "geral" },
  { name: "LocalLLaMA", topicSlug: "infraestrutura" },
];

// Posts com poucos upvotes são ruído — mínimo para garantir relevância
const MIN_SCORE = 20;
const LIMIT_PER_SUB = 25; // busca mais para filtrar pelo score
const MAX_KEEP = 8;       // mantém só os melhores por subreddit

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

    // Ordena por score e filtra mínimo
    const filtered = data.data.children
      .filter((p) => p.data.score >= MIN_SCORE)
      .sort((a, b) => b.data.score - a.data.score)
      .slice(0, MAX_KEEP);

    for (const post of filtered) {
      const { title, selftext, url: postUrl, permalink, is_self } = post.data;
      const finalUrl = is_self
        ? `https://reddit.com${permalink}`
        : (postUrl ?? `https://reddit.com${permalink}`);

      items.push({
        title,
        summary: (selftext ?? "").slice(0, 500) || title,
        url: finalUrl,
        source: SOURCE,
        topicSlug: sub.topicSlug,
        collectedAt: new Date(),
      });
    }
  }

  return {
    items,
    result: { source: SOURCE, status: "success", itemsCollected: items.length, itemsSkipped: 0 },
  };
}
