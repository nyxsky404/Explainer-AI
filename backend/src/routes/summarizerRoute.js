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
import { summarizePdfController, uploadPdfMiddleware } from "../controllers/pdfController.js";
import { summarizeTextController } from "../controllers/textController.js";
import { summarizeBatchController } from "../controllers/batchController.js";

const router = Router();

// Summary generation
router.post("/youtube", summarizeYouTubeController);
router.post("/web", summarizeWebController);
router.post("/pdf", uploadPdfMiddleware, summarizePdfController);
router.post("/text", summarizeTextController);
router.post("/batch", summarizeBatchController);

// Summary retrieval
router.get("/list", getSummaries);
router.get("/activity", getRecentActivity);
router.get("/:id", getSummary);

// Audio generation
router.post("/:id/audio", generateSummaryAudio);

// Delete summary
router.delete("/:id", deleteSummary);

export default router;
