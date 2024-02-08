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
  app.get("/username/:usernameValue", async (req, res) =>
    {
      const value = req.params.usernameValue

      console.log("BACKEND CHECKING DATABASE")
      const user = await User.findOne({ username: value });

      console.log(user);
      // console.log(req.body);

      if(user)
      {
        res.send(true)
        // return true
      }
      else
      {
        res.send(false)
        // return false
      }
    }
  )

//create user
  app.post("/signup", async (req, res) => {
    const newUser = req.body;
    // console.log(req.body)
    const user = new User(newUser);
    console.log("Created an user")
    console.log(user)
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

  //   do not store password in plain text - its just for learning purposes
  if (req.body.password !== user.password) {
    console.log("wrong password");
    return res.sendStatus(403);
  }
  //   code to generate token
  user.token = uuidv4();
  await user.save();
  res.send({ token: user.token });
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

// defining CRUD operations
app.get("/", async (req, res) => {
try {
  const a = await Event.find();
  
  res.send(a);
} catch (error) {
 console.error("error in GET/ index.js")
}
  
});



app.post("/", async (req, res) => {
  const newEvent = req.body;
  // console.log(req.body)
  const event = new Event(newEvent);
  console.log("Created an event")
  await event.save();
  res.send({ message: "New event inserted." });
});



app.delete("/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.send({ message: "Event removed." });
});

app.put("/:id", async (req, res) => {
  console.log("Connecting to Update DB");
  console.log(req.params)
  console.log(req.body)
  console.log("Making Update DB");

  await Event.findByIdAndUpdate(req.params.id, req.body);
  res.send({ message: "Event updated." });
});

// starting the server
app.listen(3001, () => {
  console.log("listening on port 3001");
});