import prisma from '../config/db.js';
import redis from '../config/redis.js';
import { chatWithContent, explainSelection } from '../services/chatService.js';
import { CHAT_MESSAGE_COST } from '../config/credits.js';
import { checkCredits } from '../services/creditService.js';

/**
 * POST /api/chat/:summaryId
 * Send a chat message about a summary, get AI response.
 */
export const sendMessage = async (req, res) => {
  const { summaryId } = req.params;
  const { message } = req.body;
  const userId = req.userID;

  try {
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Verify summary belongs to user
    const summary = await prisma.summary.findFirst({
      where: { id: summaryId, userId },
      select: { id: true, content: true, rawContent: true },
    });

    if (!summary) {
      return res.status(404).json({ success: false, message: 'Summary not found' });
    }

    // Check credits
    const creditCheck = await checkCredits(userId, CHAT_MESSAGE_COST);
    if (!creditCheck.allowed) {
      return res.status(403).json({ success: false, message: creditCheck.message });
    }

    // Load chat history
    const chatHistory = await prisma.chatMessage.findMany({
      where: { summaryId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    });

    // Get AI response
    const aiResponse = await chatWithContent(
      summary.rawContent,
      summary.content,
      chatHistory,
      message.trim()
    );

    // Store both messages and deduct credits in a transaction
    const [userMsg, assistantMsg] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: { summaryId, role: 'user', content: message.trim() },
      }),
      prisma.chatMessage.create({
        data: { summaryId, role: 'assistant', content: aiResponse },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: CHAT_MESSAGE_COST } },
      }),
    ]);

    // Invalidate user cache
    const keys = await redis.keys(`user:${userId}:*`);
    if (keys.length > 0) await redis.del(keys);

    res.status(200).json({
      success: true,
      data: {
        userMessage: { id: userMsg.id, role: 'user', content: userMsg.content, createdAt: userMsg.createdAt },
        assistantMessage: { id: assistantMsg.id, role: 'assistant', content: assistantMsg.content, createdAt: assistantMsg.createdAt },
        creditsUsed: CHAT_MESSAGE_COST,
      },
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to process chat message' });
  }
};

/**
 * POST /api/chat/:summaryId/explain
 * Explain a highlighted text selection from the summary.
 */
export const explainText = async (req, res) => {
  const { summaryId } = req.params;
  const { selectedText } = req.body;
  const userId = req.userID;

  try {
    if (!selectedText?.trim()) {
      return res.status(400).json({ success: false, message: 'Selected text is required' });
    }

    // Verify summary belongs to user
    const summary = await prisma.summary.findFirst({
      where: { id: summaryId, userId },
      select: { id: true, content: true, rawContent: true },
    });

    if (!summary) {
      return res.status(404).json({ success: false, message: 'Summary not found' });
    }

    // Check credits
    const creditCheck = await checkCredits(userId, CHAT_MESSAGE_COST);
    if (!creditCheck.allowed) {
      return res.status(403).json({ success: false, message: creditCheck.message });
    }

    // Get explanation
    const explanation = await explainSelection(
      summary.rawContent,
      summary.content,
      selectedText.trim()
    );

    // Store as chat messages for history and deduct credits
    await prisma.$transaction([
      prisma.chatMessage.create({
        data: { summaryId, role: 'user', content: `Explain: "${selectedText.trim()}"` },
      }),
      prisma.chatMessage.create({
        data: { summaryId, role: 'assistant', content: explanation },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: CHAT_MESSAGE_COST } },
      }),
    ]);

    // Invalidate user cache
    const keys = await redis.keys(`user:${userId}:*`);
    if (keys.length > 0) await redis.del(keys);

    res.status(200).json({
      success: true,
      data: {
        explanation,
        creditsUsed: CHAT_MESSAGE_COST,
      },
    });
  } catch (err) {
    console.error('Explain error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to explain text' });
  }
};

/**
 * GET /api/chat/:summaryId/history
 * Retrieve chat history for a summary.
 */
export const getChatHistory = async (req, res) => {
  const { summaryId } = req.params;
  const userId = req.userID;

  try {
    // Verify summary belongs to user
    const summary = await prisma.summary.findFirst({
      where: { id: summaryId, userId },
      select: { id: true },
    });

    if (!summary) {
      return res.status(404).json({ success: false, message: 'Summary not found' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { summaryId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ success: false, message: 'Failed to load chat history' });
  }
};
