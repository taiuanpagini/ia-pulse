import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

interface DashboardEmptyStateProps {
  message?: string;
  sub?: string;
}

export function DashboardEmptyState({
  message = "Nenhuma tendência coletada ainda.",
  sub = "O sistema coleta automaticamente todos os dias às 07:00 UTC.",
}: DashboardEmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        py: 12,
        color: "text.disabled",
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 56, opacity: 0.35 }} />
      <Typography variant="body1" textAlign="center" maxWidth={360} color="text.secondary">
        {message}
      </Typography>
      <Typography variant="body2" textAlign="center" maxWidth={360} color="text.disabled">
        {sub}
      </Typography>
    </Box>
  );
}
