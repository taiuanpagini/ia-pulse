import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb/client";
import { Trend } from "@/lib/mongodb/models/Trend";
import mongoose from "mongoose";

const bodySchema = z.object({
  status: z.enum(["pending", "approved", "discarded"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: { message: "ID inválido" } }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Status inválido. Use: pending, approved ou discarded." } },
      { status: 400 }
    );
  }

  await connectDB();

  const objId = new mongoose.Types.ObjectId(id);
  const now = new Date();

  // Usa a collection diretamente para evitar que o strict mode do Mongoose
  // filtre campos adicionados após o model ter sido cacheado no hot-reload
  const result = await Trend.collection.updateOne(
    { _id: objId },
    { $set: { status: parsed.data.status, statusAt: now } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: { message: "Tendência não encontrada" } }, { status: 404 });
  }

  return NextResponse.json({
    data: { id, status: parsed.data.status, statusAt: now.toISOString() },
  });
}
