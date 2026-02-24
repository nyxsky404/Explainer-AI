import {
  generateQuiz,
  generateQuizFromSummary,
  getQuizById,
  getUserQuizzes,
  submitQuizAttempt,
  regenerateQuestion,
  deleteQuiz,
} from '../services/quizService.js';
import redis from '../config/redis.js';

const QUIZ_CACHE_TTL = 3600;

function quizCacheKey(userId, page, limit) {
  return `user:${userId}:quizzes:${page}:${limit}`;
}

async function invalidateQuizCache(userId) {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `user:${userId}:quizzes:*`, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) await redis.del(keys);
  } while (cursor !== '0');
}

// Invalidate activity cache so new quiz appears in recent activity
async function invalidateActivityCache(userId) {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `user:${userId}:activity:*`, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) await redis.del(keys);
  } while (cursor !== '0');
}

/**
 * Generate a new quiz from content
 * POST /api/quiz/generate
 */
export const generateQuizController = async (req, res) => {
  try {
    const { content, questionCount, types, difficulty, focusAreas, sourceType } = req.body;
    const userId = req.userID;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required to generate a quiz',
      });
    }

    if (content.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Content is too short. Please provide at least 50 characters.',
      });
    }

    // Validate types if provided
    const validTypes = ['mcq', 'true_false', 'fill_blank', 'short_answer'];
    if (types) {
      if (!Array.isArray(types)) {
        return res.status(400).json({
          success: false,
          message: 'Types must be an array',
        });
      }
      const invalidTypes = types.filter((t) => !validTypes.includes(t));
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid question types: ${invalidTypes.join(', ')}. Valid types: ${validTypes.join(', ')}`,
        });
      }
    }

    // Validate difficulty
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty. Must be: easy, medium, or hard',
      });
    }

    // Validate question count
    const count = parseInt(questionCount) || 10;
    if (count < 3 || count > 20) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be between 3 and 20',
      });
    }

    const quiz = await generateQuiz(userId, content.trim(), {
      questionCount: count,
      types: types || ['mcq', 'true_false', 'fill_blank'],
      difficulty: difficulty || 'medium',
      focusAreas,
      sourceType: sourceType || 'TEXT',
    });

    await invalidateQuizCache(userId);
    await invalidateActivityCache(userId);

    return res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz generated successfully',
    });
  } catch (error) {
    console.error('Error in generateQuizController:', error);
    return res.status(error.message.includes('credits') ? 402 : 500).json({
      success: false,
      message: error.message || 'Failed to generate quiz',
    });
  }
};

/**
 * Generate quiz from existing summary
 * POST /api/quiz/generate-from-summary/:summaryId
 */
export const generateQuizFromSummaryController = async (req, res) => {
  try {
    const { summaryId } = req.params;
    const { questionCount, types, difficulty, focusAreas } = req.body;
    const userId = req.userID;

    if (!summaryId) {
      return res.status(400).json({
        success: false,
        message: 'Summary ID is required',
      });
    }

    const count = parseInt(questionCount) || 10;
    if (count < 3 || count > 20) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be between 3 and 20',
      });
    }

    const quiz = await generateQuizFromSummary(userId, summaryId, {
      questionCount: count,
      types: types || ['mcq', 'true_false', 'fill_blank'],
      difficulty: difficulty || 'medium',
      focusAreas,
    });

    await invalidateActivityCache(userId);

    return res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz generated from summary successfully',
    });
  } catch (error) {
    console.error('Error in generateQuizFromSummaryController:', error);
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('Unauthorized')
        ? 403
        : error.message.includes('credits')
          ? 402
          : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to generate quiz from summary',
    });
  }
};

/**
 * Get quiz by ID
 * GET /api/quiz/:id
 */
export const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    const quiz = await getQuizById(id, userId);

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('Error in getQuiz controller:', error);
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('Unauthorized')
        ? 403
        : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to retrieve quiz',
    });
  }
};

/**
 * Get all quizzes for current user
 * GET /api/quiz/list
 */
export const listQuizzes = async (req, res) => {
  try {
    const userId = req.userID;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 10, 100));

    if (page < 1 || isNaN(page)) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
    }

    if (limit < 1 || limit > 100 || isNaN(limit)) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100',
      });
    }

    const result = await getUserQuizzes(userId, page, limit);

    const cacheKey = quizCacheKey(userId, page, limit);
    const cached = await redis.get(cacheKey);
    if (cached) return res.status(200).json(JSON.parse(cached));

    const response = { success: true, data: result };
    await redis.set(cacheKey, JSON.stringify(response), 'EX', QUIZ_CACHE_TTL);

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in listQuizzes controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve quizzes',
    });
  }
};

/**
 * Submit quiz answers and get score
 * POST /api/quiz/:id/submit
 */
export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;
    const userId = req.userID;

    if (!answers || typeof answers !== 'object' || answers === null || Array.isArray(answers) || Object.prototype.toString.call(answers) !== '[object Object]') {
      return res.status(400).json({
        success: false,
        message: 'Answers are required as an object mapping question IDs to answers',
      });
    }

    const result = await submitQuizAttempt(id, userId, answers, timeTaken);

    return res.status(200).json({
      success: true,
      data: result,
      message: `Quiz completed! Score: ${result.score}%`,
    });
  } catch (error) {
    console.error('Error in submitQuiz controller:', error);
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('Unauthorized')
        ? 403
        : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to submit quiz',
    });
  }
};

/**
 * Regenerate a specific question
 * POST /api/quiz/:id/regenerate
 */
export const regenerateQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId } = req.body;
    const userId = req.userID;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required',
      });
    }

    const updatedQuiz = await regenerateQuestion(id, userId, questionId);

    return res.status(200).json({
      success: true,
      data: updatedQuiz,
      message: 'Question regenerated successfully',
    });
  } catch (error) {
    console.error('Error in regenerateQuizQuestion controller:', error);
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('Unauthorized')
        ? 403
        : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to regenerate question',
    });
  }
};

/**
 * Delete quiz
 * DELETE /api/quiz/:id
 */
export const deleteQuizController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    await deleteQuiz(id, userId);
    await invalidateQuizCache(userId);

    return res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteQuiz controller:', error);
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('Unauthorized')
        ? 403
        : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to delete quiz',
    });
  }
};
