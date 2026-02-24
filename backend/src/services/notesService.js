import prisma from '../config/db.js';
import redis from '../config/redis.js';
import { checkCredits, deductCredits } from './creditService.js';
import { CREDIT_COSTS } from '../config/credits.js';
import OpenAI from 'openai';
import { getNotesPrompt } from '../prompts/notesPrompts.js';

// Invalidate credit cache - non-throwing
async function invalidateCreditCache(userId) {
  try {
    await redis.del(`user:${userId}:credits`);
  } catch (err) {
    console.error('notesService::invalidateCreditCache error for userId:', userId, err.message);
  }
}

/**
 * Create an OpenRouter client instance
 */
const getClient = () => {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'Explainer-AI',
    },
  });
};

/**
 * Parse JSON from LLM response, handling markdown code blocks
 */
const parseJsonResponse = (text) => {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch (e) {
    // Try extracting from markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error('Failed to parse JSON response');
  }
};

/**
 * Validate note response structure
 */
const validateNoteResponse = (note) => {
  if (!note.title || typeof note.title !== 'string') {
    throw new Error('Note must have a valid title');
  }
  if (!Array.isArray(note.sections) || note.sections.length === 0) {
    throw new Error('Note must have at least one section');
  }
  
  // Validate each section
  note.sections.forEach((section, index) => {
    if (!section.heading || !section.content) {
      throw new Error(`Section ${index + 1} must have heading and content`);
    }
    if (section.importance && !['high', 'medium', 'low'].includes(section.importance)) {
      section.importance = 'medium'; // Default fallback
    }
  });

  return note;
};

/**
 * Generate a note from provided content
 */
export const generateNote = async (userId, sourceContent, options = {}) => {
  const {
    style = 'OUTLINE',
    pages = 2,
    sourceType = 'TEXT',
  } = options;

  // Check credits before doing any AI work
  const creditCheck = await checkCredits(userId, CREDIT_COSTS.NOTES_GENERATE);
  if (!creditCheck.allowed) {
    throw new Error(creditCheck.message || 'Insufficient credits');
  }

  try {
    const client = getClient();

    const prompt = getNotesPrompt(sourceContent, {
      style: style.toLowerCase(),
      pages,
    });

    const response = await client.chat.completions.create({
      model: process.env.MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const rawResponse = response.choices[0]?.message?.content;
    if (!rawResponse) throw new Error('AI model returned an empty response');

    const noteData = parseJsonResponse(rawResponse);
    validateNoteResponse(noteData);

    // Atomically create note + deduct credits in one transaction
    const [note] = await prisma.$transaction([
      prisma.note.create({
        data: {
          userId,
          title: noteData.title,
          style: style.toUpperCase(),
          sourceType: sourceType.toUpperCase(),
          sourceContent,
          sections: noteData.sections,
          quickReview: noteData.quickReview || [],
          formulas: noteData.formulas || [],
          creditsUsed: CREDIT_COSTS.NOTES_GENERATE,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: CREDIT_COSTS.NOTES_GENERATE } },
      }),
    ]);

    // Invalidate credit cache
    await invalidateCreditCache(userId);

    return note;
  } catch (error) {
    console.error('Error generating note:', error);
    throw error;
  }
};

/**
 * Generate a note from an existing summary
 */
export const generateNoteFromSummary = async (userId, summaryId, options = {}) => {
  const summary = await prisma.summary.findFirst({
    where: { id: summaryId, userId },
  });

  if (!summary) {
    throw new Error('Summary not found');
  }

  const sourceContent = summary.rawContent || summary.content;

  // Check credits before doing any AI work
  const creditCheck = await checkCredits(userId, CREDIT_COSTS.NOTES_FROM_SUMMARY);
  if (!creditCheck.allowed) {
    throw new Error(creditCheck.message || 'Insufficient credits');
  }

  try {
    const client = getClient();
    const style = options.style || 'OUTLINE';
    const pages = options.pages || 2;

    const prompt = getNotesPrompt(sourceContent, {
      style: style.toLowerCase(),
      pages,
    });

    const response = await client.chat.completions.create({
      model: process.env.MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const rawResponse = response.choices[0]?.message?.content;
    if (!rawResponse) throw new Error('AI model returned an empty response');

    const noteData = parseJsonResponse(rawResponse);
    validateNoteResponse(noteData);

    // Atomically create note + deduct credits in one transaction
    const [note] = await prisma.$transaction([
      prisma.note.create({
        data: {
          userId,
          summaryId,
          title: noteData.title,
          style: style.toUpperCase(),
          sourceType: 'SUMMARY',
          sourceContent,
          sections: noteData.sections,
          quickReview: noteData.quickReview || [],
          formulas: noteData.formulas || [],
          creditsUsed: CREDIT_COSTS.NOTES_FROM_SUMMARY,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: CREDIT_COSTS.NOTES_FROM_SUMMARY } },
      }),
    ]);

    // Invalidate credit cache
    await invalidateCreditCache(userId);

    return note;
  } catch (error) {
    console.error('Error generating note from summary:', error);
    throw error;
  }
};

/**
 * Get note by ID
 */
export const getNoteById = async (noteId, userId) => {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
    include: {
      summary: {
        select: {
          id: true,
          sourceUrl: true,
          type: true,
        },
      },
    },
  });

  if (!note) {
    throw new Error('Note not found');
  }

  return note;
};

/**
 * Get all notes for a user (paginated)
 */
export const getUserNotes = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        summary: {
          select: {
            id: true,
            sourceUrl: true,
            type: true,
          },
        },
      },
    }),
    prisma.note.count({ where: { userId } }),
  ]);

  return {
    notes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update note
 */
export const updateNote = async (noteId, userId, updates) => {
  // Verify ownership
  const existingNote = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!existingNote) {
    throw new Error('Note not found');
  }

  // Update note
  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: {
      title: updates.title,
      sections: updates.sections,
      quickReview: updates.quickReview,
      formulas: updates.formulas,
      updatedAt: new Date(),
    },
  });

  return updatedNote;
};

/**
 * Delete note
 */
export const deleteNote = async (noteId, userId) => {
  // Verify ownership
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!note) {
    throw new Error('Note not found');
  }

  await prisma.note.delete({
    where: { id: noteId },
  });

  return { success: true, message: 'Note deleted successfully' };
};
