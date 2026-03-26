import { CollectedItem, CollectorResult } from "../types";

const ARXIV_BASE = "https://export.arxiv.org/api/query";
const CATEGORIES = ["cs.LG", "cs.AR"];
const MAX_RESULTS = 20;
const TOPIC_SLUG = "infraestrutura";
const SOURCE = "arXiv";

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

export async function collectArxiv(signal?: AbortSignal): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  const items: CollectedItem[] = [];
  let totalFetched = 0;

  for (const category of CATEGORIES) {
    const url = `${ARXIV_BASE}?search_query=cat:${category}&sortBy=submittedDate&sortOrder=descending&max_results=${MAX_RESULTS}`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`arXiv HTTP ${response.status}`);

    const xml = await response.text();
    const entries = xml.split("<entry>").slice(1);

    for (const entry of entries) {
      const title = extractText(entry, "title");
      const summary = extractText(entry, "summary").slice(0, 500);
      const ids = extractAll(entry, "id");
      const id = ids[0] ?? "";

      if (!title || !id) continue;

      items.push({
        title,
        summary,
        url: id,
        source: SOURCE,
        topicSlug: TOPIC_SLUG,
        collectedAt: new Date(),
      });
      totalFetched++;
    }
  }

  return {
    items,
    result: {
      source: SOURCE,
      status: "success",
      itemsCollected: totalFetched,
      itemsSkipped: 0,
    },
  };
}
