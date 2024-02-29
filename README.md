# EventAppBackend
Backend for GigApp-Project


Index.js Documentation
Introduction

The index.js file serves as the entry point for the backend application. It utilizes Express.js for handling HTTP requests, Mongoose for MongoDB interactions, and various middleware for authentication and request processing.
Dependencies

    Express: Web application framework for Node.js.
    Mongoose: MongoDB object modeling tool.
    dotenv: Loads environment variables from a .env file.
    cors: Express middleware for enabling Cross-Origin Resource Sharing.
    bcrypt: Library for hashing passwords securely.
    uuid: Generates universally unique identifiers.

Initialization

    mongoose.connect(process.env.CONNECTION_STRING): Connects to the MongoDB database using the connection string from the environment variables.
    app = express(): Initializes the Express application.

Middleware

    Cors Middleware: Enables Cross-Origin Resource Sharing to allow client-side requests from different origins.
    Body Parser Middleware: Parses incoming request bodies in JSON format.

Endpoints

    Check User
        Endpoint: /username/:usernameValue
        Method: GET
        Description: Checks if a user with the provided username exists.
        Parameters: usernameValue - Username to check.
        Response: Returns true if the user exists, false otherwise.

    Create User
        Endpoint: /signup
        Method: POST
        Description: Registers a new user.
        Body: Contains user information including username and password.
        Response: Returns a message indicating successful user creation.

    User Authentication
        Endpoint: /auth
        Method: POST
        Description: Authenticates a user by verifying the provided username and password.
        Body: Contains username and password for authentication.
        Response: Returns a token for authorized access.

    Get All Events
        Endpoint: /events
        Method: GET
        Description: Retrieves all events from the database.

    Authorization Middleware
        Description: Middleware to ensure authenticated access to protected routes using tokens.

    CRUD Operations for Events
        Endpoint: /, /:id
        Methods: GET, POST, PUT, DELETE
        Description: Implements CRUD operations for events including creation, retrieval, update, and deletion.
        Authorization: Requires token-based authentication.

    Manage Interested Events
        Endpoints: /addInterestedEvent, /interestedEvents, /removeInterestedEvent, /isEventBookmarked/:eventId
        Description: Allows users to bookmark and retrieve events of interest.
        Authorization: Requires token-based authentication.

    Get Logged User's Username
        Endpoint: /loggedUsername
        Method: GET
        Description: Retrieves the username of the logged-in user.
        Authorization: Requires token-based authentication.

Server Startup

    Port: Listens on port 3001.
    Logging: Outputs a message indicating server startup.

Export

Exports the Express application for use in other modules.

This documentation provides an overview of the controllers, middleware, and authentication mechanisms implemented in the index.js file. It serves as a guide for developers to understand and utilize the backend functionality effectively.


ENDPOINTS TESTING:

For conducting backend tests (test code provided in index.test.js), it is recommended to temporarily deactivate lines 410 to 413 in the index.js file:

// Starting the server
 app.listen(3001, () => {
 console.log("listening on port 3001");
 });

Subsequently, execute the following commands:

    'npm start' to establish a connection with MongoDB.
    'npm test' to initiate the Supertest and Jest test suite.

After the tests, ensure that the database is reset to remove mock events and mock users. Failure to do so may lead to test failures in subsequent runs.
