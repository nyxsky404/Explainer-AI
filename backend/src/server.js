import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv";
dotenv.config();

import initialRoute from "./routes/initialRoute.js"
import podcastRoute from "./routes/podcastRoute.js"
import gossipRoute from "./routes/gossipRoute.js"
import authRoute from "./routes/authRoute.js"
import summarizerRoute from "./routes/summarizerRoute.js"
import chatRoute from "./routes/chatRoute.js"
import deepExplainRoute from "./routes/deepExplainRoute.js"
import quizRoute from "./routes/quizRoute.js"
import notesRoute from "./routes/notesRoute.js"
import visualizerRoute from "./routes/visualizerRoute.js"
import { verifyToken } from "./middleware/verifyToken.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { getSummaryPublic } from "./controllers/summarizerController.js";
import { getPodcastPublic } from "./controllers/podcastController.js";
import { getGossipPublic } from "./controllers/gossipController.js";
import { getNotePublic } from "./controllers/notesController.js";
import { githubCallback } from "./controllers/authController.js";
import "./queue/worker.js";
import "./queue/gossipWorker.js";

const app = express()

// Trust Render/reverse-proxy forwarded headers (needed for rate limiting and secure cookies)
app.set('trust proxy', 1)

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow Supabase storage assets
}));

// HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json())
app.use(cookieParser());

// Public share routes (no auth required)
app.get("/api/summary/share/:id", getSummaryPublic);
app.get("/api/podcast/share/:id", getPodcastPublic);
app.get("/api/gossip/share/:id", getGossipPublic);
app.get("/api/notes/share/:id", getNotePublic);

// GitHub OAuth callback — uses apiLimiter (not authLimiter) since it's
// an automated redirect from GitHub, not a brute-force target
app.get("/api/auth/github/callback", apiLimiter, githubCallback);

// Auth routes — sensitive endpoints have per-route strict limits inside authRoute.js
app.use("/api/auth", apiLimiter, authRoute)

// Protected API routes
app.use("/", initialRoute)
app.use("/api/podcast", apiLimiter, verifyToken, podcastRoute)
app.use("/api/gossip", apiLimiter, verifyToken, gossipRoute)
app.use("/api/summarize", apiLimiter, verifyToken, summarizerRoute)
app.use("/api/chat", apiLimiter, verifyToken, chatRoute)
app.use("/api/deep-explain", apiLimiter, verifyToken, deepExplainRoute)
app.use("/api/quiz", apiLimiter, verifyToken, quizRoute)
app.use("/api/notes", apiLimiter, verifyToken, notesRoute)
app.use("/api/visualizer", apiLimiter, verifyToken, visualizerRoute)

app.use(errorHandler)

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`)
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    
    // Close HTTP server first
    server.close(() => {
        console.log('HTTP server closed');
    });
    
    // Force exit after 3 seconds if graceful shutdown fails
    setTimeout(() => {
        console.log('Forcing exit');
        process.exit(0);
    }, 3000);
};

process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGINT', () => gracefulShutdown('SIGINT'));