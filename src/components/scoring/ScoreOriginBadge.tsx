import Chip from "@mui/material/Chip";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";

interface ScoreOriginBadgeProps {
  scoredBy: "manual" | "llm";
}

export function ScoreOriginBadge({ scoredBy }: ScoreOriginBadgeProps) {
  if (scoredBy === "llm") {
    return (
      <Chip
        icon={<SmartToyIcon sx={{ fontSize: "0.85rem !important" }} />}
        label="Sugerido por IA"
        size="small"
        sx={{
          bgcolor: "#ede9fe",
          color: "#5b21b6",
          fontWeight: 600,
          fontSize: "0.7rem",
          height: 22,
          "& .MuiChip-label": { px: 0.5 },
          "& .MuiChip-icon": { color: "#5b21b6" },
        }}
      />
    );
  }
  return (
    <Chip
      icon={<PersonIcon sx={{ fontSize: "0.85rem !important" }} />}
      label="Avaliação manual"
      size="small"
      sx={{
        bgcolor: "#f1f5f9",
        color: "#475569",
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 22,
        "& .MuiChip-label": { px: 0.5 },
        "& .MuiChip-icon": { color: "#475569" },
      }}
    />
  );
}
