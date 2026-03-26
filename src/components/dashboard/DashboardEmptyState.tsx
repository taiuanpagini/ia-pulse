import { Inbox } from "lucide-react";

export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-zinc-500">
      <Inbox className="h-12 w-12 opacity-40" />
      <p className="text-sm text-center max-w-sm">
        Nenhuma tendência coletada ainda. O sistema coleta diariamente às 07:00 UTC.
      </p>
    </div>
  );
}
