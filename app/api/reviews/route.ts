import { NextRequest, NextResponse } from "next/server";
import { fetchAllReviews } from "@/lib/ethos";

export async function GET(req: NextRequest) {
  try {
    const userkeyRaw = req.nextUrl.searchParams.get("userkey");
    const sentiment = req.nextUrl.searchParams.get("sentiment");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    if (!userkeyRaw) {
      return NextResponse.json(
        { error: "userkey required" },
        { status: 400 }
      );
    }

    // Decode the userkey in case it's URL encoded
    const userkey = decodeURIComponent(userkeyRaw);

    // Fetch reviews directly from Ethos API (no database dependency for demo)
    const reviewsByScore = await fetchAllReviews(userkey);
    
    // Flatten the reviews from the grouped object into a single array
    const allReviews = [
      ...reviewsByScore.POSITIVE,
      ...reviewsByScore.NEGATIVE,
      ...reviewsByScore.NEUTRAL,
    ];
    
    // Filter by sentiment if specified
    const targetScore = sentiment === "POSITIVE" || sentiment === "NEGATIVE" || sentiment === "NEUTRAL"
      ? sentiment
      : null;
    
    const filteredReviews = targetScore
      ? allReviews.filter((r) => r.score === targetScore)
      : allReviews;

    // Apply pagination
    const paginatedReviews = filteredReviews.slice(offset, offset + limit);

    // Transform reviews to match expected format
    const reviews = paginatedReviews.map((review) => ({
      id: review.id,
      score: review.score,
      comment: review.comment,
      createdAt: review.createdAt,
      author: review.author || "Unknown",
      authorTwitter: review.authorTwitter,
      votes: review.votes,
    }));

    return NextResponse.json({
      reviews,
      hasMore: offset + limit < filteredReviews.length,
      nextOffset: offset + limit,
    }, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

