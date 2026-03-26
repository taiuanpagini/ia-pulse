import Chip from "@mui/material/Chip";

// Cores alinhadas com a paleta Amazing onde possível
const colorMap: Record<string, { bg: string; color: string }> = {
  blue:    { bg: "#EFF6FF", color: "#1D4ED8" },
  emerald: { bg: "#ECFDF5", color: "#065F46" },
  violet:  { bg: "#F3E8FF", color: "#68009F" }, // brand purple
  amber:   { bg: "#FFF9E0", color: "#92600A" }, // brand yellow tone
  rose:    { bg: "#FFE4F0", color: "#D2006F" }, // brand pink
  cyan:    { bg: "#ECFEFF", color: "#0E7490" },
  orange:  { bg: "#FFF7ED", color: "#9A3412" },
  teal:    { bg: "#F0FDFA", color: "#0F766E" },
  pink:    { bg: "#FFE4F0", color: "#D2006F" }, // brand pink
  indigo:  { bg: "#F3E8FF", color: "#68009F" }, // brand purple
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
