const mongoose = require("mongoose"); // Importing Mongoose

// Define the User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  image: {
    type: String,
    required: false,
    default:
      "https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png",
  },
  posts: [
    {
      id: { type: String, default: "Mostafawasee" },
      post: String,
      title: String,
      image: String,
      comments: [
        {
          _id: false,
          id: mongoose.Schema.Types.ObjectId,
          comment: String,
        },
      ],
      likes: [Number],
    },
  ],
  friends: [
    {
      _id: false,
      id: mongoose.Schema.Types.ObjectId, // Storing the friend's ID
      name: String,
      email: String,
      image: String,
    },
  ],
});

// Create the User Model
const User = mongoose.model("User", userSchema);

module.exports = User;
