import { Queue, Worker, Job } from "bullmq";

const connection = {
  host: process.env.REDIS_URL?.includes("://")
    ? new URL(process.env.REDIS_URL).hostname
    : "localhost",
  port: process.env.REDIS_URL?.includes("://")
    ? parseInt(new URL(process.env.REDIS_URL).port || "6379")
    : 6379,
};

export const ingestQueue = new Queue("ingest", { connection });

export type IngestJobData = {
  userkey: string;
  priority?: "high" | "normal" | "low";
};

export function createIngestWorker(
  handler: (job: Job<IngestJobData>) => Promise<void>
) {
  return new Worker<IngestJobData>("ingest", handler, {
    connection,
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs per minute
    },
  });
}

export async function enqueueIngest(
  userkey: string,
  priority: "high" | "normal" | "low" = "normal"
): Promise<void> {
  await ingestQueue.add(
    "fetch-reviews",
    { userkey, priority },
    {
      priority: priority === "high" ? 1 : priority === "normal" ? 5 : 10,
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
}

