"use client";

import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
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
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ mt: 3, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(page - 1)}
        disabled={page <= 1}
        variant="outlined"
        sx={{ minWidth: 120 }}
      >
        Anterior
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textAlign: "center" }}>
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </Typography>

      <Button
        endIcon={<ArrowForwardIcon />}
        onClick={() => navigate(page + 1)}
        disabled={page >= totalPages}
        variant="outlined"
        sx={{ minWidth: 120 }}
      >
        Próxima
      </Button>
    </Stack>
  );
}
