const mongoose = require("mongoose"); // : Importing Mongoose (before)

// Define the User Schema: (before)
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
  posts: [Object],
  frinds: [Object],
});

// Create the User Model: (before)
const User = mongoose.model("User", userSchema);

module.exports = User;
