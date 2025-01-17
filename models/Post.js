import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: String,
  comment: String,
  firstName: String,
  lastName: String,
  userPicturePath: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true }); // Ensure _id is enabled

const postSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    location: String,
    description: String,
    picturePath: String,
    userPicturePath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
