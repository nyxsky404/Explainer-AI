import express from "express"
import { podcastGenerate, getPodcastById, getAllPodcasts, deletePodcast, getPodcastProgress, retryPodcast } from "../controllers/podcastController.js"

const Router = express.Router()

Router.post("/generate", podcastGenerate )
Router.get("/get/:id", getPodcastById)
Router.get("/progress/:id", getPodcastProgress)
Router.post("/retry/:id", retryPodcast)
Router.get("/get", getAllPodcasts)
Router.delete("/delete/:id", deletePodcast)

export default Router