import { Router } from 'express';
import { sendMessage, explainText, getChatHistory } from '../controllers/chatController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

// Chat with summary content
router.post('/:summaryId', verifyToken, sendMessage);

// Explain highlighted text
router.post('/:summaryId/explain', verifyToken, explainText);

// Get chat history
router.get('/:summaryId/history', verifyToken, getChatHistory);

export default router;
