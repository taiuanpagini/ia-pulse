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
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import TranslateIcon from "@mui/icons-material/Translate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { ScoreForm } from "@/components/scoring/ScoreForm";
import { ScoreDisplay } from "@/components/trend/ScoreDisplay";
import { TrendDetailHeader } from "@/components/trend/TrendDetailHeader";
import type { TrendDetail, TrendStatus } from "@/lib/trends/service";
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
    trend.titlePt ? { titlePt: trend.titlePt, summaryPt: trend.summaryPt ?? "" } : null
  );
  const [currentStatus, setCurrentStatus] = useState<TrendStatus | undefined>(trend.status);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const isAlreadyPt = trend.lang === "pt";

  async function handleTranslate() {
    setTranslating(true);
    setTranslateError(null);
    try {
      const res = await fetch(`/api/trends/${trend.id}/translate`, { method: "POST" });
      const body = (await res.json()) as {
        data?: { titlePt: string; summaryPt: string };
        error?: { message: string };
      };
      if (!res.ok) { setTranslateError(body.error?.message ?? "Erro ao traduzir"); return; }
      if (body.data) setTranslation(body.data);
    } catch {
      setTranslateError("Erro de conexão");
    } finally {
      setTranslating(false);
    }
  }

  async function handleStatusChange(newStatus: TrendStatus) {
    if (newStatus === currentStatus) return;
    setStatusLoading(true);
    setStatusError(null);
    try {
      const res = await fetch(`/api/trends/${trend.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const body = (await res.json()) as { data?: { status: TrendStatus }; error?: { message: string } };
      if (!res.ok) { setStatusError(body.error?.message ?? "Erro ao atualizar status"); return; }
      setCurrentStatus(body.data?.status);
      router.refresh();
    } catch {
      setStatusError("Erro de conexão");
    } finally {
      setStatusLoading(false);
    }
  }

  const displayTitle = translation?.titlePt ?? trend.title;
  const displaySummary = translation?.summaryPt ?? trend.summary;

  const statusConfig = {
    pending: { label: "Em análise", icon: <RadioButtonUncheckedIcon fontSize="small" />, color: "inherit" as const },
    approved: { label: "Aprovado", icon: <CheckCircleIcon fontSize="small" />, color: "success" as const },
    discarded: { label: "Descartado", icon: <CancelIcon fontSize="small" />, color: "error" as const },
  };

  return (
    <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab icon={<InfoOutlinedIcon fontSize="small" />} iconPosition="start" label="Detalhes" />
          <Tab icon={<AssessmentOutlinedIcon fontSize="small" />} iconPosition="start" label="Avaliação" />
        </Tabs>
      </Box>

      {/* ── Detalhes ── */}
      <Box hidden={tab !== 0} sx={{ p: 3 }}>
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
          <Alert severity="warning" sx={{ mb: 2, py: 0.5, fontSize: "0.75rem" }}>{translateError}</Alert>
        )}

        <TrendDetailHeader
          title={displayTitle}
          summary={displaySummary}
          url={trend.url}
          source={trend.source}
          topicName={trend.topicName}
          topicColor={trend.topicColor}
          collectedAt={trend.collectedAt}
          publishedAt={trend.publishedAt}
        />

        {trend.score && (
          <Box mt={3} pt={3} sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <ScoreDisplay score={trend.score} />
          </Box>
        )}

        {/* ── Status ── sempre visível ── */}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
            Status da tendência
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" mb={1.5}>
            Classificar determina se este item aparece em Aprovados ou Descartados no dashboard.
            {!trend.score && " Para Aprovado é recomendado avaliar antes."}
          </Typography>

          {statusError && (
            <Alert severity="error" sx={{ mb: 1.5, py: 0.5, fontSize: "0.75rem" }}>{statusError}</Alert>
          )}

          <Stack direction="row" spacing={1}>
            {(["pending", "approved", "discarded"] as TrendStatus[]).map((s) => {
              const cfg = statusConfig[s];
              const isActive = (currentStatus ?? "pending") === s;
              return (
                <Button
                  key={s}
                  size="small"
                  variant={isActive ? "contained" : "outlined"}
                  color={cfg.color}
                  startIcon={statusLoading && isActive ? <CircularProgress size={12} /> : cfg.icon}
                  onClick={() => handleStatusChange(s)}
                  disabled={statusLoading}
                  sx={{ fontWeight: isActive ? 700 : 500, minWidth: 120 }}
                >
                  {cfg.label}
                </Button>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* ── Avaliação ── */}
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
