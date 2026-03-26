import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export function DashboardEmptyState() {
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
        Nenhuma tendência coletada ainda.
      </Typography>
      <Typography variant="body2" textAlign="center" maxWidth={360} color="text.disabled">
        O sistema coleta automaticamente todos os dias às 07:00 UTC.
      </Typography>
    </Box>
  );
}
