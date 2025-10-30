/**
 * BullMQ Worker for background ingestion jobs
 * Run this separately: node --loader ts-node/esm worker.ts
 */

import { createIngestWorker, IngestJobData } from "./lib/queue";
import { fetchAllReviews } from "./lib/ethos";
import { aggregate } from "./lib/aggregate";
import { summarize } from "./lib/summarize";
import { upsertReviews, upsertProfile, upsertAggregate, getProfile } from "./lib/persistence";
import { setCached } from "./lib/cache";

const worker = createIngestWorker(async (job) => {
  const { userkey } = job.data;

  console.log(`[Worker] Processing ingestion for userkey: ${userkey}`);

  try {
    // Update progress
    await job.updateProgress(10);

    // Fetch profile if needed
    const profile = await getProfile(userkey);
    if (profile) {
      await upsertProfile(profile);
    }

    await job.updateProgress(20);

    // Fetch all reviews
    const bySentiment = await fetchAllReviews(userkey, (current, total) => {
      const progress = Math.min(90, 20 + (current / total) * 60);
      job.updateProgress(progress).catch(console.error);
    });

    // Store reviews
    const allReviews = [
      ...bySentiment.POSITIVE,
      ...bySentiment.NEGATIVE,
      ...bySentiment.NEUTRAL,
    ];

    console.log(`[Worker] Fetched ${allReviews.length} reviews for ${userkey}`);

    if (allReviews.length > 0) {
      await upsertReviews(allReviews);
    }

    await job.updateProgress(80);

    // Aggregate
    const agg = aggregate(userkey, bySentiment);

    // Summarize
    const summary = await summarize(agg);

    await job.updateProgress(90);

    // Build response
    const payload = {
      userkey,
      ...summary,
      timeline: agg.timeline,
      lastUpdated: new Date().toISOString(),
    };

    // Persist
    await upsertAggregate(agg, summary);
    await setCached(`summary:${userkey}`, payload, 60 * 15);

    await job.updateProgress(100);

    console.log(`[Worker] Completed ingestion for ${userkey}`);
  } catch (error) {
    console.error(`[Worker] Error processing ${userkey}:`, error);
    throw error;
  }
});

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

console.log("[Worker] Started ingestion worker");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Worker] Shutting down gracefully...");
  await worker.close();
  process.exit(0);
});

