import express from "express"
import dotenv from "dotenv";
dotenv.config();

const app = express()

import initialRoute from "./routes/initialRoute.js"
import podcastRoute from "./routes/podcastRoute.js"


app.use(express.json())
app.use("/", initialRoute)
app.use("/api",podcastRoute )



const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`app listening on port ${PORT}`)
})