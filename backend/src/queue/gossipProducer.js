import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const gossipQueue = new Queue("gossip-generate", {
  connection,
});

/**
 * Add a gossip generation job to the queue.
 * @param {string} gossipId - The gossip ID
 * @param {string} blogUrl - The URL to scrape
 * @param {object} options - Options (depth, etc.)
 * @returns {Promise<Job>}
 */
export async function addGossipJob(gossipId, blogUrl, options = {}) {
  const job = await gossipQueue.add(
    "gossipJob",
    { gossipId, blogUrl, options },
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