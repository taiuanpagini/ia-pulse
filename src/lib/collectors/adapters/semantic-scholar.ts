import { CollectedItem, CollectorResult } from "../types";

const API_BASE = "https://api.semanticscholar.org/graph/v1";
const SOURCE = "Semantic Scholar";

const QUERIES: { query: string; topicSlug: string; minCitations?: number }[] = [
  { query: "LLM fine-tuning production enterprise", topicSlug: "infraestrutura" },
  // Regulação tem menos papers citados em 12 meses — threshold menor
  { query: "AI regulation governance policy risk", topicSlug: "regulamentacao", minCitations: 5 },
  { query: "LLM deployment inference optimization enterprise", topicSlug: "infraestrutura" },
];

const LIMIT_PER_QUERY = 8;

// >= 10 citações padrão; cada query pode sobrescrever com minCitations
const DEFAULT_MIN_CITATIONS = 10;

// Apenas papers dos últimos 12 meses
function minPublicationDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

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

  for (let idx = 0; idx < QUERIES.length; idx++) {
    const { query, topicSlug, minCitations = DEFAULT_MIN_CITATIONS } = QUERIES[idx];
    // Delay entre queries para evitar rate limit 429 (API pública sem key)
    if (idx > 0) await new Promise((r) => setTimeout(r, 1500));

    const url =
      `${API_BASE}/paper/search` +
      `?query=${encodeURIComponent(query)}` +
      `&fields=title,abstract,externalIds,url,citationCount,year,publicationDate` +
      `&publicationDateOrYear=${minPublicationDate()}:` +
      `&limit=${LIMIT_PER_QUERY}`;

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Semantic Scholar HTTP ${response.status}`);

    const data = (await response.json()) as SSResponse;

    const filtered = (data.data ?? [])
      .filter((p) => (p.citationCount ?? 0) >= minCitations)
      .sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0))
      .slice(0, 3);

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
