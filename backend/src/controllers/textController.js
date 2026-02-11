import { summarizeText } from '../services/textService.js';
import { extractConcepts } from '../services/conceptService.js';
import prisma from '../config/db.js';
import { CREDIT_COSTS } from '../config/credits.js';
import { checkCredits } from '../services/creditService.js';

export const summarizeTextController = async (req, res) => {
  const userId = req.userID;
  const { text, depth, tone, readingLevel } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  try {
    // Check credits
    const hasCredits = await checkCredits(userId, CREDIT_COSTS.TEXT_SUMMARY);
    if (!hasCredits) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
      });
    }

    // Process Text
    console.log(`Processing text summary for user ${userId}`);
    const result = await summarizeText(text, {
      depth,
      tone,
      readingLevel,
    });

    const { summary: summaryContent, rawContent } = result;

    // Extract concepts (non-blocking)
    const concepts = await extractConcepts(rawContent || summaryContent);

    // Store summary and deduct credits
    const [summary] = await prisma.$transaction([
      prisma.summary.create({
        data: {
          userId,
          sourceUrl: 'text://paste', // Sentinel value for plain text
          type: 'text',
          content: summaryContent,
          rawContent: rawContent || null, // rawContent is the original text
          concepts: concepts.length > 0 ? concepts : undefined,
          creditsUsed: CREDIT_COSTS.TEXT_SUMMARY,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: CREDIT_COSTS.TEXT_SUMMARY } },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: summary,
      message: 'Text summarized successfully',
    });
  } catch (err) {
    console.error('Text controller error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to process text',
    });
  }
};
