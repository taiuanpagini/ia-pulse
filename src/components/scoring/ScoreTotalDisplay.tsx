import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

interface ScoreTotalDisplayProps {
  total: number | null;
}

export function ScoreTotalDisplay({ total }: ScoreTotalDisplayProps) {
  if (total === null) {
    return (
      <Typography variant="body2" color="text.disabled" fontStyle="italic">
        Preencha todos os critérios
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Typography variant="h5" fontWeight={800} fontFamily="monospace" color="primary.main">
        {total.toFixed(2)}
      </Typography>
      <Typography variant="body2" color="text.secondary">/ 5.00</Typography>
      <ScoreBadge total={total} />
    </Box>
  );
}
