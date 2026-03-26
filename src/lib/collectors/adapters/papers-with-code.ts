import { CollectedItem, CollectorResult } from "../types";

const API_BASE = "https://paperswithcode.com/api/v1";
const SOURCE = "Papers With Code";
const TOPIC_SLUG = "infraestrutura";

interface PWCPaper {
  id: string;
  title?: string;
  abstract?: string;
  url_abs?: string;
  url_pdf?: string;
}

interface PWCResponse {
  results: PWCPaper[];
}

export async function collectPapersWithCode(signal?: AbortSignal): Promise<{ items: CollectedItem[]; result: CollectorResult }> {
  const url = `${API_BASE}/papers/?ordering=-published&items_per_page=20`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Papers With Code HTTP ${response.status}`);

  const data = (await response.json()) as PWCResponse;
  const items: CollectedItem[] = [];

  for (const paper of data.results) {
    const itemUrl = paper.url_abs ?? paper.url_pdf ?? `https://paperswithcode.com/paper/${paper.id}`;
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
