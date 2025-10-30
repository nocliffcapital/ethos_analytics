import { NextRequest, NextResponse } from "next/server";
import { enqueueIngest } from "@/lib/queue";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userkey, priority = "normal" } = body;

    if (!userkey) {
      return NextResponse.json(
        { error: "userkey required" },
        { status: 400 }
      );
    }

    // Enqueue the ingestion job
    await enqueueIngest(userkey, priority);

    return NextResponse.json({
      message: "Ingestion job queued",
      userkey,
    });
  } catch (error) {
    console.error("Error queueing ingest job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

