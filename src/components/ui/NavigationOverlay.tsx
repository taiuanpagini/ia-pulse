"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigation } from "@/contexts/NavigationContext";

export function NavigationOverlay() {
  const { isPending } = useNavigation();

  if (!isPending) return null;

  return (
    <>
      {/* Dimming sutil no conteúdo */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1400,
          pointerEvents: "none",
          bgcolor: "rgba(250,250,250,0.55)",
          backdropFilter: "blur(1px)",
          transition: "opacity 0.2s",
        }}
      />
      {/* Spinner discreto centralizado */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1401,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "#121212",
          color: "#FDC500",
          borderRadius: "100px",
          px: 1.75,
          py: 1,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}
      >
        <CircularProgress size={14} sx={{ color: "#FDC500" }} />
        <Box
          component="span"
          sx={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(250,250,250,0.8)", letterSpacing: "0.02em" }}
        >
          Carregando...
        </Box>
      </Box>
    </>
  );
}
