import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { TrendCard } from "./TrendCard";
import { Pagination } from "./Pagination";
import type { ScoredTrendCard, UnscoredTrendCard } from "@/lib/trends/service";

interface StatusSectionProps {
  trends: (ScoredTrendCard | UnscoredTrendCard)[];
  total: number;
  page: number;
  limit: number;
  status: "approved" | "discarded";
}

const CONFIG = {
  approved: {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#059669" }} />,
    label: "Aprovados",
    sub: "Tendências seguidas para PoC ou ação",
    chipBg: "#ecfdf5",
    chipColor: "#065f46",
    iconBg: "#ecfdf5",
  },
  discarded: {
    icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: "#D2006F" }} />,
    label: "Descartados",
    sub: "Tendências descartadas da análise",
    chipBg: "#FFE4F0",
    chipColor: "#9F0050",
    iconBg: "#FFE4F0",
  },
};

export function StatusSection({ trends, total, page, limit, status }: StatusSectionProps) {
  const c = CONFIG[status];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {c.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" color="text.primary" sx={{ fontSize: "1rem", lineHeight: 1.2 }}>{c.label}</Typography>
          <Typography variant="caption" color="text.secondary">{c.sub}</Typography>
        </Box>
        <Chip
          label={`${total.toLocaleString("pt-BR")} itens`}
          size="small"
          sx={{ bgcolor: c.chipBg, color: c.chipColor, fontWeight: 700, fontSize: "0.7rem", height: 24, "& .MuiChip-label": { px: 1.25 } }}
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {trends.map((t) =>
          "score" in t && t.score != null
            ? <TrendCard key={t.id} variant="scored" {...(t as ScoredTrendCard)} />
            : <TrendCard key={t.id} variant="unscored" {...(t as UnscoredTrendCard)} />
        )}
      </Box>
      <Pagination page={page} total={total} limit={limit} />
    </Box>
  );
}
