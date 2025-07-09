import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateUserProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile); //get user profile
router.get("/suggested", protectedRoute, getSuggestedUsers); //get suggested to follow for users
router.post("/follow/:id", protectedRoute, followUnfollowUser); //follow or unfollow user
router.post("/update", protectedRoute, updateUserProfile); //update user profile

export default router;
