/**
 * Simple in-memory cache for AI-generated summaries
 * Prevents unnecessary API calls and saves costs
 */

type CachedSummary = {
  data: any;
  timestamp: number;
  expiresAt: number;
};

// In-memory cache (resets on server restart)
const cache = new Map<string, CachedSummary>();

// 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function getCachedSummary(userkey: string): any | null {
  const cached = cache.get(userkey);
  
  if (!cached) {
    return null;
  }
  
  const now = Date.now();
  
  // Check if cache is still valid
  if (now < cached.expiresAt) {
    console.log(`[Cache] HIT for ${userkey} (expires in ${Math.round((cached.expiresAt - now) / 1000 / 60)} minutes)`);
    return cached.data;
  }
  
  // Cache expired, remove it
  console.log(`[Cache] EXPIRED for ${userkey}`);
  cache.delete(userkey);
  return null;
}

export function setCachedSummary(userkey: string, data: any): void {
  const now = Date.now();
  const expiresAt = now + CACHE_DURATION;
  
  cache.set(userkey, {
    data,
    timestamp: now,
    expiresAt,
  });
  
  console.log(`[Cache] SET for ${userkey} (expires at ${new Date(expiresAt).toISOString()})`);
}

export function clearCache(userkey?: string): void {
  if (userkey) {
    cache.delete(userkey);
    console.log(`[Cache] CLEARED for ${userkey}`);
  } else {
    cache.clear();
    console.log(`[Cache] CLEARED ALL`);
  }
}

export function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}

