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

// Maps topic color key → vibrant accent for left border
const topicBorderColor: Record<string, string> = {
  blue:    "#3b82f6",
  emerald: "#10b981",
  violet:  "#7c3aed",
  amber:   "#f59e0b",
  rose:    "#f43f5e",
  cyan:    "#06b6d4",
  orange:  "#f97316",
  teal:    "#14b8a6",
  pink:    "#ec4899",
  indigo:  "#6366f1",
};

// Score number color per level
const scoreTextColor: Record<string, string> = {
  low:      "#94a3b8",
  medium:   "#d97706",
  high:     "#059669",
  critical: "#4338ca",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TrendCard(props: TrendCardProps) {
  const { variant, id, title, source, topicName, topicColor, collectedAt, publishedAt } = props;

  const displayTitle = ("titlePt" in props && props.titlePt) ? props.titlePt : title;
  const displayDate = publishedAt ? formatDate(publishedAt) : formatDate(collectedAt);
  const accentColor = topicBorderColor[topicColor] ?? "#6366f1";

  const scoreLevel =
    variant === "scored"
      ? getScoreLevel(props.score.total).level
      : null;

  return (
    <Card
      sx={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        borderLeft: "3px solid",
        borderLeftColor: accentColor,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 12px 32px -6px rgb(0 0 0 / 0.14), 0 4px 8px -2px rgb(0 0 0 / 0.06)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea
        component={NextLink}
        href={`/trends/${id}`}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            p: 2.5,
            pb: "20px !important",
            gap: 1.5,
          }}
        >
          {/* Header row: topic badge + score/pending */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
            <TopicBadge name={topicName} color={topicColor} />
            {variant === "scored" ? (
              <ScoreBadge total={props.score.total} />
            ) : (
              <Chip
                label="Pendente"
                size="small"
                sx={{
                  bgcolor: "#f8fafc",
                  color: "#94a3b8",
                  fontSize: "0.65rem",
                  height: 20,
                  border: "1px dashed #cbd5e1",
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            )}
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

          {/* Footer: source · date · score number · lang badge */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            mt="auto"
            flexWrap="wrap"
            useFlexGap
            sx={{ gap: "4px 6px" }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
              noWrap
              sx={{ fontSize: "0.72rem" }}
            >
              {source}
            </Typography>

            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.72rem" }}>·</Typography>

            <Typography
              variant="caption"
              color="text.disabled"
              noWrap
              sx={{ fontSize: "0.72rem" }}
            >
              {displayDate}
            </Typography>

            {variant === "scored" && scoreLevel && (
              <>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.72rem" }}>·</Typography>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                  sx={{ color: scoreTextColor[scoreLevel], fontSize: "0.72rem" }}
                  noWrap
                >
                  {props.score.total.toFixed(2)}
                </Typography>
              </>
            )}

            {(("lang" in props && props.lang === "pt") || ("titlePt" in props && props.titlePt)) && (
              <Chip
                label="PT"
                size="small"
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontSize: "0.6rem",
                  height: 16,
                  "& .MuiChip-label": { px: 0.5 },
                }}
              />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
