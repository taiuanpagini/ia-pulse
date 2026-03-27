"use client";

import { useSearchParams } from "next/navigation";
import { useNavigation } from "@/contexts/NavigationContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

function getLast12Months(): { value: string; label: string }[] {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    months.push({ value, label: label.replace(". de ", "/").replace(".", "") });
  }
  return months;
}

interface PeriodSelectorProps {
  activePeriod: string;
}

export function PeriodSelector({ activePeriod }: PeriodSelectorProps) {
  const { navigate: navTo } = useNavigation();
  const searchParams = useSearchParams();
  const months = getLast12Months();

  function navigate(period: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", period);
    params.delete("page");
    navTo(`/?${params.toString()}`);
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        px: 2,
        py: 1.25,
        overflowX: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
        <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
        <Typography
          variant="caption"
          color="text.disabled"
          fontWeight={700}
          letterSpacing="0.08em"
          sx={{ fontSize: "0.65rem", textTransform: "uppercase" }}
        >
          Período
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
        {months.map((m) => {
          const isActive = activePeriod === m.value;
          return (
            <Chip
              key={m.value}
              label={m.label}
              size="small"
              onClick={() => navigate(m.value)}
              sx={{
                height: 26,
                fontSize: "0.72rem",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                bgcolor: isActive ? "#FDC500" : "transparent",
                color: isActive ? "#121212" : "text.secondary",
                border: "1px solid",
                borderColor: isActive ? "#FDC500" : "divider",
                "& .MuiChip-label": { px: 1.25 },
                "&:hover": { bgcolor: isActive ? "#E6B200" : "#F9FAFB" },
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
