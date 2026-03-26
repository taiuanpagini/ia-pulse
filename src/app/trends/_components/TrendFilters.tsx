"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { TopicBadge } from "@/components/ui/TopicBadge";

interface Topic {
  slug: string;
  name: string;
  color: string;
}

interface TrendFiltersProps {
  topics: Topic[];
  sources: string[];
}

const PERIOD_OPTIONS = [
  { value: "1d", label: "Último dia" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
];

export function TrendFilters({ topics, sources }: TrendFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTopic = searchParams.get("topic") ?? "";
  const activeSource = searchParams.get("source") ?? "";
  const activePeriod = searchParams.get("period") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/trends?${params.toString()}`);
    },
    [router, searchParams]
  );

  const removeParam = useCallback(
    (key: string) => updateParam(key, ""),
    [updateParam]
  );

  const hasActiveFilters = activeTopic || activeSource || activePeriod;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {/* Topic filter */}
        <select
          value={activeTopic}
          onChange={(e) => updateParam("topic", e.target.value)}
          className="rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os tópicos</option>
          {topics.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Source filter */}
        <select
          value={activeSource}
          onChange={(e) => updateParam("source", e.target.value)}
          className="rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as fontes</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Period filter */}
        <select
          value={activePeriod}
          onChange={(e) => updateParam("period", e.target.value)}
          className="rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Qualquer período</option>
          {PERIOD_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500">Filtros ativos:</span>
          {activeTopic && (
            <ActiveChip
              label={`Tópico: ${topics.find((t) => t.slug === activeTopic)?.name ?? activeTopic}`}
              onRemove={() => removeParam("topic")}
            />
          )}
          {activeSource && (
            <ActiveChip
              label={`Fonte: ${activeSource}`}
              onRemove={() => removeParam("source")}
            />
          )}
          {activePeriod && (
            <ActiveChip
              label={`Período: ${PERIOD_OPTIONS.find((p) => p.value === activePeriod)?.label ?? activePeriod}`}
              onRemove={() => removeParam("period")}
            />
          )}
          <button
            onClick={() => router.push("/trends")}
            className="text-xs text-gray-500 hover:text-gray-300 underline ml-1"
          >
            Limpar tudo
          </button>
        </div>
      )}
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-800 border border-gray-700 px-3 py-0.5 text-xs text-gray-300">
      {label}
      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-gray-100 transition-colors"
        aria-label={`Remover filtro: ${label}`}
      >
        ×
      </button>
    </span>
  );
}
