import { connectDB } from "@/lib/mongodb/client";
import { TrendFilters, TrendListItem, TrendListResponse } from "./schemas";
import {
  buildTrendQuery,
  findTrendsPaginated,
  listDistinctSources,
  getScoredTrends,
  getUnscoredTrends,
  getTrendById,
  getRankingTrends,
  getCarouselTrends,
  getTrendsByStatus,
  getTabCounts,
} from "./repository";
import { findAllTopics, findTopicBySlug } from "@/lib/topics/repository";
import { ITopic } from "@/lib/mongodb/models/Topic";
import { ITrend } from "@/lib/mongodb/models/Trend";
import { getScoreLevel, ScoreLevel } from "@/lib/scoring/levels";

// ── helpers ────────────────────────────────────────────────────

export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function isoDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString();
  return String(d);
}

// ── public types ───────────────────────────────────────────────

export type TrendStatus = "pending" | "approved" | "discarded";

export interface ScoredTrendCard {
  id: string;
  title: string;
  titlePt?: string;
  source: string;
  topicSlug: string;
  topicName: string;
  topicColor: string;
  collectedAt: string;
  publishedAt?: string;
  lang?: string;
  status?: TrendStatus;
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
  publishedAt?: string;
  lang?: string;
  status?: TrendStatus;
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
  titlePt?: string;
  summaryPt?: string;
  url: string;
  source: string;
  topicSlug: string;
  topicName: string;
  topicColor: string;
  collectedAt: string;
  publishedAt?: string;
  lang?: string;
  status?: TrendStatus;
  score?: TrendScoreDetail;
}

export interface TabCounts {
  ranking: number;
  approved: number;
  discarded: number;
  awaiting: number;
}

// ── mappers ────────────────────────────────────────────────────

function toScoredCard(t: ITrend & { _id: unknown }, topicMap: Map<string, ITopic>): ScoredTrendCard {
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
    publishedAt: t.publishedAt ? isoDate(t.publishedAt) : undefined,
    status: t.status,
    score: {
      total: t.score!.total,
      level: levelConfig.level,
      scoredBy: t.score!.scoredBy,
    },
  };
}

function toUnscoredCard(t: ITrend & { _id: unknown }, topicMap: Map<string, ITopic>): UnscoredTrendCard {
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
    publishedAt: t.publishedAt ? isoDate(t.publishedAt) : undefined,
    status: t.status,
  };
}

// ── public API listing ─────────────────────────────────────────

function toTrendListItem(t: ITrend & { _id: unknown }, topicMap: Map<string, ITopic>): TrendListItem {
  const topic = topicMap.get(t.topicSlug);
  return {
    id: String(t._id),
    title: t.title,
    summary: t.summary,
    url: t.url,
    source: t.source,
    topicSlug: t.topicSlug,
    topicName: topic?.name ?? t.topicSlug,
    topicColor: topic?.color ?? "blue",
    collectedAt: isoDate(t.collectedAt),
    score: t.score ? { total: t.score.total, scoredBy: t.score.scoredBy } : null,
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
  const topicMap = new Map<string, ITopic>(topics.map((t) => [t.slug, t]));
  return {
    data: (items as unknown as Array<ITrend & { _id: unknown }>).map((t) => toTrendListItem(t, topicMap)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listSources(): Promise<string[]> {
  await connectDB();
  return listDistinctSources();
}

// ── dashboard tabs ─────────────────────────────────────────────

export async function fetchTabCounts(
  month: string,
  topicSlug?: string | null
): Promise<TabCounts> {
  await connectDB();
  return getTabCounts(month, topicSlug);
}

export async function getRankingData(
  month: string,
  topicSlug?: string | null,
  search?: string | null,
  page = 1
): Promise<{ carousel: ScoredTrendCard[]; trends: ScoredTrendCard[]; total: number }> {
  await connectDB();
  const [carouselRaw, gridResult, topics] = await Promise.all([
    getCarouselTrends(month, topicSlug, 10),
    getRankingTrends(month, topicSlug, search, page),
    findAllTopics(),
  ]);
  const topicMap = new Map<string, ITopic>(topics.map((t) => [t.slug, t]));
  const carousel = (carouselRaw as unknown as Array<ITrend & { _id: unknown }>)
    .filter((t) => t.score != null)
    .map((t) => toScoredCard(t, topicMap));
  const trends = (gridResult.items as unknown as Array<ITrend & { _id: unknown }>)
    .filter((t) => t.score != null)
    .map((t) => toScoredCard(t, topicMap));
  return { carousel, trends, total: gridResult.total };
}

export async function getStatusTabData(
  status: "approved" | "discarded",
  topicSlug?: string | null,
  search?: string | null,
  page = 1
): Promise<{ trends: (ScoredTrendCard | UnscoredTrendCard)[]; total: number }> {
  await connectDB();
  const [result, topics] = await Promise.all([
    getTrendsByStatus(status, topicSlug, search, page),
    findAllTopics(),
  ]);
  const topicMap = new Map<string, ITopic>(topics.map((t) => [t.slug, t]));
  const trends = (result.items as unknown as Array<ITrend & { _id: unknown }>).map((t) =>
    t.score != null ? toScoredCard(t, topicMap) : toUnscoredCard(t, topicMap)
  );
  return { trends, total: result.total };
}

export async function getAwaitingData(
  topicSlug?: string | null,
  search?: string | null,
  page = 1
): Promise<{ trends: UnscoredTrendCard[]; total: number }> {
  await connectDB();
  const [result, topics] = await Promise.all([
    getUnscoredTrends(topicSlug, search, page),
    findAllTopics(),
  ]);
  const topicMap = new Map<string, ITopic>(topics.map((t) => [t.slug, t]));
  const trends = (result.items as unknown as Array<ITrend & { _id: unknown }>).map((t) =>
    toUnscoredCard(t, topicMap)
  );
  return { trends, total: result.total };
}

// ── legacy (kept for backward compat with existing API routes) ─

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
  const topicMap = new Map<string, ITopic>(topics.map((t) => [t.slug, t]));
  const scored = (scoredResult.items as unknown as Array<ITrend & { _id: unknown }>)
    .filter((t) => t.score != null)
    .map((t) => toScoredCard(t, topicMap));
  const unscored = (unscoredResult.items as unknown as Array<ITrend & { _id: unknown }>).map((t) =>
    toUnscoredCard(t, topicMap)
  );
  return {
    scored,
    unscored,
    scoredTotal: scoredResult.total,
    unscoredTotal: unscoredResult.total,
  };
}

// ── trend detail ───────────────────────────────────────────────

export async function getTrendDetail(id: string): Promise<TrendDetail | null> {
  await connectDB();
  const trend = (await getTrendById(id)) as (ITrend & { _id: unknown }) | null;
  if (!trend) return null;
  const topic = await findTopicBySlug(trend.topicSlug);

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
    titlePt: trend.titlePt,
    summaryPt: trend.summaryPt,
    url: trend.url,
    source: trend.source,
    topicSlug: trend.topicSlug,
    topicName: topic?.name ?? trend.topicSlug,
    topicColor: topic?.color ?? "blue",
    collectedAt: isoDate(trend.collectedAt),
    publishedAt: trend.publishedAt ? isoDate(trend.publishedAt) : undefined,
    lang: trend.lang,
    status: trend.status,
    score,
  };
}
