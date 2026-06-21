import {
  generateNote,
  generateNoteFromSummary,
  getNoteById,
  getUserNotes,
  updateNote,
  deleteNote,
} from '../services/notesService.js';
import prisma from '../config/db.js';
// import redis from '../config/redis.js';

// // Cache helpers
// const NOTES_CACHE_TTL = 3600; // 1 hour

// function notesCacheKey(userId, page, limit) {
//   return `user:${userId}:notes:${page}:${limit}`;
// }

// // Invalidate activity cache so new note appears in recent activity
// // Non-throwing to prevent cache failures from affecting HTTP responses
// async function invalidateActivityCache(userId) {
//   try {
//     let cursor = '0';
//     do {
//       const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `user:${userId}:activity:*`, 'COUNT', 100);
//       cursor = nextCursor;
//       if (keys.length > 0) await redis.del(keys);
//     } while (cursor !== '0');
//   } catch (err) {
//     console.error('notesController::invalidateActivityCache error for userId:', userId, err.message);
//     // Non-fatal: continue without rethrowing
//   }
// }

// // Invalidate notes list cache - also non-throwing
// async function invalidateNotesCache(userId) {
//   try {
//     let cursor = '0';
//     do {
//       const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `user:${userId}:notes:*`, 'COUNT', 100);
//       cursor = nextCursor;
//       if (keys.length > 0) await redis.del(keys);
//     } while (cursor !== '0');
//   } catch (err) {
//     console.error('notesController::invalidateNotesCache error for userId:', userId, err.message);
//     // Non-fatal: continue without rethrowing
//   }
// }

/**
 * Generate a new note from content
 * POST /api/notes/generate
 */
export const generateNoteController = async (req, res) => {
  try {
    const userId = req.userID;
    const { sourceType, sourceContent, style, pages } = req.body;

    if (!sourceContent || !sourceContent.trim()) {
      return res.status(400).json({ success: false, message: 'Source content is required' });
    }

    if (!['TEXT', 'URL', 'PDF'].includes(sourceType?.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid source type. Must be TEXT, URL, or PDF' });
    }

    if (!['CORNELL', 'OUTLINE', 'FLOW', 'BULLET'].includes(style?.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid style. Must be CORNELL, OUTLINE, FLOW, or BULLET' });
    }

    const pageCount = parseInt(pages) || 2;
    if (pageCount < 1 || pageCount > 5) {
      return res.status(400).json({ success: false, message: 'Pages must be between 1 and 5' });
    }

    const note = await generateNote(userId, sourceContent, { sourceType, style, pages: pageCount });

    // // Invalidate notes list cache
    // await invalidateNotesCache(userId);
    // await invalidateActivityCache(userId);

    res.status(201).json({ success: true, message: 'Note generated successfully', data: note });
  } catch (error) {
    console.error('Error in generateNoteController:', error);
    const statusCode = error.message === 'Insufficient credits' ? 403 : 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to process request' });
  }
};

/**
 * Generate note from existing summary
 * POST /api/notes/generate-from-summary/:summaryId
 */
export const generateNoteFromSummaryController = async (req, res) => {
  try {
    const userId = req.userID;
    const { summaryId } = req.params;
    const { style, pages } = req.body;

    if (!summaryId) {
      return res.status(400).json({ success: false, message: 'Summary ID is required' });
    }

    if (style && !['CORNELL', 'OUTLINE', 'FLOW', 'BULLET'].includes(style?.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid style. Must be CORNELL, OUTLINE, FLOW, or BULLET' });
    }

    const pageCount = parseInt(pages) || 2;
    if (pageCount < 1 || pageCount > 5) {
      return res.status(400).json({ success: false, message: 'Pages must be between 1 and 5' });
    }

    const note = await generateNoteFromSummary(userId, summaryId, { style, pages: pageCount });

    // // Invalidate notes list cache
    // await invalidateNotesCache(userId);
    // await invalidateActivityCache(userId);

    res.status(201).json({ success: true, message: 'Note generated from summary successfully', data: note });
  } catch (error) {
    console.error('Error in generateNoteFromSummaryController:', error);
    let statusCode = 500;
    if (error.message === 'Insufficient credits') statusCode = 403;
    if (error.message === 'Summary not found') statusCode = 404;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to process request' });
  }
};

/**
 * Get note by ID
 * GET /api/notes/:id
 */
export const getNote = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;
    const note = await getNoteById(id, userId);
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error('Error in getNote:', error);
    const statusCode = error.message === 'Note not found' ? 404 : 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to process request' });
  }
};

/**
 * Get all notes for current user (cached)
 * GET /api/notes/list
 */
export const listNotes = async (req, res) => {
  try {
    const userId = req.userID;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // const cacheKey = notesCacheKey(userId, page, limit);
    // const cached = await redis.get(cacheKey);
    // if (cached) {
    //   return res.status(200).json(JSON.parse(cached));
    // }

    const result = await getUserNotes(userId, page, limit);

    const response = { success: true, data: result.notes, pagination: result.pagination };
    // await redis.set(cacheKey, JSON.stringify(response), 'EX', NOTES_CACHE_TTL);

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in listNotes:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to retrieve notes' });
  }
};

/**
 * Update note
 * PUT /api/notes/:id
 */
export const updateNoteController = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;
    const { title, sections, quickReview, formulas } = req.body;

    if (!title && !sections && !quickReview && !formulas) {
      return res.status(400).json({ success: false, message: 'At least one field to update is required' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (sections) updates.sections = sections;
    if (quickReview) updates.quickReview = quickReview;
    if (formulas) updates.formulas = formulas;

    const note = await updateNote(id, userId, updates);

    // // Invalidate notes list cache (title may have changed)
    // await invalidateNotesCache(userId);

    res.status(200).json({ success: true, message: 'Note updated successfully', data: note });
  } catch (error) {
    console.error('Error in updateNoteController:', error);
    const statusCode = error.message === 'Note not found' ? 404 : 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to process request' });
  }
};

/**
 * Delete note
 * DELETE /api/notes/:id
 */
export const deleteNoteController = async (req, res) => {
  try {
    const userId = req.userID;
    const { id } = req.params;

    const result = await deleteNote(id, userId);

    // // Invalidate notes list cache and activity cache
    // await invalidateNotesCache(userId);
    // await invalidateActivityCache(userId);

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('Error in deleteNoteController:', error);
    const statusCode = error.message === 'Note not found' ? 404 : 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to process request' });
  }
};

/**
 * Get note by ID (public sharing)
 * GET /api/notes/share/:id
 */
export const getNotePublic = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        style: true,
        sections: true,
        quickReview: true,
        formulas: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error('Error in getNotePublic:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch note' });
  }
};
