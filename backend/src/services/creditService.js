import prisma from "../config/db.js";
// import redis from "../config/redis.js";
import { DEFAULTS } from "../config/constants.js";

/**
 * Check if user has enough credits and reset usage if needed
 * @param {string} userId - User ID
 * @param {number} cost - Credit cost of the operation
 * @returns {Promise<object>} - Result object { allowed: boolean, user: object, message: string }
 */
export const checkCredits = async (userId, cost) => {
  // const cacheKey = `user:${userId}:credits`;
  // let user = await redis.get(cacheKey);

  // if (user) {
  //   user = JSON.parse(user);
  // } else {
  let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { creditLimit: true, creditsUsed: true, usageResetDate: true },
    });
  //   // Cache for 1 hour
  //   await redis.set(cacheKey, JSON.stringify(user), "EX", 3600);
  // }

  // Check if reset is needed (30 days cycle)
  const today = new Date();
  const resetDate = new Date(user.usageResetDate);
  const daysDiff = Math.floor((today - resetDate) / (1000 * 60 * 60 * 24));

  if (daysDiff >= DEFAULTS.USAGE_RESET_DAYS) {
    // Reset usage
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        creditsUsed: 0,
        usageResetDate: today,
      },
    });
    
    // // Update cache
    // await redis.set(cacheKey, JSON.stringify(updatedUser), "EX", 3600);

    // Return allowed since usage is now 0
    return { allowed: true, user: updatedUser };
  }

  if (user.creditsUsed + cost > user.creditLimit) {
    return {
      allowed: false,
      user,
      message: `Insufficient credits. You have ${user.creditLimit - user.creditsUsed} credits remaining. This action requires ${cost} credits. Limit resets on ${new Date(resetDate.setDate(resetDate.getDate() + DEFAULTS.USAGE_RESET_DAYS)).toLocaleDateString()}`,
    };
  }

  return { allowed: true, user };
};

/**
 * Deduct credits from user
 * @param {string} userId - User ID
 * @param {number} cost - Credit cost to deduct
 * @returns {Promise<object>} - Updated user
 */
export const deductCredits = async (userId, cost) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { creditsUsed: { increment: cost } },
  });

  // // Invalidate credit cache
  // await redis.del(`user:${userId}:credits`);

  return updatedUser;
};

/**
 * Refund credits to user
 * @param {string} userId - User ID
 * @param {number} cost - Credit cost to refund
 * @returns {Promise<object>} - Updated user
 */
export const refundCredits = async (userId, cost) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { creditsUsed: { decrement: cost } },
  });

  // // Invalidate credit cache
  // await redis.del(`user:${userId}:credits`);

  return updatedUser;
};
