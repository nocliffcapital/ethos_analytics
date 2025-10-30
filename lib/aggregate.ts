/**
 * Aggregation Engine
 * Processes reviews to extract stats, timelines, keywords, and outliers
 */

import { EthosReview } from "./ethos";

type ReviewScore = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export type TimelineSpike = {
  month: string;
  type: "positive" | "negative" | "mixed";
  magnitude: number; // How many times larger than average
  changePercent: number; // % change from previous month
  reviewCount: number;
  avgReviewCount: number;
  reviews: EthosReview[]; // The actual reviews from this spike month
};

export type AggregateData = {
  userkey: string;
  counts: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
  timeline: Array<{
    month: string;
    pos: number;
    neg: number;
    neu: number;
    score: number;
  }>;
  spikes: TimelineSpike[]; // NEW: Detected anomaly months
  positives: {
    keywords: Array<{ term: string; weight: number }>;
    examples: Array<{ id: string; snippet: string }>;
  };
  negatives: {
    keywords: Array<{ term: string; weight: number }>;
    examples: Array<{ id: string; snippet: string }>;
  };
  outliers: Array<{ id: string; reason: string }>;
};

/**
 * Common stop words to filter out
 */
const STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their",
  "what", "so", "up", "out", "if", "about", "who", "get", "which", "go",
  "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could", "them",
  "see", "other", "than", "then", "now", "look", "only", "come", "its", "over",
  "think", "also", "back", "after", "use", "two", "how", "our", "work",
  "first", "well", "way", "even", "new", "want", "because", "any", "these",
  "give", "day", "most", "us", "is", "was", "are", "been", "has", "had",
  "were", "said", "did", "having", "may", "should", "very", "much", "more",
]);

/**
 * Tokenize and clean text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
    .replace(/[^a-z0-9\s]/g, " ") // Remove special chars
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Extract top keywords using simple TF-IDF-like approach
 */
function extractKeywords(
  reviews: EthosReview[],
  topN = 25
): Array<{ term: string; weight: number }> {
  const termFreq: Record<string, number> = {};
  const docFreq: Record<string, number> = {};

  reviews.forEach((review) => {
    if (!review.comment) return;
    
    const tokens = tokenize(review.comment);
    const uniqueTokens = new Set(tokens);

    tokens.forEach((token) => {
      termFreq[token] = (termFreq[token] || 0) + 1;
    });

    uniqueTokens.forEach((token) => {
      docFreq[token] = (docFreq[token] || 0) + 1;
    });
  });

  const totalDocs = reviews.length || 1;
  const scores: Array<{ term: string; weight: number }> = [];

  for (const term in termFreq) {
    const tf = termFreq[term];
    const idf = Math.log(totalDocs / (docFreq[term] || 1));
    const score = tf * idf;
    scores.push({ term, weight: score });
  }

  return scores
    .sort((a, b) => b.weight - a.weight)
    .slice(0, topN)
    .map((item) => ({
      term: item.term,
      weight: parseFloat((item.weight / (scores[0]?.weight || 1)).toFixed(3)),
    }));
}

/**
 * Sample representative snippets
 */
function sampleSnippets(
  reviews: EthosReview[],
  count = 5
): Array<{ id: string; snippet: string }> {
  const withComments = reviews.filter((r) => r.comment && r.comment.trim().length > 20);
  
  if (withComments.length === 0) return [];

  // Sample evenly across the dataset
  const step = Math.max(1, Math.floor(withComments.length / count));
  const sampled = [];

  for (let i = 0; i < withComments.length && sampled.length < count; i += step) {
    const review = withComments[i];
    const snippet = review.comment!.slice(0, 240).trim();
    sampled.push({ id: review.id, snippet });
  }

  return sampled;
}

/**
 * Find outlier reviews
 */
function findOutliers(reviews: EthosReview[]): Array<{ id: string; reason: string }> {
  if (reviews.length === 0) return [];

  const outliers: Array<{ id: string; reason: string }> = [];

  // Calculate length statistics
  const lengths = reviews
    .filter((r) => r.comment)
    .map((r) => r.comment!.length);
  
  if (lengths.length > 0) {
    lengths.sort((a, b) => a - b);
    const p95 = lengths[Math.floor(lengths.length * 0.95)] || 1000;

    reviews.forEach((review) => {
      if (review.comment && review.comment.length > p95) {
        outliers.push({
          id: review.id,
          reason: `Very long review (${review.comment.length} chars)`,
        });
      }
    });
  }

  // Find extreme vote patterns
  const votes = reviews
    .filter((r) => r.votes)
    .map((r) => (r.votes!.upvotes || 0) - (r.votes!.downvotes || 0));

  if (votes.length > 0) {
    votes.sort((a, b) => a - b);
    const p5 = votes[Math.floor(votes.length * 0.05)] || -10;
    const p95 = votes[Math.floor(votes.length * 0.95)] || 10;

    reviews.forEach((review) => {
      if (review.votes) {
        const netVotes = (review.votes.upvotes || 0) - (review.votes.downvotes || 0);
        
        if (netVotes < p5) {
          outliers.push({
            id: review.id,
            reason: `Heavily downvoted (net: ${netVotes})`,
          });
        } else if (netVotes > p95) {
          outliers.push({
            id: review.id,
            reason: `Heavily upvoted (net: ${netVotes})`,
          });
        }
      }
    });
  }

  return outliers.slice(0, 10); // Limit to top 10 outliers
}

/**
 * Detect timeline spikes (anomaly months with unusual review activity)
 */
function detectSpikes(
  timeline: Array<{ month: string; pos: number; neg: number; neu: number; score: number }>,
  allReviewsByMonth: Record<string, EthosReview[]>
): TimelineSpike[] {
  if (timeline.length < 3) return []; // Need at least 3 months to detect spikes

  const spikes: TimelineSpike[] = [];
  
  // Calculate average reviews per month
  const totalReviews = timeline.reduce((sum, m) => sum + m.pos + m.neg + m.neu, 0);
  const avgReviewCount = totalReviews / timeline.length;
  
  // If average is too low, no meaningful spikes
  if (avgReviewCount < 2) return [];

  timeline.forEach((month, index) => {
    const reviewCount = month.pos + month.neg + month.neu;
    
    // Skip if too few reviews
    if (reviewCount < 3) return;
    
    // Check 1: Is this month 2x+ the average?
    const magnitude = reviewCount / avgReviewCount;
    const isSignificantMagnitude = magnitude >= 2.0;
    
    // Check 2: Is this a large % change from previous month?
    let changePercent = 0;
    if (index > 0) {
      const prevMonth = timeline[index - 1];
      const prevCount = prevMonth.pos + prevMonth.neg + prevMonth.neu;
      
      if (prevCount > 0) {
        changePercent = ((reviewCount - prevCount) / prevCount) * 100;
      }
    }
    const isSignificantChange = changePercent >= 150; // 150%+ increase
    
    // If either condition is met, it's a spike
    if (isSignificantMagnitude || isSignificantChange) {
      // Determine spike type based on sentiment distribution
      let type: "positive" | "negative" | "mixed" = "mixed";
      const posRatio = month.pos / reviewCount;
      const negRatio = month.neg / reviewCount;
      
      // More nuanced classification:
      // - Positive if 60%+ positive reviews
      // - Negative if 40%+ negative reviews (negative sentiment is more impactful)
      // - Mixed otherwise
      if (posRatio >= 0.6 && negRatio < 0.25) {
        type = "positive";
      } else if (negRatio >= 0.4) {
        type = "negative";
      } else if (posRatio > negRatio * 1.5) {
        // Predominantly positive even if not 60%
        type = "positive";
      } else if (negRatio > posRatio * 1.5) {
        // Predominantly negative even if not 40%
        type = "negative";
      }
      
      spikes.push({
        month: month.month,
        type,
        magnitude: parseFloat(magnitude.toFixed(2)),
        changePercent: Math.round(changePercent),
        reviewCount,
        avgReviewCount: Math.round(avgReviewCount * 10) / 10,
        reviews: allReviewsByMonth[month.month] || [],
      });
    }
  });
  
  // Sort by magnitude (most significant first) and limit to top 5
  return spikes
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, 5);
}

/**
 * Main aggregation function
 */
export function aggregate(
  userkey: string,
  data: Record<ReviewScore, EthosReview[]>,
  currentEthosScore?: number
): AggregateData {
  // 1. Counts
  const counts = {
    positive: data.POSITIVE.length,
    negative: data.NEGATIVE.length,
    neutral: data.NEUTRAL.length,
    total: data.POSITIVE.length + data.NEGATIVE.length + data.NEUTRAL.length,
  };

  // 2. Timeline - bucket by month with cumulative score
  const monthBuckets: Record<string, { pos: number; neg: number; neu: number }> = {};
  const reviewsByMonth: Record<string, EthosReview[]> = {}; // Track all reviews by month for spike analysis

  const bucketReviews = (reviews: EthosReview[], scoreKey: "pos" | "neg" | "neu") => {
    reviews.forEach((review) => {
      const month = review.createdAt.slice(0, 7); // YYYY-MM
      
      if (!monthBuckets[month]) {
        monthBuckets[month] = { pos: 0, neg: 0, neu: 0 };
      }
      
      if (!reviewsByMonth[month]) {
        reviewsByMonth[month] = [];
      }
      
      monthBuckets[month][scoreKey]++;
      reviewsByMonth[month].push(review);
    });
  };

  bucketReviews(data.POSITIVE, "pos");
  bucketReviews(data.NEGATIVE, "neg");
  bucketReviews(data.NEUTRAL, "neu");

  // Calculate historical score trend that ends at the current Ethos score
  const sortedMonths = Object.keys(monthBuckets).sort();
  
  // If we have the actual Ethos score, calculate a trend that ends there
  // Otherwise, use a simple formula
  const finalScore = currentEthosScore || 1000;
  const startingScore = Math.max(0, finalScore - 500); // Reasonable starting point
  
  const timeline = sortedMonths.map((month, index) => {
    const bucket = monthBuckets[month];
    
    // Calculate proportional score progression
    // Score gradually moves from startingScore to finalScore
    const progress = sortedMonths.length > 1 
      ? index / (sortedMonths.length - 1)
      : 1;
    
    // Apply weighted progression based on review sentiment
    const netSentiment = bucket.pos - bucket.neg + (bucket.neu * 0.2);
    const baseScore = startingScore + (finalScore - startingScore) * progress;
    
    // Add small variance based on monthly sentiment
    const variance = netSentiment * 2;
    const monthScore = Math.max(0, Math.min(5000, baseScore + variance));
    
    return {
      month,
      pos: bucket.pos,
      neg: bucket.neg,
      neu: bucket.neu,
      score: Math.round(monthScore),
    };
  });
  
  // Ensure the last month has the exact current score
  if (timeline.length > 0 && currentEthosScore) {
    timeline[timeline.length - 1].score = currentEthosScore;
  }

  // 3. Keywords and examples
  const positives = {
    keywords: extractKeywords(data.POSITIVE),
    examples: sampleSnippets(data.POSITIVE),
  };

  const negatives = {
    keywords: extractKeywords(data.NEGATIVE),
    examples: sampleSnippets(data.NEGATIVE),
  };

  // 4. Outliers
  const allReviews = [...data.POSITIVE, ...data.NEGATIVE, ...data.NEUTRAL];
  const outliers = findOutliers(allReviews);

  // 5. Detect spikes
  const spikes = detectSpikes(timeline, reviewsByMonth);

  return {
    userkey,
    counts,
    timeline,
    spikes,
    positives,
    negatives,
    outliers,
  };
}

