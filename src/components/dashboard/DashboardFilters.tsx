"use client";

import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
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
import { TopicResponse } from "@/lib/topics/schemas";

// Topic color → accent dot color
const topicDotColor: Record<string, string> = {
  blue:    "#3b82f6",
  emerald: "#10b981",
  violet:  "#7c3aed",
  amber:   "#f59e0b",
  rose:    "#f43f5e",
  cyan:    "#06b6d4",
  orange:  "#f97316",
  teal:    "#14b8a6",
  pink:    "#ec4899",
  indigo:  "#6366f1",
};

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
        borderRadius: "12px",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      {/* Search row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          gap: 1,
        }}
      >
        <SearchIcon sx={{ color: "text.disabled", fontSize: 20, flexShrink: 0 }} />

        <InputBase
          placeholder="Buscar tendências por título ou assunto…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          sx={{
            fontSize: "0.9rem",
            color: "text.primary",
            "& input::placeholder": { color: "text.disabled", opacity: 1 },
          }}
          inputProps={{ "aria-label": "buscar tendências" }}
        />

        {query ? (
          <IconButton size="small" onClick={() => setQuery("")} sx={{ flexShrink: 0, color: "text.disabled" }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        ) : null}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Typography
          variant="caption"
          color="text.disabled"
          noWrap
          sx={{ flexShrink: 0, fontSize: "0.75rem", fontVariantNumeric: "tabular-nums" }}
        >
          {query.trim().length >= 2
            ? `${total} resultado${total !== 1 ? "s" : ""}`
            : `${total.toLocaleString("pt-BR")} tendência${total !== 1 ? "s" : ""}`}
        </Typography>
      </Box>

      {/* Topic filter row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: "#f8fafc",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          color="text.disabled"
          fontWeight={700}
          letterSpacing="0.08em"
          sx={{ fontSize: "0.65rem", textTransform: "uppercase", flexShrink: 0 }}
        >
          Tópico
        </Typography>

        <Divider orientation="vertical" flexItem />

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {/* Todos */}
          <Chip
            label="Todos"
            size="small"
            onClick={() => selectTopic()}
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                cursor: "pointer",
                height: 26,
                bgcolor: !active ? "#FDC500" : "transparent",
                color: !active ? "#121212" : "text.secondary",
                border: "1px solid",
                borderColor: !active ? "#FDC500" : "divider",
                "& .MuiChip-label": { px: 1.25 },
                "&:hover": {
                  bgcolor: !active ? "#E6B200" : "#F9FAFB",
                },
                transition: "all 0.15s",
              }}
          />

          {topics.map((t) => {
            const isActive = active === t.slug;
            const dot = topicDotColor[t.color ?? "blue"] ?? "#6366f1";
            return (
              <Chip
                key={t.slug}
                size="small"
                onClick={() => selectTopic(t.slug)}
                label={
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: isActive ? "#fff" : dot,
                        display: "inline-block",
                        flexShrink: 0,
                        transition: "background-color 0.15s",
                      }}
                    />
                    {t.name}
                  </span>
                }
                sx={{
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  height: 26,
                  bgcolor: isActive ? "#FDC500" : "transparent",
                  color: isActive ? "#121212" : "text.secondary",
                  border: "1px solid",
                  borderColor: isActive ? "#FDC500" : "divider",
                  "& .MuiChip-label": { px: 1.25 },
                  "&:hover": {
                    bgcolor: isActive ? "#E6B200" : "#F9FAFB",
                  },
                  transition: "all 0.15s",
                }}
              />
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
