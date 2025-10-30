/**
 * Spike Analysis Engine
 * Uses LLM to analyze why timeline spikes occurred
 */

import OpenAI from "openai";
import { TimelineSpike } from "./aggregate";

export type SpikeInsight = {
  month: string;
  type: "positive" | "negative" | "mixed";
  magnitude: number;
  reviewCount: number;
  analysis: string; // AI-generated detailed explanation of why the spike happened (up to 400 chars)
};

const SYSTEM_PROMPT = `You are an analyst specializing in reputation timeline analysis.

Your task:
- Analyze reviews from a specific time period that saw a significant spike in activity
- Identify what triggered the spike (event, project, controversy, etc.)
- IMPORTANT: Match your analysis tone to the spike type:
  * NEGATIVE spike: Focus on criticism, problems, failures, or controversies that caused backlash. Be specific about allegations and issues raised.
  * POSITIVE spike: Focus on achievements, successes, or positive reception. Detail what impressed reviewers.
  * MIXED spike: Acknowledge both sides and explain the divisive trigger
- Be specific and evidence-based - reference actual review content and specific allegations/praise
- Provide detailed analysis (3-4 sentences, up to 400 characters maximum)

Output format (JSON):
{
  "analysis": "Detailed 3-4 sentence explanation matching the spike's sentiment. Be specific about what happened and what reviewers said. Maximum 400 characters."
}`;

/**
 * Analyze a single spike using LLM
 */
async function analyzeSingleSpike(
  spike: TimelineSpike,
  profileName: string,
  apiKey?: string
): Promise<{ analysis: string }> {
  // Check if OpenAI is configured
  if (!apiKey) {
    // Fallback to deterministic analysis
    return {
      analysis: `Spike in ${spike.type} reviews (${spike.reviewCount} reviews, ${spike.magnitude}x average). Activity increased significantly compared to typical months.`,
    };
  }

  try {
    const openai = new OpenAI({ apiKey });

    // Extract review texts from the spike month
    // Prioritize the spike type for sampling
    let reviewsToAnalyze = spike.reviews.filter(r => r.comment && r.comment.length > 10);
    
    if (spike.type === "negative") {
      // Prioritize negative reviews for negative spikes
      const negativeReviews = reviewsToAnalyze.filter(r => r.score === "NEGATIVE");
      const otherReviews = reviewsToAnalyze.filter(r => r.score !== "NEGATIVE");
      reviewsToAnalyze = [...negativeReviews.slice(0, 15), ...otherReviews.slice(0, 5)];
    } else if (spike.type === "positive") {
      // Prioritize positive reviews for positive spikes
      const positiveReviews = reviewsToAnalyze.filter(r => r.score === "POSITIVE");
      const otherReviews = reviewsToAnalyze.filter(r => r.score !== "POSITIVE");
      reviewsToAnalyze = [...positiveReviews.slice(0, 15), ...otherReviews.slice(0, 5)];
    } else {
      // For mixed, take a balanced sample
      reviewsToAnalyze = reviewsToAnalyze.slice(0, 20);
    }
    
    const reviewTexts = reviewsToAnalyze.map(r => `[${r.score}] ${r.comment}`);

    if (reviewTexts.length === 0) {
      return {
        analysis: `Activity spike detected with ${spike.reviewCount} reviews, but no detailed comments available for analysis.`,
      };
    }

    // Format month for display
    const monthName = new Date(spike.month + "-01").toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Count sentiment breakdown
    const posCount = spike.reviews.filter(r => r.score === "POSITIVE").length;
    const negCount = spike.reviews.filter(r => r.score === "NEGATIVE").length;
    const neuCount = spike.reviews.filter(r => r.score === "NEUTRAL").length;
    
    // Build context-specific instruction
    let typeInstruction = "";
    if (spike.type === "negative") {
      typeInstruction = "\n⚠️ This is a NEGATIVE spike. Your analysis MUST focus on what went wrong, criticism, problems, or controversies. Do NOT sugarcoat or make it sound positive.";
    } else if (spike.type === "positive") {
      typeInstruction = "\n✅ This is a POSITIVE spike. Your analysis should focus on achievements, successes, or positive reception.";
    } else {
      typeInstruction = "\n⚖️ This is a MIXED spike. Your analysis should acknowledge both positive and negative aspects.";
    }
    
    const prompt = `Analyze this review spike for ${profileName}:

TIME PERIOD: ${monthName}
SPIKE TYPE: ${spike.type.toUpperCase()}
MAGNITUDE: ${spike.reviewCount} reviews (${spike.magnitude}x the average of ${spike.avgReviewCount})
SENTIMENT BREAKDOWN: ${posCount} positive, ${negCount} negative, ${neuCount} neutral${typeInstruction}

REVIEWS FROM THIS PERIOD:
${reviewTexts.join("\n")}

Determine:
1. What event, action, or circumstance triggered this spike in reviews?
2. What specific allegations, criticisms, or praises were mentioned?
3. CRITICAL: Your tone and focus must match the spike type (${spike.type.toUpperCase()}).

Generate JSON with:
- analysis: Detailed 3-4 sentence explanation (up to 400 characters) that accurately reflects the ${spike.type} sentiment. Be specific about what happened and what reviewers said.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      reasoning_effort: "minimal",
      verbosity: "low",
      max_completion_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    return {
      analysis: result.analysis || `Spike of ${spike.type} reviews detected in this period.`,
    };
  } catch (error) {
    console.error(`Error analyzing spike for ${spike.month}:`, error);
    
    // Fallback
    return {
      analysis: `Significant spike in ${spike.type} reviews (${spike.reviewCount} total, ${spike.magnitude}x average).`,
    };
  }
}

/**
 * Analyze all detected spikes
 */
export async function analyzeSpikes(
  spikes: TimelineSpike[],
  profileName: string,
  userApiKey?: string
): Promise<SpikeInsight[]> {
  if (spikes.length === 0) {
    return [];
  }

  const systemApiKey = process.env.OPENAI_API_KEY;
  const apiKey = userApiKey || systemApiKey;

  console.log(`[AnalyzeSpikes] Analyzing ${spikes.length} spike(s) with ${userApiKey ? 'user' : 'system'} API key`);

  // Analyze each spike
  const insights: SpikeInsight[] = [];

  for (const spike of spikes) {
    try {
      const { analysis } = await analyzeSingleSpike(spike, profileName, apiKey);
      
      insights.push({
        month: spike.month,
        type: spike.type,
        magnitude: spike.magnitude,
        reviewCount: spike.reviewCount,
        analysis,
      });
    } catch (error) {
      console.error(`Failed to analyze spike ${spike.month}:`, error);
    }
  }

  console.log(`[AnalyzeSpikes] Generated ${insights.length} insight(s)`);

  return insights;
}

