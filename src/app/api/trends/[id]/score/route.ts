import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { ScoreInputSchema } from "@/lib/scoring/schemas";
import { calculateScore } from "@/lib/scoring/formula";
import { connectDB } from "@/lib/mongodb/client";
import { Trend } from "@/lib/mongodb/models/Trend";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Tendência não encontrada" } },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Body inválido" } },
      { status: 400 }
    );
  }

  const parsed = ScoreInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  const { maturity, applicability, competitiveImpact, strategicAlignment, adoptionComplexity, notes, scoredBy } =
    parsed.data;

  const total = calculateScore({ maturity, applicability, competitiveImpact, strategicAlignment, adoptionComplexity });
  if (total === null) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Critérios incompletos" } },
      { status: 422 }
    );
  }

  try {
    await connectDB();

    const trend = await Trend.findOneAndUpdate(
      { _id: id, deletedAt: null },
      {
        $set: {
          score: {
            maturity,
            applicability,
            competitiveImpact,
            strategicAlignment,
            adoptionComplexity,
            total,
            scoredBy,
            scoredAt: new Date(),
            notes: notes ?? "",
          },
        },
      },
      { new: true }
    );

    if (!trend) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Tendência não encontrada" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: String(trend._id),
        score: trend.score,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
