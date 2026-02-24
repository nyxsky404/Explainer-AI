import { Queue } from "bullmq";
import IORedis from "ioredis";

// Validate REDIS_URL before creating connection
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required but not defined');
}

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1, // Bounded value for fail-fast behavior
  enableReadyCheck: false, // Recommended for BullMQ producers
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
  // Validate inputs before enqueuing
  if (!gossipId || typeof gossipId !== 'string' || gossipId.trim() === '') {
    throw new Error('Invalid gossipId: must be a non-empty string');
  }
  if (!blogUrl || typeof blogUrl !== 'string' || blogUrl.trim() === '') {
    throw new Error('Invalid blogUrl: must be a non-empty string');
  }
  
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

/**
 * Graceful shutdown for the queue and connection
 */
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`gossipProducer::Received ${signal}, shutting down gracefully...`);
  
  try {
    await gossipQueue.close();
    console.log('gossipProducer::Queue closed');
  } catch (err) {
    console.error('gossipProducer::Error closing queue:', err.message);
  }
  
  try {
    await connection.quit();
    console.log('gossipProducer::Redis connection closed');
  } catch (err) {
    console.error('gossipProducer::Error closing Redis connection:', err.message);
    // Force disconnect if quit fails
    connection.disconnect();
  }
}

// Register shutdown handlers
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGINT', () => gracefulShutdown('SIGINT'));