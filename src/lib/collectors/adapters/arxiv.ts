import { CollectedItem, CollectorResult } from "../types";

const ARXIV_BASE = "https://export.arxiv.org/api/query";
const SOURCE = "arXiv";

// Queries focadas em papers aplicados — deployment, ferramentas, otimização real
const QUERIES: { query: string; topicSlug: string }[] = [
  {
    query: "cat:cs.LG AND (ti:quantization OR ti:deployment OR ti:inference OR ti:optimization)",
    topicSlug: "infraestrutura",
  },
  {
    query: "cat:cs.LG AND (ti:regulation OR ti:privacy OR ti:compliance OR ti:governance)",
    topicSlug: "regulamentacao",
  },
];

// 3 por query = apenas os mais recentes com maior relevância
const MAX_PER_QUERY = 3;

function extractText(xml: string, tag: string): string {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i").exec(xml);
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : "";
}

function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "gi");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1].replace(/<[^>]+>/g, "").trim());
  }
  return results;
}

export async function collectArxiv(
  signal?: AbortSignal
): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  const seen = new Set<string>();
  const items: CollectedItem[] = [];

  for (const { query, topicSlug } of QUERIES) {
    const url =
      `${ARXIV_BASE}?search_query=${encodeURIComponent(query)}` +
      `&sortBy=submittedDate&sortOrder=descending` +
      `&max_results=${MAX_PER_QUERY}`;

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`arXiv HTTP ${response.status}`);

    const xml = await response.text();
    const entries = xml.split("<entry>").slice(1);

    for (const entry of entries) {
      const title = extractText(entry, "title");
      const summary = extractText(entry, "summary").slice(0, 500);
      const ids = extractAll(entry, "id");
      const id = ids[0] ?? "";

      if (!title || !id || seen.has(id)) continue;
      seen.add(id);

      const publishedRaw = extractText(entry, "published");
      const publishedAt = publishedRaw ? new Date(publishedRaw) : undefined;

      items.push({
        title,
        summary,
        url: id,
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
