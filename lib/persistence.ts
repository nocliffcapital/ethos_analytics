/**
 * Database persistence layer
 * Handles storing and retrieving profiles, reviews, and aggregates
 */

import { query, getClient } from "./db";
import { EthosProfile, EthosReview, EthosReply } from "./ethos";
import { AggregateData } from "./aggregate";

/**
 * Upsert a profile
 */
export async function upsertProfile(profile: EthosProfile): Promise<void> {
  await query(
    `INSERT INTO profiles (userkey, twitter, primary_wallet, display_name, avatar_url, last_refreshed)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (userkey) 
     DO UPDATE SET
       twitter = COALESCE($2, profiles.twitter),
       primary_wallet = COALESCE($3, profiles.primary_wallet),
       display_name = COALESCE($4, profiles.display_name),
       avatar_url = COALESCE($5, profiles.avatar_url),
       last_refreshed = NOW()`,
    [
      profile.userkey,
      profile.twitter,
      profile.primaryWallet,
      profile.displayName,
      profile.avatarUrl,
    ]
  );
}

/**
 * Get a profile by userkey
 */
export async function getProfile(userkey: string): Promise<EthosProfile | null> {
  const rows = await query<{
    userkey: string;
    twitter: string | null;
    primary_wallet: string | null;
    display_name: string | null;
    avatar_url: string | null;
  }>(
    `SELECT userkey, twitter, primary_wallet, display_name, avatar_url
     FROM profiles
     WHERE userkey = $1`,
    [userkey]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    userkey: row.userkey,
    twitter: row.twitter || undefined,
    primaryWallet: row.primary_wallet || undefined,
    displayName: row.display_name || undefined,
    avatarUrl: row.avatar_url || undefined,
  };
}

/**
 * Upsert reviews (batch)
 */
export async function upsertReviews(reviews: EthosReview[]): Promise<void> {
  if (reviews.length === 0) return;

  const client = await getClient();
  try {
    await client.query("BEGIN");

    for (const review of reviews) {
      await client.query(
        `INSERT INTO reviews (id, userkey, score, body, created_at, author_userkey, net_votes, raw)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           body = $4,
           net_votes = $7,
           raw = $8`,
        [
          review.id,
          review.subject,
          review.score,
          review.comment,
          review.createdAt,
          review.author,
          review.votes
            ? (review.votes.upvotes || 0) - (review.votes.downvotes || 0)
            : null,
          JSON.stringify(review.raw),
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Upsert replies (batch)
 */
export async function upsertReplies(
  reviewId: string,
  replies: EthosReply[]
): Promise<void> {
  if (replies.length === 0) return;

  const client = await getClient();
  try {
    await client.query("BEGIN");

    for (const reply of replies) {
      await client.query(
        `INSERT INTO replies (id, review_id, body, created_at, author_userkey, raw)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           body = $3,
           raw = $6`,
        [
          reply.id,
          reviewId,
          reply.content,
          reply.createdAt,
          reply.author,
          JSON.stringify(reply.raw),
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get reviews for a userkey with optional filters
 */
export async function getReviews(
  userkey: string,
  options: {
    score?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    limit?: number;
    offset?: number;
  } = {}
): Promise<EthosReview[]> {
  const { score, limit = 100, offset = 0 } = options;

  let sql = `SELECT id, userkey, score, body, created_at, author_userkey, net_votes, raw
             FROM reviews
             WHERE userkey = $1`;
  const params: unknown[] = [userkey];

  if (score) {
    params.push(score);
    sql += ` AND score = $${params.length}`;
  }

  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const rows = await query<{
    id: string;
    userkey: string;
    score: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    body: string | null;
    created_at: string;
    author_userkey: string | null;
    net_votes: number | null;
    raw: Record<string, unknown>;
  }>(sql, params);

  return rows.map((row) => ({
    id: row.id,
    score: row.score,
    subject: row.userkey,
    author: row.author_userkey || "unknown",
    comment: row.body || undefined,
    createdAt: row.created_at,
    votes: row.net_votes !== null ? {
      upvotes: Math.max(0, row.net_votes),
      downvotes: Math.max(0, -row.net_votes),
    } : undefined,
    raw: row.raw,
  }));
}

/**
 * Upsert aggregate data
 */
export async function upsertAggregate(
  agg: AggregateData,
  summary: {
    summary: string;
    positives: Array<{ term: string; weight: number }>;
    negatives: Array<{ term: string; weight: number }>;
    stats: Record<string, unknown>;
    outliers: Array<{ id: string; reason: string }>;
  }
): Promise<void> {
  await query(
    `INSERT INTO aggregates (userkey, counts, timeline, themes, quotes, outliers, summary, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (userkey) DO UPDATE SET
       counts = $2,
       timeline = $3,
       themes = $4,
       quotes = $5,
       outliers = $6,
       summary = $7,
       updated_at = NOW()`,
    [
      agg.userkey,
      JSON.stringify(agg.counts),
      JSON.stringify(agg.timeline),
      JSON.stringify({ positives: summary.positives, negatives: summary.negatives }),
      JSON.stringify({
        positives: agg.positives.examples,
        negatives: agg.negatives.examples,
      }),
      JSON.stringify(summary.outliers),
      summary.summary,
    ]
  );
}

/**
 * Get aggregate data
 */
export async function getAggregate(userkey: string): Promise<any | null> {
  const rows = await query(
    `SELECT counts, timeline, themes, quotes, outliers, summary, updated_at
     FROM aggregates
     WHERE userkey = $1`,
    [userkey]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    userkey,
    counts: row.counts,
    timeline: row.timeline,
    themes: row.themes,
    quotes: row.quotes,
    outliers: row.outliers,
    summary: row.summary,
    lastUpdated: row.updated_at,
  };
}

/**
 * Check if profile needs refresh (>24h old)
 */
export async function needsRefresh(userkey: string): Promise<boolean> {
  const rows = await query<{ last_refreshed: string }>(
    `SELECT last_refreshed FROM profiles WHERE userkey = $1`,
    [userkey]
  );

  if (rows.length === 0) return true;

  const lastRefresh = new Date(rows[0].last_refreshed);
  const hoursSince = (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60);

  return hoursSince > 24;
}

