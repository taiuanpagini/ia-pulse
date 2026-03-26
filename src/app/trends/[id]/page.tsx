import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrendDetail } from "@/lib/trends/service";
import { TrendDetailHeader } from "@/components/trend/TrendDetailHeader";
import { ScoreDisplay } from "@/components/trend/ScoreDisplay";
import { TrendDetailClient } from "./TrendDetailClient";

export default async function TrendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trend = await getTrendDetail(id);

  if (!trend) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 md:px-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Voltar ao dashboard
        </Link>

        <TrendDetailHeader
          title={trend.title}
          summary={trend.summary}
          url={trend.url}
          source={trend.source}
          topicName={trend.topicName}
          topicColor={trend.topicColor}
          collectedAt={trend.collectedAt}
        />

        {trend.score && <ScoreDisplay score={trend.score} />}

        <TrendDetailClient
          trendId={trend.id}
          defaultValues={trend.score ? {
            maturity: trend.score.maturity,
            applicability: trend.score.applicability,
            competitiveImpact: trend.score.competitiveImpact,
            strategicAlignment: trend.score.strategicAlignment,
            adoptionComplexity: trend.score.adoptionComplexity,
            notes: trend.score.notes ?? "",
          } : undefined}
          showAutoScore={true}
        />
      </div>
    </main>
  );
}
