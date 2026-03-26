import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <PendingActionsOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
        <Typography variant="h6" color="text.secondary" fontSize="1rem">
          Aguardando avaliação
        </Typography>
        <Typography variant="caption" color="text.disabled">({trends.length})</Typography>
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
