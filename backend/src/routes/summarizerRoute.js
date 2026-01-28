import { Router } from "express";
import {
  summarizeYouTubeController,
  summarizeWebController,
  getSummaries,
  getSummary,
  getRecentActivity,
  generateSummaryAudio,
  deleteSummary,
  getSummaryPublic,
} from "../controllers/summarizerController.js";

const router = Router();

// Summary generation
router.post("/youtube", summarizeYouTubeController);
router.post("/web", summarizeWebController);

// Summary retrieval
router.get("/list", getSummaries);
router.get("/activity", getRecentActivity);
router.get("/:id", getSummary);

// Audio generation
router.post("/:id/audio", generateSummaryAudio);

// Delete summary
router.delete("/:id", deleteSummary);

export default router;
