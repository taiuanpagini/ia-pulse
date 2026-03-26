"use client";

import { useRouter } from "next/navigation";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { TopicResponse } from "@/lib/topics/schemas";

interface TopicFilterBarProps {
  topics: TopicResponse[];
  active?: string;
}

export function TopicFilterBar({ topics, active }: TopicFilterBarProps) {
  const router = useRouter();

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip
        label="Todos"
        onClick={() => router.push("/")}
        variant={!active ? "filled" : "outlined"}
        color={!active ? "primary" : "default"}
        size="small"
        sx={{ fontWeight: 600, cursor: "pointer" }}
      />
      {topics.map((t) => (
        <Chip
          key={t.slug}
          label={t.name}
          onClick={() => router.push(`/?topic=${t.slug}`)}
          variant={active === t.slug ? "filled" : "outlined"}
          color={active === t.slug ? "primary" : "default"}
          size="small"
          sx={{ fontWeight: 600, cursor: "pointer" }}
        />
      ))}
    </Stack>
  );
}
