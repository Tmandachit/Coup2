const express = require("express");
const cors = require("cors");
const { db } = require("./firebase"); 
const { doc, getDoc, setDoc, collection, query, where, getDocs } = require("firebase/firestore");

const app = express();
app.use(cors());
app.use(express.json());


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

      await setDoc(doc(db, "players", username), {
          firstName,
          lastName,
          email,
          username,
          password,
          createdAt: new Date().toISOString(),
      });

      res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
      console.error("Error saving user to Firestore:", error);
      res.status(500).json({ message: "Failed to register user" });
  }
});


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

      if (userData.password !== password) {
          return res.status(400).json({ message: "Invalid password" });
      }

      res.status(200).json({ message: "Login successful!", user: userData });

  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));
