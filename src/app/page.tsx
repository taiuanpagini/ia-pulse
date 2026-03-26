import { Suspense } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import { getDashboardData } from "@/lib/trends/service";
import { listTopics } from "@/lib/topics/service";
import { RankedSection } from "@/components/dashboard/RankedSection";
import { AwaitingSection } from "@/components/dashboard/AwaitingSection";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { TopicFilterBar } from "@/components/dashboard/TopicFilterBar";
import { SearchInput } from "@/components/dashboard/SearchInput";

const PAGE_LIMIT = 24;

interface HomeSearchParams {
  topic?: string;
  q?: string;
  page?: string;
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <GraphicEqIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            IAPulse
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5, mt: 0.3 }}>
            Monitoramento de tendências em IA
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Barra de filtros e busca */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
            <Suspense fallback={null}>
              <SearchInput />
            </Suspense>
            <Suspense fallback={null}>
              <TopicFilterBar topics={topics} active={topic} />
            </Suspense>
          </Stack>

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
              {unscoredTotal > 0 && <Divider />}
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
