import { NextResponse } from "next/server";
import { getRedis } from "@/lib/cache";
import { query } from "@/lib/db";

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      redis: "unknown",
    },
  };

  try {
    // Check database
    await query("SELECT 1");
    health.services.database = "healthy";
  } catch {
    health.services.database = "unhealthy";
    health.status = "degraded";
  }

  try {
    // Check Redis
    const redis = getRedis();
    await redis.ping();
    health.services.redis = "healthy";
  } catch {
    health.services.redis = "unhealthy";
    health.status = "degraded";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}

