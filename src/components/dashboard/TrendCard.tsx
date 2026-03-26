import NextLink from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ScoredTrendCard, UnscoredTrendCard } from "@/lib/trends/service";
import { getScoreLevel } from "@/lib/scoring/levels";

type TrendCardProps =
  | ({ variant: "scored" } & ScoredTrendCard)
  | ({ variant: "unscored" } & UnscoredTrendCard);

const topicBorderColor: Record<string, string> = {
  blue:    "#2563EB",
  emerald: "#059669",
  violet:  "#68009F", // brand purple
  amber:   "#FDC500", // brand yellow
  rose:    "#D2006F", // brand pink
  cyan:    "#0891B2",
  orange:  "#EA580C",
  teal:    "#0F766E",
  pink:    "#D2006F", // brand pink
  indigo:  "#68009F", // brand purple
};

const scoreTextColor: Record<string, string> = {
  low:      "#9CA3AF",
  medium:   "#D2006F", // brand pink
  high:     "#68009F", // brand purple
  critical: "#92600A", // dark gold (yellow on white = poor contrast)
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function TrendCard(props: TrendCardProps) {
  const { variant, id, title, source, topicName, topicColor, collectedAt, publishedAt } = props;

  const displayTitle = ("titlePt" in props && props.titlePt) ? props.titlePt : title;
  const displayDate  = publishedAt ? formatDate(publishedAt) : formatDate(collectedAt);
  const accentColor  = topicBorderColor[topicColor] ?? "#FDC500";

  const scoreLevel = variant === "scored" ? getScoreLevel(props.score.total).level : null;

  return (
    <Card
      sx={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        borderLeft: "3px solid",
        borderLeftColor: accentColor,
        bgcolor: "#FFFFFF",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 24px -4px rgba(253,197,0,0.18), 0 2px 8px -2px rgb(0 0 0 / 0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea
        component={NextLink}
        href={`/trends/${id}`}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2.5, pb: "20px !important", gap: 1.5 }}>

          {/* Header: topic + status + score badge */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
            <TopicBadge name={topicName} color={topicColor} />
            <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
              {variant === "scored" && props.status === "approved" && (
                <Chip label="Aprovado" size="small" sx={{ bgcolor: "#ECFDF5", color: "#065F46", fontSize: "0.62rem", height: 18, "& .MuiChip-label": { px: 0.75 } }} />
              )}
              {variant === "scored" && props.status === "discarded" && (
                <Chip label="Descartado" size="small" sx={{ bgcolor: "#FFE4F0", color: "#D2006F", fontSize: "0.62rem", height: 18, "& .MuiChip-label": { px: 0.75 } }} />
              )}
              {variant === "scored" ? (
                <ScoreBadge total={props.score.total} />
              ) : (
                <Chip
                  label="Pendente"
                  size="small"
                  sx={{ bgcolor: "#F9FAFB", color: "#9CA3AF", fontSize: "0.65rem", height: 20, border: "1px dashed #D1D5DB", "& .MuiChip-label": { px: 0.75 } }}
                />
              )}
            </Stack>
          </Box>

          {/* Title */}
          <Typography
            variant="body2"
            fontWeight={600}
            color="text.primary"
            sx={{
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
              fontSize: "0.875rem",
            }}
          >
            {displayTitle}
          </Typography>

          {/* Footer */}
          <Stack direction="row" spacing={0.5} alignItems="center" mt="auto" flexWrap="wrap" useFlexGap sx={{ gap: "4px 6px" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap sx={{ fontSize: "0.72rem" }}>{source}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.72rem" }}>·</Typography>
            <Typography variant="caption" color="text.disabled" noWrap sx={{ fontSize: "0.72rem" }}>{displayDate}</Typography>

            {variant === "scored" && scoreLevel && (
              <>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.72rem" }}>·</Typography>
                <Typography variant="caption" fontWeight={800} fontFamily="monospace" sx={{ color: scoreTextColor[scoreLevel], fontSize: "0.72rem" }} noWrap>
                  {props.score.total.toFixed(2)}
                </Typography>
              </>
            )}

            {(("lang" in props && props.lang === "pt") || ("titlePt" in props && props.titlePt)) && (
              <Chip label="PT" size="small" sx={{ bgcolor: "#FFF9E0", color: "#92600A", fontSize: "0.6rem", height: 16, "& .MuiChip-label": { px: 0.5 } }} />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
