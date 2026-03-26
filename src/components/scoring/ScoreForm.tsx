"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { ScoreFormSchema, ScoreFormValues, LLMScoreResponse } from "@/lib/scoring/schemas";
import { calculateScore } from "@/lib/scoring/formula";
import { determineScoredBy, } from "@/lib/scoring/origin";
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
  { name: "adoptionComplexity", label: "Complexidade de Adoção", description: "10% · invertido", isInverted: true },
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

  // NFR-001: calculateScore via useMemo — síncrono, < 200ms garantido
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-5">
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
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-300" htmlFor="notes">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={3}
          placeholder="Justificativa ou contexto adicional..."
          className="rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">Score total</span>
        <ScoreTotalDisplay total={totalScore} />
      </div>

      {showAutoScore && (
        <AutoScoreButton trendId={trendId} onSuggestion={handleLLMSuggestion} />
      )}

      {saveError && <p className="text-sm text-red-400">{saveError}</p>}

      <button
        type="submit"
        disabled={totalScore === null || isSaving}
        className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 transition-colors"
      >
        {isSaving ? "Salvando..." : "Salvar avaliação"}
      </button>
    </form>
  );
}
