"use client";

import { useRouter } from "next/navigation";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { TopicResponse } from "@/lib/topics/schemas";

interface TopicFilterBarProps {
  topics: TopicResponse[];
  active?: string;
}

export function TopicFilterBar({ topics, active }: TopicFilterBarProps) {
  const router = useRouter();

  function select(slug?: string) {
    router.push(slug ? `/?topic=${slug}` : "/");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => select()}
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
          !active
            ? "border-zinc-400 bg-zinc-700 text-zinc-100"
            : "border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
        }`}
      >
        Todos
      </button>

      {topics.map((t) => (
        <button
          key={t.slug}
          onClick={() => select(t.slug)}
          className={`inline-flex items-center rounded-full px-0.5 py-0.5 border transition-colors ${
            active === t.slug
              ? "border-zinc-400 ring-1 ring-zinc-400"
              : "border-transparent hover:border-zinc-600"
          }`}
        >
          <TopicBadge name={t.name} color={t.color} />
        </button>
      ))}
    </div>
  );
}
