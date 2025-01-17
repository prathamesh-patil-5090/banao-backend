import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;
    
    if (!comment || !userId) {
      return res.status(400).json({ message: "Comment and userId are required" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newComment = {
      userId,
      comment,
      firstName: user.firstName,
      lastName: user.lastName,
      userPicturePath: user.picturePath,
      createdAt: new Date().toISOString()
    };

    post.comments.unshift(newComment); // Add new comment at the beginning
    await post.save();
    console.log("Newly added comment ID:", post.comments[0]._id.toString());

    res.status(200).json(post); // Ensure this includes the updated comments with correct _id
  } catch (err) {
    console.error("Error in addComment:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to update post with ID: ${id}`); // Added log
    const { description } = req.body;
    const userId = req.user.id; // Get from verifyToken middleware
    
    const post = await Post.findById(id);
    if (!post) {
      console.error(`Post with ID ${id} not found`); // Added log
      return res.status(404).json({ message: "Post not found" });
    }
    
    if (post.userId !== userId) {
      console.error(`User ${userId} unauthorized to update post ${id}`); // Added log
      return res.status(403).json({ message: "Unauthorized to update this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { description },
      { new: true }
    );

    console.log(`Post with ID ${id} updated successfully`); // Added log
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Get from verifyToken middleware
    
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    if (post.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    
    // Return all posts after deletion
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { comment } = req.body;

    console.log(`Received updateComment request with Post ID: ${id}, Comment ID: ${commentId}`);

    const post = await Post.findById(id);
    if (!post) {
      console.error(`Post with ID ${id} not found.`);
      return res.status(404).json({ message: "Post not found" });
    }

    const existingCommentIds = post.comments.map((c) => c._id.toString());
    console.log("Existing comment IDs in this post:", existingCommentIds);

    const commentToUpdate = post.comments.id(commentId);
    if (!commentToUpdate) {
      console.error(`Comment with ID ${commentId} not found in post ${id}.`);
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentToUpdate.userId !== req.user.id) {
      console.error(`User ${req.user.id} unauthorized to update comment ${commentId}.`);
      return res.status(403).json({ message: "Unauthorized to update this comment" });
    }

    console.log(`Updating comment ${commentId} in post ${id}.`);
    commentToUpdate.comment = comment;
    await post.save();

    console.log(`Comment ${commentId} updated successfully.`);
    res.status(200).json(post);
  } catch (err) {
    console.error("Error updating comment:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIndex === -1) return res.status(404).json({ message: "Comment not found" });
    
    if (post.comments[commentIndex].userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();
    
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
