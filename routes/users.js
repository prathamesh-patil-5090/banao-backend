import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  fixUserFriends,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

// Add this route to fix existing records
router.post("/fix-friends", verifyToken, fixUserFriends);

export default router;
