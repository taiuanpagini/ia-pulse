import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/client";
import { runCollectors } from "@/lib/collectors/orchestrator";

export const maxDuration = 60;

async function handleCollect(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const report = await runCollectors();

    const successCount = report.sources.filter((s) => s.status === "success").length;
    const errorCount = report.sources.filter((s) => s.status === "error").length;

    console.log(
      `[IAPulse] Collection complete — inserted: ${report.inserted}, skipped: ${report.skipped}, ` +
        `sources ok: ${successCount}, sources failed: ${errorCount}, duration: ${report.durationMs}ms`
    );

    return NextResponse.json({
      ok: true,
      totalItems: report.totalItems,
      inserted: report.inserted,
      skipped: report.skipped,
      durationMs: report.durationMs,
      sources: report.sources,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[IAPulse] Cron collect failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Vercel Cron Jobs chamam via GET com Authorization: Bearer <CRON_SECRET>
export const GET = handleCollect;

// Chamadas manuais via POST (testes locais, curl, etc.)
export const POST = handleCollect;
