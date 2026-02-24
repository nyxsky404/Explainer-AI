import redis from '../config/redis.js';

/**
 * Cache utility with stampede protection
 * 
 * Cache stampede occurs when multiple requests hit an uncached endpoint simultaneously,
 * causing all of them to fetch from the database at once.
 * 
 * This utility implements a lock-based protection to prevent this.
 */

const LOCK_TTL = 5000; // 5 seconds - max time to hold lock
const LOCK_RETRY_DELAY = 50; // ms to wait between lock retries
const LOCK_MAX_RETRIES = 100; // max retries (5 seconds total)

/**
 * Try to acquire a lock for a cache key
 * @param {string} lockKey - The lock key
 * @param {string} value - Unique value (usually timestamp or random string)
 * @returns {Promise<boolean>} - Whether lock was acquired
 */
async function acquireLock(lockKey, value) {
  const result = await redis.set(lockKey, value, 'NX', 'PX', LOCK_TTL);
  return result === 'OK';
}

/**
 * Release a lock
 * @param {string} lockKey - The lock key
 * @param {string} value - The value that was set (for safety)
 */
async function releaseLock(lockKey, value) {
  // Only release if the value matches (prevents releasing someone else's lock)
  const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;
  await redis.eval(script, 1, lockKey, value);
}

/**
 * Get cached data with stampede protection
 * 
 * @param {string} cacheKey - The cache key
 * @param {Function} fetchFn - Async function to fetch data if not cached
 * @param {number} ttl - Cache TTL in seconds
 * @param {object} options - Additional options
 * @param {number} options.staleWhileRevalidate - Seconds to serve stale data while revalidating
 * @returns {Promise<any>} - The cached or fetched data
 */
export async function getOrFetch(cacheKey, fetchFn, ttl = 3600, options = {}) {
  const { staleWhileRevalidate = 60 } = options;
  const lockKey = `${cacheKey}:lock`;
  const lockValue = `${Date.now()}-${Math.random()}`;

  // Try to get from cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Try to acquire lock to prevent stampede
  const lockAcquired = await acquireLock(lockKey, lockValue);

  if (lockAcquired) {
    // We got the lock - fetch fresh data
    try {
      const data = await fetchFn();
      await redis.set(cacheKey, JSON.stringify(data), 'EX', ttl + staleWhileRevalidate);
      return data;
    } finally {
      await releaseLock(lockKey, lockValue);
    }
  } else {
    // Another request is fetching - wait for it
    for (let i = 0; i < LOCK_MAX_RETRIES; i++) {
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, LOCK_RETRY_DELAY));
      
      // Check if data is now in cache
      const nowCached = await redis.get(cacheKey);
      if (nowCached) {
        return JSON.parse(nowCached);
      }
    }

    // Lock holder took too long - fetch anyway (fallback)
    console.warn(`Cache stampede protection fallback for key: ${cacheKey}`);
    const data = await fetchFn();
    await redis.set(cacheKey, JSON.stringify(data), 'EX', ttl);
    return data;
  }
}

/**
 * Invalidate a cache key
 * @param {string} cacheKey - The cache key to invalidate
 */
export async function invalidateCache(cacheKey) {
  try {
    await redis.del(cacheKey);
  } catch (err) {
    console.error('invalidateCache error:', err.message);
  }
}

/**
 * Invalidate all cache keys matching a pattern (SCAN-based, safe for production)
 * @param {string} pattern - Pattern to match (e.g., 'user:123:*')
 */
export async function invalidateCachePattern(pattern) {
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.error('invalidateCachePattern error for pattern:', pattern, err.message);
  }
}

/**
 * Invalidate credit cache for a user
 * @param {string} userId - User ID
 */
export async function invalidateCreditCache(userId) {
  await invalidateCache(`user:${userId}:credits`);
}

/**
 * Invalidate all user-related caches
 * @param {string} userId - User ID
 */
export async function invalidateAllUserCache(userId) {
  await invalidateCachePattern(`user:${userId}:*`);
}
