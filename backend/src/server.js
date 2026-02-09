import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();

const app = express()

import initialRoute from "./routes/initialRoute.js"
import podcastRoute from "./routes/podcastRoute.js"
import authRoute from "./routes/authRoute.js"
import summarizerRoute from "./routes/summarizerRoute.js"
import chatRoute from "./routes/chatRoute.js"
import { verifyToken } from "../src/middleware/verifyToken.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import "./queue/worker.js";


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
app.use("/api/podcast", verifyToken, podcastRoute)
app.use("/api/summarize", verifyToken, summarizerRoute)
app.use("/api/chat", verifyToken, chatRoute)
app.use("/api/auth", authRoute)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`)
})