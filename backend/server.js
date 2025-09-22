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
  const { name, surname, idNumber, email, password } = req.body;

  if (!name || !surname || !idNumber || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format" });
  if (!passwordRegex.test(password)) return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one letter and one number" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, surname, idNumber, email, password) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, surname, idNumber, email, hashedPassword], function (err) {
      if (err) {
        console.error("SQLite Error creating user:", err.message);
        return res.status(500).json({ message: "Error creating user", error: err.message });
      }
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


// Save payment route
app.post("/payments", (req, res) => {
  const {
    userId,
    recipientName,
    bank,
    accountNumber,
    recipientEmail,
    currency,
    amount,
    reference,
    swiftCode
  } = req.body;

  // ✅ Improved error handling
  const missing = [];
  if (!userId) missing.push("userId");
  if (!recipientName) missing.push("recipientName");
  if (!bank) missing.push("bank");
  if (!accountNumber) missing.push("accountNumber");
  if (!recipientEmail) missing.push("recipientEmail");
  if (!currency) missing.push("currency");
  if (!amount) missing.push("amount");

  if (missing.length > 0) {
    return res.status(400).json({
      message: `Missing required payment fields: ${missing.join(", ")}`
    });
  }

  const query = `INSERT INTO payments 
    (userId, recipientName, bank, accountNumber, recipientEmail, currency, amount, reference, swiftCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    query,
    [userId, recipientName, bank, accountNumber, recipientEmail, currency, amount, reference, swiftCode],
    function (err) {
      if (err) {
        console.error("SQLite Error saving payment:", err.message);
        return res.status(500).json({ message: "Error saving payment", error: err.message });
      }
      res.status(201).json({ message: "Payment saved!", paymentId: this.lastID });
    }
  );
});
