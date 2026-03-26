import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import { TrendCard } from "./TrendCard";
import { Pagination } from "./Pagination";
import { UnscoredTrendCard } from "@/lib/trends/service";

interface AwaitingSectionProps {
  trends: UnscoredTrendCard[];
  total: number;
  page: number;
  limit: number;
}

export function AwaitingSection({ trends, total, page, limit }: AwaitingSectionProps) {
  if (trends.length === 0 && total === 0) return null;

  return (
    <Box>
      {/* Section header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2.5,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            bgcolor: "#fffbeb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <PendingActionsOutlinedIcon sx={{ color: "#d97706", fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" color="text.primary" sx={{ fontSize: "1rem", lineHeight: 1.2 }}>
            Aguardando avaliação
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ordenado por data de coleta
          </Typography>
        </Box>
        <Chip
          label={`${total.toLocaleString("pt-BR")} pendentes`}
          size="small"
          sx={{
            bgcolor: "#fffbeb",
            color: "#b45309",
            fontWeight: 700,
            fontSize: "0.7rem",
            height: 24,
            "& .MuiChip-label": { px: 1.25 },
          }}
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {trends.map((t) => (
          <TrendCard key={t.id} variant="unscored" {...t} />
        ))}
      </Box>
      <Pagination page={page} total={total} limit={limit} />
    </Box>
  );
}
