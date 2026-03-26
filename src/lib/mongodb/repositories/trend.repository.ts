import { Trend } from "../models/Trend";
import { CollectedItem } from "@/lib/collectors/types";

export interface UpsertResult {
  inserted: number;
  skipped: number;
}

export async function upsertTrends(items: CollectedItem[]): Promise<UpsertResult> {
  if (items.length === 0) return { inserted: 0, skipped: 0 };

  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    const res = await Trend.updateOne(
      { url: item.url },
      {
        $setOnInsert: {
          title: item.title,
          summary: item.summary,
          url: item.url,
          source: item.source,
          topicSlug: item.topicSlug,
          collectedAt: item.collectedAt,
        },
      },
      { upsert: true }
    );

    if (res.upsertedCount > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  return { inserted, skipped };
}
