import { TopicColor } from "@/lib/mongodb/models/Topic";

interface TopicBadgeProps {
  name: string;
  color: TopicColor | string;
}

const colorClasses: Record<string, string> = {
  blue: "bg-blue-900/60 text-blue-300 border border-blue-700/40",
  emerald: "bg-emerald-900/60 text-emerald-300 border border-emerald-700/40",
  violet: "bg-violet-900/60 text-violet-300 border border-violet-700/40",
  amber: "bg-amber-900/60 text-amber-300 border border-amber-700/40",
  rose: "bg-rose-900/60 text-rose-300 border border-rose-700/40",
  cyan: "bg-cyan-900/60 text-cyan-300 border border-cyan-700/40",
  orange: "bg-orange-900/60 text-orange-300 border border-orange-700/40",
  teal: "bg-teal-900/60 text-teal-300 border border-teal-700/40",
  pink: "bg-pink-900/60 text-pink-300 border border-pink-700/40",
  indigo: "bg-indigo-900/60 text-indigo-300 border border-indigo-700/40",
};

export function TopicBadge({ name, color }: TopicBadgeProps) {
  const cls = colorClasses[color] ?? colorClasses.blue;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {name}
    </span>
  );
}
