import express from 'express';
import {
  generateQuizController,
  generateQuizFromSummaryController,
  getQuiz,
  listQuizzes,
  submitQuiz,
  regenerateQuizQuestion,
  deleteQuizController,
} from '../controllers/quizController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Generate quiz from content
router.post('/generate', generateQuizController);

// Generate quiz from existing summary
router.post('/generate-from-summary/:summaryId', generateQuizFromSummaryController);

// Get all quizzes for user (paginated)
router.get('/list', listQuizzes);

// Get single quiz by ID
router.get('/:id', getQuiz);

// Submit quiz answers
router.post('/:id/submit', submitQuiz);

// Regenerate a specific question
router.post('/:id/regenerate', regenerateQuizQuestion);

// Delete quiz
router.delete('/:id', deleteQuizController);

export default router;
