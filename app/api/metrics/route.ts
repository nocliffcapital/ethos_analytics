import { NextResponse } from "next/server";
import { metrics, MetricNames } from "@/lib/metrics";

export async function GET() {
  // Only allow in development or with auth
  if (process.env.NODE_ENV === "production" && !process.env.METRICS_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = {
    api: metrics.getSummary(MetricNames.API_RESPONSE_TIME),
    cache: {
      hits: metrics.getMetrics(MetricNames.CACHE_HIT).length,
      misses: metrics.getMetrics(MetricNames.CACHE_MISS).length,
    },
    db: metrics.getSummary(MetricNames.DB_QUERY_TIME),
    reviews: metrics.getMetrics(MetricNames.REVIEW_FETCHED).length,
    errors: metrics.getMetrics(MetricNames.ERROR).length,
  };

  return NextResponse.json(summary);
}

