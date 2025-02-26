const express = require("express");
const db = require("./db"); // Import MySQL connection
const cors = require("cors");

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors()); // Enable cross-origin requests

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
  

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
