"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { ScoreFormSchema, ScoreFormValues, LLMScoreResponse } from "@/lib/scoring/schemas";
import { calculateScore } from "@/lib/scoring/formula";
import { determineScoredBy } from "@/lib/scoring/origin";
import { ScoreCriteria } from "@/lib/scoring/formula";
import { CriteriaInput } from "./CriteriaInput";
import { ScoreTotalDisplay } from "./ScoreTotalDisplay";
import { AutoScoreButton } from "./AutoScoreButton";

const CRITERIA: {
  name: keyof Omit<ScoreFormValues, "notes">;
  label: string;
  description: string;
  isInverted: boolean;
}[] = [
  { name: "maturity", label: "Maturidade Tecnológica", description: "20% · 1=pesquisa, 5=produção", isInverted: false },
  { name: "applicability", label: "Aplicabilidade Imediata", description: "30% · 1=nenhuma, 5=direta", isInverted: false },
  { name: "competitiveImpact", label: "Impacto Competitivo", description: "25% · 1=incremental, 5=disruptivo", isInverted: false },
  { name: "strategicAlignment", label: "Alinhamento Estratégico", description: "15% · 1=baixo, 5=alto", isInverted: false },
  { name: "adoptionComplexity", label: "Facilidade de Adoção", description: "10% · 1=muito complexa, 5=simples", isInverted: true },
];

export interface ScoreFormProps {
  trendId: string;
  defaultValues?: Partial<ScoreFormValues>;
  showAutoScore?: boolean;
  onSuccess?: () => void;
}

export function ScoreForm({ trendId, defaultValues, showAutoScore = false, onSuccess }: ScoreFormProps) {
  const [llmSuggestion, setLlmSuggestion] = useState<ScoreCriteria | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { watch, setValue, handleSubmit, register } = useForm<ScoreFormValues>({
    resolver: zodResolver(ScoreFormSchema),
    defaultValues: defaultValues ?? {},
  });

  const values = watch();
  const totalScore = useMemo(() => calculateScore(values), [values]);

  const handleLLMSuggestion = (suggestion: LLMScoreResponse) => {
    setLlmSuggestion({
      maturity: suggestion.maturity,
      applicability: suggestion.applicability,
      competitiveImpact: suggestion.competitiveImpact,
      strategicAlignment: suggestion.strategicAlignment,
      adoptionComplexity: suggestion.adoptionComplexity,
    });
    (Object.keys(suggestion) as (keyof LLMScoreResponse)[]).forEach((key) => {
      setValue(key, suggestion[key]);
    });
  };

  const onSubmit = async (data: ScoreFormValues) => {
    setSaveError(null);
    setIsSaving(true);

    const scoredBy = determineScoredBy(
      {
        maturity: data.maturity,
        applicability: data.applicability,
        competitiveImpact: data.competitiveImpact,
        strategicAlignment: data.strategicAlignment,
        adoptionComplexity: data.adoptionComplexity,
      },
      llmSuggestion
    );

    try {
      const res = await fetch(`/api/trends/${trendId}/score`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, scoredBy }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        setSaveError(err?.error?.message ?? "Erro ao salvar");
        return;
      }

      onSuccess?.();
    } catch {
      setSaveError("Erro de conexão");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {CRITERIA.map((c) => (
          <CriteriaInput
            key={c.name}
            name={c.name}
            label={c.label}
            description={c.description}
            isInverted={c.isInverted}
            value={values[c.name]}
            onChange={(v) => setValue(c.name, v)}
          />
        ))}

        <TextField
          label="Notas (opcional)"
          placeholder="Justificativa ou contexto adicional..."
          multiline
          rows={3}
          size="small"
          fullWidth
          {...register("notes")}
        />

        <Paper
          variant="outlined"
          sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 2 }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Score total
          </Typography>
          <ScoreTotalDisplay total={totalScore} />
        </Paper>

        {showAutoScore && (
          <>
            <Divider>
              <Typography variant="caption" color="text.disabled">ou</Typography>
            </Divider>
            <AutoScoreButton trendId={trendId} onSuggestion={handleLLMSuggestion} />
          </>
        )}

        {saveError && <Alert severity="error">{saveError}</Alert>}

        <Button
          type="submit"
          variant="contained"
          disabled={totalScore === null || isSaving}
          startIcon={<SaveOutlinedIcon />}
          size="large"
          fullWidth
        >
          {isSaving ? "Salvando..." : "Salvar avaliação"}
        </Button>
      </Stack>
    </Box>
  );
}
