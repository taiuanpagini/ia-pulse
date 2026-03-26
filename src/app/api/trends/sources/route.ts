import { NextResponse } from "next/server";
import { listSources } from "@/lib/trends/service";

export async function GET(): Promise<NextResponse> {
  try {
    const sources = await listSources();
    return NextResponse.json({ data: sources });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
