import { Suspense } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import PulseIcon from "@mui/icons-material/GraphicEq";
import Divider from "@mui/material/Divider";
import { getDashboardData } from "@/lib/trends/service";
import { listTopics } from "@/lib/topics/service";
import { RankedSection } from "@/components/dashboard/RankedSection";
import { AwaitingSection } from "@/components/dashboard/AwaitingSection";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { TopicFilterBar } from "@/components/dashboard/TopicFilterBar";

interface HomeSearchParams {
  topic?: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const { topic } = await searchParams;
  const [{ scored, unscored }, topics] = await Promise.all([
    getDashboardData(topic ?? null),
    listTopics(),
  ]);

  const isEmpty = scored.length === 0 && unscored.length === 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <PulseIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            IAPulse
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5, mt: 0.3 }}>
            Monitoramento de tendências em IA
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Suspense fallback={null}>
            <TopicFilterBar topics={topics} active={topic} />
          </Suspense>

          {isEmpty ? (
            <DashboardEmptyState />
          ) : (
            <>
              <RankedSection trends={scored} />
              {unscored.length > 0 && <Divider />}
              <AwaitingSection trends={unscored} />
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
