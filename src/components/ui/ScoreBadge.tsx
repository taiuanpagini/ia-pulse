import Chip from "@mui/material/Chip";
import { getScoreLevel } from "@/lib/scoring/levels";

// Crítico = maior score = destaque com amarelo brand
const levelStyles: Record<string, { bg: string; color: string; dot: string }> = {
  low:      { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  medium:   { bg: "#FFE4F0", color: "#D2006F", dot: "#D2006F" },
  high:     { bg: "#F3E8FF", color: "#68009F", dot: "#68009F" },
  critical: { bg: "#FFF9E0", color: "#92600A", dot: "#FDC500" },
};

interface ScoreBadgeProps {
  total: number;
}

export function ScoreBadge({ total }: ScoreBadgeProps) {
  const level = getScoreLevel(total);
  const s = levelStyles[level.level] ?? levelStyles.low;

  return (
    <Chip
      label={
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.dot, display: "inline-block", flexShrink: 0 }} />
          {level.label}
        </span>
      }
      size="small"
      sx={{
        bgcolor: s.bg,
        color: s.color,
        fontWeight: 700,
        fontSize: "0.68rem",
        height: 22,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}
