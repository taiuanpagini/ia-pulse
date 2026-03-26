import Chip from "@mui/material/Chip";

const colorMap: Record<string, { bg: string; color: string }> = {
  blue:    { bg: "#dbeafe", color: "#1d4ed8" },
  emerald: { bg: "#d1fae5", color: "#065f46" },
  violet:  { bg: "#ede9fe", color: "#5b21b6" },
  amber:   { bg: "#fef3c7", color: "#92400e" },
  rose:    { bg: "#ffe4e6", color: "#9f1239" },
  cyan:    { bg: "#cffafe", color: "#0e7490" },
  orange:  { bg: "#ffedd5", color: "#9a3412" },
  teal:    { bg: "#ccfbf1", color: "#0f766e" },
  pink:    { bg: "#fce7f3", color: "#9d174d" },
  indigo:  { bg: "#e0e7ff", color: "#3730a3" },
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
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 22,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}
