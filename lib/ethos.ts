/**
 * Ethos API Client
 * Handles fetching profiles, reviews, and replies from the Ethos Network API
 */

const BASE_URL = "https://api.ethos.network/api/v2";
const LIMIT = 1000;
const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 1000;

type ReviewScore = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export type EthosProfile = {
  userkey: string;
  twitter?: string;
  primaryWallet?: string;
  displayName?: string;
  avatarUrl?: string;
  score?: number; // Actual Ethos credibility score
  vouchesReceived?: number; // Total vouches received
};

export type ProjectVotingData = {
  bullishVotes: number;
  bearishVotes: number;
  totalVotes: number;
  percentBullish: number;
  percentBearish: number;
  uniqueVoters: number;
};

export type EthosReview = {
  id: string;
  score: ReviewScore;
  subject: string;
  author: string;
  authorTwitter?: string;
  comment?: string;
  createdAt: string;
  votes?: {
    upvotes: number;
    downvotes: number;
  };
  raw: any;
};

export type EthosReply = {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  raw: any;
};

/**
 * Retry with exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(process.env.ETHOS_API_KEY && {
            Authorization: `Bearer ${process.env.ETHOS_API_KEY}`,
          }),
          ...options.headers,
        },
      });

      if (response.ok) {
        return response;
      }

      // Rate limit or server error - retry
      if (response.status === 429 || response.status >= 500) {
        const delay = INITIAL_BACKOFF * Math.pow(2, i) + Math.random() * 1000;
        console.warn(
          `Ethos API ${response.status}, retry ${i + 1}/${retries} after ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Client error - don't retry
      throw new Error(`Ethos API error: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      
      const delay = INITIAL_BACKOFF * Math.pow(2, i) + Math.random() * 1000;
      console.warn(`Fetch error, retry ${i + 1}/${retries} after ${delay}ms:`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}

/**
 * Fetch user profile data by userkey
 */
export async function fetchUserProfile(userkey: string): Promise<EthosProfile | null> {
  try {
    // Try to extract service and ID from userkey format
    const parts = userkey.split(':');
    
    // Handle Twitter userkey format: "service:x.com:44196397"
    if (parts[0] === 'service' && parts[1] === 'x.com' && parts[2]) {
      const response = await fetchWithRetry(
        `${BASE_URL}/users/by/x`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountIdsOrUsernames: [parts[2]],
          }),
        }
      );

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const user = data[0];
        return {
          userkey: user.userkeys?.[0] || userkey,
          twitter: user.username,
          primaryWallet: user.primaryAddress,
          displayName: user.displayName || user.name || user.username,
          avatarUrl: user.avatarUrl || user.avatar,
          score: user.score,
        };
      }
    }
    
    // Handle wallet address userkey format: "address:0x..."
    if (parts[0] === 'address' && parts[1]) {
      const walletAddress = parts[1];
      const response = await fetchWithRetry(
        `${BASE_URL}/users/by/address`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addresses: [walletAddress],
          }),
        }
      );

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const user = data[0];
        return {
          userkey: user.userkeys?.[0] || userkey,
          twitter: user.username,
          primaryWallet: walletAddress,
          displayName: user.displayName || user.name || user.username,
          avatarUrl: user.avatarUrl || user.avatar,
          score: user.score,
        };
      }
    }
    
    // If we can't parse the userkey format, return basic profile
    console.warn(`Unable to fetch full profile for userkey: ${userkey}`);
    return {
      userkey,
      displayName: userkey,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Resolve userkey from Twitter handle or wallet address
 * Based on: https://developers.ethos.network/api-documentation/api-v2/users
 */
export async function resolveUserkey(
  input: { twitter?: string; wallet?: string; userkey?: string }
): Promise<EthosProfile | null> {
  try {
    // If userkey is provided directly, fetch the full profile
    if (input.userkey) {
      console.log(`Using userkey directly: ${input.userkey}`);
      return await fetchUserProfile(input.userkey);
    }

    // Use the correct endpoints from the documentation
    if (input.wallet) {
      console.log(`Resolving wallet: ${input.wallet}`);
      const response = await fetchWithRetry(
        `${BASE_URL}/users/by/address`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addresses: [input.wallet],
          }),
        }
      );

      const data = await response.json();
      console.log(`Wallet lookup response:`, JSON.stringify(data).slice(0, 200));
      
      if (Array.isArray(data) && data.length > 0) {
        const user = data[0];
        return {
          userkey: user.userkeys?.[0] || user.userkey || user.id,
          twitter: user.primaryTwitterProfile?.username,
          primaryWallet: input.wallet,
          displayName: user.displayName || user.name || user.username,
          avatarUrl: user.avatarUrl || user.avatar,
          score: user.score,
        };
      }
    }

    if (input.twitter) {
      const handle = input.twitter.replace(/^@/, "");
      console.log(`Resolving Twitter: ${handle}`);
      
      const response = await fetchWithRetry(
        `${BASE_URL}/users/by/x`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountIdsOrUsernames: [handle],
          }),
        }
      );

      const data = await response.json();
      console.log(`Twitter lookup response:`, JSON.stringify(data).slice(0, 200));
      
      if (Array.isArray(data) && data.length > 0) {
        const user = data[0];
        return {
          userkey: user.userkeys?.[0] || user.userkey || user.id,
          twitter: handle,
          primaryWallet: user.primaryAddress,
          displayName: user.displayName || user.name || user.username,
          avatarUrl: user.avatarUrl || user.avatar,
          score: user.score,
        };
      }
    }

    console.error("Failed to resolve profile");
    return null;
  } catch (error) {
    console.error("Error resolving userkey:", error);
    return null;
  }
}

/**
 * Fetch a single page of reviews using the GET endpoint
 * Based on: https://developers.ethos.network/api-documentation/api-v2/activities
 */
async function fetchReviewsPage(
  userkey: string,
  score?: ReviewScore,
  offset = 0
): Promise<any[]> {
  // Build query parameters for GET request
  const params = new URLSearchParams({
    userkey,
    direction: "subject",
    activityType: "review",
    excludeSpam: "true",
    limit: String(LIMIT),
    offset: String(offset),
  });

  if (score) {
    params.set("reviewScore", score);
  }

  const response = await fetchWithRetry(
    `${BASE_URL}/activities/userkey?${params.toString()}`
  );
  
  const data = await response.json();
  
  // API returns array directly for GET endpoint
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch all reviews for a userkey, paginated across all sentiments
 * Based on: https://developers.ethos.network/api-documentation/api-v2/activities
 */
export async function fetchAllReviews(
  userkey: string,
  onProgress?: (current: number, total: number) => void
): Promise<Record<ReviewScore, EthosReview[]>> {
  const sentiments: ReviewScore[] = ["POSITIVE", "NEGATIVE", "NEUTRAL"];
  const results: Record<ReviewScore, EthosReview[]> = {
    POSITIVE: [],
    NEGATIVE: [],
    NEUTRAL: [],
  };

  let totalFetched = 0;

  // Fetch all sentiments in parallel
  await Promise.all(
    sentiments.map(async (score) => {
      let offset = 0;
      
      // Limit concurrency per sentiment to avoid overwhelming the API
      while (true) {
        const page = await fetchReviewsPage(userkey, score, offset);
        
        if (page.length === 0) break;

        const reviews: EthosReview[] = page.map((item: any) => {
          // Extract data from the activity structure
          const reviewData = item.data || item;
          const timestamp = item.timestamp || reviewData.createdAt || item.createdAt;
          
          // Extract author Twitter if available
          const authorTwitter = item.author?.username || 
                                item.author?.twitter || 
                                item.author?.primaryTwitterProfile?.username;
          
          return {
            id: reviewData.id || item.id || `${userkey}-${offset}-${Math.random()}`,
            score,
            subject: item.subject?.userkey || reviewData.subject || userkey,
            author: item.author?.userkey || reviewData.author || "unknown",
            authorTwitter: authorTwitter || undefined,
            comment: reviewData.comment || reviewData.body || reviewData.content,
            createdAt: typeof timestamp === 'number' 
              ? new Date(timestamp * 1000).toISOString() 
              : timestamp || new Date().toISOString(),
            votes: item.votes ? {
              upvotes: item.votes.upvotes || 0,
              downvotes: item.votes.downvotes || 0,
            } : undefined,
            raw: item,
          };
        });

        results[score].push(...reviews);
        totalFetched += reviews.length;

        if (onProgress) {
          onProgress(totalFetched, totalFetched + LIMIT);
        }

        if (page.length < LIMIT) break;
        offset += LIMIT;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    })
  );

  return results;
}

/**
 * Fetch replies for a specific review
 * Based on: https://developers.ethos.network/api-documentation/api-v2/replies
 */
export async function fetchReplies(reviewId: string): Promise<EthosReply[]> {
  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/replies/review/${reviewId}`
    );
    
    const data = await response.json();
    const items = Array.isArray(data) ? data : data.values || [];

    return items.map((item: any) => ({
      id: item.id || `reply-${reviewId}-${Math.random()}`,
      content: item.content || item.body || item.comment || "",
      author: item.author || item.authorUserkey || "unknown",
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      raw: item,
    }));
  } catch (error) {
    console.error(`Error fetching replies for review ${reviewId}:`, error);
    return [];
  }
}

/**
 * Batch fetch replies for multiple reviews
 */
export async function fetchRepliesBatch(
  reviewIds: string[],
  batchSize = 200
): Promise<Record<string, EthosReply[]>> {
  const results: Record<string, EthosReply[]> = {};

  for (let i = 0; i < reviewIds.length; i += batchSize) {
    const batch = reviewIds.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (reviewId) => {
        results[reviewId] = await fetchReplies(reviewId);
      })
    );

    // Delay between batches
    if (i + batchSize < reviewIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Fetch vouches for a profile
 */
export async function fetchVouches(userkey: string): Promise<number> {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/vouches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectUserkeys: [userkey],
        limit: 1000, // Get all vouches
        offset: 0,
      }),
    });

    const data = await response.json();
    
    console.log(`[fetchVouches] Response for ${userkey}:`, JSON.stringify(data).slice(0, 500));
    
    // Calculate total vouches received
    if (data.values && Array.isArray(data.values)) {
      console.log(`[fetchVouches] Found ${data.values.length} vouch entries`);
      
      // Sum up all the balance amounts from vouches
      const totalVouches = data.values.reduce((sum: number, vouch: any) => {
        const balance = parseFloat(vouch.balance || 0);
        console.log(`[fetchVouches] Vouch balance: ${balance}`);
        return sum + balance;
      }, 0);
      
      console.log(`[fetchVouches] Total vouches: ${totalVouches}`);
      return Math.round(totalVouches);
    }

    console.log(`[fetchVouches] No values array found in response`);
    return 0;
  } catch (error) {
    console.error(`Error fetching vouches for ${userkey}:`, error);
    return 0;
  }
}

/**
 * Fetch project voting data (for projects only)
 * Based on: GET /api/v2/internal/listings/{username}
 */
export async function fetchProjectVotes(username: string): Promise<ProjectVotingData | null> {
  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/internal/listings/${username}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    
    // Extract voting data from the response
    if (data.topVoters) {
      const bullishVotes = data.topVoters.bullish?.total || 0;
      const bearishVotes = data.topVoters.bearish?.total || 0;
      const totalVotes = data.topVoters.all?.total || 0;
      const uniqueVoters = data.topVoters.all?.uniqueVoters || 0;

      // Calculate percentages
      const percentBullish = totalVotes > 0 ? Math.round((bullishVotes / totalVotes) * 100) : 0;
      const percentBearish = totalVotes > 0 ? Math.round((bearishVotes / totalVotes) * 100) : 0;

      return {
        bullishVotes,
        bearishVotes,
        totalVotes,
        percentBullish,
        percentBearish,
        uniqueVoters,
      };
    }

    return null;
  } catch (error) {
    // Not all profiles are projects, so this is expected to fail sometimes
    console.log(`No project data found for ${username} (this is normal for non-projects)`);
    return null;
  }
}

export type TrendingUser = {
  username: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  userkey: string;
  positiveReviewPercentage: number;
  positiveReviewCount: number;
  negativeReviewCount: number;
  totalReviewCount: number;
};

/**
 * Fetch trending users
 * Based on: GET /api/v2/internal/trending-users
 */
export async function fetchTrendingUsers(limit: number = 5): Promise<TrendingUser[]> {
  try {
    // Get trending users from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    const response = await fetchWithRetry(
      `${BASE_URL}/internal/trending-users?startDate=${startDate}`
    );

    const data = await response.json();
    
    if (!data.values || !Array.isArray(data.values)) {
      return [];
    }

    // Map to simplified format
    const trendingUsers: TrendingUser[] = data.values
      .slice(0, limit)
      .map((item: any) => ({
        username: item.user.username || item.user.displayName,
        displayName: item.user.displayName || item.user.username,
        avatarUrl: item.user.avatarUrl,
        score: item.user.score || 0,
        userkey: item.user.userkeys?.[0] || "",
        positiveReviewPercentage: Math.round(item.stats?.reviews?.positiveReviewPercentage || 0),
        positiveReviewCount: item.stats?.reviews?.positiveReviewCount || 0,
        negativeReviewCount: item.stats?.reviews?.negativeReviewCount || 0,
        totalReviewCount: item.stats?.reviews?.received || 0,
      }))
      .filter((user: TrendingUser) => user.userkey && user.totalReviewCount > 0);

    return trendingUsers;
  } catch (error) {
    console.error("Error fetching trending users:", error);
    return [];
  }
}

