import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ScoreOriginBadge } from "@/components/scoring/ScoreOriginBadge";
import { TrendScoreDetail } from "@/lib/trends/service";

const CRITERIA_LABELS: Record<
  keyof Omit<TrendScoreDetail, "total" | "level" | "scoredBy" | "scoredAt" | "notes">,
  string
> = {
  maturity: "Maturidade Tecnológica",
  applicability: "Aplicabilidade Imediata",
  competitiveImpact: "Impacto Competitivo",
  strategicAlignment: "Alinhamento Estratégico",
  adoptionComplexity: "Complexidade de Adoção",
};

interface ScoreDisplayProps {
  score: TrendScoreDetail | null | undefined;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  if (!score) return null;

  const criteria = Object.entries(CRITERIA_LABELS) as [
    keyof typeof CRITERIA_LABELS,
    string,
  ][];

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" mb={2}>
        <ScoreBadge total={score.total} />
        <Typography variant="h6" fontWeight={700} fontFamily="monospace">
          {score.total.toFixed(2)}
          <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
            {" "}/ 5.00
          </Typography>
        </Typography>
        <ScoreOriginBadge scoredBy={score.scoredBy} />
      </Stack>

      <Table size="small">
        <TableBody>
          {criteria.map(([key, label]) => (
            <TableRow key={key} sx={{ "&:last-child td": { border: 0 } }}>
              <TableCell sx={{ color: "text.secondary", py: 0.75, pl: 0 }}>{label}</TableCell>
              <TableCell align="right" sx={{ py: 0.75, pr: 0 }}>
                <Chip
                  label={`${score[key]} / 5`}
                  size="small"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    bgcolor: "#f1f5f9",
                    color: "text.primary",
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {score.notes && (
        <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
          {score.notes}
        </Typography>
      )}
    </Box>
  );
}
