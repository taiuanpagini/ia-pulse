import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { TrendDetail } from "@/lib/trends/service";

type TrendDetailHeaderProps = Pick<
  TrendDetail,
  "title" | "summary" | "url" | "source" | "topicName" | "topicColor" | "collectedAt" | "publishedAt"
>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function TrendDetailHeader({
  title,
  summary,
  url,
  source,
  topicName,
  topicColor,
  collectedAt,
  publishedAt,
}: TrendDetailHeaderProps) {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, mb: 2.5 }}>
        {summary}
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        <TopicBadge name={topicName} color={topicColor} />
        <Typography variant="caption" color="text.secondary">{source}</Typography>
        {publishedAt ? (
          <Typography variant="caption" color="text.disabled">
            Publicado em {formatDate(publishedAt)}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">
            Coletado em {formatDate(collectedAt)}
          </Typography>
        )}

        {url ? (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, ml: "auto" }}
          >
            Ver fonte original
            <OpenInNewIcon sx={{ fontSize: 12 }} />
          </Link>
        ) : (
          <Typography variant="caption" color="text.disabled" sx={{ ml: "auto" }}>
            URL não disponível
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
