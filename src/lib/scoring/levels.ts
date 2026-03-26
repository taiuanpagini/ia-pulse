export type ScoreLevel = "low" | "medium" | "high" | "critical";

export interface ScoreLevelConfig {
  label: string;
  level: ScoreLevel;
  min: number;
  max: number;
  colorClass: string;
}

export const SCORE_LEVEL_CONFIG: ScoreLevelConfig[] = [
  { level: "low", label: "Baixo", min: 1, max: 2.49, colorClass: "bg-gray-700 text-gray-200" },
  { level: "medium", label: "Médio", min: 2.5, max: 3.49, colorClass: "bg-blue-900 text-blue-200" },
  { level: "high", label: "Alto", min: 3.5, max: 4.49, colorClass: "bg-amber-900 text-amber-200" },
  { level: "critical", label: "Crítico", min: 4.5, max: 5, colorClass: "bg-red-900 text-red-200" },
];

export function getScoreLevel(total: number): ScoreLevelConfig {
  return (
    SCORE_LEVEL_CONFIG.find((c) => total >= c.min && total <= c.max) ??
    SCORE_LEVEL_CONFIG[0]
  );
}
