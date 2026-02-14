import express from 'express';
import {
  generateExplanation,
  getExplanation,
  listExplanations,
  addFollowUpQuestion,
  deleteExplanationById,
} from '../controllers/deepExplainController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Generate new deep explanation
router.post('/generate', generateExplanation);

// Add follow-up question to existing explanation
router.post('/:id/follow-up', addFollowUpQuestion);

// Get all explanations for user (paginated)
router.get('/list', listExplanations);

// Get single explanation by ID
router.get('/:id', getExplanation);

// Delete explanation
router.delete('/:id', deleteExplanationById);

export default router;
