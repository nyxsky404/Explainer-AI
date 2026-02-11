import { summarizeWebPage } from './webSummaryService.js';
import { summarizeYouTube } from './youtubeService.js';
import { extractConcepts } from './conceptService.js';
import prisma from '../config/db.js';
import { CREDIT_COSTS } from '../config/credits.js';

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
const MAX_BATCH_SIZE = 5;

/**
 * Detect if URL is a YouTube link.
 */
function isYouTubeUrl(url) {
  return YOUTUBE_REGEX.test(url);
}

/**
 * Summarize multiple URLs sequentially.
 * @param {string} userId
 * @param {string[]} urls
 * @param {object} options - { readingLevel, tone, depth }
 * @returns {{ results: Array, totalCredits: number, successCount: number, failCount: number }}
 */
export const summarizeBatch = async (userId, urls, options = {}) => {
  if (!urls || urls.length === 0) {
    throw new Error('At least one URL is required');
  }

  if (urls.length > MAX_BATCH_SIZE) {
    throw new Error(`Maximum ${MAX_BATCH_SIZE} URLs allowed per batch`);
  }

  const creditCostPerUrl = CREDIT_COSTS.WEB_SUMMARY;
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const url of urls) {
    const type = isYouTubeUrl(url) ? 'youtube' : 'web';

    try {
      console.log(`Batch: Processing ${type} URL: ${url}`);

      // Summarize based on type
      const result = type === 'youtube'
        ? await summarizeYouTube(url, options)
        : await summarizeWebPage(url, options);

      const { summary: summaryContent, rawContent } = result;

      // Extract concepts (non-blocking)
      const concepts = await extractConcepts(rawContent || summaryContent);

      // Create summary + deduct credits
      const [summary] = await prisma.$transaction([
        prisma.summary.create({
          data: {
            userId,
            sourceUrl: url,
            type,
            content: summaryContent,
            rawContent: rawContent || null,
            concepts: concepts.length > 0 ? concepts : undefined,
            creditsUsed: creditCostPerUrl,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { creditsUsed: { increment: creditCostPerUrl } },
        }),
      ]);

      results.push({
        url,
        type,
        status: 'success',
        id: summary.id,
        creditsUsed: creditCostPerUrl,
      });
      successCount++;

      console.log(`Batch: Completed ${url} → ${summary.id}`);
    } catch (err) {
      console.error(`Batch: Failed ${url}:`, err.message);
      results.push({
        url,
        type,
        status: 'failed',
        error: err.message,
      });
      failCount++;
    }
  }

  return {
    results,
    totalCredits: successCount * creditCostPerUrl,
    successCount,
    failCount,
  };
};
