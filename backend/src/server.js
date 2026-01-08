import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();

const app = express()

import initialRoute from "./routes/initialRoute.js"
import podcastRoute from "./routes/podcastRoute.js"
import authRoute from "./routes/authRoute.js"
import { verifyToken } from "../src/middleware/verifyToken.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true
}));

app.use(express.json())
app.use(cookieParser());

app.use("/", initialRoute)
app.use("/api/podcast", verifyToken, podcastRoute)
app.use("/api/auth", authRoute)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`)
})