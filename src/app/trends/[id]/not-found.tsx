import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <SearchX className="h-12 w-12 text-zinc-600" />
        <h1 className="text-xl font-semibold text-zinc-100">Tendência não encontrada</h1>
        <p className="text-sm text-zinc-500 max-w-xs">
          O conteúdo que você procura não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Voltar ao dashboard
        </Link>
      </div>
    </main>
  );
}
