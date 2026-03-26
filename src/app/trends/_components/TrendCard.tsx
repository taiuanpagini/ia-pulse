import Link from "next/link";
import { TrendListItem } from "@/lib/trends/schemas";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

interface TrendCardProps {
  trend: TrendListItem;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TrendCard({ trend }: TrendCardProps) {
  return (
    <article className="rounded-xl border border-gray-800 bg-gray-900 p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/trends/${trend.id}`}
          className="text-base font-semibold text-gray-100 hover:text-blue-400 transition-colors line-clamp-2 flex-1"
        >
          {trend.title}
        </Link>
        {trend.score ? (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-lg font-bold text-white">
              {trend.score.total.toFixed(2)}
            </span>
            <ScoreBadge total={trend.score.total} />
          </div>
        ) : (
          <span className="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
            Não avaliado
          </span>
        )}
      </div>

      <p className="text-sm text-gray-400 line-clamp-3">{trend.summary}</p>

      <div className="flex items-center gap-2 flex-wrap mt-auto">
        <TopicBadge name={trend.topicName} color={trend.topicColor} />
        <span className="text-xs text-gray-500">{trend.source}</span>
        <span className="text-xs text-gray-600 ml-auto">{formatDate(trend.collectedAt)}</span>
      </div>
    </article>
  );
}
