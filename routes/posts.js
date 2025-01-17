import express from "express";
import { getFeedPosts, getUserPosts, likePost, addComment, updateComment, deleteComment, updatePost, deletePost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
router.patch("/:id/comment", verifyToken, addComment);
router.patch("/:id/comments/:commentId", verifyToken, updateComment); // Ensure this route exists
router.delete("/:id/comments/:commentId", verifyToken, deleteComment); // Ensure this route exists
router.patch("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

export default router;
