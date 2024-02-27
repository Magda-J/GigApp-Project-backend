require("dotenv").config({ path: ".env.test" }); // Load test environment variables

const request = require("supertest");
const app = require("./index");

// Test 1 to check GET /events
// Asserts that the response status is 200.

describe("GET /events", () => {
  it("should respond with status code 200", async () => {
    const response = await request(app).get("/events");
    expect(response.status).toBe(200);
  });
});

// Test 2 /////////////////////////////////
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

//  Test 3 /////////////////////////////
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

// Test 4 //////////////////////////
// Asserts that the response status is 200.
describe("GET /", () => {
  it("should respond with status code 200", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});

// Test 5 /////////////////////////

const User = require("./models/user"); // Replace this with the path to your User model file

describe("GET /loggedUsername", () => {
  it("should return 403 Forbidden if user is not found", async () => {
    // Mocking the User.findOne method to return null
    User.findOne = jest.fn().mockResolvedValue(null);

    // Making a request to the endpoint with a dummy authorization header
    const res = await request(app)
      .get("/loggedUsername")
      .set("Authorization", "Bearer dummyToken");

    // Assertions
    expect(res.status).toBe(403);
  });

  it("should return the logged in user's username if authenticated", async () => {
    // Assuming you have a valid token generated for testing
    const validToken = "14466012-b4f7-4442-994e-3a2c856b9b51";

    // Making a request to the endpoint with the valid authorization header
    const res = await request(app)
      .get("/loggedUsername")
      .set("authorization", `14466012-b4f7-4442-994e-3a2c856b9b51`);
    console.log("Response:", res);
    // Assertions

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("username");
  });
});
