const express = require("express");
const mongoose = require("mongoose");
const { Event } = require("./models/event");
const { User } = require("./models/user");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const cors = require("cors");

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

//create user
app.post("/signup", async (req, res) => {
  const newUser = req.body;
  // console.log(req.body)
  const user = new User(newUser);
  console.log("Created an user");
  console.log(user);
  await user.save();
  res.send({ message: "New User Created." });
});

// Authorization generation endpoint
app.post("/auth", async (req, res) => {
  console.log("arrived");
  console.log(req.body);
  const user = await User.findOne({ username: req.body.username });
  //console.log(user);
  if (!user) {
    return res.sendStatus(403);
  }

  if (req.body.password !== user.password) {
    console.log("wrong password");
    return res.sendStatus(403);
  }
  // code to generate token
  user.token = uuidv4();
  await user.save();
  res.send({ token: user.token });
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

// Remove interested event
app.post("/removeInterestedEvent", async (req, res) => {
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

    // Check if the user has bookmarked the event
    if (!user.interested.includes(eventId)) {
      return res.status(400).send({ message: "Event not bookmarked." });
    }

    // Remove the event ID from the user's interested array
    user.interested = user.interested.filter(id => id !== eventId);
    await user.save();

    res.send({ message: "Event removed from bookmarks successfully." });
  } catch (error) {
    console.error("Error removing event from bookmarks:", error);
    res.status(500).send({ message: "Error removing event from bookmarks." });
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
    const interestedEvents = await Event.find({ _id: { $in: user.interested } });
    res.send(interestedEvents);
  } catch (error) {
    console.error("Error fetching interested events:", error);
    res.status(500).send({ message: "Error fetching interested events." });
  }
});



// new controllers \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\







// starting the server

app.listen(3001, () => {
  console.log("listening on port 3001");
  // app.listen(
  //   3000,
  //   () => {
  //   console.log("listening on port 3000");
});
