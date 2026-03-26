import { ExternalLink } from "lucide-react";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { TrendDetail } from "@/lib/trends/service";

type TrendDetailHeaderProps = Pick<
  TrendDetail,
  "title" | "summary" | "url" | "source" | "topicName" | "topicColor" | "collectedAt"
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
}: TrendDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-zinc-100 leading-snug">{title}</h1>
      <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 w-fit"
        >
          Ver fonte original
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="text-sm text-zinc-500">URL não disponível</span>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
        <TopicBadge name={topicName} color={topicColor} />
        <span>{source}</span>
        <span>{formatDate(collectedAt)}</span>
      </div>
    </div>
  );
}
