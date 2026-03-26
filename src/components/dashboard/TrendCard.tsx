import Link from "next/link";
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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-2 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/trends/${id}`}
          className="text-sm font-medium text-zinc-100 hover:text-white line-clamp-2 flex-1"
        >
          {title}
        </Link>

        {variant === "scored" ? (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <ScoreBadge total={props.score.total} />
            <span className="text-xs text-zinc-400 font-mono">
              {props.score.total.toFixed(2)}
            </span>
          </div>
        ) : (
          <span className="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            Não avaliado
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <TopicBadge name={topicName} color={topicColor} />
        <span className="text-xs text-zinc-500">{source}</span>
        <span className="text-xs text-zinc-600">{formatDate(collectedAt)}</span>
      </div>
    </div>
  );
}
