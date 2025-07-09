import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/me", protectedRoute, getMe); //to check who is logged in
router.post("/signup", signup); //signup
router.post("/login", login); //login
router.post("/logout", logout); //logout

export default router;
