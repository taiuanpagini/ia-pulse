import { notFound } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import { BackButton } from "@/components/ui/BackButton";
import { getTrendDetail } from "@/lib/trends/service";
import { TrendDetailClient } from "./TrendDetailClient";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

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

  const displayTitle = trend.titlePt ?? trend.title;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          bgcolor: "#121212",
          pt: { xs: 3, sm: 4 },
          pb: { xs: 4, sm: 5 },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 70% 40%, rgba(253,197,0,0.16) 0%, transparent 55%), " +
              "radial-gradient(ellipse at 15% 80%, rgba(104,0,159,0.10) 0%, transparent 50%)",
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(253,197,0,0.35), transparent)",
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={2.5}>

            {/* Logo + voltar */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: "10px",
                    bgcolor: "#FDC500",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 18px rgba(253,197,0,0.35)",
                    flexShrink: 0,
                  }}
                >
                  <GraphicEqIcon sx={{ color: "#121212", fontSize: 20 }} />
                </Box>
                <Typography
                  sx={{ color: "#FAFAFA", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.03em", lineHeight: 1.1 }}
                >
                  IA<Box component="span" sx={{ color: "#FDC500" }}>Pulse</Box>
                </Typography>
              </Stack>

              <BackButton label="Voltar" />
            </Stack>

            {/* Badges + título + meta */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5} flexWrap="wrap" useFlexGap>
                <TopicBadge name={trend.topicName} color={trend.topicColor} />
                {trend.score && <ScoreBadge total={trend.score.total} />}
                {trend.score && (
                  <Typography sx={{ color: "rgba(250,250,250,0.5)", fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 700 }}>
                    {trend.score.total.toFixed(2)}
                  </Typography>
                )}
                {!trend.score && (
                  <Typography sx={{ color: "rgba(250,250,250,0.35)", fontSize: "0.72rem" }}>
                    Aguardando avaliação
                  </Typography>
                )}
              </Stack>

              <Typography
                sx={{
                  color: "#FAFAFA", fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.3rem" },
                  letterSpacing: "-0.02em", lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}
              >
                {displayTitle}
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center" mt={1.25} flexWrap="wrap" useFlexGap>
                <Typography sx={{ color: "rgba(250,250,250,0.4)", fontSize: "0.72rem" }}>
                  {trend.source}
                </Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "rgba(250,250,250,0.2)", flexShrink: 0 }} />
                <Typography sx={{ color: "rgba(250,250,250,0.4)", fontSize: "0.72rem" }}>
                  {trend.publishedAt
                    ? `Publicado em ${new Date(trend.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`
                    : `Coletado em ${new Date(trend.collectedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`}
                </Typography>
                {trend.lang === "pt" && (
                  <Box sx={{ px: 0.75, py: 0.1, borderRadius: "4px", bgcolor: "rgba(253,197,0,0.15)", border: "1px solid rgba(253,197,0,0.3)" }}>
                    <Typography sx={{ color: "#FDC500", fontSize: "0.65rem", fontWeight: 700 }}>PT-BR</Typography>
                  </Box>
                )}
              </Stack>
            </Box>

          </Stack>
        </Container>
      </Box>

      {/* ── CONTEÚDO ─────────────────────────────────────────── */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <TrendDetailClient trend={trend} defaultValues={defaultValues} />
      </Container>
    </Box>
  );
}
