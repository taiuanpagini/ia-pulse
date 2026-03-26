import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb/client";
import { Trend } from "@/lib/mongodb/models/Trend";
import { createLLMAdapter } from "@/lib/llm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: { code: "INVALID_ID" } }, { status: 404 });
  }

  const llm = createLLMAdapter();
  if (!llm) {
    return NextResponse.json(
      { error: { code: "LLM_NOT_CONFIGURED", message: "Configure LLM_API_KEY no .env.local para usar tradução automática." } },
      { status: 503 }
    );
  }

  await connectDB();
  const trend = await Trend.findOne({ _id: id, deletedAt: null });

  if (!trend) {
    return NextResponse.json({ error: { code: "TREND_NOT_FOUND" } }, { status: 404 });
  }

  // Já traduzido
  if (trend.titlePt && trend.summaryPt) {
    return NextResponse.json({
      data: { titlePt: trend.titlePt, summaryPt: trend.summaryPt, cached: true },
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const prompt = `Traduza o seguinte conteúdo sobre inteligência artificial para o português do Brasil. Mantenha termos técnicos em inglês quando não tiverem tradução consagrada. Retorne APENAS um JSON com os campos "titlePt" e "summaryPt".

Título original: ${trend.title}
Resumo original: ${trend.summary}

JSON de resposta:`;

    // Usa o provider LLM já configurado para chamar diretamente
    const providerName = process.env.LLM_PROVIDER ?? "openai";
    let titlePt = "";
    let summaryPt = "";

    if (providerName === "gemini") {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const json = JSON.parse(text.replace(/```json|```/g, "").trim()) as { titlePt: string; summaryPt: string };
      titlePt = json.titlePt;
      summaryPt = json.summaryPt;
    } else {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.LLM_API_KEY });
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }, { signal: controller.signal });
      const json = JSON.parse(completion.choices[0]?.message.content ?? "{}") as { titlePt: string; summaryPt: string };
      titlePt = json.titlePt;
      summaryPt = json.summaryPt;
    }

    clearTimeout(timeout);

    if (!titlePt || !summaryPt) {
      throw new Error("Resposta inválida da LLM");
    }

    await Trend.updateOne({ _id: id }, { $set: { titlePt, summaryPt } });

    return NextResponse.json({ data: { titlePt, summaryPt, cached: false } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro na tradução";
    return NextResponse.json({ error: { code: "TRANSLATION_ERROR", message } }, { status: 500 });
  }
}
