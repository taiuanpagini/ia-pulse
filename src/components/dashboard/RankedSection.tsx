import { BarChart2 } from "lucide-react";
import { TrendCard } from "./TrendCard";
import { ScoredTrendCard } from "@/lib/trends/service";

interface RankedSectionProps {
  trends: ScoredTrendCard[];
}

export function RankedSection({ trends }: RankedSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Ranking de Tendências</h2>

      {trends.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-zinc-500">
          <BarChart2 className="h-10 w-10 opacity-40" />
          <p className="text-sm text-center max-w-xs">
            Nenhuma tendência avaliada ainda — avalie itens abaixo para que apareçam aqui
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
          {trends.map((t) => (
            <TrendCard key={t.id} variant="scored" {...t} />
          ))}
        </div>
      )}
    </section>
  );
}
