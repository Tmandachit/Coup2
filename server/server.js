// Import necessary modules
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { db } = require("./firebase");
const { doc, getDoc, setDoc, collection, query, where, getDocs } = require("firebase/firestore");

// Initialize Express app and HTTP server
const app = express();
const server = createServer(app);

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware setup for CORS and JSON parsing
app.use(cors({
  origin: 'http://localhost:5174',
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// In-memory storage for lobbies, user mappings, and active game instances
const lobbies = {};     // Stores active lobbies and their members
const userSockets = {}; // Maps socket.id to user information (username and lobby)
const games = {};       // Stores active game instances

// Helper function to generate a unique 6-digit code
function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Route to create a new lobby
app.get('/createlobby', (req, res) => {
  let code = '';
  while (!code || lobbies[code]) {
    code = generateSixDigitCode();
  }
  lobbies[code] = []; // Create a new lobby
  console.log(`Lobby ${code} CREATED`);
  res.json({ lobby: code });
});

// Endpoint to fetch players for a specific lobby by its code
app.get('/lobby/:lobbyCode/players', (req, res) => {
  const { lobbyCode } = req.params;
  if (lobbies[lobbyCode]) {
    res.json({ players: lobbies[lobbyCode] });
  } else {
    res.status(404).json({ error: 'Lobby not found' });
  }
});

// Socket.IO connection handler for real-time events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a lobby
  socket.on('join-lobby', ({ username, lobby }, callback) => {
    if (!lobbies[lobby]) {
      console.error(`Lobby ${lobby} does not exist.`);
      if (callback) callback({ status: 'error', message: 'Lobby does not exist' });
      return;
    }

    if (!lobbies[lobby].includes(username)) {
      lobbies[lobby].push(username);
      userSockets[socket.id] = { username, lobby };
    }

    socket.join(lobby);
    console.log(`${username} joined lobby: ${lobby}`);

    io.to(lobby).emit('lobby-update', lobbies[lobby]);
    if (callback) callback({ status: 'ok' });
  });

  // Handle starting the game
  socket.on('start-game', ({ lobbyCode }) => {
    if (!lobbies[lobbyCode]) {
      console.error(`Attempt to start a non-existent lobby: ${lobbyCode}`);
      return;
    }

    if (games[lobbyCode]) {
      console.log(`Game already started for lobby ${lobbyCode}`);
      return;
    }

    // Create game instance
    games[lobbyCode] = {
      players: [...lobbies[lobbyCode]],
      startedAt: new Date().toISOString(),
      status: 'in-progress'
    };

    console.log(`Game started for lobby ${lobbyCode}`);
    
    // Notify all players in the lobby that the game has started
    io.to(lobbyCode).emit('game-started', { lobbyCode });
  });

  // Handle disconnecting users
  socket.on('disconnecting', () => {
    console.log(`User disconnecting: ${socket.id}`);
    const user = userSockets[socket.id];
    if (user) {
      const { username, lobby } = user;
      if (lobbies[lobby]) {
        lobbies[lobby] = lobbies[lobby].filter((player) => player !== username);
        io.to(lobby).emit('lobby-update', lobbies[lobby]);

        if (lobbies[lobby].length === 0) {
          delete lobbies[lobby];
          console.log(`Lobby ${lobby} deleted.`);
        }
      }
      delete userSockets[socket.id];
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Serve the React application's build files as static assets
const clientBuildPath = path.join(__dirname, '../client/my-react-app/');
app.use(express.static(clientBuildPath));

// Catch-all route for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
