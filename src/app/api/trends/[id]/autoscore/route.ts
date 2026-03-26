import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb/client";
import { Trend } from "@/lib/mongodb/models/Trend";
import { createLLMAdapter } from "@/lib/llm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Tendência não encontrada" } },
      { status: 404 }
    );
  }

  const adapter = createLLMAdapter();
  if (!adapter) {
    return NextResponse.json(
      { error: { code: "LLM_NOT_CONFIGURED", message: "LLM_API_KEY não configurada" } },
      { status: 503 }
    );
  }

  try {
    await connectDB();

    const trend = await Trend.findOne({ _id: id, deletedAt: null }).lean();
    if (!trend) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Tendência não encontrada" } },
        { status: 404 }
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    try {
      const suggestion = await Promise.race([
        adapter.suggestScore(trend.title, trend.summary),
        new Promise<never>((_, reject) =>
          controller.signal.addEventListener("abort", () =>
            reject(Object.assign(new Error("LLM_TIMEOUT"), { code: "LLM_TIMEOUT" }))
          )
        ),
      ]);

      return NextResponse.json({ data: suggestion });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);

      if (errMsg === "LLM_TIMEOUT" || (err instanceof Error && err.name === "AbortError")) {
        return NextResponse.json(
          { error: { code: "LLM_TIMEOUT", message: "LLM demorou mais de 10s" } },
          { status: 504 }
        );
      }

      if (errMsg === "LLM_INVALID_RESPONSE") {
        return NextResponse.json(
          { error: { code: "LLM_INVALID_RESPONSE", message: "Resposta inválida da LLM" } },
          { status: 422 }
        );
      }

      throw err;
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
