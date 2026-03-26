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

type TrendCardProps =
  | ({ variant: "scored" } & ScoredTrendCard)
  | ({ variant: "unscored" } & UnscoredTrendCard);

const TITLE_LINES = 3;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TrendCard(props: TrendCardProps) {
  const { variant, id, title, source, topicName, topicColor, collectedAt } = props;

  return (
    <Card
      sx={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.15s, border-color 0.15s",
        "&:hover": { boxShadow: "0 4px 16px 0 rgb(0 0 0 / 0.10)", borderColor: "primary.light" },
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
            gap: 1.5,
            pb: "16px !important",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: TITLE_LINES,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                flex: 1,
              }}
            >
              {title}
            </Typography>

            {variant === "scored" ? (
              <Stack alignItems="flex-end" gap={0.5} flexShrink={0}>
                <ScoreBadge total={props.score.total} />
                <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontWeight={700}>
                  {props.score.total.toFixed(2)}
                </Typography>
              </Stack>
            ) : (
              <Chip
                label="Pendente"
                size="small"
                sx={{ bgcolor: "#f1f5f9", color: "#94a3b8", fontSize: "0.7rem", height: 22, flexShrink: 0 }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center" mt="auto">
            <TopicBadge name={topicName} color={topicColor} />
            <Typography variant="caption" color="text.secondary" noWrap>{source}</Typography>
            <Typography variant="caption" color="text.disabled" noWrap>{formatDate(collectedAt)}</Typography>
            {(props.lang === "pt" || props.titlePt) && (
              <Chip
                label={props.lang === "pt" ? "PT-BR" : "Traduzido"}
                size="small"
                sx={{ bgcolor: "#dcfce7", color: "#166534", fontSize: "0.65rem", height: 18, "& .MuiChip-label": { px: 0.75 } }}
              />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
