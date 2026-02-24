import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

async function clearActivityCache() {
  try {
    let cursor = "0";
    let totalDeleted = 0;
    
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        "user:*:activity:*",
        "COUNT",
        100
      );
      cursor = nextCursor;
      
      if (keys.length > 0) {
        await redis.del(keys);
        totalDeleted += keys.length;
        console.log(`Deleted ${keys.length} keys...`);
      }
    } while (cursor !== "0");
    
    console.log(`\nTotal cache keys cleared: ${totalDeleted}`);
    process.exit(0);
  } catch (err) {
    console.error("Error clearing cache:", err);
    process.exit(1);
  }
}

clearActivityCache();
