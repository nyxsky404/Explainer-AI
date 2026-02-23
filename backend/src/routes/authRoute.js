import express from "express";
import {
  login,
  logout,
  signup,
  profile,
  forgotPassword,
  resetPassword,
  updateProfile,
  getUsage,
  deleteAccount,
  getCreditPricing,
  getPreferences,
  updatePreferences,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Strict rate limit only for credential endpoints (brute-force prevention)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

router.post("/logout", logout);

router.get("/profile", verifyToken, profile);
router.put("/update-profile", verifyToken, updateProfile);
router.get("/usage", verifyToken, getUsage);
router.get("/pricing", getCreditPricing);
router.delete("/delete-account", verifyToken, deleteAccount);
router.get("/preferences", verifyToken, getPreferences);
router.put("/preferences", verifyToken, updatePreferences);

export default router;
