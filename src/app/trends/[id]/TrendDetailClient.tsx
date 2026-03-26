"use client";

import { useRouter } from "next/navigation";
import { ScoreForm } from "@/components/scoring/ScoreForm";
import { ScoreFormValues } from "@/lib/scoring/schemas";

interface TrendDetailClientProps {
  trendId: string;
  defaultValues?: Partial<ScoreFormValues>;
  showAutoScore?: boolean;
}

export function TrendDetailClient({
  trendId,
  defaultValues,
  showAutoScore = false,
}: TrendDetailClientProps) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-base font-semibold text-zinc-100 mb-5">Avaliação</h2>
      <ScoreForm
        trendId={trendId}
        defaultValues={defaultValues}
        showAutoScore={showAutoScore}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
