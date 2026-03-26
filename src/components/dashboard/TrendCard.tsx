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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.15s",
        "&:hover": { boxShadow: "0 4px 16px 0 rgb(0 0 0 / 0.10)" },
      }}
    >
      <CardActionArea
        component={NextLink}
        href={`/trends/${id}`}
        sx={{ flexGrow: 1, alignItems: "flex-start", display: "flex", flexDirection: "column" }}
      >
        <CardContent sx={{ width: "100%", pb: "12px !important" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{
                lineHeight: 1.45,
                display: "-webkit-box",
                WebkitLineClamp: 2,
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

          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            <TopicBadge name={topicName} color={topicColor} />
            <Typography variant="caption" color="text.secondary">{source}</Typography>
            <Typography variant="caption" color="text.disabled">{formatDate(collectedAt)}</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
