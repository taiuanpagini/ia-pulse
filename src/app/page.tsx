import { Suspense } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { getDashboardData } from "@/lib/trends/service";
import { listTopics } from "@/lib/topics/service";
import { RankedSection } from "@/components/dashboard/RankedSection";
import { AwaitingSection } from "@/components/dashboard/AwaitingSection";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";

const PAGE_LIMIT = 24;

interface HomeSearchParams {
  topic?: string;
  q?: string;
  page?: string;
}

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
  border: string;
}

function StatPill({ icon, label, value, color, bg, border }: StatPillProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: "100px",
        bgcolor: bg,
        border: "1px solid",
        borderColor: border,
        backdropFilter: "blur(8px)",
      }}
    >
      <Box sx={{ color, display: "flex", alignItems: "center", "& svg": { fontSize: 15 } }}>
        {icon}
      </Box>
      <Typography
        sx={{
          color,
          fontWeight: 800,
          fontSize: "0.95rem",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {value.toLocaleString("pt-BR")}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const { topic, q, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const [{ scored, unscored, scoredTotal, unscoredTotal }, topics] = await Promise.all([
    getDashboardData(topic ?? null, q ?? null, page),
    listTopics(),
  ]);

  const isEmpty = scoredTotal === 0 && unscoredTotal === 0;
  const total = scoredTotal + unscoredTotal;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

      {/* ── HERO HEADER ────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)",
          pt: { xs: 4, sm: 5 },
          pb: { xs: 5, sm: 6 },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 70% 40%, rgba(99,102,241,0.22) 0%, transparent 60%), " +
              "radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.10) 0%, transparent 50%)",
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={3.5}>

            {/* Logo + nome */}
            <Stack direction="row" alignItems="center" spacing={1.75}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.1) inset, 0 0 24px rgba(99,102,241,0.5)",
                  flexShrink: 0,
                }}
              >
                <GraphicEqIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: { xs: "1.4rem", sm: "1.6rem" },
                    letterSpacing: "-0.04em",
                    lineHeight: 1.1,
                  }}
                >
                  IA
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(90deg, #818cf8, #67e8f9)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Pulse
                  </Box>
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    mt: 0.25,
                  }}
                >
                  Monitoramento de tendências em Inteligência Artificial
                </Typography>
              </Box>
            </Stack>

            {/* Stats pills */}
            <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
              <StatPill
                icon={<TrendingUpIcon />}
                label="tendências"
                value={total}
                color="#818cf8"
                bg="rgba(99,102,241,0.12)"
                border="rgba(99,102,241,0.25)"
              />
              <StatPill
                icon={<CheckCircleOutlineIcon />}
                label="avaliadas"
                value={scoredTotal}
                color="#34d399"
                bg="rgba(52,211,153,0.12)"
                border="rgba(52,211,153,0.25)"
              />
              <StatPill
                icon={<HourglassEmptyIcon />}
                label="aguardando"
                value={unscoredTotal}
                color="#fbbf24"
                bg="rgba(251,191,36,0.12)"
                border="rgba(251,191,36,0.25)"
              />
              <StatPill
                icon={<CategoryOutlinedIcon />}
                label="tópicos"
                value={topics.length}
                color="#67e8f9"
                bg="rgba(103,232,249,0.12)"
                border="rgba(103,232,249,0.25)"
              />
            </Stack>

          </Stack>
        </Container>
      </Box>

      {/* ── CONTEÚDO ────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Suspense fallback={null}>
            <DashboardFilters
              topics={topics}
              active={topic}
              totalScored={scoredTotal}
              totalUnscored={unscoredTotal}
              search={q}
            />
          </Suspense>

          {isEmpty ? (
            <DashboardEmptyState />
          ) : (
            <>
              <RankedSection
                trends={scored}
                total={scoredTotal}
                page={page}
                limit={PAGE_LIMIT}
              />
              {scoredTotal > 0 && unscoredTotal > 0 && <Divider />}
              <AwaitingSection
                trends={unscored}
                total={unscoredTotal}
                page={page}
                limit={PAGE_LIMIT}
              />
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
