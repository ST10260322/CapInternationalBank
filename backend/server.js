const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());




// Routes
app.get("/", (req, res) => res.send("Backend is running!"));








// Register route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format" });
  if (!passwordRegex.test(password)) return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one letter and one number" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(query, [email, hashedPassword], function(err) {
      if (err) return res.status(500).json({ message: "Error creating user", error: err.message });
      res.status(201).json({ message: "User registered!", userId: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});







// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format" });
  if (!passwordRegex.test(password)) return res.status(400).json({ message: "Invalid password format" });

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    res.json({ message: "Login successful!", userId: user.id });
  });
});





// HTTPS server options
const options = {
  key: fs.readFileSync("./localhost+2-key.pem"),
  cert: fs.readFileSync("./localhost+2.pem")
};




// Start HTTPS server
const PORT = 3001;
https.createServer(options, app).listen(PORT, () => {
  console.log(`Secure server running on https://localhost:${PORT}`);
});
