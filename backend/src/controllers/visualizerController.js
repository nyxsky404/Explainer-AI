import { generateVisualization, getUserVisualizations, getVisualizationById, deleteVisualization } from '../services/visualizerService.js';

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

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in generateVisualizationController:', error);
    
    // Check for specific error types if needed (e.g. credits)
    const statusCode = error.message === 'Insufficient credits' ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to generate visualization',
    });
  }
};

/**
 * Get user visualizations
 * @route GET /api/visualizer/list
 */
export const listVisualizations = async (req, res) => {
  try {
    const userId = req.userID;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getUserVisualizations(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in listVisualizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visualizations',
      error: error.message,
    });
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

    res.status(200).json({
      success: true,
      data: result,
    });
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

    res.status(200).json({
      success: true,
      message: 'Visualization deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteVisualizationController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete visualization',
      error: error.message,
    });
  }
};
