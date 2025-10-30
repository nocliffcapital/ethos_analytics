import { NextRequest, NextResponse } from "next/server";
import { resolveUserkey } from "@/lib/ethos";

export async function GET(req: NextRequest) {
  try {
    const twitter = req.nextUrl.searchParams.get("twitter");
    const wallet = req.nextUrl.searchParams.get("wallet");
    const userkey = req.nextUrl.searchParams.get("userkey");

    console.log(`[Resolve] Request: twitter=${twitter}, wallet=${wallet}, userkey=${userkey}`);

    if (!twitter && !wallet && !userkey) {
      return NextResponse.json(
        { error: "Either twitter, wallet, or userkey parameter required" },
        { status: 400 }
      );
    }

    const profile = await resolveUserkey({ 
      twitter: twitter || undefined, 
      wallet: wallet || undefined,
      userkey: userkey || undefined
    });

    if (!profile) {
      console.log(`[Resolve] No profile found`);
      return NextResponse.json(
        { 
          error: "No Ethos profile found",
          details: "Unable to find profile on Ethos Network. Make sure the account exists and has activity."
        },
        { status: 404 }
      );
    }

    console.log(`[Resolve] Found profile: ${profile.userkey}`);

    return NextResponse.json({ 
      userkey: profile.userkey, 
      profile 
    }, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("[Resolve] Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

