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
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

//TODO: verify email and password routes

// check if user authenticated or not?
router.get("/profile", verifyToken, profile);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Update user profile (requires authentication)
router.put("/update-profile", verifyToken, updateProfile);

// Usage information (requires authentication)
router.get("/usage", verifyToken, getUsage);

// Delete account (requires authentication and password confirmation)
router.delete("/delete-account", verifyToken, deleteAccount);

export default router;
