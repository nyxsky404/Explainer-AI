import prisma from '../config/db.js';
import { checkCredits, deductCredits, refundCredits } from './creditService.js';
import { CREDIT_COSTS } from '../config/credits.js';
import OpenAI from 'openai';
import { getQuizPrompt, getRegenerateQuestionPrompt } from '../prompts/quizPrompts.js';

/**
 * Create an OpenRouter client instance.
 */
function getClient() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': 'https://explainer-ai-two.vercel.app/',
      'X-Title': 'Explainer AI',
    },
  });
}

/**
 * Parse JSON from LLM response, handling markdown code blocks
 */
function parseJsonResponse(text) {
  // Strip markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
}

/**
 * Validate quiz questions structure
 */
function validateQuizResponse(quiz) {
  if (!quiz || !quiz.title || !Array.isArray(quiz.questions)) {
    throw new Error('Invalid quiz format: missing title or questions array');
  }

  for (const q of quiz.questions) {
    if (!q.id || !q.type || !q.question) {
      throw new Error(`Invalid question format: missing id, type, or question text`);
    }
    if (q.type === 'mcq' && (!Array.isArray(q.options) || !q.correctAnswer)) {
      throw new Error(`MCQ question ${q.id} missing options or correctAnswer`);
    }
    if (q.type === 'true_false' && q.correctAnswer === undefined) {
      throw new Error(`True/False question ${q.id} missing correctAnswer`);
    }
    if (q.type === 'fill_blank' && !q.correctAnswer) {
      throw new Error(`Fill-blank question ${q.id} missing correctAnswer`);
    }
    if (q.type === 'short_answer' && !q.sampleAnswer) {
      throw new Error(`Short answer question ${q.id} missing sampleAnswer`);
    }
  }

  return quiz;
}

/**
 * Generate a quiz from provided content
 */
export const generateQuiz = async (userId, sourceContent, options = {}) => {
  try {
    const creditCost = options.fromSummary ? CREDIT_COSTS.QUIZ_FROM_SUMMARY : CREDIT_COSTS.QUIZ_GENERATE;

    // Check credits
    const creditCheck = await checkCredits(userId, creditCost);
    if (!creditCheck.allowed) {
      throw new Error(creditCheck.message || 'Insufficient credits');
    }

    // Build prompt
    const prompt = getQuizPrompt(sourceContent, {
      questionCount: options.questionCount || 10,
      types: options.types || ['mcq', 'true_false', 'fill_blank'],
      difficulty: options.difficulty || 'medium',
      focusAreas: options.focusAreas,
    });

    // Call OpenRouter
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: process.env.MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;

    // Parse and validate
    const quizData = parseJsonResponse(responseText);
    validateQuizResponse(quizData);

    // Deduct credits first
    await deductCredits(userId, creditCost);

    // Store in database
    try {
      const quiz = await prisma.quiz.create({
        data: {
          userId,
          summaryId: options.summaryId || null,
          title: quizData.title,
          description: quizData.description || null,
          sourceType: options.sourceType || 'TEXT',
          sourceContent: (sourceContent || '').substring(0, 50000), // limit stored content
          difficulty: (options.difficulty || 'medium').toUpperCase(),
          questionCount: quizData.questions.length,
          questions: quizData.questions,
          creditsUsed: creditCost,
        },
      });
      return quiz;
    } catch (dbError) {
      // Refund credits if DB save fails
      await refundCredits(userId, creditCost);
      throw dbError;
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

/**
 * Generate a quiz from an existing summary
 */
export const generateQuizFromSummary = async (userId, summaryId, options = {}) => {
  try {
    // Fetch summary
    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
    });

    if (!summary) {
      throw new Error('Summary not found');
    }

    if (summary.userId !== userId) {
      throw new Error('Unauthorized access');
    }

    // Use raw content (full source) if available, otherwise use summary content
    const content = summary.rawContent || summary.content;

    return await generateQuiz(userId, content, {
      ...options,
      summaryId,
      sourceType: 'SUMMARY',
      fromSummary: true,
    });
  } catch (error) {
    console.error('Error generating quiz from summary:', error);
    throw error;
  }
};

/**
 * Get quiz by ID
 */
export const getQuizById = async (quizId, userId) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      attempts: {
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  if (quiz.userId !== userId) {
    throw new Error('Unauthorized access');
  }

  return quiz;
};

/**
 * Get all quizzes for a user (paginated)
 */
export const getUserQuizzes = async (userId, page = 1, limit = 10) => {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
  const skip = (safePage - 1) * safeLimit;

  const [quizzes, total] = await Promise.all([
    prisma.quiz.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
      select: {
        id: true,
        title: true,
        description: true,
        sourceType: true,
        difficulty: true,
        questionCount: true,
        creditsUsed: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { attempts: true },
        },
      },
    }),
    prisma.quiz.count({
      where: { userId },
    }),
  ]);

  return {
    quizzes,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: total,
      totalPages: Math.ceil(total / safeLimit),
      hasPrevPage: safePage > 1,
      hasNextPage: safePage < Math.ceil(total / safeLimit),
    },
  };
};

/**
 * Submit quiz answers and calculate score
 */
export const submitQuizAttempt = async (quizId, userId, answers, timeTaken = null) => {
  try {
    // Get quiz
    const quiz = await getQuizById(quizId, userId);

    // Score the quiz
    const questions = quiz.questions;
    let correctCount = 0;
    const results = [];

    for (const question of questions) {
      const userAnswer = answers[question.id];
      let isCorrect = false;
      let needsReview = false;

      // Coerce to strings for comparison
      const ua = userAnswer == null ? '' : String(userAnswer);
      const ca = question.correctAnswer == null ? '' : String(question.correctAnswer);

      switch (question.type) {
        case 'mcq':
          isCorrect = ua.toUpperCase().trim() === ca.toUpperCase().trim();
          break;
        case 'true_false':
          isCorrect = ua.toLowerCase().trim() === ca.toLowerCase().trim();
          break;
        case 'fill_blank':
          // Case-insensitive comparison, trimmed
          isCorrect = ua.trim().toLowerCase() === ca.trim().toLowerCase();
          break;
        case 'short_answer':
          // For short answer, check if key points are mentioned
          if (question.keyPoints && Array.isArray(question.keyPoints)) {
            const answerLower = ua.toLowerCase();
            const matchedPoints = question.keyPoints.filter((point) =>
              answerLower.includes(point.toLowerCase())
            );
            isCorrect = matchedPoints.length >= Math.ceil(question.keyPoints.length / 2);
          } else {
            // Fallback: mark for review instead of auto-correct
            isCorrect = false;
            needsReview = true;
          }
          break;
      }

      if (isCorrect) correctCount++;

      results.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        needsReview,
        correctAnswer: question.type === 'short_answer' ? question.sampleAnswer : question.correctAnswer,
        explanation: question.explanation,
      });
    }

    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        answers,
        score: Math.round(score * 100) / 100,
        timeTaken,
      },
    });

    return {
      attempt,
      results,
      score: Math.round(score * 100) / 100,
      correctCount,
      totalQuestions: questions.length,
    };
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw error;
  }
};

/**
 * Regenerate a specific question in a quiz
 */
export const regenerateQuestion = async (quizId, userId, questionId) => {
  try {
    const quiz = await getQuizById(quizId, userId);

    const questionIndex = quiz.questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      throw new Error('Question not found in quiz');
    }

    const existingQuestion = quiz.questions[questionIndex];
    const prompt = getRegenerateQuestionPrompt(
      quiz.sourceContent,
      existingQuestion,
      quiz.difficulty.toLowerCase()
    );

    const client = getClient();
    const completion = await client.chat.completions.create({
      model: process.env.MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });

    const responseText = completion.choices[0].message.content;
    const newQuestion = parseJsonResponse(responseText);

    // Validate the new question using existing validation
    validateQuizResponse({ title: 'temp', questions: [newQuestion] });

    // Replace the question
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex] = { ...newQuestion, id: questionId };

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: { questions: updatedQuestions },
    });

    return updatedQuiz;
  } catch (error) {
    console.error('Error regenerating question:', error);
    throw error;
  }
};

/**
 * Delete quiz
 */
export const deleteQuiz = async (quizId, userId) => {
  // Verify ownership
  await getQuizById(quizId, userId);

  await prisma.quiz.delete({
    where: { id: quizId },
  });

  return { success: true };
};
