import express from "express";
import rateLimit from "express-rate-limit";
import {
  gossipGenerate,
  getGossipById,
  getGossipProgress,
  retryGossip,
  getAllGossips,
  deleteGossip,
} from "../controllers/gossipController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Rate limiter for expensive generation endpoints
// Uses default IP-based key generator which handles IPv6 properly
const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many generation requests. Please wait a moment before trying again.',
    });
  },
});

// Apply authentication middleware to all routes
router.use(verifyToken);

// Generate a new gossip (rate limited)
router.post("/generate", generateLimiter, gossipGenerate);

// Get all gossips for the authenticated user
router.get("/list", getAllGossips);

// Get gossip by ID
router.get("/get/:id", getGossipById);

// Get gossip progress for polling
router.get("/progress/:id", getGossipProgress);

// Retry a failed gossip (rate limited)
router.post("/retry/:id", generateLimiter, retryGossip);

// Delete a gossip
router.delete("/delete/:id", deleteGossip);

export default router;