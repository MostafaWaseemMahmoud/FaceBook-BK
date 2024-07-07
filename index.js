const express = require("express"); //? Importing Express to create the server and handle routing
const cors = require("cors"); //? Importing CORS to handle cross-origin requests
const mongoose = require("mongoose"); //? Importing Mongoose to connect to MongoDB and define schemas
const multer = require("multer"); //? Importing Multer to handle file uploads
const path = require("path"); //? Importing Path to work with file and directory paths
const User = require("./models/user.model"); //? Importing the User model for database operations

const port = process.env.PORT || 5500; //? Initialize the port for the application
const app = express(); //? Initialize the Express application

app.use(cors()); //? Using CORS to allow cross-origin requests
app.use(express.json()); //? Middleware to parse JSON request bodies

const AUTH = "Mostafa_waseem_web_application"; //? Authorization variable for security

function checkAuth(auth) {
  //? Function to check the authorization header value
  return auth === AUTH; //? Return true if the provided auth matches the expected value
}

app.get("/", (req, res) => {
  //? GET route for the root URL
  if (checkAuth(req.body["auth"])) {
    //? Check if the provided auth matches the expected value
    res.status(200).send("Authenticated"); //? Respond with success message
  } else {
    res.status(401).send("Unauthorized"); //? Respond with unauthorized status
  }
});

app.use("/images", express.static(path.join(__dirname, "./images"))); //? Serve images statically from the 'images' directory

let originalNameValue = "";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //? Set the destination directory for uploaded files
    cb(null, path.join(__dirname, "./images")); //? Specify the path for storing uploaded files
  },
  filename: function (req, file, cb) {
    //? Set the filename for uploaded files
    cb(null, file.originalname); //? Keep the original file name
    originalNameValue = file.originalname; //? Save the original file name
  },
});

const upload = multer({ storage }); //? Initialize Multer with the defined storage configuration

app.post("/adduser", upload.single("image"), (req, res) => {
  const imageUrl = `http://localhost:5500/images/${originalNameValue}`; //? Construct the URL for the uploaded image

  const { name, email, password } = req.body; //? Extract name, email, and password from the request body

  if (!name || !email || !password) {
    return res.status(400).send("Name, email, and password are required"); //? Check for missing fields and respond with an error
  }

  const newUser = new User({
    name,
    email,
    password,
    image: imageUrl,
  });

  //? Save the new user to the database
  newUser
    .save()
    .then(() => {
      res.status(201).send(newUser); //? Respond with the created user on success
    })
    .catch((err) => {
      res.status(400).send("Error creating user: " + err); //? Respond with an error message on failure
    });
});

app.get("/getuser/:id", async (req, res) => {
  //? GET route to retrieve a user by ID
  if (!checkAuth(req.headers["auth"])) {
    res.status(401).json({ message: "Unauthorized" }); //? Check authorization header and respond with an error if unauthorized
    return;
  }

  const { id } = req.params; //? Extract the user ID from the route parameters

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid User ID format"); //? Check if the ID format is valid
  }

  try {
    const user = await User.findById(id); //? Find the user by ID

    if (user) {
      res.status(200).json(user); //? Respond with the user data if found
    } else {
      res.status(404).send("No User Found"); //? Respond with an error if the user is not found
    }
  } catch (error) {
    res.status(500).send("Error retrieving user: " + error.message); //? Respond with an error message on failure
  }
});

app.get("/allusers", async (req, res) => {
  //? GET route to retrieve all users
  try {
    const allUsers = await User.find({}); //? Find all users in the database

    if (allUsers.length > 0) {
      res.status(200).json(allUsers); //? Respond with all users if found
    } else {
      res.status(404).send("No Users Found"); //? Respond with an error if no users are found
    }
  } catch (error) {
    res.status(500).send("Error retrieving users: " + error.message); //? Respond with an error message on failure
  }
});

app.post("/addpost/:userId", upload.single("image"), async (req, res) => {
  const imageUrl = `http://localhost:5500/images/${originalNameValue}`; //? Construct the URL for the uploaded image
  //? POST route to add a new post for a specific user
  if (!checkAuth(req.headers["auth"])) {
    res.status(401).send("Unauthorized"); //? Check authorization header and respond with an error if unauthorized
    return;
  }

  const { title, post } = req.body; //? Extract title and post content from the request body
  const { userId } = req.params; //? Extract the user ID from the route parameters

  if (!title || !post) {
    return res.status(400).send("Title and post are required"); //? Check for missing fields and respond with an error
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send("Invalid User ID format"); //? Check if the user ID format is valid
  }

  try {
    const user = await User.findById(userId); //? Find the user by ID

    if (!user) {
      return res.status(404).send("No User Found"); //? Respond with an error if the user is not found
    }

    const newPost = { imageUrl, title, post }; //? Create a new post object

    user.posts.push(newPost); //? Add the new post to the user's posts
    await user.save(); //? Save the updated user to the database

    res.status(201).send(newPost); //? Respond with the created post
  } catch (error) {
    res.status(500).send("Error creating post: " + error.message); //? Respond with an error message on failure
  }
});

app.post("/addFriend", async (req, res) => {
  const { friendId, userId } = req.body; //? Extract friendId and userId from the request body

  //? Check if the IDs are valid ObjectId
  if (
    !mongoose.Types.ObjectId.isValid(friendId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).send("Invalid User ID format"); //? Respond with an error if either ID is invalid
  }

  try {
    const friend = await User.findById(friendId); //? Find the friend by ID
    const user = await User.findById(userId); //? Find the user by ID

    if (!friend || !user) {
      return res.status(404).send("User or Friend not found"); //? Respond with an error if either user or friend is not found
    }

    //? Add the friend to the user's friends list and vice versa
    if (!user.friends.includes(friend._id)) {
      user.friends.push(friend._id);
    }
    if (!friend.friends.includes(user._id)) {
      friend.friends.push(user._id);
    }

    await user.save(); //? Save the updated user to the database
    await friend.save(); //? Save the updated friend to the database

    res.status(200).json({ message: "Friend added successfully" }); //? Respond with a success message
  } catch (error) {
    res.status(500).send("Error adding friend: " + error.message); //? Respond with an error message on failure
  }
});

mongoose
  .connect(
    "mongodb+srv://mostafawaseem88:qqQuPGD1tEeqjmKF@cluster0.dmpbupd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("<++ Database Connected ++>!"); //? Log message on successful connection
    app.listen(port, () => {
      console.log(`===> Application running successfully at port ${port} <===`); //? Log message on successful server start
    });
  })
  .catch((err) => {
    console.error("Database can't connect: ", err); //? Log message on connection error
  });
