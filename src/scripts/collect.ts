import path from "path";

try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));
} catch {
  // .env.local optional in CI/production
}

import { connectDB } from "@/lib/mongodb/client";
import { runCollectors } from "@/lib/collectors/orchestrator";

async function main() {
  await connectDB();
  console.log("Iniciando coleta...\n");

  const report = await runCollectors();

  console.log(`✓ Coleta finalizada em ${report.durationMs}ms`);
  console.log(`  Total coletado das fontes : ${report.totalItems}`);
  console.log(`  Inseridos (novos)         : ${report.inserted}`);
  console.log(`  Ignorados (duplicados)    : ${report.skipped}`);
  console.log("\nDetalhes por fonte:");

  for (const s of report.sources) {
    const status = s.status === "error" ? `❌ ERRO: ${s.error}` : `✓ ${s.itemsCollected} item(s)`;
    console.log(`  [${s.source}] ${status}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Erro na coleta:", err);
  process.exit(1);
});
