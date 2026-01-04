import express from "express"
import { podcastGenerate } from "../controllers/podcastController.js"
import { checkPodcast } from "../controllers/podcastController.js";
import { getPodcast } from "../controllers/podcastController.js";


const Router = express.Router()

Router.post("/generate", podcastGenerate )
Router.get("/check", checkPodcast)
Router.get("/get", getPodcast)

export default Router