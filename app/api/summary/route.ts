import { NextRequest, NextResponse } from "next/server";
import { fetchAllReviews, resolveUserkey, fetchVouches, fetchProjectVotes } from "@/lib/ethos";
import { aggregate } from "@/lib/aggregate";
import { summarize } from "@/lib/summarize";
import { analyzeSpikes } from "@/lib/analyze-spikes";
import { getCachedSummary, setCachedSummary } from "@/lib/summary-cache";

export async function GET(req: NextRequest) {
  try {
    const userkeyRaw = req.nextUrl.searchParams.get("userkey");
    const forceRefresh = req.nextUrl.searchParams.get("refresh") === "true";
    
    // Extract user's API key from request headers (if provided)
    const userApiKey = req.headers.get("X-User-OpenAI-Key") || undefined;

    if (!userkeyRaw) {
      return NextResponse.json(
        { error: "userkey required" },
        { status: 400 }
      );
    }

    // Decode the userkey in case it's URL-encoded
    const userkey = decodeURIComponent(userkeyRaw);

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cached = getCachedSummary(userkey);
      if (cached) {
        console.log(`[Summary] Returning cached data for ${userkey}`);
        return NextResponse.json(cached, {
          headers: {
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", // 24 hours, 7 days stale
            "X-Cache-Status": "HIT",
          },
        });
      }
    }

    console.log(`[Summary] Generating fresh summary for userkey: ${userkey}`);

    // Fetch profile to get the actual Ethos score and profile info
    const profile = await resolveUserkey({ userkey });

    // Fetch vouches received
    console.log(`[Summary] Fetching vouches for ${userkey}...`);
    const vouchesReceived = await fetchVouches(userkey);
    console.log(`[Summary] Received ${vouchesReceived} vouches`);
    
    // Add vouches to profile
    if (profile) {
      profile.vouchesReceived = vouchesReceived;
    }

    // Try to fetch project voting data (only exists for projects)
    let projectVotes = null;
    if (profile?.twitter) {
      console.log(`[Summary] Checking for project voting data...`);
      projectVotes = await fetchProjectVotes(profile.twitter);
      if (projectVotes) {
        console.log(`[Summary] Found project votes: ${projectVotes.totalVotes} total (${projectVotes.percentBullish}% bullish)`);
      }
    }

    // Fetch fresh data directly (no cache/db for demo)
    const bySentiment = await fetchAllReviews(userkey);
    
    const totalReviews = 
      bySentiment.POSITIVE.length + 
      bySentiment.NEGATIVE.length + 
      bySentiment.NEUTRAL.length;

    console.log(`[Summary] Fetched ${totalReviews} reviews`);

    if (totalReviews === 0) {
      return NextResponse.json({
        userkey,
        summary: "No reviews found for this user.",
        positives: [],
        negatives: [],
        stats: {
          positive: 0,
          negative: 0,
          neutral: 0,
          pctPositive: 0,
        },
        timeline: [],
        outliers: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    // Aggregate (pass the actual Ethos score)
    const agg = aggregate(userkey, bySentiment, profile?.score);
    
    console.log(`[Summary] Timeline last 3 months:`, JSON.stringify(agg.timeline.slice(-3), null, 2));
    
    // Prepare review text for LLM
    const reviewTexts = {
      positive: bySentiment.POSITIVE.map(r => r.comment || "").filter(c => c.length > 10),
      negative: bySentiment.NEGATIVE.map(r => r.comment || "").filter(c => c.length > 10),
      neutral: bySentiment.NEUTRAL.map(r => r.comment || "").filter(c => c.length > 10),
    };
    
    // Summarize with LLM (GPT-5-nano)
    // Pass the display name so the LLM refers to the person by their actual name
    // Prefer Twitter handle over displayName for more recognizable identity
    const displayName = profile?.twitter || profile?.displayName || userkey.split(':').pop() || "the user";
    const summary = await summarize(agg, reviewTexts, displayName, userApiKey);
    
    // Analyze spikes (timeline anomalies)
    console.log(`[Summary] Detected ${agg.spikes.length} spike(s), analyzing...`);
    const spikeInsights = await analyzeSpikes(agg.spikes, displayName, userApiKey);
    
    // Build response
    const payload = {
      userkey,
      profile: profile ? {
        twitter: profile.twitter,
        primaryWallet: profile.primaryWallet,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        score: profile.score,
        vouchesReceived: profile.vouchesReceived,
      } : undefined,
      projectVotes: projectVotes || undefined, // Add project voting data if available
      ...summary,
      timeline: agg.timeline,
      spikeInsights, // NEW: Add spike analysis
      lastUpdated: new Date().toISOString(),
    };

    console.log(`[Summary] Generated summary successfully`);

    // Cache the generated summary for 24 hours
    setCachedSummary(userkey, payload);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", // 24 hours cache
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error) {
    console.error("[Summary] Error generating summary:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate summary",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

