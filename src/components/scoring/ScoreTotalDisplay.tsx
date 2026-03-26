"use client";

import { ScoreBadge } from "@/components/ui/ScoreBadge";

interface ScoreTotalDisplayProps {
  total: number | null;
}

export function ScoreTotalDisplay({ total }: ScoreTotalDisplayProps) {
  if (total === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-600">—</span>
        <span className="text-xs text-gray-500">preencha todos os critérios</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-bold text-white">{total.toFixed(2)}</span>
      <ScoreBadge total={total} />
    </div>
  );
}
