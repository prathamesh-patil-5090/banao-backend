import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      type: String,
      default: "",
    },
    friends: {
      type: Array,
      default: [],
    },
    location: String,
    occupation: String,
    viewedProfile: Number,
    impressions: Number,
    username: {
      type: String,
      required: false, // Change to false if username is not mandatory
      unique: true,
      min: 2,
      max: 50,
    },
  },
  { timestamps: true }
);

// Add pre-save middleware to ensure friends is always an array
UserSchema.pre('save', function(next) {
  if (this.friends === null || typeof this.friends === 'string') {
    this.friends = [];
  }
  if (!Array.isArray(this.friends)) {
    this.friends = Array.isArray(this.friends) ? this.friends : [];
  }
  next();
});

const User = mongoose.model("User", UserSchema);
export default User;
