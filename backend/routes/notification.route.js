import express from "express";

import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  getNotifications,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getNotifications); //get all notifications
router.delete("/", protectedRoute, deleteAllNotifications); //delete all notifications

export default router;
