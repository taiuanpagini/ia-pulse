"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
}

export function Pagination({ page, total, limit }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/?${params.toString()}`);
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(page - 1)}
        disabled={page <= 1}
        variant="outlined"
      >
        Anterior
      </Button>
      <Typography variant="caption" color="text.secondary" px={1}>
        {page} / {totalPages}
      </Typography>
      <Button
        size="small"
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate(page + 1)}
        disabled={page >= totalPages}
        variant="outlined"
      >
        Próxima
      </Button>
    </Stack>
  );
}
