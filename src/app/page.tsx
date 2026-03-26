import { Suspense } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import {
  currentPeriod,
  fetchTabCounts,
  getRankingData,
  getStatusTabData,
  getAwaitingData,
} from "@/lib/trends/service";
import { listTopics } from "@/lib/topics/service";
import { RankedSection } from "@/components/dashboard/RankedSection";
import { AwaitingSection } from "@/components/dashboard/AwaitingSection";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { TopCarousel } from "@/components/dashboard/TopCarousel";
import { StatusSection } from "@/components/dashboard/StatusSection";

const PAGE_LIMIT = 24;

interface HomeSearchParams {
  tab?: string;
  month?: string;
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
      }}
    >
      <Box sx={{ color, display: "flex", alignItems: "center", "& svg": { fontSize: 15 } }}>
        {icon}
      </Box>
      <Typography sx={{ color, fontWeight: 800, fontSize: "0.95rem", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
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
  const { tab: tabParam, month: monthParam, topic, q, page: pageStr } = await searchParams;

  const tab = tabParam === "approved" || tabParam === "discarded" || tabParam === "awaiting"
    ? tabParam : "ranking";
  const month = monthParam ?? currentPeriod();
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const [topics, counts] = await Promise.all([listTopics(), fetchTabCounts(month, topic ?? null)]);

  let rankingCarousel: Awaited<ReturnType<typeof getRankingData>>["carousel"] = [];
  let rankingTrends:   Awaited<ReturnType<typeof getRankingData>>["trends"]   = [];
  let rankingTotal = 0;
  let statusTrends: Awaited<ReturnType<typeof getStatusTabData>>["trends"] = [];
  let statusTotal  = 0;
  let awaitingTrends: Awaited<ReturnType<typeof getAwaitingData>>["trends"] = [];
  let awaitingTotal  = 0;

  if (tab === "ranking") {
    const data = await getRankingData(month, topic ?? null, q ?? null, page);
    rankingCarousel = data.carousel;
    rankingTrends   = data.trends;
    rankingTotal    = data.total;
  } else if (tab === "approved" || tab === "discarded") {
    const data = await getStatusTabData(tab, topic ?? null, q ?? null, page);
    statusTrends = data.trends;
    statusTotal  = data.total;
  } else {
    const data = await getAwaitingData(topic ?? null, q ?? null, page);
    awaitingTrends = data.trends;
    awaitingTotal  = data.total;
  }

  const totalAll = counts.ranking + counts.approved + counts.discarded + counts.awaiting;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          bgcolor: "#121212",
          pt: { xs: 4, sm: 5 },
          pb: { xs: 5, sm: 6 },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 65% 40%, rgba(253,197,0,0.18) 0%, transparent 55%), " +
              "radial-gradient(ellipse at 20% 80%, rgba(104,0,159,0.12) 0%, transparent 50%)",
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
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={3.5}>

            {/* Logo */}
            <Stack direction="row" alignItems="center" spacing={1.75}>
              <Box
                sx={{
                  width: 44, height: 44, borderRadius: "14px",
                  bgcolor: "#FDC500",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 24px rgba(253,197,0,0.4)",
                  flexShrink: 0,
                }}
              >
                <GraphicEqIcon sx={{ color: "#121212", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: "#FAFAFA", fontWeight: 800,
                    fontSize: { xs: "1.4rem", sm: "1.6rem" },
                    letterSpacing: "-0.04em", lineHeight: 1.1,
                  }}
                >
                  IA<Box component="span" sx={{ color: "#FDC500" }}>Pulse</Box>
                </Typography>
                <Typography sx={{ color: "rgba(250,250,250,0.4)", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", mt: 0.25 }}>
                  Monitoramento de tendências em Inteligência Artificial
                </Typography>
              </Box>
            </Stack>

            {/* Stats */}
            <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
              <StatPill icon={<TrendingUpIcon />}         label="tendências" value={totalAll}          color="#FDC500" bg="rgba(253,197,0,0.12)"    border="rgba(253,197,0,0.25)"    />
              <StatPill icon={<CheckCircleOutlineIcon />} label="avaliadas"  value={counts.ranking + counts.approved + counts.discarded} color="#C084FC" bg="rgba(192,132,252,0.12)" border="rgba(192,132,252,0.25)" />
              <StatPill icon={<HourglassEmptyIcon />}     label="aguardando" value={counts.awaiting}   color="#F472B6" bg="rgba(244,114,182,0.12)"  border="rgba(244,114,182,0.25)"  />
              <StatPill icon={<CategoryOutlinedIcon />}   label="tópicos"    value={topics.length}     color="rgba(250,250,250,0.7)" bg="rgba(250,250,250,0.07)" border="rgba(250,250,250,0.12)" />
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ── CONTEÚDO ─────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Suspense fallback={null}>
            <DashboardFilters topics={topics} active={topic} totalScored={counts.ranking + counts.approved + counts.discarded} totalUnscored={counts.awaiting} search={q} />
          </Suspense>

          <Suspense fallback={null}>
            <DashboardTabs activeTab={tab} counts={counts} />
          </Suspense>

          {tab === "ranking" && (
            <Suspense fallback={null}>
              <PeriodSelector activePeriod={month} />
            </Suspense>
          )}

          {tab === "ranking" && (
            rankingTotal === 0 ? (
              <DashboardEmptyState message="Nenhuma tendência avaliada neste período." sub="Tente selecionar outro mês ou avalie tendências na aba Aguardando." />
            ) : (
              <Stack spacing={4}>
                {rankingCarousel.length > 0 && <TopCarousel trends={rankingCarousel} />}
                <RankedSection trends={rankingTrends} total={rankingTotal} page={page} limit={PAGE_LIMIT} />
              </Stack>
            )
          )}

          {(tab === "approved" || tab === "discarded") && (
            statusTotal === 0 ? (
              <DashboardEmptyState
                message={tab === "approved" ? "Nenhuma tendência aprovada ainda." : "Nenhuma tendência descartada ainda."}
                sub="Abra uma tendência avaliada e use os botões de status para classificar."
              />
            ) : (
              <StatusSection trends={statusTrends} total={statusTotal} page={page} limit={PAGE_LIMIT} status={tab} />
            )
          )}

          {tab === "awaiting" && (
            <AwaitingSection trends={awaitingTrends} total={awaitingTotal} page={page} limit={PAGE_LIMIT} />
          )}
        </Stack>
      </Container>
    </Box>
  );
}
