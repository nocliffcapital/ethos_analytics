/**
 * Summarization Engine
 * Uses OpenAI to generate structured summaries with fallback to deterministic approach
 */

import OpenAI from "openai";
import { AggregateData } from "./aggregate";

type SummaryOutput = {
  summary: string; // Overall reputation summary including all reviews (positive, negative, neutral)
  positiveSummary: string; // Full summary of all positive reviews
  negativeSummary: string; // Full summary of all negative reviews
  positiveNotes: string; // Short 1-sentence positive highlight (for backwards compatibility)
  negativeNotes: string; // Short 1-sentence negative highlight (for backwards compatibility)
  positiveThemes: string[]; // 3-6 keyword badges
  negativeThemes: string[]; // 2-4 keyword badges
  positives: Array<{ theme: string; evidence: string[] }>;
  negatives: Array<{ theme: string; evidence: string[] }>;
  stats: {
    positive: number;
    negative: number;
    neutral: number;
    pctPositive: number;
  };
  outliers: Array<{ reviewId: string; why: string }>;
};

const SYSTEM_PROMPT = `You are a neutral analyst specializing in summarizing user reviews.

Your task:
- Analyze ALL provided reviews (positive, negative, and neutral) to generate comprehensive summaries
- IMPORTANT: Refer to the subject by their actual name/username, NOT as "Ethos Network"
- Create an overall summary covering the complete reputation picture
- Write detailed summaries for positive and negative reviews separately
- Identify key themes as short 2-3 word badges
- Use only the provided text - no speculation or external knowledge
- Be balanced and fair in your analysis

Output format (JSON):
{
  "summary": "Comprehensive 4-5 sentence overall reputation summary (400-500 characters) covering positive, negative, AND neutral reviews. Provide a full picture of their reputation. Use the person's actual name.",
  "positiveSummary": "2-3 sentence summary of all positive reviews, highlighting common themes and sentiments. Use the person's actual name.",
  "negativeSummary": "2-3 sentence summary of all negative reviews and concerns (or 'No negative reviews.' if none). Use the person's actual name.",
  "positiveNotes": "1 sentence positive highlight",
  "negativeNotes": "1 sentence on concerns (or 'No significant concerns' if none)",
  "positiveThemes": ["Theme1", "Theme2", "Theme3"], // 3-6 short keywords (2-3 words)
  "negativeThemes": ["Issue1", "Issue2"] // 2-4 short keywords (or empty if none)
}`;

/**
 * Get trend direction from timeline
 */
function getTrend(timeline: AggregateData["timeline"]): string {
  if (timeline.length < 2) return "stable";

  const recent = timeline.slice(-3);
  const older = timeline.slice(-6, -3);

  if (recent.length === 0 || older.length === 0) return "stable";

  const recentAvg =
    recent.reduce((sum, m) => sum + m.pos - m.neg, 0) / recent.length;
  const olderAvg =
    older.reduce((sum, m) => sum + m.pos - m.neg, 0) / older.length;

  if (recentAvg > olderAvg * 1.2) return "improving";
  if (recentAvg < olderAvg * 0.8) return "declining";
  return "stable";
}

/**
 * Deterministic fallback summary
 */
function deterministicSummary(agg: AggregateData): SummaryOutput {
  const total = agg.counts.total || 1;
  const pctPositive = parseFloat(((agg.counts.positive / total) * 100).toFixed(1));
  const trend = getTrend(agg.timeline);

  let summary = `Based on ${total} review${total !== 1 ? "s" : ""}: ${pctPositive}% positive, ${agg.counts.negative} negative, ${agg.counts.neutral} neutral.`;
  
  if (trend !== "stable") {
    summary += ` Recent trend is ${trend}.`;
  }

  const positives = agg.positives.keywords.slice(0, 3).map((kw, idx) => ({
    theme: kw.term.charAt(0).toUpperCase() + kw.term.slice(1),
    evidence:
      agg.positives.examples
        .slice(idx * 2, idx * 2 + 2)
        .map((ex) => `"${ex.snippet}"`) || [],
  }));

  const negatives = agg.negatives.keywords.slice(0, 3).map((kw, idx) => ({
    theme: kw.term.charAt(0).toUpperCase() + kw.term.slice(1),
    evidence:
      agg.negatives.examples
        .slice(idx * 2, idx * 2 + 2)
        .map((ex) => `"${ex.snippet}"`) || [],
  }));

  return {
    summary,
    positiveSummary: agg.counts.positive > 0 ? `Received ${agg.counts.positive} positive reviews highlighting strong reputation and community trust.` : "No positive reviews.",
    negativeSummary: agg.counts.negative > 0 ? `${agg.counts.negative} negative reviews raised some concerns about specific interactions or behaviors.` : "No negative reviews.",
    positiveNotes: agg.counts.positive > 0 ? "Positive feedback received across multiple reviews." : "Limited positive feedback.",
    negativeNotes: agg.counts.negative > 0 ? "Some concerns raised in reviews." : "No significant concerns.",
    positiveThemes: positives.map(p => p.theme).slice(0, 5),
    negativeThemes: negatives.map(n => n.theme).slice(0, 3),
    positives,
    negatives,
    stats: {
      positive: agg.counts.positive,
      negative: agg.counts.negative,
      neutral: agg.counts.neutral,
      pctPositive,
    },
    outliers: agg.outliers.map((o) => ({ reviewId: o.id, why: o.reason })),
  };
}

/**
 * LLM-based summarization
 */
export async function summarize(
  agg: AggregateData,
  reviewTexts?: { positive: string[]; negative: string[]; neutral: string[] },
  profileName?: string,
  userApiKey?: string
): Promise<SummaryOutput> {
  // Prioritize user API key, fallback to system key
  const apiKey = userApiKey || process.env.OPENAI_API_KEY;
  
  // Check if OpenAI is configured
  if (!apiKey) {
    console.warn("OpenAI API key not configured, using deterministic summary");
    return deterministicSummary(agg);
  }

  try {
    console.log(`[Summarize] Using ${userApiKey ? 'user-provided' : 'system'} API key`);
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    console.log(`[Summarize] Calling OpenAI with gpt-5-nano...`);

    const total = agg.counts.total || 1;
    const pctPositive = parseFloat(((agg.counts.positive / total) * 100).toFixed(1));

    // Prepare input data for the LLM
    const subjectName = profileName || "the user";
    
    const positiveReviews = reviewTexts?.positive.slice(0, 20).join("\n- ") || agg.positives.examples.map(e => e.snippet).join("\n- ");
    const negativeReviews = reviewTexts?.negative.slice(0, 15).join("\n- ") || agg.negatives.examples.map(e => e.snippet).join("\n- ");
    const neutralReviews = reviewTexts?.neutral.slice(0, 10).join("\n- ") || "";
    
    const prompt = `Analyze ${total} reviews for ${subjectName} and provide comprehensive summaries:

IMPORTANT: The subject of these reviews is "${subjectName}", NOT "Ethos Network". Always refer to them by their actual name.

POSITIVE REVIEWS (${agg.counts.positive}):
- ${positiveReviews}

NEGATIVE REVIEWS (${agg.counts.negative}):
${negativeReviews ? `- ${negativeReviews}` : "None"}

NEUTRAL REVIEWS (${agg.counts.neutral}):
${neutralReviews ? `- ${neutralReviews}` : "None"}

Generate JSON with:
- summary: Comprehensive 4-5 sentence overall reputation (400-500 characters) covering ALL reviews (positive, negative, neutral). Provide depth and detail. Start with "Overall, ${subjectName} is viewed as..." or similar.
- positiveSummary: 2-3 sentence summary of positive reviews about ${subjectName}
- negativeSummary: 2-3 sentence summary of negative reviews (or "No negative reviews." if none)
- positiveNotes: 1 sentence highlight
- negativeNotes: 1 sentence on concerns
- positiveThemes: array of 3-6 short keywords
- negativeThemes: array of 2-4 keywords (or empty array if none)`;

    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      // GPT-5 specific parameters (no temperature, top_p, or logprobs allowed)
      reasoning_effort: "minimal", // Use minimal reasoning for fast, concise responses
      verbosity: "low", // Keep output concise
      max_completion_tokens: 4096, // Higher limit to allow room for both reasoning + output tokens
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    
    console.log(`[Summarize] GPT-5-nano response received successfully`);

    // Validate and merge with stats
    return {
      summary: result.summary || deterministicSummary(agg).summary,
      positiveSummary: result.positiveSummary || (agg.counts.positive > 0 ? "Positive reviews highlight strong reputation and trustworthiness." : "No positive reviews."),
      negativeSummary: result.negativeSummary || (agg.counts.negative > 0 ? "Some concerns have been raised by reviewers." : "No negative reviews."),
      positiveNotes: result.positiveNotes || "Positive feedback received.",
      negativeNotes: result.negativeNotes || (agg.counts.negative > 0 ? "Some concerns raised." : "No significant concerns."),
      positiveThemes: Array.isArray(result.positiveThemes) ? result.positiveThemes.slice(0, 6) : [],
      negativeThemes: Array.isArray(result.negativeThemes) ? result.negativeThemes.slice(0, 4) : [],
      positives: agg.positives.keywords.slice(0, 3).map((kw, idx) => ({
        theme: kw.term.charAt(0).toUpperCase() + kw.term.slice(1),
        evidence:
          agg.positives.examples
            .slice(idx * 2, idx * 2 + 2)
            .map((ex) => `"${ex.snippet}"`) || [],
      })),
      negatives: agg.negatives.keywords.slice(0, 3).map((kw, idx) => ({
        theme: kw.term.charAt(0).toUpperCase() + kw.term.slice(1),
        evidence:
          agg.negatives.examples
            .slice(idx * 2, idx * 2 + 2)
            .map((ex) => `"${ex.snippet}"`) || [],
      })),
      stats: {
        positive: agg.counts.positive,
        negative: agg.counts.negative,
        neutral: agg.counts.neutral,
        pctPositive,
      },
      outliers: agg.outliers.map((o) => ({ reviewId: o.id, why: o.reason })),
    };
  } catch (error) {
    console.error("Error generating GPT-5-nano summary, falling back to deterministic:");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return deterministicSummary(agg);
  }
}

