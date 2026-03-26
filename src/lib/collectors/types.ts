export interface CollectedItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  topicSlug: string;
  collectedAt: Date;
}

export type CollectorStatus = "success" | "partial" | "error";

export interface CollectorResult {
  source: string;
  status: CollectorStatus;
  itemsCollected: number;
  itemsSkipped: number;
  error?: string;
}
