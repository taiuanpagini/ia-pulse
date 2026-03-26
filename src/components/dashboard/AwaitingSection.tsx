import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import { TrendCard } from "./TrendCard";
import { UnscoredTrendCard } from "@/lib/trends/service";

interface AwaitingSectionProps {
  trends: UnscoredTrendCard[];
}

export function AwaitingSection({ trends }: AwaitingSectionProps) {
  if (trends.length === 0) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <PendingActionsOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
        <Typography variant="h6" color="text.secondary" fontSize="1rem">
          Aguardando avaliação
        </Typography>
        <Typography variant="caption" color="text.disabled">({trends.length})</Typography>
      </Box>

      <Grid container spacing={2} alignItems="stretch">
        {trends.map((t) => (
          <Grid item xs={12} sm={6} md={4} key={t.id} sx={{ display: "flex" }}>
            <TrendCard variant="unscored" {...t} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
