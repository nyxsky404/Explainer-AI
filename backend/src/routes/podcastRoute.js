import express from "express"
import { podcastGenerate } from "../controllers/podcastController.js"
import { verifyToken } from "../middleware/verifyToken.js";

const Router = express.Router()

Router.post("/podcast", verifyToken, podcastGenerate )

export default Router