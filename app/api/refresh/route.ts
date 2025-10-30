import { NextRequest, NextResponse } from "next/server";
import { enqueueIngest } from "@/lib/queue";
import { deleteCached } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userkey } = body;

    if (!userkey) {
      return NextResponse.json(
        { error: "userkey required" },
        { status: 400 }
      );
    }

    // Clear cache
    await deleteCached(`summary:${userkey}`);

    // Queue high-priority refresh
    await enqueueIngest(userkey, "high");

    return NextResponse.json({
      message: "Refresh queued",
      userkey,
    });
  } catch (error) {
    console.error("Error queueing refresh:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

