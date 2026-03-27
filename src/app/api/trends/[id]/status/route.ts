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

  const trend = await Trend.findOneAndUpdate(
    { _id: id },
    { $set: { status: parsed.data.status, statusAt: new Date() } },
    { new: true }
  );

  if (!trend) {
    return NextResponse.json({ error: { message: "Tendência não encontrada" } }, { status: 404 });
  }

  return NextResponse.json({ data: { id, status: trend.status, statusAt: trend.statusAt } });
}
