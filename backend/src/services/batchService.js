import { summarizeWebPage } from './webSummaryService.js';
import { summarizeYouTube } from './youtubeService.js';
import { extractConcepts } from './conceptService.js';
import prisma from '../config/db.js';
import redis from '../config/redis.js';
import { CREDIT_COSTS } from '../config/credits.js';
import { checkCredits } from './creditService.js';

// Invalidate credit cache - non-throwing
async function invalidateCreditCache(userId) {
  try {
    await redis.del(`user:${userId}:credits`);
  } catch (err) {
    console.error('batchService::invalidateCreditCache error for userId:', userId, err.message);
  }
}

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
const SSRF_BLOCKED = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.0\.0\.0|::1)/i;
const MAX_BATCH_SIZE = 5;

function isYouTubeUrl(url) {
  return YOUTUBE_REGEX.test(url);
}

/**
 * Validate a URL for safety: protocol allowlist + SSRF protection.
 * @returns {string|null} An error message, or null if the URL is valid.
 */
function validateUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return 'Invalid URL format';
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return 'Only HTTP and HTTPS URLs are allowed';
  }
  if (SSRF_BLOCKED.test(parsed.hostname)) {
    return 'URL points to a private or restricted network address';
  }
  return null;
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
  const totalCost = creditCostPerUrl * urls.length;

  // Pre-check: ensure the user has enough credits for the full batch before starting
  const creditCheck = await checkCredits(userId, totalCost);
  if (!creditCheck.allowed) {
    throw new Error(creditCheck.message || 'Insufficient credits for this batch');
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const url of urls) {
    // Validate each URL (SSRF + protocol) before making any outbound requests
    const urlError = validateUrl(url);
    if (urlError) {
      results.push({ url, type: 'unknown', status: 'failed', error: urlError });
      failCount++;
      continue;
    }

    const type = isYouTubeUrl(url) ? 'youtube' : 'web';

    try {
      const result = type === 'youtube'
        ? await summarizeYouTube(url, options)
        : await summarizeWebPage(url, options);

      const { summary: summaryContent, rawContent } = result;

      const concepts = await extractConcepts(rawContent || summaryContent);

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
    } catch (err) {
      console.error(`Batch: Failed ${url}:`, err.message);
      results.push({ url, type, status: 'failed', error: err.message });
      failCount++;
    }
  }

  // Invalidate credit cache after batch completes
  if (successCount > 0) {
    await invalidateCreditCache(userId);
  }

  return {
    results,
    totalCredits: successCount * creditCostPerUrl,
    successCount,
    failCount,
  };
};
