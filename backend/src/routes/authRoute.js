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
  githubCallback,
  getCreditPricing,
  getPreferences,
  updatePreferences,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/github/callback", githubCallback);

//TODO: verify email and password routes

router.get("/profile", verifyToken, profile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.put("/update-profile", verifyToken, updateProfile);

router.get("/usage", verifyToken, getUsage);
router.get("/pricing", getCreditPricing);

router.delete("/delete-account", verifyToken, deleteAccount);

router.get("/preferences", verifyToken, getPreferences);
router.put("/preferences", verifyToken, updatePreferences);

export default router;
