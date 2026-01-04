import express from "express"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
dotenv.config();

const app = express()

import initialRoute from "./routes/initialRoute.js"
import podcastRoute from "./routes/podcastRoute.js"
import authRoute from "./routes/authRoute.js"

app.use(express.json())
app.use(cookieParser()); // parse incoming cookies
app.use("/", initialRoute)
app.use("/api",podcastRoute )
app.use("/api/auth" , authRoute)



const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`app listening on port ${PORT}`)
})