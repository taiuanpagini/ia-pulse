import { CollectedItem, CollectorResult } from "../types";

const API_BASE = "https://paperswithcode.com/api/v1";
const SOURCE = "Papers With Code";
const TOPIC_SLUG = "infraestrutura";

// Apenas 5 papers com implementação pública — altamente práticos para PoC
const ITEMS_PER_PAGE = 5;

interface PWCPaper {
  id: string;
  title?: string;
  abstract?: string;
  url_abs?: string;
  url_pdf?: string;
  github_link?: string | null;
  stars?: number | null;
  published?: string;
}

interface PWCResponse {
  results: PWCPaper[];
}

export async function collectPapersWithCode(
  signal?: AbortSignal
): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  // papers com github_link = implementação pública; ordenados por github_link (mais linkados = mais impacto)
  const url = `${API_BASE}/papers/?ordering=-github_link&items_per_page=${ITEMS_PER_PAGE}`;
  const response = await fetch(url, {
    signal,
    headers: { "User-Agent": "IAPulse/1.0 (AI monitoring bot; github.com/iapulse)" },
  });
  if (!response.ok) throw new Error(`Papers With Code HTTP ${response.status}`);

  const data = (await response.json()) as PWCResponse;
  const items: CollectedItem[] = [];

  for (const paper of data.results) {
    if (!paper.github_link) continue; // exige implementação pública
    const itemUrl = paper.url_abs ?? paper.url_pdf ?? `https://paperswithcode.com/paper/${paper.id}`;
    const title = paper.title ?? "";
    if (!title) continue;

    const publishedAt = paper.published ? new Date(paper.published) : undefined;

    items.push({
      title,
      summary: (paper.abstract ?? "").slice(0, 500) || title,
      url: itemUrl,
      source: SOURCE,
      topicSlug: TOPIC_SLUG,
      collectedAt: new Date(),
      publishedAt,
    });
  }

  return {
    items,
    result: { source: SOURCE, status: "success", itemsCollected: items.length, itemsSkipped: 0 },
  };
}
