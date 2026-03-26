import { CollectedItem, CollectorResult } from "../types";

const API_BASE = "https://api.semanticscholar.org/graph/v1";
const SOURCE = "Semantic Scholar";

// Foco em papers com impacto real — citados por outros trabalhos
const QUERIES: { query: string; topicSlug: string }[] = [
  { query: "LLM fine-tuning production", topicSlug: "infraestrutura" },
  { query: "AI regulation compliance risk", topicSlug: "regulamentacao" },
  { query: "machine learning business application ROI", topicSlug: "geral" },
];

const LIMIT_PER_QUERY = 10;
const MIN_CITATIONS = 1; // ao menos 1 citação = algum reconhecimento acadêmico

interface SSPaper {
  paperId: string;
  title?: string;
  abstract?: string;
  url?: string;
  externalIds?: { ArXiv?: string };
  citationCount?: number;
  year?: number;
  publicationDate?: string;
}

interface SSResponse {
  data: SSPaper[];
}

export async function collectSemanticScholar(
  signal?: AbortSignal
): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  const seen = new Set<string>();
  const items: CollectedItem[] = [];

  for (const { query, topicSlug } of QUERIES) {
    const url =
      `${API_BASE}/paper/search` +
      `?query=${encodeURIComponent(query)}` +
      `&fields=title,abstract,externalIds,url,citationCount,year,publicationDate` +
      `&limit=${LIMIT_PER_QUERY}`;

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Semantic Scholar HTTP ${response.status}`);

    const data = (await response.json()) as SSResponse;

    // Filtra por citações mínimas e ordena pelos mais citados
    const filtered = (data.data ?? [])
      .filter((p) => (p.citationCount ?? 0) >= MIN_CITATIONS)
      .sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0));

    for (const paper of filtered) {
      const itemUrl =
        paper.url ??
        (paper.externalIds?.ArXiv
          ? `https://arxiv.org/abs/${paper.externalIds.ArXiv}`
          : null) ??
        `https://www.semanticscholar.org/paper/${paper.paperId}`;

      if (seen.has(itemUrl)) continue;
      seen.add(itemUrl);

      const title = paper.title ?? "";
      if (!title) continue;

      const publishedAt = paper.publicationDate
        ? new Date(paper.publicationDate)
        : paper.year
        ? new Date(`${paper.year}-01-01`)
        : undefined;

      items.push({
        title,
        summary: (paper.abstract ?? "").slice(0, 500) || title,
        url: itemUrl,
        source: SOURCE,
        topicSlug,
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
