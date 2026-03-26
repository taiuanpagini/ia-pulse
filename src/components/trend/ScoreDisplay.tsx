import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ScoreOriginBadge } from "@/components/scoring/ScoreOriginBadge";
import { TrendScoreDetail } from "@/lib/trends/service";

const CRITERIA_LABELS: Record<keyof Omit<TrendScoreDetail, "total" | "level" | "scoredBy" | "scoredAt" | "notes">, string> = {
  maturity: "Maturidade Tecnológica",
  applicability: "Aplicabilidade Imediata",
  competitiveImpact: "Impacto Competitivo",
  strategicAlignment: "Alinhamento Estratégico",
  adoptionComplexity: "Complexidade de Adoção",
};

interface ScoreDisplayProps {
  score: TrendScoreDetail | null | undefined;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  if (!score) return null;

  const criteria = Object.entries(CRITERIA_LABELS) as [
    keyof typeof CRITERIA_LABELS,
    string,
  ][];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <ScoreBadge total={score.total} />
        <span className="text-lg font-semibold text-zinc-100 font-mono">
          {score.total.toFixed(2)}
          <span className="text-sm text-zinc-500 font-normal"> / 5.00</span>
        </span>
        <ScoreOriginBadge scoredBy={score.scoredBy} />
      </div>

      <table className="w-full text-sm">
        <tbody className="divide-y divide-zinc-800">
          {criteria.map(([key, label]) => (
            <tr key={key}>
              <td className="py-1.5 text-zinc-400">{label}</td>
              <td className="py-1.5 text-right font-mono text-zinc-200 w-12">{score[key]} / 5</td>
            </tr>
          ))}
        </tbody>
      </table>

      {score.notes && (
        <p className="text-xs text-zinc-400 border-t border-zinc-800 pt-3">{score.notes}</p>
      )}
    </div>
  );
}
