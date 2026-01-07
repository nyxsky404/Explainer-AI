import prisma from "../config/db.js";
import { addJobs } from "../queue/producer.js";
import { deleteAudioFile } from "../services/storageService.js";

// Helper function to check and reset usage limits
async function checkAndResetUsage(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const resetDate = new Date(user.usageResetDate);

  // Reset usage if it's been a month since last reset
  if (now >= resetDate) {
    const nextResetDate = new Date(now);
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentUsage: 0,
        usageResetDate: nextResetDate,
      },
    });

    return {
      currentUsage: 0,
      monthlyLimit: user.monthlyLimit,
      resetDate: nextResetDate,
    };
  }

  return {
    currentUsage: user.currentUsage,
    monthlyLimit: user.monthlyLimit,
    resetDate: user.usageResetDate,
  };
}

export const podcastGenerate = async (req, res) => {
  console.log(req.body);
  const { blogUrl } = req.body;

  try {
    if (!req.body || !blogUrl) {
      return res.status(400).json({
        success: false,
        message: "Url not Provided",
      });
    }

    // Check usage limits
    const usage = await checkAndResetUsage(req.userID);

    if (usage.currentUsage >= usage.monthlyLimit) {
      return res.status(403).json({
        success: false,
        message: `Monthly limit reached. You have used ${usage.currentUsage}/${
          usage.monthlyLimit
        } podcasts this month. Limit resets on ${new Date(
          usage.resetDate
        ).toLocaleDateString()}`,
        usage: {
          current: usage.currentUsage,
          limit: usage.monthlyLimit,
          resetDate: usage.resetDate,
        },
      });
    }

    const data = await prisma.podcast.create({
      data: {
        blogUrl,
        status: "processing",
        progress: 0,
        user: {
          connect: {
            id: req.userID,
          },
        },
      },
    });

    // Increment usage
    await prisma.user.update({
      where: { id: req.userID },
      data: {
        currentUsage: {
          increment: 1,
        },
      },
    });

    await addJobs(data.id, blogUrl);

    res.status(200).json({
      success: true,
      data,
      usage: {
        current: usage.currentUsage + 1,
        limit: usage.monthlyLimit,
        resetDate: usage.resetDate,
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

    res.status(200).json({
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
    });
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
