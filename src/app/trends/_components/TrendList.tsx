import { TrendListItem } from "@/lib/trends/schemas";
import { TrendCard } from "./TrendCard";

interface TrendListProps {
  trends: TrendListItem[];
}

export function TrendList({ trends }: TrendListProps) {
  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm">Nenhuma tendência encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trends.map((trend) => (
        <TrendCard key={trend.id} trend={trend} />
      ))}
    </div>
  );
}
