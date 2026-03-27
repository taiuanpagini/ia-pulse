"use client";

import { useRouter } from "next/navigation";
import MuiLink from "@mui/material/Link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({ fallbackHref = "/", label = "Voltar" }: BackButtonProps) {
  const router = useRouter();

  return (
    <MuiLink
      component="button"
      underline="none"
      onClick={() => router.back()}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        color: "rgba(250,250,250,0.5)",
        fontSize: "0.8rem",
        fontWeight: 500,
        px: 1.5,
        py: 0.75,
        borderRadius: "8px",
        border: "1px solid rgba(250,250,250,0.12)",
        bgcolor: "rgba(250,250,250,0.05)",
        cursor: "pointer",
        transition: "all 0.15s",
        "&:hover": {
          color: "#FDC500",
          bgcolor: "rgba(253,197,0,0.08)",
          borderColor: "rgba(253,197,0,0.3)",
        },
      }}
    >
      <ArrowBackIcon sx={{ fontSize: 14 }} />
      {label}
    </MuiLink>
  );
}
