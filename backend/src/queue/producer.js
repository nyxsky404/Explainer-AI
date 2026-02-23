import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const myQueue = new Queue("podcast-generate", {
  connection,
});

export async function addJobs(podcastId, blogUrl, options = {}) {
  const job = await myQueue.add(
    "podcastJob",
    { podcastId, blogUrl, options },
    {
      attempts: 2,
      backoff: {
        type: "fixed",
        delay: 5000,
      },
    }
  );

  return job;
}
