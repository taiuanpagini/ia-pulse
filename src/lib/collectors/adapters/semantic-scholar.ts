import { CollectedItem, CollectorResult } from "../types";

const API_BASE = "https://api.semanticscholar.org/graph/v1";
const SOURCE = "Semantic Scholar";
const TOPIC_SLUG = "infraestrutura";
const QUERIES = ["large language model", "machine learning hardware", "model quantization"];

interface SSPaper {
  paperId: string;
  title?: string;
  abstract?: string;
  url?: string;
  externalIds?: { ArXiv?: string };
}

interface SSResponse {
  data: SSPaper[];
}

export async function collectSemanticScholar(signal?: AbortSignal): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  const seen = new Set<string>();
  const items: CollectedItem[] = [];

  for (const query of QUERIES) {
    const url = `${API_BASE}/paper/search?query=${encodeURIComponent(query)}&fields=title,abstract,externalIds,url&limit=10`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Semantic Scholar HTTP ${response.status}`);

    const data = (await response.json()) as SSResponse;

    for (const paper of data.data) {
      const itemUrl =
        paper.url ??
        (paper.externalIds?.ArXiv ? `https://arxiv.org/abs/${paper.externalIds.ArXiv}` : null) ??
        `https://www.semanticscholar.org/paper/${paper.paperId}`;

      if (seen.has(itemUrl)) continue;
      seen.add(itemUrl);

      const title = paper.title ?? "";
      if (!title) continue;

      items.push({
        title,
        summary: (paper.abstract ?? "").slice(0, 500) || title,
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
