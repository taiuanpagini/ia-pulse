import { notFound } from "next/navigation";
import NextLink from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import { getTrendDetail } from "@/lib/trends/service";
import { TrendDetailClient } from "./TrendDetailClient";

export default async function TrendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trend = await getTrendDetail(id);

  if (!trend) notFound();

  const defaultValues = trend.score
    ? {
        maturity: trend.score.maturity,
        applicability: trend.score.applicability,
        competitiveImpact: trend.score.competitiveImpact,
        strategicAlignment: trend.score.strategicAlignment,
        adoptionComplexity: trend.score.adoptionComplexity,
        notes: trend.score.notes ?? "",
      }
    : undefined;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <GraphicEqIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            IAPulse
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <MuiLink
          component={NextLink}
          href="/"
          underline="hover"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mb: 3 }}
          color="text.secondary"
          variant="body2"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          Voltar ao dashboard
        </MuiLink>

        <TrendDetailClient trend={trend} defaultValues={defaultValues} />
      </Container>
    </Box>
  );
}
