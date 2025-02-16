import express from 'express';
import {
  generateNoteController,
  generateNoteFromSummaryController,
  getNote,
  listNotes,
  updateNoteController,
  deleteNoteController,
} from '../controllers/notesController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Generate note from content
router.post('/generate', generateNoteController);

// Generate note from existing summary
router.post('/generate-from-summary/:summaryId', generateNoteFromSummaryController);

// Get all notes for user (paginated)
router.get('/list', listNotes);

// Get single note by ID
router.get('/:id', getNote);

// Update note
router.put('/:id', updateNoteController);

// Delete note
router.delete('/:id', deleteNoteController);

export default router;
