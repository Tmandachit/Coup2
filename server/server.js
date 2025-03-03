// Import necessary modules
const express = require('express');                     // Express framework for building web applications
const cors = require('cors');                           // CORS middleware to allow cross-origin resource sharing
const { createServer } = require('http');               // HTTP module to create a server instance
const { Server } = require('socket.io');                // Socket.IO for real-time communication
const mysql = require('mysql2/promise');                // MySQL library with Promise support
const path = require('path');                           // Module for handling file and directory paths

// Initialize Express app and HTTP server
const app = express();                                  // Create an Express application
const server = createServer(app);                       // Create an HTTP server using the Express app

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5174'],                // Allowed client origin for socket connections
    methods: ['GET', 'POST'],                         // Allowed HTTP methods
    credentials: true,                                // Allow credentials (cookies, headers, etc.)
  },
});

// Middleware setup for CORS and JSON parsing
app.use(
  cors({
    origin: 'http://localhost:5174',                  // Allowed client origin for HTTP requests
    methods: ['GET', 'POST'],                         // Allowed HTTP methods
    credentials: true,                                // Allow credentials
  })
);
app.use(express.json());                              // Middleware to parse incoming JSON requests


// In-memory storage for lobbies and user mappings
const lobbies = {};     // Object to store active lobbies and their member usernames
const userSockets = {}; // Object to map socket.id to user information (username and lobby)

// Helper function to generate a unique 6-digit code
function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit number as a string
}

// Route to create a new lobby
app.get('/createlobby', (req, res) => {
  let code = '';

  // Generate a unique 6-digit code that is not already in use
  while (!code || lobbies[code]) {
    code = generateSixDigitCode();
  }

  // Create a new lobby with the generated code and initialize with an empty array of players
  lobbies[code] = [];
  console.log(`Lobby ${code} CREATED`);
  res.json({ lobby: code });  // Respond with the created lobby code in JSON format
});

// Endpoint to fetch players for a specific lobby by its code
app.get('/lobby/:lobbyCode/players', (req, res) => {
  const { lobbyCode } = req.params;
  // Check if the lobby exists and return the list of players; otherwise, send a 404 error
  if (lobbies[lobbyCode]) {
    res.json({ players: lobbies[lobbyCode] });
  } else {
    res.status(404).json({ error: 'Lobby not found' });
  }
});

// RESTful API route for user registration
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  // Validate that all required fields are provided
  if (!firstName || !lastName || !email || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Initialize database connection
    const connection = await initDb();
    // SQL statement to insert a new user into the users table
    const sql =
      'INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)';
    // Execute the SQL query with the provided user data
    await connection.execute(sql, [firstName, lastName, email, username, password]);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Database Insert Error:', error);
    res.status(500).json({ message: 'Database error' });  // Return a 500 status if an error occurs during registration
  }
});

// Socket.IO connection handler for real-time events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle the 'join-lobby' event when a client requests to join a lobby
  socket.on('join-lobby', ({ username, lobby }, callback) => {
    // Check if the requested lobby exists
    if (!lobbies[lobby]) {
      console.error(`Lobby ${lobby} does not exist.`);
      if (callback) callback({ status: 'error', message: 'Lobby does not exist' });
      return;
    }

    // Add user to the lobby if they are not already in it
    if (!lobbies[lobby].includes(username)) {
      lobbies[lobby].push(username);
      userSockets[socket.id] = { username, lobby };  // Map the socket ID to the user details
    }

    // Add the socket to the room corresponding to the lobby
    socket.join(lobby);
    console.log(`${username} joined lobby: ${lobby} with socket id: ${socket.id}`);

    // Notify all members in the lobby about the updated list of players
    io.to(lobby).emit('lobby-update', lobbies[lobby]);

    // Send an acknowledgment to the client indicating successful joining
    if (callback) callback({ status: 'ok' });
  });

  // Handle the 'disconnecting' event to manage user disconnection
  socket.on('disconnecting', () => {
    console.log(`User disconnecting: ${socket.id}`);
    const user = userSockets[socket.id];
    if (user) {
      const { username, lobby } = user;
      if (lobbies[lobby]) {
        // Remove the user from the lobby's list
        lobbies[lobby] = lobbies[lobby].filter((user) => user !== username);

        // Notify remaining lobby members of the updated players list
        io.to(lobby).emit('lobby-update', lobbies[lobby]);

        // Delete the lobby if there are no more players left
        if (lobbies[lobby].length === 0) {
          delete lobbies[lobby];
          console.log(`Lobby ${lobby} deleted.`);
        }
      }
      // Remove the user from the userSockets mapping
      delete userSockets[socket.id];
    }
  });

  // Handle the 'disconnect' event and log the disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Serve the React application's build files as static assets
const clientBuildPath = path.join(__dirname, '../client/my-react-app/');
app.use(express.static(clientBuildPath));

// Catch-all route to send the React application's index.html file for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start the server and listen on the specified port (default is 5001)
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
