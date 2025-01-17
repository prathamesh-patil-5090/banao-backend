import User from "../models/User.js";
import mongoose from "mongoose";
import { users, posts } from "../data/index.js";
import Post from "../models/Post.js";
/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure friends is an array
    if (!Array.isArray(user.friends)) {
      user.friends = [];
      await user.save();
    }

    const friends = await User.find({
      '_id': { $in: user.friends }
    }).select('firstName lastName occupation location picturePath');

    res.status(200).json(friends);
  } catch (err) {
    console.error("Error getting friends:", err);
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    if (id === friendId) {
      return res.status(400).json({ message: "Cannot add yourself as friend" });
    }

    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    // Initialize arrays if needed
    if (!Array.isArray(user.friends)) user.friends = [];
    if (!Array.isArray(friend.friends)) friend.friends = [];

    const userFriends = user.friends.map(fid => fid.toString());
    
    if (userFriends.includes(friendId)) {
      user.friends = user.friends.filter(fid => fid.toString() !== friendId);
      friend.friends = friend.friends.filter(fid => fid.toString() !== id);
    } else {
      user.friends.push(mongoose.Types.ObjectId(friendId));
      friend.friends.push(mongoose.Types.ObjectId(id));
    }

    await Promise.all([
      user.save(),
      friend.save()
    ]);

    const updatedFriends = await User.find({
      '_id': { $in: user.friends }
    }).select('firstName lastName occupation location picturePath');

    res.status(200).json(updatedFriends);
  } catch (err) {
    console.error("Error updating friend status:", err);
    res.status(500).json({ message: err.message });
  }
};

export const popUser = async (req, res) => {
  try {
    users.forEach(async (user) => {
      const newUser = new User(user);
      await newUser.save();
    });

    res.status(200).json({ message: "Users added" });
  }
  catch (err) {
    res.status(404).json({ message: err.message });
  }
}

export const popPosts = async (req, res) => {
  try {
    posts.forEach(async (post) => {
      const newPost = new Post(post);
      await newPost.save();
    });

    res.status(200).json({ message: "Posts added" });
  }
  catch (err) {
    res.status(404).json({ message: err.message });
  }
}

export const fixUserFriends = async (req, res) => {
  try {
    const users = await User.find({});
    
    const updates = users.map(async (user) => {
      if (!Array.isArray(user.friends)) {
        user.friends = [];
        return user.save();
      }
      return Promise.resolve();
    });

    await Promise.all(updates);
    res.status(200).json({ message: "Fixed friends arrays for all users" });
  } catch (err) {
    console.error("Error fixing friend arrays:", err);
    res.status(500).json({ message: err.message });
  }
};
