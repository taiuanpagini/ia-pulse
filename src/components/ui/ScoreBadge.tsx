import Chip from "@mui/material/Chip";
import { getScoreLevel } from "@/lib/scoring/levels";

const levelColors: Record<string, { bg: string; color: string }> = {
  low:      { bg: "#f1f5f9", color: "#64748b" },
  medium:   { bg: "#fef9c3", color: "#a16207" },
  high:     { bg: "#dbeafe", color: "#1d4ed8" },
  critical: { bg: "#fee2e2", color: "#b91c1c" },
};

interface ScoreBadgeProps {
  total: number;
}

export function ScoreBadge({ total }: ScoreBadgeProps) {
  const level = getScoreLevel(total);
  const c = levelColors[level.level] ?? levelColors.low;
  return (
    <Chip
      label={level.label}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 22,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}
