import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import { TrendCard } from "./TrendCard";
import { Pagination } from "./Pagination";
import { ScoredTrendCard } from "@/lib/trends/service";

interface RankedSectionProps {
  trends: ScoredTrendCard[];
  total: number;
  page: number;
  limit: number;
}

export function RankedSection({ trends, total, page, limit }: RankedSectionProps) {
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
            bgcolor: "#eef2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LeaderboardOutlinedIcon sx={{ color: "#4f46e5", fontSize: 18 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" color="text.primary" sx={{ fontSize: "1rem", lineHeight: 1.2 }}>
            Ranking de Tendências
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ordenado por score ponderado
          </Typography>
        </Box>
        <Chip
          label={`${total.toLocaleString("pt-BR")} avaliadas`}
          size="small"
          sx={{
            bgcolor: "#eef2ff",
            color: "#4338ca",
            fontWeight: 700,
            fontSize: "0.7rem",
            height: 24,
            "& .MuiChip-label": { px: 1.25 },
          }}
        />
      </Box>

      {trends.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center", color: "text.disabled" }}>
          <LeaderboardOutlinedIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1, display: "block", mx: "auto" }} />
          <Typography variant="body2">
            Nenhuma tendência avaliada ainda.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            {trends.map((t) => (
              <TrendCard key={t.id} variant="scored" {...t} />
            ))}
          </Box>
          <Pagination page={page} total={total} limit={limit} />
        </>
      )}
    </Box>
  );
}
