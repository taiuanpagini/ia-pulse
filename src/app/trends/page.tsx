import { Suspense } from "react";
import { connectDB } from "@/lib/mongodb/client";
import { TrendFiltersSchema } from "@/lib/trends/schemas";
import { listTrends, listSources } from "@/lib/trends/service";
import { findAllTopics } from "@/lib/topics/repository";
import { TrendList } from "./_components/TrendList";
import { TrendFilters } from "./_components/TrendFilters";
import Link from "next/link";

interface TrendsPageProps {
  searchParams: Promise<Record<string, string | string[]>>;
}

export default async function TrendsPage({ searchParams }: TrendsPageProps) {
  const params = await searchParams;

  const parsed = TrendFiltersSchema.safeParse(params);
  const filters = parsed.success ? parsed.data : { page: 1, limit: 20 };

  await connectDB();
  const [result, topics, sources] = await Promise.all([
    listTrends(filters),
    findAllTopics(),
    listSources(),
  ]);

  const topicsForFilter = topics.map((t) => ({
    slug: t.slug,
    name: t.name,
    color: t.color,
  }));

  const { data, pagination } = result;
  const page = filters.page ?? 1;

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tendências em IA</h1>
            <p className="text-sm text-gray-400 mt-1">
              {pagination.total} tendências coletadas
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-16 rounded-lg bg-gray-800 animate-pulse" />}>
          <TrendFilters topics={topicsForFilter} sources={sources} />
        </Suspense>

        {/* List */}
        <TrendList trends={data} />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-gray-500">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <PaginationLink
                  params={params}
                  page={page - 1}
                  label="← Anterior"
                />
              )}
              {page < pagination.totalPages && (
                <PaginationLink
                  params={params}
                  page={page + 1}
                  label="Próxima →"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function PaginationLink({
  params,
  page,
  label,
}: {
  params: Record<string, string | string[]>;
  page: number;
  label: string;
}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => !Array.isArray(v))
        .map(([k, v]) => [k, String(v)])
    )
  );
  qs.set("page", String(page));
  return (
    <Link
      href={`/trends?${qs.toString()}`}
      className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
    >
      {label}
    </Link>
  );
}
