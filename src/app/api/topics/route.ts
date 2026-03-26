import { NextRequest, NextResponse } from "next/server";
import { CreateTopicSchema } from "@/lib/topics/schemas";
import { listTopics, createTopicService, SlugConflictError } from "@/lib/topics/service";

export async function GET(): Promise<NextResponse> {
  try {
    const topics = await listTopics();
    return NextResponse.json({ data: topics });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_JSON", message: "Body inválido" } }, { status: 400 });
  }

  const parsed = CreateTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const topic = await createTopicService(parsed.data);
    return NextResponse.json({ data: topic }, { status: 201 });
  } catch (err) {
    if (err instanceof SlugConflictError) {
      return NextResponse.json(
        { error: { code: "SLUG_CONFLICT", message: err.message } },
        { status: 409 }
      );
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
  }
}
