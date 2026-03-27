import { FilterQuery } from "mongoose";
import mongoose from "mongoose";
import { Trend, ITrend } from "@/lib/mongodb/models/Trend";
import { TrendFilters } from "./schemas";

// ── helpers ────────────────────────────────────────────────────

export function buildTrendQuery(filters: Partial<TrendFilters>): FilterQuery<ITrend> {
  const query: FilterQuery<ITrend> = { deletedAt: null };

  if (filters.topic) {
    const topics = Array.isArray(filters.topic) ? filters.topic : [filters.topic];
    query.topicSlug = { $in: topics };
  }
  if (filters.source) query.source = filters.source;
  if (filters.period) {
    const msMap: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30, "90d": 90 };
    const days = msMap[filters.period] ?? 0;
    if (days > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      query.collectedAt = { $gte: cutoff };
    }
  }
  return query;
}

function searchFilter(search?: string | null): FilterQuery<ITrend> {
  if (!search || search.trim().length < 2) return {};
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    $or: [
      { title: { $regex: escaped, $options: "i" } },
      { titlePt: { $regex: escaped, $options: "i" } },
      { summary: { $regex: escaped, $options: "i" } },
    ],
  };
}

// Parse "YYYY-MM" → { $gte, $lt } on collectedAt
function monthFilter(month?: string | null): FilterQuery<ITrend> {
  if (!month) return {};
  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10) - 1;
  if (isNaN(year) || isNaN(m)) return {};
  return {
    collectedAt: {
      $gte: new Date(year, m, 1),
      $lt: new Date(year, m + 1, 1),
    },
  };
}

// Scored trends not yet approved/discarded (null = legacy = treated as pending)
const RANKING_STATUS_FILTER: FilterQuery<ITrend> = {
  status: { $nin: ["approved", "discarded"] },
};

// ── existing (public API listing) ─────────────────────────────

export async function findTrendsPaginated(query: FilterQuery<ITrend>, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Trend.find(query).sort({ collectedAt: -1 }).skip(skip).limit(limit).lean(),
    Trend.countDocuments(query),
  ]);
  return { items, total };
}

export async function listDistinctSources(): Promise<string[]> {
  return Trend.distinct("source", { deletedAt: null });
}

// ── ranking tab ────────────────────────────────────────────────

export async function getRankingTrends(
  month: string,
  topicSlug?: string | null,
  search?: string | null,
  page = 1,
  limit = 24
) {
  const skip = (page - 1) * limit;
  const filter: FilterQuery<ITrend> = {
    score: { $exists: true },
    deletedAt: null,
    ...RANKING_STATUS_FILTER,
    ...monthFilter(month),
    ...(topicSlug ? { topicSlug } : {}),
    ...searchFilter(search),
  };
  const [items, total] = await Promise.all([
    Trend.find(filter).sort({ "score.total": -1 }).skip(skip).limit(limit).lean(),
    Trend.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getCarouselTrends(
  month: string,
  topicSlug?: string | null,
  limit = 10
) {
  const filter: FilterQuery<ITrend> = {
    score: { $exists: true },
    deletedAt: null,
    ...RANKING_STATUS_FILTER,
    ...monthFilter(month),
    ...(topicSlug ? { topicSlug } : {}),
  };
  return Trend.find(filter).sort({ "score.total": -1 }).limit(limit).lean();
}

// ── status tabs (approved / discarded) ────────────────────────
// Inclui tendências com e sem score — a única condição é o status

export async function getTrendsByStatus(
  status: "approved" | "discarded",
  topicSlug?: string | null,
  search?: string | null,
  page = 1,
  limit = 24
) {
  const skip = (page - 1) * limit;
  const filter: FilterQuery<ITrend> = {
    status,
    deletedAt: null,
    ...(topicSlug ? { topicSlug } : {}),
    ...searchFilter(search),
  };
  const [items, total] = await Promise.all([
    // Scored first (desc by score), then unscored by date
    Trend.find(filter).sort({ "score.total": -1, collectedAt: -1 }).skip(skip).limit(limit).lean(),
    Trend.countDocuments(filter),
  ]);
  return { items, total };
}

// ── unscored (awaiting) ────────────────────────────────────────
// Exclui itens que já foram aprovados ou descartados sem avaliação

export async function getUnscoredTrends(
  topicSlug?: string | null,
  search?: string | null,
  page = 1,
  limit = 24
) {
  const skip = (page - 1) * limit;
  const filter: FilterQuery<ITrend> = {
    score: { $exists: false },
    status: { $nin: ["approved", "discarded"] },
    deletedAt: null,
    ...(topicSlug ? { topicSlug } : {}),
    ...searchFilter(search),
  };
  const [items, total] = await Promise.all([
    Trend.find(filter).sort({ collectedAt: -1 }).skip(skip).limit(limit).lean(),
    Trend.countDocuments(filter),
  ]);
  return { items, total };
}

// ── tab counts ─────────────────────────────────────────────────

export async function getTabCounts(
  month: string,
  topicSlug?: string | null
): Promise<{ ranking: number; approved: number; discarded: number; awaiting: number }> {
  const topicFilter = topicSlug ? { topicSlug } : {};
  const [ranking, approved, discarded, awaiting] = await Promise.all([
    Trend.countDocuments({
      score: { $exists: true },
      deletedAt: null,
      ...RANKING_STATUS_FILTER,
      ...monthFilter(month),
      ...topicFilter,
    }),
    Trend.countDocuments({ status: "approved", deletedAt: null, ...topicFilter }),
    Trend.countDocuments({ status: "discarded", deletedAt: null, ...topicFilter }),
    Trend.countDocuments({ score: { $exists: false }, status: { $nin: ["approved", "discarded"] }, deletedAt: null, ...topicFilter }),
  ]);
  return { ranking, approved, discarded, awaiting };
}

// ── legacy (used by public API routes) ────────────────────────

export async function getScoredTrends(
  topicSlug?: string | null,
  search?: string | null,
  page = 1,
  limit = 24
) {
  const skip = (page - 1) * limit;
  const filter: FilterQuery<ITrend> = {
    score: { $exists: true },
    deletedAt: null,
    ...(topicSlug ? { topicSlug } : {}),
    ...searchFilter(search),
  };
  const [items, total] = await Promise.all([
    Trend.find(filter).sort({ "score.total": -1 }).skip(skip).limit(limit).lean(),
    Trend.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getTrendById(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Trend.findOne({ _id: id, deletedAt: null }).lean();
}
