import Chip from "@mui/material/Chip";
import { getScoreLevel } from "@/lib/scoring/levels";

const levelStyles: Record<string, { bg: string; color: string; dot: string }> = {
  low: {
    bg: "#f1f5f9",
    color: "#475569",
    dot: "#94a3b8",
  },
  medium: {
    bg: "#fffbeb",
    color: "#b45309",
    dot: "#f59e0b",
  },
  high: {
    bg: "#ecfdf5",
    color: "#065f46",
    dot: "#10b981",
  },
  critical: {
    bg: "#eef2ff",
    color: "#3730a3",
    dot: "#6366f1",
  },
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
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: s.dot,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
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
