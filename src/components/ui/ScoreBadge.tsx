import { getScoreLevel } from "@/lib/scoring/levels";

interface ScoreBadgeProps {
  total: number;
}

export function ScoreBadge({ total }: ScoreBadgeProps) {
  const level = getScoreLevel(total);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${level.colorClass}`}
    >
      {level.label}
    </span>
  );
}
