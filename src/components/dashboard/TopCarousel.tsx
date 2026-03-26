import NextLink from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { getScoreLevel } from "@/lib/scoring/levels";
import type { ScoredTrendCard } from "@/lib/trends/service";

const topicBorderColor: Record<string, string> = {
  blue:    "#2563EB",
  emerald: "#059669",
  violet:  "#68009F",
  amber:   "#FDC500",
  rose:    "#D2006F",
  cyan:    "#0891B2",
  orange:  "#EA580C",
  teal:    "#0F766E",
  pink:    "#D2006F",
  indigo:  "#68009F",
};

const scoreTextColor: Record<string, string> = {
  low:      "#9CA3AF",
  medium:   "#D2006F",
  high:     "#68009F",
  critical: "#92600A",
};

// Medalhas com amarelo brand no 1º lugar
const MEDAL: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "1º", color: "#92600A", bg: "#FDC500" },
  2: { label: "2º", color: "#4A006F", bg: "#E9D5FF" },
  3: { label: "3º", color: "#9F0050", bg: "#FFE4F0" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

interface CarouselCardProps {
  trend: ScoredTrendCard;
  rank: number;
}

function CarouselCard({ trend, rank }: CarouselCardProps) {
  const medal = MEDAL[rank] ?? { label: `${rank}º`, color: "#4f46e5", bg: "#eef2ff" };
  const scoreLevel = getScoreLevel(trend.score.total).level;
  const accentColor = topicBorderColor[trend.topicColor] ?? "#6366f1";
  const displayTitle = trend.titlePt ?? trend.title;
  const displayDate = trend.publishedAt ? formatDate(trend.publishedAt) : formatDate(trend.collectedAt);

  return (
    <Card
      sx={{
        minWidth: 260,
        maxWidth: 260,
        scrollSnapAlign: "start",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderLeft: "3px solid",
        borderLeftColor: accentColor,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: "0 12px 32px -6px rgb(0 0 0 / 0.16)",
          transform: "translateY(-3px)",
        },
      }}
    >
      <CardActionArea
        component={NextLink}
        href={`/trends/${trend.id}`}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2, pb: "16px !important", display: "flex", flexDirection: "column", gap: 1.25 }}>
          {/* Rank + score */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ px: 1, py: 0.25, borderRadius: "6px", bgcolor: medal.bg, display: "inline-flex", alignItems: "center" }}>
              <Typography sx={{ color: medal.color, fontWeight: 800, fontSize: "0.8rem" }}>
                {medal.label}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography
                sx={{
                  color: scoreTextColor[scoreLevel],
                  fontWeight: 800,
                  fontSize: "1rem",
                  fontFamily: "monospace",
                }}
              >
                {trend.score.total.toFixed(2)}
              </Typography>
              <ScoreBadge total={trend.score.total} />
            </Stack>
          </Stack>

          {/* Topic */}
          <TopicBadge name={trend.topicName} color={trend.topicColor} />

          {/* Title */}
          <Typography
            variant="body2"
            fontWeight={600}
            color="text.primary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
              flex: 1,
              fontSize: "0.85rem",
            }}
          >
            {displayTitle}
          </Typography>

          {/* Footer */}
          <Typography variant="caption" color="text.disabled" noWrap sx={{ fontSize: "0.7rem", mt: "auto" }}>
            {trend.source} · {displayDate}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

interface TopCarouselProps {
  trends: ScoredTrendCard[];
}

export function TopCarousel({ trends }: TopCarouselProps) {
  if (trends.length === 0) return null;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
      <Box sx={{ px: 1.25, py: 0.5, borderRadius: "8px", bgcolor: "#FDC500", display: "inline-flex", alignItems: "center" }}>
          <Typography sx={{ color: "#121212", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            TOP {trends.length}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Tendências mais pontuadas do período
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 2,
          pb: 2,
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          mx: -0.5,
          px: 0.5,
        }}
      >
        {trends.map((t, i) => (
          <CarouselCard key={t.id} trend={t} rank={i + 1} />
        ))}
      </Box>
    </Box>
  );
}
