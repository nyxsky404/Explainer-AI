import prisma from "../config/db.js";
import { addJobs } from "../queue/producer.js";
import { deleteAudioFile } from "../services/storageService.js";
import { PODCAST_GENERATION_COST } from "../config/credits.js";
import { checkCredits } from "../services/creditService.js";
import redis from "../config/redis.js";
const PODCAST_CREDIT_COST = PODCAST_GENERATION_COST;



export const podcastGenerate = async (req, res) => {
  console.log(req.body);
  const { blogUrl, depth } = req.body;

  try {
    if (!req.body || !blogUrl) {
      return res.status(400).json({
        success: false,
        message: "Url not Provided",
      });
    }

    // Check usage limits
    const creditCheck = await checkCredits(req.userID, PODCAST_CREDIT_COST);

    if (!creditCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: creditCheck.message,
        usage: {
          current: creditCheck.user.creditsUsed,
          limit: creditCheck.user.creditLimit,
          resetDate: creditCheck.user.usageResetDate,
        },
      });
    }

    const data = await prisma.podcast.create({
      data: {
        blogUrl,
        status: "processing",
        progress: 0,
        creditsUsed: PODCAST_CREDIT_COST,
        user: {
          connect: {
            id: req.userID,
          },
        },
      },
    });

    // Deduct credits for podcast (3 credits)
    await prisma.user.update({
      where: { id: req.userID },
      data: {
        creditsUsed: {
          increment: PODCAST_CREDIT_COST,
        },
      },
    });

    // Fetch user preferences and merge with per-request depth
    const preferences = await prisma.userPreference.findUnique({
      where: { userId: req.userID },
    });
    const options = {
      readingLevel: preferences?.readingLevel || 'intermediate',
      tone: preferences?.tone || 'conversational',
      depth: depth || preferences?.defaultDepth || 'standard',
    };

    await addJobs(data.id, blogUrl, options);

    // Invalidate user cache (podcasts list and recent activity)
    const keys = await redis.keys(`user:${req.userID}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    res.status(200).json({
      success: true,
      data,
      usage: {
        current: creditCheck.user.creditsUsed + PODCAST_CREDIT_COST,
        limit: creditCheck.user.creditLimit,
        resetDate: creditCheck.user.usageResetDate,
        creditsUsed: PODCAST_CREDIT_COST,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getPodcastById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "No id provided",
      });
    }

    const data = await prisma.podcast.findUnique({
      where: { id },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No data found",
      });
    }

    res.status(200).json({
      success: true,
      message: "podcast found 🎉",
      data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get podcast progress
export const getPodcastProgress = async (req, res) => {
  const { id } = req.params;
  const userId = req.userID;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Podcast ID is required",
      });
    }

    const podcast = await prisma.podcast.findUnique({
      where: { id },
    });

    if (!podcast) {
      return res.status(404).json({
        success: false,
        message: "Podcast not found",
      });
    }

    if (podcast.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this podcast",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: podcast.id,
        status: podcast.status,
        progress: podcast.progress,
        errorMessage: podcast.errorMessage,
        failedAt: podcast.failedAt,
        createdAt: podcast.createdAt,
        updatedAt: podcast.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Retry failed podcast
export const retryPodcast = async (req, res) => {
  const { id } = req.params;
  const userId = req.userID;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Podcast ID is required",
      });
    }

    const podcast = await prisma.podcast.findUnique({
      where: { id },
    });

    if (!podcast) {
      return res.status(404).json({
        success: false,
        message: "Podcast not found",
      });
    }

    if (podcast.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to retry this podcast",
      });
    }

    if (podcast.status !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Can only retry failed podcasts",
      });
    }

    // Reset podcast and re-queue
    await prisma.podcast.update({
      where: { id },
      data: {
        status: "processing",
        progress: 0,
        errorMessage: null,
        failedAt: null,
      },
    });

    await addJobs(id, podcast.blogUrl);

    // Invalidate user cache
    const keys = await redis.keys(`user:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    res.status(200).json({
      success: true,
      message: "Podcast retry initiated",
      data: {
        id: podcast.id,
        status: "processing",
        progress: 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllPodcasts = async (req, res) => {
  const userId = req.userID;

  try {
    // Parse pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Validate pagination parameters (0 will be converted to 1 due to the || 1 as 0 is falsy value in JavaScript)
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cacheKey = `user:${userId}:podcasts:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Get total count of podcasts for this user
    const totalPodcasts = await prisma.podcast.count({
      where: { userId },
    });

    // Get paginated podcasts
    const podcasts = await prisma.podcast.findMany({
      where: { userId },
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc", // Most recent first
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalPodcasts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        podcasts: podcasts,
      },
      pagination: {
        currentPage: page,
        limit: limit,
        totalItems: totalPodcasts,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
      },
    };

    // Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(response), "EX", 3600);

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Podcast
export const deletePodcast = async (req, res) => {
  const { id } = req.params;
  const userId = req.userID;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Podcast ID is required",
      });
    }

    // Check if podcast exists and belongs to user
    const podcast = await prisma.podcast.findUnique({
      where: { id },
    });

    if (!podcast) {
      return res.status(404).json({
        success: false,
        message: "Podcast not found",
      });
    }

    if (podcast.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this podcast",
      });
    }

    // Delete audio file from storage if it exists
    if (podcast.audioUrl) {
      await deleteAudioFile(id);
    }

    await prisma.podcast.delete({
      where: { id },
    });

    // Invalidate user cache
    const keys = await redis.keys(`user:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    res.status(200).json({
      success: true,
      message: "Podcast deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get public podcast details (no auth required)
export const getPodcastPublic = async (req, res) => {
  const { id } = req.params;

  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!podcast) {
      return res.status(404).json({
        success: false,
        message: "Podcast not found",
      });
    }

    if (podcast.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Podcast is not ready for public viewing",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: podcast.id,
        blogUrl: podcast.blogUrl,
        audioUrl: podcast.audioUrl,
        audioDuration: podcast.audioDuration,
        createdAt: podcast.createdAt,
        author: podcast.user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
