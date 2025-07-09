import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnLikePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectedRoute, getAllPosts); //get all posts
router.get("/following", protectedRoute, getFollowingPosts); //get all posts of the users the current user is following
router.get("/user/:username", protectedRoute, getUserPosts); //get all posts of the logged in user
router.get("/likes/:id", protectedRoute, getLikedPosts); //get liked posts
router.post("/create", protectedRoute, createPost); //create post
router.post("/like/:id", protectedRoute, likeUnLikePost); //like or unlike post
router.post("/comment/:id", protectedRoute, commentOnPost); //comment on post
router.delete("/:id", protectedRoute, deletePost); //delete post

export default router;
