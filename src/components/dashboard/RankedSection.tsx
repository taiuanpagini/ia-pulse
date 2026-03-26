import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
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
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <EmojiEventsOutlinedIcon sx={{ color: "primary.main", fontSize: 20 }} />
        <Typography variant="h6" color="text.primary">
          Ranking de Tendências
        </Typography>
        {trends.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            ({trends.length})
          </Typography>
        )}
      </Box>

      {trends.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            py: 6,
            color: "text.disabled",
          }}
        >
          <BarChartIcon sx={{ fontSize: 40, opacity: 0.4 }} />
          <Typography variant="body2" textAlign="center" maxWidth={320}>
            Nenhuma tendência avaliada ainda. Avalie os itens abaixo para que apareçam aqui.
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
