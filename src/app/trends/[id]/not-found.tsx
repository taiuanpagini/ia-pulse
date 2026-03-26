import NextLink from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <ManageSearchIcon sx={{ fontSize: 56, color: "text.disabled" }} />
        <Typography variant="h5" fontWeight={700}>Tendência não encontrada</Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={320}>
          O conteúdo que você procura não existe ou foi removido.
        </Typography>
        <Button
          component={NextLink}
          href="/"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          size="small"
        >
          Voltar ao dashboard
        </Button>
      </Box>
    </Box>
  );
}
