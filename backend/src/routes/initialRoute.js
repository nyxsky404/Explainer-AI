import express from "express"
import {welcome} from "../controllers/initialController.js"

const Router = express.Router()

Router.get("/", welcome )

export default Router