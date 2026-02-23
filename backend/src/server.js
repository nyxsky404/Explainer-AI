import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv";
dotenv.config();

const app = express()

import initialRoute from "./routes/initialRoute.js"
import podcastRoute from "./routes/podcastRoute.js"
import authRoute from "./routes/authRoute.js"
import summarizerRoute from "./routes/summarizerRoute.js"
import chatRoute from "./routes/chatRoute.js"
import deepExplainRoute from "./routes/deepExplainRoute.js"
import quizRoute from "./routes/quizRoute.js"
import notesRoute from "./routes/notesRoute.js"
import visualizerRoute from "./routes/visualizerRoute.js"
import { verifyToken } from "../src/middleware/verifyToken.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import "./queue/worker.js";


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

// Public routes (no auth required)
import { getSummaryPublic } from "./controllers/summarizerController.js";
import { getPodcastPublic } from "./controllers/podcastController.js";
app.get("/api/summary/share/:id", getSummaryPublic);
app.get("/api/podcast/share/:id", getPodcastPublic);

// Protected routes
app.use("/", initialRoute)
app.use("/api/auth", authLimiter, authRoute)
app.use("/api/podcast", apiLimiter, verifyToken, podcastRoute)
app.use("/api/summarize", apiLimiter, verifyToken, summarizerRoute)
app.use("/api/chat", apiLimiter, verifyToken, chatRoute)
app.use("/api/deep-explain", apiLimiter, verifyToken, deepExplainRoute)
app.use("/api/quiz", apiLimiter, verifyToken, quizRoute)
app.use("/api/notes", apiLimiter, verifyToken, notesRoute)
app.use("/api/visualizer", apiLimiter, verifyToken, visualizerRoute)

app.use(errorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`)
})