import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/client";
import mongoose from "mongoose";

export async function GET(): Promise<NextResponse> {
  const start = Date.now();

  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        {
          status: "degraded",
          database: "disconnected",
          durationMs: Date.now() - start,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      durationMs: Date.now() - start,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        status: "degraded",
        database: "error",
        error: message,
        durationMs: Date.now() - start,
      },
      { status: 503 }
    );
  }
}
