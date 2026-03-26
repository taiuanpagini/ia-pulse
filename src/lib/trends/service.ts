import { connectDB } from "@/lib/mongodb/client";
import { TrendFilters, TrendListItem, TrendListResponse } from "./schemas";
import { buildTrendQuery, findTrendsPaginated, listDistinctSources } from "./repository";
import { findAllTopics } from "@/lib/topics/repository";
import { ITopic } from "@/lib/mongodb/models/Topic";
import { ITrend } from "@/lib/mongodb/models/Trend";

function toTrendListItem(
  trend: ITrend & { _id: unknown },
  topicMap: Map<string, ITopic>
): TrendListItem {
  const topic = topicMap.get(trend.topicSlug);
  return {
    id: String(trend._id),
    title: trend.title,
    summary: trend.summary,
    url: trend.url,
    source: trend.source,
    topicSlug: trend.topicSlug,
    topicName: topic?.name ?? trend.topicSlug,
    topicColor: topic?.color ?? "blue",
    collectedAt: trend.collectedAt instanceof Date
      ? trend.collectedAt.toISOString()
      : String(trend.collectedAt),
    score: trend.score
      ? { total: trend.score.total, scoredBy: trend.score.scoredBy }
      : null,
  };
}

export async function listTrends(filters: Partial<TrendFilters>): Promise<TrendListResponse> {
  await connectDB();

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  const query = buildTrendQuery(filters);
  const [{ items, total }, topics] = await Promise.all([
    findTrendsPaginated(query, page, limit),
    findAllTopics(),
  ]);

  const topicMap = new Map<string, ITopic>(
    topics.map((t) => [t.slug, t])
  );

  const data = (items as Array<ITrend & { _id: unknown }>).map((t) =>
    toTrendListItem(t, topicMap)
  );

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listSources(): Promise<string[]> {
  await connectDB();
  return listDistinctSources();
}
