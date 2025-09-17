const db = require("./database");

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());           // allow all origins
app.use(express.json());    // parse JSON bodies

app.get("/", (req, res) => {
  res.send("Backend is running!");
});






const bcrypt = require("bcrypt");

// Register route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(query, [email, hashedPassword], function(err) {
      if (err) {
        return res.status(500).json({ message: "Error creating user", error: err.message });
      }
      res.status(201).json({ message: "User registered!", userId: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Find user in the database
  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful!", userId: user.id });
  });
});





const PORT = process.env.PORT || 3001; // changed from 5000 to 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
