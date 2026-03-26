import { TrendCard } from "./TrendCard";
import { UnscoredTrendCard } from "@/lib/trends/service";

interface AwaitingSectionProps {
  trends: UnscoredTrendCard[];
}

export function AwaitingSection({ trends }: AwaitingSectionProps) {
  if (trends.length === 0) return null;

  return (
    <section>
      <h2 className="text-base font-semibold text-zinc-400 mb-3">
        Aguardando avaliação ({trends.length})
      </h2>
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
        {trends.map((t) => (
          <TrendCard key={t.id} variant="unscored" {...t} />
        ))}
      </div>
    </section>
  );
}
