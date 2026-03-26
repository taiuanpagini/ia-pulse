"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import TranslateIcon from "@mui/icons-material/Translate";
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
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<{ titlePt: string; summaryPt: string } | null>(
    trend.score !== undefined && (trend as unknown as { titlePt?: string }).titlePt
      ? { titlePt: (trend as unknown as { titlePt: string }).titlePt, summaryPt: (trend as unknown as { summaryPt: string }).summaryPt ?? "" }
      : null
  );

  const isAlreadyPt = (trend as unknown as { lang?: string }).lang === "pt";

  async function handleTranslate() {
    setTranslating(true);
    setTranslateError(null);
    try {
      const res = await fetch(`/api/trends/${trend.id}/translate`, { method: "POST" });
      const body = (await res.json()) as {
        data?: { titlePt: string; summaryPt: string };
        error?: { message: string };
      };
      if (!res.ok) {
        setTranslateError(body.error?.message ?? "Erro ao traduzir");
        return;
      }
      if (body.data) setTranslation(body.data);
    } catch {
      setTranslateError("Erro de conexão");
    } finally {
      setTranslating(false);
    }
  }

  const displayTitle = translation?.titlePt ?? trend.title;
  const displaySummary = translation?.summaryPt ?? trend.summary;

  return (
    <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab icon={<InfoOutlinedIcon fontSize="small" />} iconPosition="start" label="Detalhes" />
          <Tab icon={<AssessmentOutlinedIcon fontSize="small" />} iconPosition="start" label="Avaliação" />
        </Tabs>
      </Box>

      <Box hidden={tab !== 0} sx={{ p: 3 }}>
        {/* Botão de tradução */}
        {!isAlreadyPt && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 1, alignItems: "center" }}>
            {translation && (
              <Chip label="PT-BR" size="small" sx={{ bgcolor: "#dcfce7", color: "#166534", fontSize: "0.7rem" }} />
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={translating ? <CircularProgress size={12} /> : <TranslateIcon fontSize="small" />}
              onClick={handleTranslate}
              disabled={translating}
            >
              {translation ? "Retraduzir" : "Traduzir para PT-BR"}
            </Button>
          </Box>
        )}
        {translateError && (
          <Alert severity="warning" sx={{ mb: 2, py: 0.5, fontSize: "0.75rem" }}>
            {translateError}
          </Alert>
        )}

        <TrendDetailHeader
          title={displayTitle}
          summary={displaySummary}
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

      <Box hidden={tab !== 1} sx={{ p: 3 }}>
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
