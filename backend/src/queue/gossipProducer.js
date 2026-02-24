import { Queue } from "bullmq";
import IORedis from "ioredis";

// Validate REDIS_URL before creating connection
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required but not defined');
}

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Attach error listener to prevent unhandled exceptions
connection.on('error', (err) => {
  console.error('gossipProducer::Redis connection error:', err.message);
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