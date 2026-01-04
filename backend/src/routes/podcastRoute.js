import express from "express"
import { podcastGenerate } from "../controllers/podcastController.js"

const Router = express.Router()

Router.post("/podcast", podcastGenerate )

export default Router