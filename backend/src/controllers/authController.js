import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { deleteAudioFile } from "../services/storageService.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { CREDIT_COSTS } from "../config/credits.js";
import { z } from "zod";

// Zod schemas for input validation
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({
        success: false,
        message: tokenData.error_description || "Failed to authenticate with GitHub",
      });
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const githubUser = await userResponse.json();

    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      email = primaryEmail ? primaryEmail.email : emails[0]?.email;
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Unable to retrieve email from GitHub account",
      });
    }

    let user = await prisma.user.findUnique({
      where: { githubId: String(githubUser.id) },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: String(githubUser.id),
            provider: "github",
            avatarUrl: githubUser.avatar_url,
            lastLogin: new Date(),
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            name: githubUser.name || githubUser.login,
            email: email.toLowerCase().trim(),
            githubId: String(githubUser.id),
            provider: "github",
            avatarUrl: githubUser.avatar_url,
            password: null, // OAuth users don't have passwords
          },
        });
      }
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          avatarUrl: githubUser.avatar_url, // Update avatar in case it changed
        },
      });
    }

    generateTokenAndSetCookie(res, user.id);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?success=true`);
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message)}`);
  }
};

export const signup = async (req, res) => {
  try {

    // Validation
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.errors?.[0]?.message || "Invalid input"
      });
    }

    const { name, email, password } = validationResult.data;

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

    generateTokenAndSetCookie(res, createUser.id);

    res.status(201).json({
      success: true,
      message: "user Created Successfully",
      user: { ...createUser, password: undefined },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    // Validation
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.errors?.[0]?.message || "Invalid input"
      });
    }

    const { email, password } = validationResult.data;

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
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
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

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email: key },
      data: {
        resetToken: hashedResetToken,
        resetTokenExpiry,
      },
    });

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
        previewUrl:
          process.env.NODE_ENV === "development"
            ? emailResult.previewUrl
            : undefined,
      });
    } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);

      res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
        resetToken:
          process.env.NODE_ENV === "development" ? resetToken : undefined,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // Validate new password strength (same rules as signup)
    const passwordValidation = signupSchema.shape.password.safeParse(newPassword);
    if (!passwordValidation.success) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.error.errors?.[0]?.message || "Password does not meet requirements",
      });
    }

    // Hash the incoming token to compare against stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

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

    if (name) {
      updateData.name =
        name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    }

    if (email) {
      const key = String(email).toLowerCase().trim();

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

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change password",
        });
      }

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

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

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

export const getUsage = async (req, res) => {
  try {
    const userId = req.userID;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        creditLimit: true,
        creditsUsed: true,
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
        current: user.creditsUsed,
        limit: user.creditLimit,
        remaining: Math.max(0, user.creditLimit - user.creditsUsed),
        resetDate: user.usageResetDate,
        daysUntilReset: Math.max(0, daysUntilReset),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userID;
    const { password } = req.body;

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

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid password. Account deletion requires password confirmation.",
      });
    }

    if (user.podcasts && user.podcasts.length > 0) {
      const deletePromises = user.podcasts
        .filter((podcast) => podcast.audioUrl)
        .map((podcast) => deleteAudioFile(podcast.id));

      await Promise.allSettled(deletePromises);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get credit pricing for all features
export const getCreditPricing = (req, res) => {
  res.status(200).json({
    success: true,
    pricing: {
      podcast: CREDIT_COSTS.PODCAST_GENERATION,
      youtubeSummary: CREDIT_COSTS.YOUTUBE_SUMMARY,
      webSummary: CREDIT_COSTS.WEB_SUMMARY,
      pdfSummary: CREDIT_COSTS.PDF_SUMMARY,
      textSummary: CREDIT_COSTS.TEXT_SUMMARY,
      audioGeneration: CREDIT_COSTS.AUDIO_GENERATION,
      chatMessage: CREDIT_COSTS.CHAT_MESSAGE,
      deepExplain: CREDIT_COSTS.DEEP_EXPLAIN,
      deepExplainFollowup: CREDIT_COSTS.DEEP_EXPLAIN_FOLLOWUP,
      quizGenerate: CREDIT_COSTS.QUIZ_GENERATE,
      quizFromSummary: CREDIT_COSTS.QUIZ_FROM_SUMMARY,
      notesGenerate: CREDIT_COSTS.NOTES_GENERATE,
      notesFromSummary: CREDIT_COSTS.NOTES_FROM_SUMMARY,
      visualizerMermaid: CREDIT_COSTS.VISUALIZER_MERMAID,
      visualizerImage: CREDIT_COSTS.VISUALIZER_IMAGE,
    },
  });
};

// Get user preferences
export const getPreferences = async (req, res) => {
  const userId = req.userID;

  try {
    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return defaults without creating a record yet
      preferences = {
        readingLevel: 'intermediate',
        tone: 'conversational',
        defaultDepth: 'standard',
        defaultLanguage: 'en',
      };
    }

    res.status(200).json({ success: true, preferences });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update user preferences (upsert)
export const updatePreferences = async (req, res) => {
  const userId = req.userID;
  const { readingLevel, tone, defaultDepth, defaultLanguage } = req.body;

  try {
    // Validate enum values
    const validReadingLevels = ['beginner', 'intermediate', 'expert'];
    const validTones = ['casual', 'conversational', 'professional', 'academic'];
    const validDepths = ['quick', 'standard', 'detailed'];

    if (readingLevel && !validReadingLevels.includes(readingLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reading level. Must be one of: ${validReadingLevels.join(', ')}`,
      });
    }

    if (tone && !validTones.includes(tone)) {
      return res.status(400).json({
        success: false,
        message: `Invalid tone. Must be one of: ${validTones.join(', ')}`,
      });
    }

    if (defaultDepth && !validDepths.includes(defaultDepth)) {
      return res.status(400).json({
        success: false,
        message: `Invalid depth. Must be one of: ${validDepths.join(', ')}`,
      });
    }

    // Build update data (only include fields that were provided)
    const updateData = {};
    if (readingLevel) updateData.readingLevel = readingLevel;
    if (tone) updateData.tone = tone;
    if (defaultDepth) updateData.defaultDepth = defaultDepth;
    if (defaultLanguage) updateData.defaultLanguage = defaultLanguage;

    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        readingLevel: readingLevel || 'intermediate',
        tone: tone || 'conversational',
        defaultDepth: defaultDepth || 'standard',
        defaultLanguage: defaultLanguage || 'en',
      },
    });

    res.status(200).json({ success: true, preferences });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

