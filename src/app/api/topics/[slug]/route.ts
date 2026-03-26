import { NextRequest, NextResponse } from "next/server";
import { UpdateTopicSchema } from "@/lib/topics/schemas";
import { updateTopicDescriptionService } from "@/lib/topics/service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_JSON", message: "Body inválido" } }, { status: 400 });
  }

  const parsed = UpdateTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
      { status: 422 }
    );
  }

  try {
    const topic = await updateTopicDescriptionService(slug, parsed.data.description);
    if (!topic) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Tópico '${slug}' não encontrado` } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: topic });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
  }
}
