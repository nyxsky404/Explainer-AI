import {
  generateDeepExplanation,
  getExplanationById,
  getUserExplanations,
  addFollowUp,
  deleteExplanation,
} from '../services/deepExplainService.js';
import redis from '../config/redis.js';

// Invalidate activity cache so new explanation appears in recent activity
// Non-throwing to prevent cache failures from affecting HTTP responses
async function invalidateActivityCache(userId) {
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `user:${userId}:activity:*`, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) await redis.del(keys);
    } while (cursor !== '0');
  } catch (err) {
    console.error('deepExplainController::invalidateActivityCache error for userId:', userId, err.message);
    // Non-fatal: continue without rethrowing
  }
}

// Invalidate explanations list cache
async function invalidateExplanationsCache(userId) {
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `user:${userId}:explanations:*`, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) await redis.del(keys);
    } while (cursor !== '0');
  } catch (err) {
    console.error('deepExplainController::invalidateExplanationsCache error for userId:', userId, err.message);
  }
}

const EXPLANATIONS_CACHE_TTL = 3600; // 1 hour

function explanationsCacheKey(userId, page, limit) {
  return `user:${userId}:explanations:${page}:${limit}`;
}

/**
 * Generate a new deep explanation
 * POST /api/deep-explain/generate
 */
export const generateExplanation = async (req, res) => {
  try {
    const { topic, mode = 'easy', sourceContent } = req.body;
    const userId = req.userID;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required',
      });
    }

    if (!['easy', 'intuitive', 'deep'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Must be: easy, intuitive, or deep',
      });
    }

    const explanation = await generateDeepExplanation(
      userId,
      topic.trim(),
      mode,
      sourceContent
    );

    // Best-effort cache invalidation - don't let Redis failures affect response
    try {
      await invalidateActivityCache(userId);
      await invalidateExplanationsCache(userId);
    } catch (cacheError) {
      console.error('deepExplainController::generateExplanation cache invalidation failed for userId:', userId, 'explanationId:', explanation.id, cacheError.message);
    }

    return res.status(201).json({
      success: true,
      data: explanation,
      message: 'Explanation generated successfully',
    });
  } catch (error) {
    console.error('Error in generateExplanation controller:', error);
    return res.status((error?.message || '').includes('credits') ? 402 : 500).json({
      success: false,
      message: error?.message || 'Failed to generate explanation',
    });
  }
};

/**
 * Get explanation by ID
 * GET /api/deep-explain/:id
 */
export const getExplanation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    const explanation = await getExplanationById(id, userId);

    return res.status(200).json({
      success: true,
      data: explanation,
      message: 'Explanation retrieved successfully',
    });
  } catch (error) {
    const msg = error?.message || String(error);
    console.error('Error in getExplanation controller:', msg);
    const status = msg.includes('not found') ? 404 : 
                   msg.includes('Unauthorized') ? 403 : 500;
    return res.status(status).json({
      success: false,
      message: msg || 'Failed to retrieve explanation',
    });
  }
};

/**
 * Get all explanations for current user
 * GET /api/deep-explain/list
 */
export const listExplanations = async (req, res) => {
  try {
    const userId = req.userID;
    const page = Math.max(1, Math.floor(parseInt(req.query.page) || 1));
    const limit = Math.max(1, Math.min(Math.floor(parseInt(req.query.limit) || 10), 100));

    // Check cache first
    const cacheKey = explanationsCacheKey(userId, page, limit);
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await getUserExplanations(userId, page, limit);

    const response = {
      success: true,
      data: result,
      message: 'Explanations retrieved successfully',
    };

    await redis.set(cacheKey, JSON.stringify(response), 'EX', EXPLANATIONS_CACHE_TTL);

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in listExplanations controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve explanations',
    });
  }
};

/**
 * Add follow-up question
 * POST /api/deep-explain/:id/follow-up
 */
export const addFollowUpQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    const userId = req.userID;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    const result = await addFollowUp(id, userId, question.trim());

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Follow-up question answered successfully',
    });
  } catch (error) {
    console.error('Error in addFollowUpQuestion controller:', error);
    const msg = error?.message || '';
    const status = msg.includes('Unauthorized') ? 403 :
                   msg.includes('credits') ? 402 : 
                   msg.includes('not found') ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error?.message || 'Failed to add follow-up',
    });
  }
};

/**
 * Delete explanation
 * DELETE /api/deep-explain/:id
 */
export const deleteExplanationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    await deleteExplanation(id, userId);

    // Invalidate caches
    await invalidateActivityCache(userId);
    await invalidateExplanationsCache(userId);

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Explanation deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteExplanationById controller:', error);
    const msg = error?.message || '';
    const status = msg.includes('not found') ? 404 : 
                   msg.includes('Unauthorized') ? 403 : 500;
    return res.status(status).json({
      success: false,
      message: error?.message || 'Failed to delete explanation',
    });
  }
};
