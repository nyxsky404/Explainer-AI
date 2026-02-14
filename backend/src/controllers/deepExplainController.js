import {
  generateDeepExplanation,
  getExplanationById,
  getUserExplanations,
  addFollowUp,
  deleteExplanation,
} from '../services/deepExplainService.js';

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

    return res.status(201).json({
      success: true,
      data: explanation,
      message: 'Explanation generated successfully',
    });
  } catch (error) {
    console.error('Error in generateExplanation controller:', error);
    return res.status(error.message.includes('credits') ? 402 : 500).json({
      success: false,
      message: error.message || 'Failed to generate explanation',
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
    console.error('Error in getExplanation controller:', error);
    const status = error.message.includes('not found') ? 404 : 
                   error.message.includes('Unauthorized') ? 403 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to retrieve explanation',
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getUserExplanations(userId, page, limit);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Explanations retrieved successfully',
    });
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
    const status = error.message.includes('credits') ? 402 : 
                   error.message.includes('not found') ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to add follow-up',
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

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Explanation deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteExplanationById controller:', error);
    const status = error.message.includes('not found') ? 404 : 
                   error.message.includes('Unauthorized') ? 403 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to delete explanation',
    });
  }
};
