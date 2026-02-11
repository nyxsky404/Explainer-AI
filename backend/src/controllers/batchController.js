import { summarizeBatch } from '../services/batchService.js';
import { checkCredits } from '../services/creditService.js';
import { CREDIT_COSTS } from '../config/credits.js';

export const summarizeBatchController = async (req, res) => {
  const userId = req.userID;
  const { urls, depth, tone, readingLevel } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ success: false, message: 'An array of URLs is required' });
  }

  try {
    // Calculate total cost
    const totalCost = urls.length * CREDIT_COSTS.WEB_SUMMARY;

    // Check credits
    const hasCredits = await checkCredits(userId, totalCost);
    if (!hasCredits) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. Need ${totalCost} credits.`,
        code: 'INSUFFICIENT_CREDITS',
      });
    }

    // Process Batch
    console.log(`Processing batch of ${urls.length} URLs for user ${userId}`);
    const result = await summarizeBatch(userId, urls, {
      depth,
      tone,
      readingLevel,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: `Batch processing complete. ${result.successCount} succeeded, ${result.failCount} failed.`,
    });
  } catch (err) {
    console.error('Batch controller error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to process batch',
    });
  }
};
