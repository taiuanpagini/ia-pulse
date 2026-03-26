"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import type { TabCounts } from "@/lib/trends/service";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  countBg: string;
  countColor: string;
}

interface DashboardTabsProps {
  activeTab: string;
  counts: TabCounts;
}

export function DashboardTabs({ activeTab, counts }: DashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(tabId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  const tabs: Tab[] = [
    {
      id: "ranking",
      label: "Ranking",
      icon: <LeaderboardOutlinedIcon sx={{ fontSize: 16 }} />,
      count: counts.ranking,
      activeColor: "#121212",
      activeBg: "#FDC500",
      activeBorder: "#FDC500",
      countBg: "rgba(18,18,18,0.15)",
      countColor: "#121212",
    },
    {
      id: "approved",
      label: "Aprovados",
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
      count: counts.approved,
      activeColor: "#065F46",
      activeBg: "#ECFDF5",
      activeBorder: "#059669",
      countBg: "#BBF7D0",
      countColor: "#065F46",
    },
    {
      id: "discarded",
      label: "Descartados",
      icon: <CancelOutlinedIcon sx={{ fontSize: 16 }} />,
      count: counts.discarded,
      activeColor: "#D2006F",
      activeBg: "#FFE4F0",
      activeBorder: "#D2006F",
      countBg: "#FECDD3",
      countColor: "#9F0050",
    },
    {
      id: "awaiting",
      label: "Aguardando",
      icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />,
      count: counts.awaiting,
      activeColor: "#68009F",
      activeBg: "#F3E8FF",
      activeBorder: "#68009F",
      countBg: "#E9D5FF",
      countColor: "#4A006F",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#FFFFFF",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        p: 0.75,
        gap: 0.5,
      }}
    >
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <Box
            key={t.id}
            onClick={() => navigate(t.id)}
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              py: 1,
              px: { xs: 1, sm: 1.5 },
              borderRadius: "8px",
              cursor: "pointer",
              bgcolor: isActive ? t.activeBg : "transparent",
              color: isActive ? t.activeColor : "text.secondary",
              border: "1px solid",
              borderColor: isActive ? t.activeBorder : "transparent",
              transition: "all 0.15s",
              "&:hover": { bgcolor: isActive ? t.activeBg : "#F9FAFB" },
              userSelect: "none",
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "flex" }, color: "inherit" }}>{t.icon}</Box>
            <Typography variant="body2" fontWeight={isActive ? 700 : 500} fontSize="0.82rem" sx={{ color: "inherit", whiteSpace: "nowrap" }}>
              {t.label}
            </Typography>
            <Chip
              label={t.count.toLocaleString("pt-BR")}
              size="small"
              sx={{
                height: 18, fontSize: "0.65rem", fontWeight: 700,
                bgcolor: isActive ? t.countBg : "#F3F4F6",
                color: isActive ? t.countColor : "#6B7280",
                "& .MuiChip-label": { px: 0.75 },
                transition: "all 0.15s",
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
