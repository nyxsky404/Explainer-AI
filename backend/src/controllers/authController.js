import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { deleteAudioFile } from "../services/storageService.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send("All fields are required");
    }

    const key = String(email).toLowerCase().trim();

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email: key },
    });

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await prisma.user.create({
      data: {
        name: name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
        email: key,
        password: hashedPassword,
      },
    });

    // jwt
    generateTokenAndSetCookie(res, createUser.id);

    res.status(201).json({
      success: true,
      message: "user Created Successfully",
      user: { ...createUser, password: undefined }, // not passing the password
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const key = String(email).toLowerCase().trim();

    const findUser = await prisma.user.findUnique({
      where: {
        email: key,
      },
    });

    if (!findUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const checkPassword = await bcrypt.compare(password, findUser.password);

    if (!checkPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(res, findUser.id);

    await prisma.user.update({
      where: { email: key },
      data: {
        lastLogin: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: { ...findUser, password: undefined },
    });
  } catch (err) {
    throw new Error(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const profile = async (req, res) => {
  const id = req.userID;
  try {
    const findUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, user: { ...findUser, password: undefined } });
  } catch (err) {
    throw new Error(err.message);
  }
};

// Forgot Password - Generate reset token
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const key = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: key },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Account with this email does not exist",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email: key },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email with reset token
    try {
      const emailResult = await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name
      );

      res.status(200).json({
        success: true,
        message:
          "Password reset link has been sent to your email. Please check your inbox.",
        // Include preview URL in development for Ethereal emails
        previewUrl:
          process.env.NODE_ENV === "development"
            ? emailResult.previewUrl
            : undefined,
      });
    } catch (emailError) {
      // Log error but don't expose it to user for security
      console.error("Failed to send password reset email:", emailError);

      // Still return success to user (security best practice)
      res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
        // In development, include token if email fails
        resetToken:
          process.env.NODE_ENV === "development" ? resetToken : undefined,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reset Password - Use reset token to change password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userID;
    const { name, email, newPassword, currentPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const updateData = {};

    // Update name if provided
    if (name) {
      updateData.name =
        name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    }

    // Update email if provided
    if (email) {
      const key = String(email).toLowerCase().trim();

      // Check if email is already taken by another user
      const emailExists = await prisma.user.findUnique({
        where: { email: key },
      });

      if (emailExists && emailExists.id !== userId) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken",
        });
      }

      updateData.email = key;
    }

    // Update password if newPassword is provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change password",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: { ...updatedUser, password: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Usage Information
export const getUsage = async (req, res) => {
  try {
    const userId = req.userID;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyLimit: true,
        currentUsage: true,
        usageResetDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();
    const resetDate = new Date(user.usageResetDate);
    const daysUntilReset = Math.ceil((resetDate - now) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      usage: {
        current: user.currentUsage,
        limit: user.monthlyLimit,
        remaining: Math.max(0, user.monthlyLimit - user.currentUsage),
        resetDate: user.usageResetDate,
        daysUntilReset: Math.max(0, daysUntilReset),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userID;
    const { password } = req.body;

    // Get user to verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        podcasts: {
          select: { id: true, audioUrl: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Require password confirmation for security
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid password. Account deletion requires password confirmation.",
      });
    }

    // Delete all audio files from storage
    if (user.podcasts && user.podcasts.length > 0) {
      const deletePromises = user.podcasts
        .filter((podcast) => podcast.audioUrl)
        .map((podcast) => deleteAudioFile(podcast.id));

      // Wait for all deletions to complete (don't fail if some fail)
      await Promise.allSettled(deletePromises);
    }

    // Delete user (this will cascade delete all podcasts due to the relation)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear auth cookie
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
