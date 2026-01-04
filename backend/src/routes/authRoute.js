import express from "express"
import { login, logout, signup, checkAuth } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

// check if user authenticated or not?
router.get("/check-auth", verifyToken, checkAuth)

export default router;