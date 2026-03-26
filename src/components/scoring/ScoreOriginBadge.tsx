interface ScoreOriginBadgeProps {
  scoredBy: "manual" | "llm";
}

export function ScoreOriginBadge({ scoredBy }: ScoreOriginBadgeProps) {
  if (scoredBy === "llm") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-900/40 border border-violet-700/40 px-3 py-0.5 text-xs text-violet-300">
        <span aria-hidden>🤖</span>
        Avaliado por IA
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-800 border border-gray-700 px-3 py-0.5 text-xs text-gray-300">
      <span aria-hidden>👤</span>
      Avaliação manual
    </span>
  );
}
