import { generateVisualization, getUserVisualizations, getVisualizationById, deleteVisualization } from '../services/visualizerService.js';
import redis from '../config/redis.js';

const VIZ_CACHE_TTL = 3600; // 1 hour

function vizCacheKey(userId, page, limit) {
  return `user:${userId}:visualizations:${page}:${limit}`;
}

async function invalidateVizCache(userId) {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `user:${userId}:visualizations:*`, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) await redis.del(keys);
  } while (cursor !== '0');
}

// Invalidate activity cache so new visualization appears in recent activity
async function invalidateActivityCache(userId) {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `user:${userId}:activity:*`, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) await redis.del(keys);
  } while (cursor !== '0');
}

/**
 * Generate a new visualization
 * @route POST /api/visualizer/generate
 */
export const generateVisualizationController = async (req, res) => {
  try {
    const userId = req.userID;
    const { topic, forceMode } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const result = await generateVisualization(userId, topic, forceMode);

    // Invalidate visualization list cache
    await invalidateVizCache(userId);
    await invalidateActivityCache(userId);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in generateVisualizationController:', error);
    const statusCode = error.message === 'Insufficient credits' ? 403 : 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to generate visualization' });
  }
};

/**
 * Get user visualizations (cached)
 * @route GET /api/visualizer/list
 */
export const listVisualizations = async (req, res) => {
  try {
    const userId = req.userID;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const cacheKey = vizCacheKey(userId, page, limit);
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await getUserVisualizations(userId, page, limit);

    const response = { success: true, data: result };
    await redis.set(cacheKey, JSON.stringify(response), 'EX', VIZ_CACHE_TTL);

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in listVisualizations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch visualizations' });
  }
};

/**
 * Get single visualization
 * @route GET /api/visualizer/:id
 */
export const getVisualization = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;
    const result = await getVisualizationById(id, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in getVisualization:', error);
    res.status(error.message === 'Visualization not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to fetch visualization',
    });
  }
};

/**
 * Delete visualization
 * @route DELETE /api/visualizer/:id
 */
export const deleteVisualizationController = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;

    await deleteVisualization(id, userId);

    // Invalidate visualization list cache
    await invalidateVizCache(userId);

    res.status(200).json({ success: true, message: 'Visualization deleted successfully' });
  } catch (error) {
    console.error('Error in deleteVisualizationController:', error);
    res.status(500).json({ success: false, message: 'Failed to delete visualization' });
  }
};
