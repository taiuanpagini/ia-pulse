"use client";

import { useState } from "react";
import { LLMScoreResponse } from "@/lib/scoring/schemas";

interface AutoScoreButtonProps {
  trendId: string;
  onSuggestion: (data: LLMScoreResponse) => void;
}

export function AutoScoreButton({ trendId, onSuggestion }: AutoScoreButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/trends/${trendId}/autoscore`, { method: "POST" });
      const json = (await res.json()) as {
        data?: LLMScoreResponse;
        error?: { code?: string; message?: string };
      };

      if (!res.ok) {
        const code = json.error?.code;
        if (code === "LLM_TIMEOUT") {
          setError("A IA demorou mais de 10s. Tente novamente.");
        } else if (code === "LLM_NOT_CONFIGURED") {
          setError("Chave de API não configurada.");
        } else {
          setError(json.error?.message ?? "Erro ao obter sugestão da IA.");
        }
        return;
      }

      if (json.data) {
        onSuggestion(json.data);
      }
    } catch {
      setError("Erro de conexão com a IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="rounded-lg border border-violet-600 bg-violet-900/30 hover:bg-violet-900/50 disabled:opacity-50 text-violet-300 text-sm font-medium py-2 px-4 transition-colors flex items-center gap-2 justify-center"
      >
        {isLoading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full" />
            Consultando IA...
          </>
        ) : (
          <>
            <span aria-hidden>🤖</span>
            Auto-score com IA
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
