require("dotenv").config({ path: ".env.test" }); // Load test environment variables

const request = require("supertest");
const app = require("./index");
const bcrypt = require("bcrypt");

// Test 1//////////////////// to check retrievel of all events in the dastabase
// Asserts that the response status is 200.

describe("GET /events", () => {
  it("should respond with status code 200", async () => {
    const response = await request(app).get("/events");
    expect(response.status).toBe(200);
  });
});

// Test 2 /////////////////////////////////  Signup test
//  Makes a POST request to the /signup endpoint with dummy user data.
// Asserts that the response status is 200.
// Asserts that the response body contains the expected success message.
describe("POST /signup", () => {
  it("should respond with status code 200 and a success message", async () => {
    const response = await request(app).post("/signup").send({
      username: "testuser",
      password: "password123",
      // Add any other required fields here
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "New User Created." });
  });
});

//  Test 3 ///////////////////////////// Authentication test
// Tests if the endpoint responds with status code 200 and a token if authentication succeeds.
// Tests if the endpoint responds with status code 403 if the user does not exist.
// Tests if the endpoint responds with status code 403 if the password is incorrect.

describe("POST /auth", () => {
  it("should respond with status code 200 and a token if authentication succeeds", async () => {
    const response = await request(app).post("/auth").send({
      username: "testuser",
      password: "password123",
      // Add any other required fields here
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should respond with status code 403 if user does not exist", async () => {
    const response = await request(app).post("/auth").send({
      username: "nonexistentuser",
      password: "password123",
      // Add any other required fields here
    });

    expect(response.status).toBe(403);
  });

  it("should respond with status code 403 if password is incorrect", async () => {
    const response = await request(app).post("/auth").send({
      username: "testuser",
      password: "wrongpassword",
      // Add any other required fields here
    });

    expect(response.status).toBe(403);
  });
});

// Test 4 ////////////////////////// to check retrieval of events assigned to specific user
// Asserts that the response status is 200.
describe("GET /", () => {
  it("should respond with status code 200", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});

// Test 5 ///////////////////////// Username retrieval
//  Tests if the endpoint responds with status code 200 and an username if authentication succeeds.
// Tests if the endpoint responds with status code 401 if the token is missing.
describe("GET /loggedUsername", () => {
  it("should return the logged user's username if authenticated", async () => {
    // First, authenticate and get the token
    const authResponse = await request(app).post("/auth").send({
      username: "testuser",
      password: "password123",
      // Add any other required fields here
    });

    // Extract the token from the response
    const token = authResponse.body.token;

    // Make a request to the controller endpoint with the obtained token
    const response = await request(app)
      .get("/loggedUsername")
      .set("Authorization", token);

    // Check if the response contains the expected username
    expect(response.status).toBe(200);
    expect(response.body.username).toBe("testuser"); // Assuming you know the expected username
  });

  it("should return 401 if token is missing", async () => {
    const response = await request(app).get("/loggedUsername");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized: Missing token");
  });
});

// Test 6 /////////////////////////  POST test - creation of the new event
//  Tests if the endpoint responds with status code 200 when new event is inserted.
//  Tests if the event was actually created in the database
const mongoose = require("mongoose");
const { Event } = require("./models/event");

describe("POST /", () => {
  it("should create a new event if authenticated", async () => {
    // First, authenticate and get the token
    const authResponse = await request(app)
      .post("/auth")
      .send({ username: "testuser", password: "password123" });

    // Extract the token from the response
    const token = authResponse.body.token;

    // Create a sample event data
    const eventData = {
      name: "Sample Event",
      city: "Sample City",
      date: "2024-03-01",
      price: 10,
      time: "18:00",
      photo: "sample.jpg",
      venue: "Sample Venue",
      countrycode: "US",
      postcode: "12345",
      currency: "USD",
      price2: 15,
      ticketlink: "https://example.com/tickets",
    };

    // Make a request to create a new event with the obtained token
    const response = await request(app)
      .post("/")
      .set("Authorization", token)
      .send(eventData);

    // Check if the response indicates success
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("New event inserted.");

    // Check if the event was actually created in the database
    const createdEvent = await Event.findOne({ name: eventData.name });
    expect(createdEvent).toBeTruthy();
    expect(createdEvent.name).toBe(eventData.name);
  });
});

// Test 7 ///////////////////////// DELETE test - deletion of user event

const { User } = require("./models/user");

describe("DELETE /:id", () => {
  it("should delete an event if authenticated user is authorized", async () => {
    // First, create a user

    const user = new User({
      username: "TestUser2",
      password: await bcrypt.hash("Password1234.", 10),
    });
    await user.save();
    const authResponse = await request(app)
      .post("/auth")
      .send({ username: "TestUser2", password: "Password1234." });

    // Extract the token from the response
    const token = authResponse.body.token;

    // Update the user with the generated token
    user.token = token;
    await user.save();

    // Create a sample event associated with the user
    const sampleEvent = await Event.create({
      name: "Sample Event",
      city: "Sample City",
      date: "2024-03-01",
      price: 10,
      time: "18:00",
      photo: "sample.jpg",
      venue: "Sample Venue",
      countrycode: "US",
      postcode: "12345",
      currency: "USD",
      price2: 15,
      ticketlink: "https://example.com/tickets",
      createdBy: user._id, // Use the user's ObjectId
    });

    console.log("Sample Event ID:", sampleEvent._id);

    // Make a request to delete the event with the obtained token
    const response = await request(app)
      .delete(`/${sampleEvent._id}`)
      .set("authorization", token);

    // Check if the response status is in the success range (200-299)
    expect(response.status).toBe(200);

    // Check if the event was deleted successfully
    if (response.status === 200) {
      expect(response.body.message).toBe("Event deleted.");
    } else {
      // If an error occurred, log the error message
      console.error(response.body);
    }

    // Check if the event was actually deleted from the database
    const deletedEvent = await Event.findById(sampleEvent._id);
    expect(deletedEvent).toBeFalsy();
  });
});

//  Test 8 //////////////////// PUT test - test for the form updating controller

describe("PUT /:id", () => {
  it("should update an event if authenticated user is authorized", async () => {
    // First, create a user
    const user = new User({
      username: "TestUser3",
      password: await bcrypt.hash("Password1234.", 10),
    });
    await user.save();

    // Authenticate and get the token
    const authResponse = await request(app)
      .post("/auth")
      .send({ username: "TestUser3", password: "Password1234." });

    // Extract the token from the response
    const token = authResponse.body.token;

    // Update the user with the generated token
    user.token = token;
    await user.save();

    // Create a sample event associated with the user
    const sampleEvent = await Event.create({
      name: "Sample Event",
      city: "Sample City",
      date: "2024-03-01",
      price: 10,
      time: "18:00",
      photo: "sample.jpg",
      venue: "Sample Venue",
      countrycode: "US",
      postcode: "12345",
      currency: "USD",
      price2: 15,
      ticketlink: "https://example.com/tickets",
      createdBy: user._id, // Use the user's ObjectId
    });

    // Make a request to update the event with the obtained token
    const updatedEventData = {
      name: "Updated Event Name",
      city: "Updated City",
      date: "2024-03-02",
      price: 15,
    };

    const response = await request(app)
      .put(`/${sampleEvent._id}`)
      .set("authorization", token)
      .send(updatedEventData);

    // Check if the response status is in the success range (200-299)
    expect(response.status).toBe(200);

    // Check if the event was updated successfully
    expect(response.body.message).toBe("Event updated.");

    // Check if the event was actually updated in the database
    const updatedEvent = await Event.findById(sampleEvent._id);
    expect(updatedEvent.name).toBe(updatedEventData.name);
    expect(updatedEvent.city).toBe(updatedEventData.city);
    expect(updatedEvent.date).toBe(updatedEventData.date);
    expect(updatedEvent.price).toBe(updatedEventData.price);
  });
});