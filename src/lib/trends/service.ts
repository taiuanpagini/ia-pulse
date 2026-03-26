import { connectDB } from "@/lib/mongodb/client";
import { TrendFilters, TrendListItem, TrendListResponse } from "./schemas";
import {
  buildTrendQuery,
  findTrendsPaginated,
  listDistinctSources,
  getScoredTrends,
  getUnscoredTrends,
  getTrendById,
} from "./repository";
import { findAllTopics, findTopicBySlug } from "@/lib/topics/repository";
import { ITopic } from "@/lib/mongodb/models/Topic";
import { ITrend } from "@/lib/mongodb/models/Trend";
import { getScoreLevel, ScoreLevel } from "@/lib/scoring/levels";

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

export interface ScoredTrendCard {
  id: string;
  title: string;
  titlePt?: string;
  source: string;
  topicSlug: string;
  topicName: string;
  topicColor: string;
  collectedAt: string;
  lang?: string;
  score: {
    total: number;
    level: ScoreLevel;
    scoredBy: "manual" | "llm";
  };
}

export interface UnscoredTrendCard {
  id: string;
  title: string;
  titlePt?: string;
  source: string;
  topicSlug: string;
  topicName: string;
  topicColor: string;
  collectedAt: string;
  lang?: string;
}

export interface TrendScoreDetail {
  maturity: number;
  applicability: number;
  competitiveImpact: number;
  strategicAlignment: number;
  adoptionComplexity: number;
  total: number;
  level: ScoreLevel;
  scoredBy: "manual" | "llm";
  scoredAt: string;
  notes?: string;
}

export interface TrendDetail {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  topicSlug: string;
  topicName: string;
  topicColor: string;
  collectedAt: string;
  score?: TrendScoreDetail;
}

export interface DashboardData {
  scored: ScoredTrendCard[];
  unscored: UnscoredTrendCard[];
  scoredTotal: number;
  unscoredTotal: number;
}

export async function getDashboardData(
  topicFilter?: string | null,
  search?: string | null,
  page = 1
): Promise<DashboardData> {
  await connectDB();

  const [scoredResult, unscoredResult, topics] = await Promise.all([
    getScoredTrends(topicFilter, search, page),
    getUnscoredTrends(topicFilter, search, page),
    findAllTopics(),
  ]);

  const scoredRaw = scoredResult.items;
  const unscoredRaw = unscoredResult.items;

  const topicMap = new Map<string, ITopic>(topics.map((t) => [t.slug, t]));

  function isoDate(d: unknown): string {
    if (d instanceof Date) return d.toISOString();
    return String(d);
  }

  const scored: ScoredTrendCard[] = (scoredRaw as Array<ITrend & { _id: unknown }>)
    .filter((t) => t.score != null)
    .map((t) => {
      const topic = topicMap.get(t.topicSlug);
      const levelConfig = getScoreLevel(t.score!.total);
      return {
        id: String(t._id),
        title: t.title,
        titlePt: t.titlePt,
        lang: t.lang,
        source: t.source,
        topicSlug: t.topicSlug,
        topicName: topic?.name ?? t.topicSlug,
        topicColor: topic?.color ?? "blue",
        collectedAt: isoDate(t.collectedAt),
        score: {
          total: t.score!.total,
          level: levelConfig.level,
          scoredBy: t.score!.scoredBy,
        },
      };
    });

  const unscored: UnscoredTrendCard[] = (unscoredRaw as Array<ITrend & { _id: unknown }>).map((t) => {
    const topic = topicMap.get(t.topicSlug);
    return {
      id: String(t._id),
      title: t.title,
      titlePt: t.titlePt,
      lang: t.lang,
      source: t.source,
      topicSlug: t.topicSlug,
      topicName: topic?.name ?? t.topicSlug,
      topicColor: topic?.color ?? "blue",
      collectedAt: isoDate(t.collectedAt),
    };
  });

  return { scored, unscored, scoredTotal: scoredResult.total, unscoredTotal: unscoredResult.total };
}

export async function getTrendDetail(id: string): Promise<TrendDetail | null> {
  await connectDB();

  const trend = (await getTrendById(id)) as (ITrend & { _id: unknown }) | null;
  if (!trend) return null;

  const topic = await findTopicBySlug(trend.topicSlug);

  function isoDate(d: unknown): string {
    if (d instanceof Date) return d.toISOString();
    return String(d);
  }

  const score: TrendScoreDetail | undefined = trend.score
    ? {
        maturity: trend.score.maturity,
        applicability: trend.score.applicability,
        competitiveImpact: trend.score.competitiveImpact,
        strategicAlignment: trend.score.strategicAlignment,
        adoptionComplexity: trend.score.adoptionComplexity,
        total: trend.score.total,
        level: getScoreLevel(trend.score.total).level,
        scoredBy: trend.score.scoredBy,
        scoredAt: isoDate(trend.score.scoredAt),
        notes: trend.score.notes,
      }
    : undefined;

  return {
    id: String(trend._id),
    title: trend.title,
    summary: trend.summary,
    url: trend.url,
    source: trend.source,
    topicSlug: trend.topicSlug,
    topicName: topic?.name ?? trend.topicSlug,
    topicColor: topic?.color ?? "blue",
    collectedAt: isoDate(trend.collectedAt),
    score,
  };
}
