import prisma from "../config/db.js";
import { addGossipJob } from "../queue/gossipProducer.js";
import { deleteGossipAudio } from "../services/storageService.js";
import { GOSSIP_GENERATION_COST } from "../config/credits.js";
import { checkCredits } from "../services/creditService.js";
import redis from "../config/redis.js";

// Safe SCAN-based cache invalidation
async function invalidateUserCache(userId) {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `user:${userId}:*`, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) await redis.del(keys);
  } while (cursor !== '0');
}

const GOSSIP_CREDIT_COST = GOSSIP_GENERATION_COST;

/**
 * Create a new gossip generation job.
 */
export const gossipGenerate = async (req, res) => {
  const { blogUrl, depth } = req.body;

  try {
    if (!req.body || !blogUrl) {
      return res.status(400).json({
        success: false,
        message: "Url not Provided",
      });
    }

    // Check usage limits
    const creditCheck = await checkCredits(req.userID, GOSSIP_CREDIT_COST);

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

    const data = await prisma.gossip.create({
      data: {
        blogUrl,
        status: "processing",
        progress: 0,
        creditsUsed: GOSSIP_CREDIT_COST,
        user: {
          connect: {
            id: req.userID,
          },
        },
      },
    });

    // Deduct credits for gossip (3 credits)
    await prisma.user.update({
      where: { id: req.userID },
      data: {
        creditsUsed: {
          increment: GOSSIP_CREDIT_COST,
        },
      },
    });

    // Fetch user preferences and merge with per-request depth
    const preferences = await prisma.userPreference.findUnique({
      where: { userId: req.userID },
    });
    const options = {
      depth: depth || preferences?.defaultDepth || 'standard',
    };

    await addGossipJob(data.id, blogUrl, options);

    // Invalidate user cache (SCAN-based)
    await invalidateUserCache(req.userID);

    res.status(200).json({
      success: true,
      data,
      usage: {
        current: creditCheck.user.creditsUsed + GOSSIP_CREDIT_COST,
        limit: creditCheck.user.creditLimit,
        resetDate: creditCheck.user.usageResetDate,
        creditsUsed: GOSSIP_CREDIT_COST,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Get gossip by ID.
 */
export const getGossipById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "No id provided",
      });
    }

    const data = await prisma.gossip.findUnique({
      where: { id },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Gossip not found",
      });
    }

    // Authorization: ensure the gossip belongs to the requesting user
    if (data.userId !== req.userID) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this gossip",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gossip found",
      data,
    });
  } catch (err) {
    console.error('getGossipById error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve gossip",
    });
  }
};

/**
 * Get gossip progress for polling.
 */
export const getGossipProgress = async (req, res) => {
  const { id } = req.params;
  const userId = req.userID;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Gossip ID is required",
      });
    }

    const gossip = await prisma.gossip.findUnique({
      where: { id },
    });

    if (!gossip) {
      return res.status(404).json({
        success: false,
        message: "Gossip not found",
      });
    }

    if (gossip.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this gossip",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: gossip.id,
        status: gossip.status,
        progress: gossip.progress,
        errorMessage: gossip.errorMessage,
        failedAt: gossip.failedAt,
        createdAt: gossip.createdAt,
        updatedAt: gossip.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Retry a failed gossip.
 */
export const retryGossip = async (req, res) => {
  const { id } = req.params;
  const userId = req.userID;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Gossip ID is required",
      });
    }

    const gossip = await prisma.gossip.findUnique({
      where: { id },
    });

    if (!gossip) {
      return res.status(404).json({
        success: false,
        message: "Gossip not found",
      });
    }

    if (gossip.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to retry this gossip",
      });
    }

    if (gossip.status !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Can only retry failed gossips",
      });
    }

    // Reset gossip and re-queue
    await prisma.gossip.update({
      where: { id },
      data: {
        status: "processing",
        progress: 0,
        errorMessage: null,
        failedAt: null,
      },
    });

    await addGossipJob(id, gossip.blogUrl);

    // Invalidate user cache
    await invalidateUserCache(userId);

    res.status(200).json({
      success: true,
      message: "Gossip retry initiated",
      data: {
        id: gossip.id,
        status: "processing",
        progress: 0,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Get all gossips for a user (paginated).
 */
export const getAllGossips = async (req, res) => {
  const userId = req.userID;

  try {
    // Parse pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Validate pagination parameters
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

    const cacheKey = `user:${userId}:gossips:${page}:${limit}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Get total count of gossips for this user
    const totalGossips = await prisma.gossip.count({
      where: { userId },
    });

    // Get paginated gossips
    const gossips = await prisma.gossip.findMany({
      where: { userId },
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc", // Most recent first
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalGossips / limit);
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
        gossips: gossips,
      },
      pagination: {
        currentPage: page,
        limit: limit,
        totalItems: totalGossips,
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
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Delete a gossip.
 */
export const deleteGossip = async (req, res) => {
  const { id } = req.params;
  const userId = req.userID;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Gossip ID is required",
      });
    }

    // Check if gossip exists and belongs to user
    const gossip = await prisma.gossip.findUnique({
      where: { id },
    });

    if (!gossip) {
      return res.status(404).json({
        success: false,
        message: "Gossip not found",
      });
    }

    if (gossip.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this gossip",
      });
    }

    // Delete audio file from storage if it exists
    if (gossip.audioUrl) {
      await deleteGossipAudio(id);
    }

    await prisma.gossip.delete({
      where: { id },
    });

    // Invalidate user cache
    await invalidateUserCache(userId);

    res.status(200).json({
      success: true,
      message: "Gossip deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Get public gossip details (no auth required).
 */
export const getGossipPublic = async (req, res) => {
  const { id } = req.params;

  try {
    const gossip = await prisma.gossip.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!gossip) {
      return res.status(404).json({
        success: false,
        message: "Gossip not found",
      });
    }

    if (gossip.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Gossip is not ready for public viewing",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: gossip.id,
        blogUrl: gossip.blogUrl,
        audioUrl: gossip.audioUrl,
        audioDuration: gossip.audioDuration,
        createdAt: gossip.createdAt,
        author: gossip.user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};