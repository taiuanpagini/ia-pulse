import { NextRequest, NextResponse } from "next/server";
import { TrendFiltersSchema } from "@/lib/trends/schemas";
import { listTrends } from "@/lib/trends/service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const rawFilters = Object.fromEntries(searchParams.entries());

  const parsed = TrendFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_FILTERS", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const result = await listTrends(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
