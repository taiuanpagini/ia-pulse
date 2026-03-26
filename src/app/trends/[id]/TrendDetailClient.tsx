"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import { ScoreForm } from "@/components/scoring/ScoreForm";
import { ScoreDisplay } from "@/components/trend/ScoreDisplay";
import { TrendDetailHeader } from "@/components/trend/TrendDetailHeader";
import type { TrendDetail } from "@/lib/trends/service";
import type { ScoreFormValues } from "@/lib/scoring/schemas";

interface TrendDetailClientProps {
  trend: TrendDetail;
  defaultValues?: Partial<ScoreFormValues>;
}

export function TrendDetailClient({ trend, defaultValues }: TrendDetailClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState(0);

  return (
    <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Detalhes e avaliação">
          <Tab
            icon={<InfoOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Detalhes"
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            icon={<AssessmentOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Avaliação"
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>
      </Box>

      <Box role="tabpanel" hidden={tab !== 0} id="tabpanel-0" aria-labelledby="tab-0" sx={{ p: 3 }}>
        <TrendDetailHeader
          title={trend.title}
          summary={trend.summary}
          url={trend.url}
          source={trend.source}
          topicName={trend.topicName}
          topicColor={trend.topicColor}
          collectedAt={trend.collectedAt}
        />
        {trend.score && (
          <Box mt={3} pt={3} sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <ScoreDisplay score={trend.score} />
          </Box>
        )}
      </Box>

      <Box role="tabpanel" hidden={tab !== 1} id="tabpanel-1" aria-labelledby="tab-1" sx={{ p: 3 }}>
        <ScoreForm
          trendId={trend.id}
          defaultValues={defaultValues}
          showAutoScore
          onSuccess={() => {
            router.refresh();
            setTab(0);
          }}
        />
      </Box>
    </Paper>
  );
}
