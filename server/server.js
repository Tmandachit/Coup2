// Import necessary modules
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');

// Initialize Express app and HTTP server
const app = express();
const server = createServer(app);

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5174'], // Client's origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware setup
app.use(
  cors({
    origin: 'http://localhost:5174', // Client's origin
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(express.json());

// MySQL database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_password', // Replace with your MySQL password
  database: 'users_db',      // Ensure this database exists
};

// Function to initialize database connection
async function initDb() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// In-memory storage for lobbies and user mappings
const lobbies = {};     // Stores active lobbies and their members
const userSockets = {}; // Maps socket.id to { username, lobby }

// Helper function to generate a unique 6-digit code
function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Route to create a new lobby
app.get('/createlobby', (req, res) => {
  let code = '';

  // Generate a unique 6-digit code
  while (!code || lobbies[code]) {
    code = generateSixDigitCode();
  }

  // Create a new lobby
  lobbies[code] = [];
  console.log(`Lobby ${code} CREATED`);
  res.json({ lobby: code });
});

// RESTful API route for user registration
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  if (!firstName || !lastName || !email || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const connection = await initDb();
    const sql =
      'INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)';
    await connection.execute(sql, [firstName, lastName, email, username, password]);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Database Insert Error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a lobby with acknowledgment
  socket.on('join-lobby', ({ username, lobby }, callback) => {
    if (!lobbies[lobby]) {
      console.error(`Lobby ${lobby} does not exist.`);
      if (callback) callback({ status: 'error', message: 'Lobby does not exist' });
      return;
    }

    // Add user to the lobby if not already present
    if (!lobbies[lobby].includes(username)) {
      lobbies[lobby].push(username);
      userSockets[socket.id] = { username, lobby };
    }

    // Join the socket room
    socket.join(lobby);
    console.log(`${username} joined lobby: ${lobby}`);

    // Notify all members in the lobby about the updated list
    io.to(lobby).emit('lobby-update', lobbies[lobby]);

    // Send acknowledgment to the client
    if (callback) callback({ status: 'ok' });
  });

  // Handle user disconnection gracefully
  socket.on('disconnecting', () => {
    console.log(`User disconnecting: ${socket.id}`);
    const user = userSockets[socket.id];
    if (user) {
      const { username, lobby } = user;
      if (lobbies[lobby]) {
        // Remove the user from the lobby
        lobbies[lobby] = lobbies[lobby].filter((user) => user !== username);

        // Notify remaining members
        io.to(lobby).emit('lobby-update', lobbies[lobby]);

        // Delete the lobby if it's empty
        if (lobbies[lobby].length === 0) {
          delete lobbies[lobby];
          console.log(`Lobby ${lobby} deleted.`);
        }
      }
      // Remove the user from the userSockets mapping
      delete userSockets[socket.id];
    }
  });

  // Log full disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
