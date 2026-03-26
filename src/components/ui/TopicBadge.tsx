import Chip from "@mui/material/Chip";

const colorMap: Record<string, { bg: string; color: string }> = {
  blue:    { bg: "#eff6ff", color: "#1d4ed8" },
  emerald: { bg: "#ecfdf5", color: "#065f46" },
  violet:  { bg: "#f5f3ff", color: "#5b21b6" },
  amber:   { bg: "#fffbeb", color: "#92400e" },
  rose:    { bg: "#fff1f2", color: "#9f1239" },
  cyan:    { bg: "#ecfeff", color: "#0e7490" },
  orange:  { bg: "#fff7ed", color: "#9a3412" },
  teal:    { bg: "#f0fdfa", color: "#0f766e" },
  pink:    { bg: "#fdf2f8", color: "#9d174d" },
  indigo:  { bg: "#eef2ff", color: "#3730a3" },
};

interface TopicBadgeProps {
  name: string;
  color: string;
}

export function TopicBadge({ name, color }: TopicBadgeProps) {
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <Chip
      label={name}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.color,
        fontWeight: 700,
        fontSize: "0.68rem",
        height: 22,
        "& .MuiChip-label": { px: 1 },
        letterSpacing: "0.01em",
      }}
    />
  );
}
