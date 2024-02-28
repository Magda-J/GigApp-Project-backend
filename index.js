const express = require("express");
const mongoose = require("mongoose");

const { Event } = require("./models/event");
const { User } = require("./models/user");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcrypt");

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err.message);
  });

// defining the Express app
const app = express();

app.use(cors());
app.use(express.json());

//CheckUser
app.get("/username/:usernameValue", async (req, res) => {
  const value = req.params.usernameValue;

  const user = await User.findOne({ username: value });

  console.log(user);

  if (user) {
    res.send(true);
    // return true
  } else {
    res.send(false);
    // return false
  }
});

// create user
app.post("/signup", async (req, res) => {
  const newUser = req.body;

  try {
    // Hash the user's password before saving it
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword;

    const user = new User(newUser);
    console.log("Created a user");
    await user.save();
    res.send({ message: "New User Created." });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ message: "Error creating user." });
  }
});

// auth with bcrypt
// Authorization generation endpoint
app.post("/auth", async (req, res) => {
  console.log("arrived");
  console.log(req.body);
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.sendStatus(403); // User not found
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log("wrong password");
      return res.sendStatus(403);
    }

    // Generate token
    user.token = uuidv4();
    await user.save();
    res.send({ token: user.token });
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send({ message: "Error authenticating user." });
  }
});

// get all posts in database for the homepage without authentication

app.get("/events", async (req, res) => {
  try {
    // Find all events
    const allEvents = await Event.find();

    res.send(allEvents);
  } catch (error) {
    console.error("Error fetching all events:", error);
    res.status(500).send({ message: "Error fetching all events." });
  }
});

// Authorization middleware
app.use(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const user = await User.findOne({ token: authHeader });
  if (user) {
    next();
  } else {
    return res.sendStatus(403);
  }
});

// CRUD operations
// get all posts controller

app.get("/", async (req, res) => {
  try {
    // Retrieve the user's token from the authorization header
    const authHeader = req.headers["authorization"];

    // Find the user based on the token
    const user = await User.findOne({ token: authHeader });

    // Check if the user exists
    if (!user) {
      return res.sendStatus(403); // Forbidden if user not found
    }

    // Find events created by the user
    const userEvents = await Event.find({ createdBy: user._id });

    res.send(userEvents);
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).send({ message: "Error fetching user events." });
  }
});

// add post controller

app.post("/", async (req, res) => {
  const newEvent = req.body;

  // Retrieve the user's token from the authorization header
  const authHeader = req.headers["authorization"];

  try {
    // Find the user based on the token
    const user = await User.findOne({ token: authHeader });

    // Check if the user exists
    if (!user) {
      return res.sendStatus(403); // Forbidden if user not found
    }

   
    // Create a new event document and associate it with the user
    const event = new Event({
      ...newEvent,
      createdBy: user._id, // Assign the user's ID to the createdBy field
    });

    // Save the event
    await event.save();

    res.send({ message: "New event inserted." });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).send({ message: "Error creating event.", error });
  }
});

// Update event
app.put("/:id", async (req, res) => {
  try {
    // Retrieve the user's token from the authorization header
    const authHeader = req.headers["authorization"];

    // Find the user based on the token
    const user = await User.findOne({ token: authHeader });

    // Check if the user exists
    if (!user) {
      return res.sendStatus(403); // Forbidden if user not found
    }

    // Find the event by ID
    const event = await Event.findById(req.params.id);

    // Check if the event exists
    if (!event) {
      return res.status(404).send({ message: "Event not found." });
    }

    // Check if the user is the creator of the event
    if (event.createdBy.toString() !== user._id.toString()) {
      return res
        .status(403)
        .send({ message: "Unauthorized to update this event." });
    }

    // Update the event
    await Event.findByIdAndUpdate(req.params.id, req.body);
    res.send({ message: "Event updated." });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).send({ message: "Error updating event." });
  }
});

// Delete event
app.delete("/:id", async (req, res) => {
  try {
    // Retrieve the user's token from the authorization header
    const authHeader = req.headers["authorization"];

    // Find the user based on the token
    const user = await User.findOne({ token: authHeader });

    // Check if the user exists
    if (!user) {
      return res.sendStatus(403); // Forbidden if user not found
    }

    // Find the event by ID
    const event = await Event.findById(req.params.id);

    // Check if the event exists
    if (!event) {
      return res.status(404).send({ message: "Event not found." });
    }

    // Check if the user is the creator of the event
    if (event.createdBy.toString() !== user._id.toString()) {
      return res
        .status(403)
        .send({ message: "Unauthorized to delete this event." });
    }

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);
    res.send({ message: "Event deleted." });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).send({ message: "Error deleting event." });
  }
});

// new controllers \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// Add interested event
app.post("/addInterestedEvent", async (req, res) => {
  try {
    // Retrieve the user's token from the authorization header
    const authHeader = req.headers["authorization"];

    // Find the user based on the token
    const user = await User.findOne({ token: authHeader });

    // Check if the user exists
    if (!user) {
      return res.sendStatus(403); // Forbidden if user not found
    }

    // Get the event ID from the request body
    const eventId = req.body.eventId;

    // Check if the event ID is provided
    if (!eventId) {
      return res.status(400).send({ message: "Event ID is required." });
    }

    // Check if the event with the provided ID exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send({ message: "Event not found." });
    }

    // Check if the user has already bookmarked the event
    if (user.interested.includes(eventId)) {
      return res.status(400).send({ message: "Event already bookmarked." });
    }

    // Add the event ID to the user's interested array
    user.interested.push(eventId);
    await user.save();

    res.send({ message: "Event bookmarked successfully." });
  } catch (error) {
    console.error("Error bookmarking event:", error);
    res.status(500).send({ message: "Error bookmarking event." });
  }
});

// Get interested events controller
app.get("/interestedEvents", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const user = await User.findOne({ token: authHeader });
    if (!user) {
      return res.sendStatus(403); // Forbidden if user not found
    }
    const interestedEvents = await Event.find({
      _id: { $in: user.interested },
    });
    res.send(interestedEvents);
  } catch (error) {
    console.error("Error fetching interested events:", error);
    res.status(500).send({ message: "Error fetching interested events." });
  }
});

// Remove interested event
app.post("/removeInterestedEvent", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const user = await User.findOne({ token: authHeader });

    if (!user) {
      console.log("User not found");
      return res.sendStatus(403); // Forbidden if user not found
    }

    const eventId = req.body.eventId;
    console.log(`this is the event id ${eventId}`);

    if (!eventId) {
      console.log("Event ID not provided");
      return res.status(400).send({ message: "Event ID is required." });
    }

    // Check if the user has bookmarked the event
    if (!user.interested.includes(eventId)) {
      console.log("Event not bookmarked");
      return res.status(400).send({ message: "Event not bookmarked." });
    }

    // Remove the event ID from the user's interested array
    await User.findByIdAndUpdate(user._id, { $pull: { interested: eventId } });

    console.log("Event removed from bookmarks successfully");
    res.send({ message: "Event removed from bookmarks" });
    console.log("Request sent successfully", res.send);
  } catch (error) {
    console.error("Error removing event from bookmarks:", error);
    res.status(500).send({ message: "Error removing event from bookmarks." });
  }
});

// coontroller to check if event is bookmarked

// Endpoint to check if an event is bookmarked by a user
app.get("/isEventBookmarked/:eventId", async (req, res) => {
  try {
    // Retrieve the user's token from the authorization header
    const authHeader = req.headers["authorization"];

    // Find the user based on the token
    const user = await User.findOne({ token: authHeader });

    // Check if the user exists
    if (!user) {
      return res.sendStatus(403); // Forbidden if user not found
    }

    // Get the event ID from the request parameters
    const eventId = req.params.eventId;

    // Check if the event ID is provided
    if (!eventId) {
      return res.status(400).send({ message: "Event ID is required." });
    }

    // Check if the event with the provided ID exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send({ message: "Event not found." });
    }

    // Check if the user has bookmarked the event
    const isBookmarked = user.interested.includes(eventId);
    // console.log("Bookmark status for event", eventId, ":", isBookmarked); // Log the bookmark status with event ID // Log the bookmark status
    res.send({ bookmarked: isBookmarked });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    res.status(500).send({ message: "Error checking bookmark status." });
  }
});

// Get logged user's username controller

app.get("/loggedUsername", async (req, res) => {
  try {
    // Retrieve the user's token from the authorization header
    const authHeader = req.headers["authorization"];

    // Check if the authorization header is missing or invalid
    if (!authHeader) {
      return res.status(401).send({ message: "Unauthorized: Missing token" }); // Return 401 Unauthorized
    }

    // Find the user based on the token
    const user = await User.findOne({ token: authHeader });

    // Check if the user exists
    if (!user) {
      return res.status(404).send({ message: "User not found." }); // Return 404 Not Found
    }

    // Send the user's username in the response
    res.send({ username: user.username });
  } catch (error) {
    console.error("Error fetching logged user's username:", error);
    res.status(500).send({ message: "Error fetching logged user's username." }); // Return 500 Internal Server Error
  }
});

// new controllers \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


// starting the server
app.listen(3001, () => {
  console.log("listening on port 3001");
});

module.exports = app;
