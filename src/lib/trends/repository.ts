import { FilterQuery } from "mongoose";
import { Trend, ITrend } from "@/lib/mongodb/models/Trend";
import { TrendFilters } from "./schemas";

export function buildTrendQuery(filters: Partial<TrendFilters>): FilterQuery<ITrend> {
  const query: FilterQuery<ITrend> = { deletedAt: null };

  if (filters.topic) {
    const topics = Array.isArray(filters.topic) ? filters.topic : [filters.topic];
    query.topicSlug = { $in: topics };
  }

  if (filters.source) {
    query.source = filters.source;
  }

  if (filters.period) {
    const msMap: Record<string, number> = {
      "1d": 1,
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };
    const days = msMap[filters.period] ?? 0;
    if (days > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      query.collectedAt = { $gte: cutoff };
    }
  }

  return query;
}

export async function findTrendsPaginated(
  query: FilterQuery<ITrend>,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Trend.find(query)
      .sort({ collectedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Trend.countDocuments(query),
  ]);
  return { items, total };
}

export async function listDistinctSources(): Promise<string[]> {
  return Trend.distinct("source", { deletedAt: null });
}
