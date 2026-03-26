"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import { TopicResponse } from "@/lib/topics/schemas";

interface DashboardFiltersProps {
  topics: TopicResponse[];
  active?: string;
  totalScored: number;
  totalUnscored: number;
  search?: string;
}

export function DashboardFilters({
  topics,
  active,
  totalScored,
  totalUnscored,
  search,
}: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(search ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim().length >= 2) {
        params.set("q", query.trim());
        params.delete("page");
      } else {
        params.delete("q");
      }
      router.push(`/?${params.toString()}`);
    }, 350);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectTopic(slug?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("topic", slug);
    else params.delete("topic");
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  const total = totalScored + totalUnscored;

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* Linha superior — busca + contador */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.25,
          gap: 1,
          bgcolor: "background.paper",
        }}
      >
        <SearchIcon sx={{ color: "text.disabled", fontSize: 20, flexShrink: 0 }} />

        <InputBase
          placeholder="Buscar tendências por título ou assunto…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          sx={{ fontSize: "0.875rem", color: "text.primary" }}
          inputProps={{ "aria-label": "buscar tendências" }}
        />

        {query && (
          <IconButton size="small" onClick={() => setQuery("")} sx={{ flexShrink: 0 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Typography variant="caption" color="text.disabled" noWrap sx={{ flexShrink: 0 }}>
          {query.trim().length >= 2
            ? `${total} resultado${total !== 1 ? "s" : ""}`
            : `${total} tendência${total !== 1 ? "s" : ""}`}
        </Typography>
      </Box>

      {/* Linha inferior — filtros por tópico */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1,
          bgcolor: "#f8fafc",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <FilterListIcon sx={{ fontSize: 14, color: "text.disabled" }} />
          <Typography variant="caption" color="text.disabled" fontWeight={600} letterSpacing={0.5}>
            TÓPICO
          </Typography>
        </Stack>

        <Divider orientation="vertical" flexItem />

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          <Chip
            label="Todos"
            size="small"
            onClick={() => selectTopic()}
            sx={{
              fontWeight: 600,
              fontSize: "0.72rem",
              cursor: "pointer",
              bgcolor: !active ? "primary.main" : "transparent",
              color: !active ? "white" : "text.secondary",
              border: "1px solid",
              borderColor: !active ? "primary.main" : "divider",
              "&:hover": { bgcolor: !active ? "primary.dark" : "#f1f5f9" },
            }}
          />
          {topics.map((t) => (
            <Chip
              key={t.slug}
              label={t.name}
              size="small"
              onClick={() => selectTopic(t.slug)}
              sx={{
                fontWeight: 600,
                fontSize: "0.72rem",
                cursor: "pointer",
                bgcolor: active === t.slug ? "primary.main" : "transparent",
                color: active === t.slug ? "white" : "text.secondary",
                border: "1px solid",
                borderColor: active === t.slug ? "primary.main" : "divider",
                "&:hover": { bgcolor: active === t.slug ? "primary.dark" : "#f1f5f9" },
              }}
            />
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}
