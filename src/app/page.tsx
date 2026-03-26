import { Suspense } from "react";
import { getDashboardData } from "@/lib/trends/service";
import { listTopics } from "@/lib/topics/service";
import { RankedSection } from "@/components/dashboard/RankedSection";
import { AwaitingSection } from "@/components/dashboard/AwaitingSection";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { TopicFilterBar } from "@/components/dashboard/TopicFilterBar";

interface HomeSearchParams {
  topic?: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const { topic } = await searchParams;
  const [{ scored, unscored }, topics] = await Promise.all([
    getDashboardData(topic ?? null),
    listTopics(),
  ]);

  const isEmpty = scored.length === 0 && unscored.length === 0;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">IAPulse</h1>
        </div>

        <Suspense fallback={null}>
          <TopicFilterBar topics={topics} active={topic} />
        </Suspense>

        {isEmpty ? (
          <DashboardEmptyState />
        ) : (
          <>
            <RankedSection trends={scored} />
            <AwaitingSection trends={unscored} />
          </>
        )}
      </div>
    </main>
  );
}
