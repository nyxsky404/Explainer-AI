import { summarizeYouTube } from "../services/youtubeService.js";
import { summarizeWebPage } from "../services/webSummaryService.js";
import { extractConcepts } from "../services/conceptService.js";
import { textToSpeech } from "../services/deepgramService.js";
import { uploadSummaryAudio, deleteSummaryAudio } from "../services/storageService.js";
import prisma from "../config/db.js";
import redis from "../config/redis.js";
import { SUMMARY_CREDIT_COST, AUDIO_GENERATION_COST, CREDIT_COSTS } from "../config/credits.js";
import { checkCredits, refundCredits } from "../services/creditService.js";

export const summarizeYouTubeController = async (req, res) => {
  const { url, depth } = req.body;
  const userId = req.userID;

  try {
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "YouTube URL is required",
      });
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid YouTube URL",
      });
    }

    // Check credit limit
    const creditCheck = await checkCredits(userId, SUMMARY_CREDIT_COST);
    if (!creditCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: creditCheck.message,
      });
    }

    // Fetch user preferences and merge with per-request depth
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });
    const options = {
      readingLevel: preferences?.readingLevel || 'intermediate',
      tone: preferences?.tone || 'conversational',
      depth: depth || preferences?.defaultDepth || 'standard',
    };

    const result = await summarizeYouTube(url, options);
    const { summary: summaryContent, rawContent } = result;

    // Extract concepts from the content (non-blocking on failure)
    const concepts = await extractConcepts(rawContent || summaryContent);

    // Store summary and deduct credits
    const [summary] = await prisma.$transaction([
      prisma.summary.create({
        data: {
          userId,
          sourceUrl: url,
          type: "youtube",
          content: summaryContent,
          rawContent: rawContent || null,
          concepts: concepts.length > 0 ? concepts : undefined,
          creditsUsed: SUMMARY_CREDIT_COST,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: SUMMARY_CREDIT_COST } },
      }),
    ]);

    // Invalidate user cache
    const keys = await redis.keys(`user:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    res.status(200).json({
      success: true,
      data: {
        id: summary.id,
        url,
        summary: summary.content,
        type: "youtube",
        creditsUsed: SUMMARY_CREDIT_COST,
      },
    });
  } catch (err) {
    console.error("YouTube summarization error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to summarize YouTube video",
    });
  }
};

export const summarizeWebController = async (req, res) => {
  const { url, depth } = req.body;
  const userId = req.userID;

  try {
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Web page URL is required",
      });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid URL",
      });
    }

    // Check credit limit
    const creditCheck = await checkCredits(userId, SUMMARY_CREDIT_COST);
    if (!creditCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: creditCheck.message,
      });
    }

    // Fetch user preferences and merge with per-request depth
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });
    const options = {
      readingLevel: preferences?.readingLevel || 'intermediate',
      tone: preferences?.tone || 'conversational',
      depth: depth || preferences?.defaultDepth || 'standard',
    };

    const result = await summarizeWebPage(url, options);
    const { summary: summaryContent, rawContent } = result;

    // Extract concepts from the raw content (non-blocking on failure)
    const concepts = await extractConcepts(rawContent || summaryContent);

    // Store summary and deduct credits
    const [summary] = await prisma.$transaction([
      prisma.summary.create({
        data: {
          userId,
          sourceUrl: url,
          type: "web",
          content: summaryContent,
          rawContent: rawContent || null,
          concepts: concepts.length > 0 ? concepts : undefined,
          creditsUsed: SUMMARY_CREDIT_COST,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: SUMMARY_CREDIT_COST } },
      }),
    ]);

    // Invalidate user cache
    const keys = await redis.keys(`user:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    res.status(200).json({
      success: true,
      data: {
        id: summary.id,
        url,
        summary: summary.content,
        type: "web",
        creditsUsed: SUMMARY_CREDIT_COST,
      },
    });
  } catch (err) {
    console.error("Web summarization error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to summarize web page",
    });
  }
};

// Get all summaries for user
export const getSummaries = async (req, res) => {
  const userId = req.userID;
  const { page = 1, limit = 10, type } = req.query;

  try {
    const cacheKey = `user:${userId}:summaries:${page}:${limit}:${type || 'all'}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { userId };
    if (type) where.type = type;

    const [summaries, total] = await Promise.all([
      prisma.summary.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.summary.count({ where }),
    ]);

    const response = {
      success: true,
      data: { summaries },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1,
        hasNextPage: skip + summaries.length < total,
      },
    };

    // Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(response), "EX", 3600);

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single summary
export const getSummary = async (req, res) => {
  const userId = req.userID;
  const { id } = req.params;

  try {
    const summary = await prisma.summary.findFirst({
      where: { id, userId },
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Summary not found",
      });
    }

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get recent activity (combined podcasts + summaries)
export const getRecentActivity = async (req, res) => {
  const userId = req.userID;
  const { limit = 5, page = 1 } = req.query;

  try {
    const cacheKey = `user:${userId}:activity:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [podcasts, summaries, totalPodcasts, totalSummaries] = await Promise.all([
      prisma.podcast.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          blogUrl: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.summary.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          sourceUrl: true,
          type: true,
          audioStatus: true,
          createdAt: true,
        },
      }),
      prisma.podcast.count({ where: { userId } }),
      prisma.summary.count({ where: { userId } }),
    ]);

    // Combine, add credits info, and sort by date
    const allActivity = [
      ...podcasts.map((p) => ({ ...p, activityType: "podcast", credits: CREDIT_COSTS.PODCAST_GENERATION })),
      ...summaries.map((s) => ({ ...s, activityType: "summary", credits: CREDIT_COSTS.YOUTUBE_SUMMARY })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = totalPodcasts + totalSummaries;
    const activity = allActivity.slice(skip, skip + parseInt(limit));

    const response = {
      success: true,
      data: { activity },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1,
        hasNextPage: skip + activity.length < total,
      },
    };

    // Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(response), "EX", 3600);

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Generate audio from summary text (background process)
export const generateSummaryAudio = async (req, res) => {
  const userId = req.userID;
  const { id } = req.params;

  try {
    // Get the summary
    const summary = await prisma.summary.findFirst({
      where: { id, userId },
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Summary not found",
      });
    }

    // Check if audio already exists or is generating
    if (summary.audioUrl) {
      return res.status(200).json({
        success: true,
        data: { audioUrl: summary.audioUrl, audioStatus: "completed" },
        message: "Audio already exists",
      });
    }

    if (summary.audioStatus === "generating") {
      return res.status(200).json({
        success: true,
        data: { audioStatus: "generating" },
        message: "Audio generation in progress",
      });
    }

    // Check credit limit
    const creditCheck = await checkCredits(userId, AUDIO_GENERATION_COST);
    if (!creditCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: creditCheck.message,
      });
    }

    // Set status to generating immediately
    await prisma.summary.update({
      where: { id },
      data: { audioStatus: "generating" },
    });

    // Return immediately, process in background
    res.status(202).json({
      success: true,
      data: { audioStatus: "generating" },
      message: "Audio generation started",
    });

    // Background async process (non-blocking)
    processAudioGeneration(id, userId, summary.content).catch((err) => {
      console.error("Background audio generation failed:", err);
    });

  } catch (err) {
    console.error("Audio generation error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate audio",
    });
  }
};

// Background audio processing function
async function processAudioGeneration(summaryId, userId, content) {
  try {
    console.log("Starting background audio generation for summary:", summaryId);

    // Generate audio using Deepgram
    const audioBuffer = await textToSpeech(content);
    console.log("Deepgram TTS complete, buffer size:", audioBuffer?.length);

    // Upload to Supabase storage
    const audioUrl = await uploadSummaryAudio(audioBuffer, summaryId);
    console.log("Supabase upload complete, URL:", audioUrl);

    // Update summary with audio URL and deduct credits
    await prisma.$transaction([
      prisma.summary.update({
        where: { id: summaryId },
        data: { audioUrl, audioStatus: "completed" },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: AUDIO_GENERATION_COST } },
      }),
      // Update the summary's creditsUsed to reflect the audio generation cost
      prisma.summary.update({
        where: { id: summaryId },
        data: { creditsUsed: { increment: AUDIO_GENERATION_COST } }
      })
    ]);

    console.log("Audio generation completed successfully for summary:", summaryId);
  } catch (err) {
    console.error("Background audio generation failed:", err);
    // Update status to failed and refund credits if they were deducted (though here they weren't yet)
    // In this flow, credits are deducted ONLY on success (lines 370-373),
    // so we don't need to refund here. But to be safe for future changes,
    // we ensure the user wasn't charged.
    // Refund credits since generation failed
    await refundCredits(userId, AUDIO_GENERATION_COST);
    
    // Update status to failed
    await prisma.summary.update({
      where: { id: summaryId },
      data: { audioStatus: "failed" },
    });

  }
}

// Delete summary and associated audio
export const deleteSummary = async (req, res) => {
  const userId = req.userID;
  const { id } = req.params;

  try {
    // Find the summary first
    const summary = await prisma.summary.findFirst({
      where: { id, userId },
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Summary not found",
      });
    }

    // Delete audio file from Supabase if exists
    if (summary.audioUrl) {
      await deleteSummaryAudio(id);
    }

    // Delete from database
    await prisma.summary.delete({
      where: { id },
    });

    // Invalidate user cache (summaries list and recent activity)
    const keys = await redis.keys(`user:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    res.status(200).json({
      success: true,
      message: "Summary deleted successfully",
    });
  } catch (err) {
    console.error("Delete summary error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to delete summary",
    });
  }
};

// Get shareable summary (public access without auth)
export const getSummaryPublic = async (req, res) => {
  const { id } = req.params;

  try {
    const summary = await prisma.summary.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Summary not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: summary.id,
        type: summary.type,
        sourceUrl: summary.sourceUrl,
        content: summary.content,
        audioUrl: summary.audioUrl,
        createdAt: summary.createdAt,
        author: summary.user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


