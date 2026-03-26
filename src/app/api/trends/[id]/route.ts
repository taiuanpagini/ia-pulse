import { NextRequest, NextResponse } from "next/server";
import { getTrendDetail } from "@/lib/trends/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const trend = await getTrendDetail(id);

    if (!trend) {
      return NextResponse.json(
        { error: { code: "TREND_NOT_FOUND", message: "Tendência não encontrada" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: trend });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
