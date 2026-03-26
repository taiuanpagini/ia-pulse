"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { LLMScoreResponse } from "@/lib/scoring/schemas";

interface AutoScoreButtonProps {
  trendId: string;
  onSuggestion: (suggestion: LLMScoreResponse) => void;
}

export function AutoScoreButton({ trendId, onSuggestion }: AutoScoreButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/trends/${trendId}/autoscore`, { method: "POST" });
      const data = (await res.json()) as { data?: LLMScoreResponse; error?: { message: string } };
      if (!res.ok) {
        setError(data.error?.message ?? "Erro ao gerar sugestão");
        return;
      }
      if (data.data) onSuggestion(data.data);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        onClick={handleClick}
        disabled={loading}
        startIcon={
          loading ? <CircularProgress size={14} /> : <SmartToyOutlinedIcon fontSize="small" />
        }
        sx={{ mb: error ? 1 : 0 }}
      >
        {loading ? "Analisando..." : "Auto-score com IA"}
      </Button>
      {error && (
        <Alert severity="warning" sx={{ mt: 1, py: 0.5, fontSize: "0.75rem" }}>
          {error}
        </Alert>
      )}
    </div>
  );
}
