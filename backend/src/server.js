import express from "express"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
dotenv.config();

const app = express()

import initialRoute from "./routes/initialRoute.js"
import podcastRoute from "./routes/podcastRoute.js"
import authRoute from "./routes/authRoute.js"
import { verifyToken } from "../src/middleware/verifyToken.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

app.use(express.json())
app.use(cookieParser());

app.use("/", initialRoute)
app.use("/api/podcast", verifyToken, podcastRoute )
app.use("/api/auth" , authRoute)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`app listening on port ${PORT}`)
})