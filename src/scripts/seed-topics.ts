import path from "path";

try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));
} catch {
  // .env.local optional in CI/production
}

import { connectDB } from "@/lib/mongodb/client";
import { Topic } from "@/lib/mongodb/models/Topic";

const INITIAL_TOPICS = [
  {
    name: "Infraestrutura",
    slug: "infraestrutura",
    description: "GPUs, TPUs, edge computing, quantização e hardware para IA",
    color: "blue" as const,
  },
  {
    name: "Regulamentação",
    slug: "regulamentacao",
    description:
      "AI Act (EU), legislação brasileira (ANPD, PL 2338), NIST AI RMF e compliance",
    color: "amber" as const,
  },
];

async function seed() {
  await connectDB();

  for (const topic of INITIAL_TOPICS) {
    await Topic.updateOne(
      { slug: topic.slug },
      { $setOnInsert: topic },
      { upsert: true }
    );
    console.log(`✓ Topic "${topic.name}" ensured`);
  }

  console.log("Seed concluído.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
