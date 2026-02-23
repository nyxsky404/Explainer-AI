import prisma from '../config/db.js';
import { checkCredits, deductCredits, refundCredits } from './creditService.js';
import { CREDIT_COSTS } from '../config/credits.js';
import OpenAI from 'openai';
import { getDeepExplainPrompt, getFollowUpPrompt } from '../prompts/deepExplainPrompts.js';

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
 * Generate deep explanation for a topic
 */
export const generateDeepExplanation = async (userId, topic, mode = 'easy', sourceContent = null) => {
  try {
    // Check credits
    const creditCheck = await checkCredits(userId, CREDIT_COSTS.DEEP_EXPLAIN);
    if (!creditCheck.allowed) {
      throw new Error(creditCheck.message || 'Insufficient credits');
    }

    const prompt = getDeepExplainPrompt(topic, mode, sourceContent);

    const client = getClient();
    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    if (!completion?.choices?.length || !completion.choices[0]?.message) {
      throw new Error('AI model returned an empty or invalid response');
    }
    const content = completion.choices[0].message.content || '';

    // Deduct credits first
    await deductCredits(userId, CREDIT_COSTS.DEEP_EXPLAIN);

    // Store in database (refund if save fails)
    let explanation;
    try {
      explanation = await prisma.deepExplanation.create({
        data: {
          userId,
          topic,
          mode: mode.toUpperCase(),
          content,
          sourceContent,
          creditsUsed: CREDIT_COSTS.DEEP_EXPLAIN,
        },
      });
    } catch (dbError) {
      await refundCredits(userId, CREDIT_COSTS.DEEP_EXPLAIN);
      throw dbError;
    }

    return explanation;
  } catch (error) {
    console.error('Error generating deep explanation:', error);
    throw error;
  }
};

/**
 * Get explanation by ID
 */
export const getExplanationById = async (explanationId, userId) => {
  const explanation = await prisma.deepExplanation.findUnique({
    where: { id: explanationId },
  });

  if (!explanation) {
    throw new Error('Explanation not found');
  }

  // Verify ownership
  if (explanation.userId !== userId) {
    throw new Error('Unauthorized access');
  }

  return explanation;
};

/**
 * Get all explanations for a user
 */
export const getUserExplanations = async (userId, page = 1, limit = 10) => {
  const MAX_LIMIT = 100;
  page = Math.max(1, Math.floor(Number(page) || 1));
  limit = Math.max(1, Math.min(Math.floor(Number(limit) || 10), MAX_LIMIT));
  const skip = (page - 1) * limit;

  const [explanations, total] = await Promise.all([
    prisma.deepExplanation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.deepExplanation.count({
      where: { userId },
    }),
  ]);

  return {
    explanations,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Add follow-up question and answer
 */
export const addFollowUp = async (explanationId, userId, question) => {
  try {
    // Check credits
    const creditCheck = await checkCredits(userId, CREDIT_COSTS.DEEP_EXPLAIN_FOLLOWUP);
    if (!creditCheck.allowed) {
      throw new Error(creditCheck.message || 'Insufficient credits');
    }

    // Get original explanation
    const explanation = await getExplanationById(explanationId, userId);

    // Build chat history from existing follow-ups
    const chatHistory = [
      { role: 'assistant', content: explanation.content },
      ...(explanation.followUps || []).flatMap((fup) => [
        { role: 'user', content: fup.question },
        { role: 'assistant', content: fup.answer },
      ]),
    ];

    // Build follow-up prompt
    const prompt = getFollowUpPrompt(
      explanation.topic,
      explanation.mode.toLowerCase(),
      chatHistory,
      question
    );

    // Call OpenRouter with GPT
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    if (!completion?.choices?.length || !completion.choices[0]?.message) {
      throw new Error('AI model returned an empty or invalid response');
    }
    const answer = completion.choices[0].message.content || '';

    // Update explanation with new follow-up
    const updatedFollowUps = [
      ...(explanation.followUps || []),
      {
        question,
        answer,
        timestamp: new Date().toISOString(),
      },
    ];

    // Deduct credits before DB update
    await deductCredits(userId, CREDIT_COSTS.DEEP_EXPLAIN_FOLLOWUP);

    let updated;
    try {
      updated = await prisma.deepExplanation.update({
        where: { id: explanationId },
        data: {
          followUps: updatedFollowUps,
          creditsUsed: explanation.creditsUsed + CREDIT_COSTS.DEEP_EXPLAIN_FOLLOWUP,
        },
      });
    } catch (dbError) {
      await refundCredits(userId, CREDIT_COSTS.DEEP_EXPLAIN_FOLLOWUP);
      throw dbError;
    }

    return {
      followUp: updatedFollowUps[updatedFollowUps.length - 1],
      explanation: updated,
    };
  } catch (error) {
    console.error('Error adding follow-up:', error);
    throw error;
  }
};

/**
 * Delete explanation
 */
export const deleteExplanation = async (explanationId, userId) => {
  // Verify ownership
  const explanation = await getExplanationById(explanationId, userId);

  await prisma.deepExplanation.delete({
    where: { id: explanationId },
  });

  return { success: true };
};
