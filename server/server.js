// Import necessary modules
const express = require('express');                     
const cors = require('cors');                           
const { createServer } = require('http');               
const { Server } = require('socket.io');                
const path = require('path');                           
const { db } = require("./firebase"); 
const bcrypt = require("bcrypt");
const { doc, getDoc, setDoc, collection, query, where, getDocs } = require("firebase/firestore");
const Game = require('./game/coupGame.js');

// Initialize Express app and HTTP server
const app = express();
const server = createServer(app);

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],                // Allowed client origin for socket connections
    methods: ['GET', 'POST'],                         // Allowed HTTP methods
    credentials: true,                                // Allow credentials (cookies, headers, etc.)
  },
});

// Middleware setup for CORS and JSON parsing
app.use(cors({
  origin: 'http://localhost:5173',                
  methods: ['GET', 'POST'],                        
  credentials: true,                                
}));
app.use(express.json());                              

// In-memory storage for lobbies, user mappings, and game instances
const lobbies = {};    
const games = {};
const userSockets = {}; 

// Const variables
const MAX_PLAYERS_PER_LOBBY = 6;

// Helper function to generate a unique 6-digit code
function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
}

// User Registration

app.post("/register", async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
  }

  try {
      const usersRef = collection(db, "players");

      const usernameQuery = query(usersRef, where("username", "==", username));
      const usernameSnapshot = await getDocs(usernameQuery);

      if (!usernameSnapshot.empty) {
          return res.status(400).json({ message: "Username already taken" });
      }

      const emailQuery = query(usersRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
          return res.status(400).json({ message: "Email is already registered" });
      }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await setDoc(doc(db, "players", username), {
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      gamesPlayed: 0,
      gamesWon: 0,
      createdAt: new Date().toISOString(),
    });

      res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
      console.error("Error saving user to Firestore:", error);
      res.status(500).json({ message: "Failed to register user" });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  try {
      const userRef = doc(db, "players", username);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
          return res.status(400).json({ message: "User not found" });
      }

      const userData = userDoc.data();

      const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const { password: _, ...userWithoutPassword } = userData;

      res.status(200).json({ message: "Login successful!", 
        user: userData, 
        userId: username, 
        firstName: userData.firstName, 
        lastName: userData.lastName, 
        gamesPlayed: userData.gamesPlayed, 
        gamesWon: userData.gamesWon 
      });

  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

// Change password
app.post("/changepassword", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userRef = doc(db, "players", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();
    const isPasswordValid = await bcrypt.compare(currentPassword, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await setDoc(userRef, { ...userData, password: hashedNewPassword });

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Change profile
app.post("/changeprofile", async (req, res) => {
  const { username, firstName, lastName } = req.body;

  if (!username || !firstName || !lastName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userRef = doc(db, "players", username);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    await setDoc(userRef, {
      ...userData,
      firstName,
      lastName,
    });

    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new lobby
app.get('/createlobby', (req, res) => {
  let code = '';

  while (!code || lobbies[code]) {
    code = generateSixDigitCode();
  }

  lobbies[code] = [];
  console.log(`Lobby ${code} CREATED`);
  res.json({ lobby: code });
});

// Fetch players in a lobby
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
      if (callback && typeof callback === "function") {
        callback({ status: "error", message: "Lobby does not exist" });
      }
      return;
    }

    // Enfore player limit
    if (lobbies[lobby].length >= MAX_PLAYERS_PER_LOBBY) {
      console.log(`Lobby ${lobby} is full.`);
      if (callback && typeof callback === "function") {
        callback({ status: "error", message: "Lobby is full" });
      }
      return;
    }

    if (!lobbies[lobby].some(player => player.name === username)) {
      lobbies[lobby].push({ name: username, ready: false });
      userSockets[socket.id] = { username, lobby };
    }

    socket.join(lobby);
    console.log(`${username} joined lobby: ${lobby}`);

    io.to(lobby).emit('lobby-update', lobbies[lobby]);

    if (callback && typeof callback === "function") {
      callback({ status: "ok" });
    }
  });

  // Handle Leave lobby
  socket.on('leave-lobby', ({ lobbyCode, userName }) => {
    if (lobbies[lobbyCode]) {
      lobbies[lobbyCode] = lobbies[lobbyCode].filter(p => p.name !== userName);
      io.to(lobbyCode).emit('lobby-update', lobbies[lobbyCode]);
  
      if (lobbies[lobbyCode].length === 0) {
        delete lobbies[lobbyCode];
        console.log(`Lobby ${lobbyCode} deleted (everyone left).`);
      }
    }
  });
  

  // Handle Ready Up
  socket.on('playerReady', ({ lobbyCode, userName, ready }) => {
    if (!lobbies[lobbyCode]) {
      console.error(`Attempt to ready in a non-existent lobby: ${lobbyCode}`);
      return;
    }
  
    lobbies[lobbyCode] = lobbies[lobbyCode].map(player =>
      player.name === userName ? { ...player, ready } : player
    );
  
    console.log(`${userName} is now ${ready ? 'Ready' : 'Not Ready'} in lobby ${lobbyCode}`);
  
    io.to(lobbyCode).emit('lobby-update', lobbies[lobbyCode]);
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
  
    const players = [...lobbies[lobbyCode]];
  
    // Get all sockets for players in the lobby
    const sockets = players.map(p => {
      const socketEntry = Object.entries(userSockets).find(([, val]) =>
        val.username === p.name && val.lobby === lobbyCode
      );
      return socketEntry ? socketEntry[0] : null;
    }).filter(Boolean);
  
    // Attach socketID to each player
    const playersWithSockets = players.map((player, index) => ({
      ...player,
      socketID: sockets[index]
    }));

    const game = new Game(playersWithSockets, sockets, io, lobbyCode);
    games[lobbyCode] = game;
  
    console.log(`Game instance created for lobby ${lobbyCode}`);
    io.to(lobbyCode).emit('game-started', { lobbyCode });
  });

  // Handle switch from lobby to game
  socket.on('join-game', ({ lobbyCode }) => {
    socket.join(lobbyCode);
    console.log(`${socket.id} joined game room ${lobbyCode}`);
  
    const game = games[lobbyCode];

    // ensure that full player data is only sent to corresponding user, with only public info for others
    if (game) {
      // const socketUser = userSockets[socket.id];
      // const yourName = socketUser?.username;

      // const sanitizedPlayers = game.players.map((player) => {
      //   if (player.name === yourName) {
      //     // Send full data for current player
      //     return player;
      //   } else {
      //     // Send only public info for opponents
      //     return {
      //       name: player.name,
      //       money: player.money,
      //       influenceCount: player.influences.length // just send the amount of influence cards
      //     };
      //   }
      // });

      // const playerData = game.getPlayerView(socket.id);

      // emit game-update event on a player-by-player basis - not all players receive the same data
      game.players.forEach(player => {
        const socketId = game.nameSocketMap[player.name];
        const playerData = game.getPlayerView(socketId);
        io.to(socketId).emit('game-update', {
          players: playerData,
          currentPlayer: game.players[game.currentPlayer].name
        });
      });
    } else {
      console.warn(`No game found for lobby ${lobbyCode}`);
    }
  });
  

  // Handle player disconnection
  socket.on('disconnecting', () => {
    console.log(`User disconnecting: ${socket.id}`);
    const user = userSockets[socket.id];
    if (user) {
      const { username, lobby } = user;
      if (lobbies[lobby]) {
        lobbies[lobby] = lobbies[lobby].filter((player) => player.name !== username);
        io.to(lobby).emit('lobby-update', lobbies[lobby]);

        if (lobbies[lobby].length === 0) {
          delete lobbies[lobby];
          console.log(`Lobby ${lobby} deleted.`);
        }
      }
      delete userSockets[socket.id];
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on('submit-action', ({ playerName, action, target }) => {    
    const user = userSockets[socket.id];
    if (!user) return;
  
    const { lobby } = user;
    const game = games[lobby];
    if (!game) return;
  
    const currentPlayer = game.players[game.currentPlayer];

    if (currentPlayer.name !== playerName) {
      socket.emit('error-message', 'It is not your turn.');
      return;
    }
  
    game.handleSubmit(action, target);
  });
});

// Serve React Frontend
const clientBuildPath = path.join(__dirname, '../client/my-react-app/');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
