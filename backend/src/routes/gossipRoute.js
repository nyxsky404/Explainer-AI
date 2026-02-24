import express from "express";
import {
  gossipGenerate,
  getGossipById,
  getGossipProgress,
  retryGossip,
  getAllGossips,
  deleteGossip,
} from "../controllers/gossipController.js";

const router = express.Router();

// Generate a new gossip
router.post("/generate", gossipGenerate);

// Get all gossips for the authenticated user
router.get("/all", getAllGossips);

// Get gossip by ID
router.get("/get/:id", getGossipById);

// Get gossip progress for polling
router.get("/progress/:id", getGossipProgress);

// Retry a failed gossip
router.post("/retry/:id", retryGossip);

// Delete a gossip
router.delete("/delete/:id", deleteGossip);

export default router;