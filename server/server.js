const express = require("express");
const db = require("./db");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// add to db -> users table in users_db
app.post("/register", async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body;
  
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const sql = "INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)";
      await db.query(sql, [firstName, lastName, email, username, password]);
      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.error("Database Insert Error:", error);
      res.status(500).json({ message: "Database error" });
    }
  });

  app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        const [results] = await db.query(sql, [username, password]);

        if (results.length > 0) {
            res.json({ success: true, message: "Login successful" });
        } else {
            res.json({ success: false, message: "Invalid username or password" });
        }
    } catch (error) {
        console.error("Database Query Error:", error);
        res.status(500).json({ message: "Database error" });
    }
});

  

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
