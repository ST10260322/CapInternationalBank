import fs from "fs";
import https from "https";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import db from "./database";
import session from "express-session";
import SQLiteStore from "connect-sqlite3";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";

const SQLiteStoreInstance = SQLiteStore(session);
const app = express();

// =====================
// Security Middleware
// =====================
app.use(
  helmet({
    frameguard: { action: "deny" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    }
  })
);

// CORS setup
app.use(
  cors({
    origin: "https://localhost:3000",
    credentials: true
  })
);

app.use(express.json());

// =====================
// Session Middleware
// =====================
app.use(
  session({
    store: new SQLiteStoreInstance({ db: "sessions.sqlite" }),
    secret: "super-secret-key", // change for production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

// =====================
// Rate Limiting
// =====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP per window
  message: "Too many requests from this IP, please try again later."
});

app.use("/login", limiter);
app.use("/register", limiter);
app.use("/payments", limiter);

// =====================
// Helper: Input Validation
// =====================
function validateInput(field, type) {
  const regexes = {
    name: /^[A-Za-z\s]+$/,
    idNumber: /^\d{13}$/,
    accountNumber: /^\d{6,12}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    currency: /^(USD|ZAR|EUR)$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  };
  return regexes[type].test(field);
}

// =====================
// Routes
// =====================
app.get("/", (req, res) => res.send("Backend is running!"));

// ---------------------
// Register Route
// ---------------------
app.post("/register", async (req, res) => {
  let { name, surname, idNumber, email, password } = req.body;

  // Sanitization
  name = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
  surname = sanitizeHtml(surname, { allowedTags: [], allowedAttributes: {} });
  idNumber = idNumber.replace(/\D/g, ""); // digits only
  email = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
  password = sanitizeHtml(password, { allowedTags: [], allowedAttributes: {} });

  // Validation
  if (!name || !surname || !idNumber || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!validateInput(name, "name") || !validateInput(surname, "name")) return res.status(400).json({ message: "Invalid name or surname" });
  if (!validateInput(idNumber, "idNumber")) return res.status(400).json({ message: "Invalid ID Number" });
  if (!validateInput(email, "email")) return res.status(400).json({ message: "Invalid email format" });
  if (!validateInput(password, "password")) return res.status(400).json({ message: "Password too weak" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, surname, idNumber, email, password) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, surname, idNumber, email, hashedPassword], function (err) {
      if (err) return res.status(500).json({ message: "Error creating user", error: err.message });
      res.status(201).json({ message: "User registered!", userId: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------------
// Login Route
// ---------------------
app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  // Sanitization
  email = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
  password = sanitizeHtml(password, { allowedTags: [], allowedAttributes: {} });

  if (!email || !password || !validateInput(email, "email")) {
    return res.status(400).json({ message: "Invalid email or password format" });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    req.session.userId = user.id;
    res.json({ message: "Login successful!", userId: user.id });
  });
});

// ---------------------
// Auth Middleware
// ---------------------
function authMiddleware(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: "Unauthorized: Please log in first" });
  next();
}

// ---------------------
// Payment Route
// ---------------------
app.post("/payments", authMiddleware, (req, res) => {
  let { recipientName, bank, accountNumber, recipientEmail, currency, amount, reference, swiftCode } = req.body;
  const userId = req.session.userId;

  // Sanitization
  recipientName = sanitizeHtml(recipientName, { allowedTags: [], allowedAttributes: {} });
  bank = sanitizeHtml(bank, { allowedTags: [], allowedAttributes: {} });
  accountNumber = accountNumber.replace(/\D/g, "");
  recipientEmail = sanitizeHtml(recipientEmail, { allowedTags: [], allowedAttributes: {} });
  reference = sanitizeHtml(reference || "", { allowedTags: [], allowedAttributes: {} });
  swiftCode = sanitizeHtml(swiftCode || "", { allowedTags: [], allowedAttributes: {} });

  // Required fields
  const missing = [];
  if (!recipientName) missing.push("recipientName");
  if (!bank) missing.push("bank");
  if (!accountNumber) missing.push("accountNumber");
  if (!recipientEmail) missing.push("recipientEmail");
  if (!currency) missing.push("currency");
  if (!amount) missing.push("amount");
  if (missing.length > 0) return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });

  // Validation
  if (!validateInput(recipientName, "name") || !validateInput(bank, "name")) return res.status(400).json({ message: "Invalid recipient or bank name" });
  if (!validateInput(accountNumber, "accountNumber")) return res.status(400).json({ message: "Invalid account number" });
  if (!validateInput(recipientEmail, "email")) return res.status(400).json({ message: "Invalid recipient email" });
  if (!validateInput(currency, "currency")) return res.status(400).json({ message: "Unsupported currency" });
  if (isNaN(amount) || Number(amount) <= 0) return res.status(400).json({ message: "Invalid amount" });

  const query = `INSERT INTO payments (userId, recipientName, bank, accountNumber, recipientEmail, currency, amount, reference, swiftCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(query, [userId, recipientName, bank, accountNumber, recipientEmail, currency, amount, reference, swiftCode], function (err) {
    if (err) return res.status(500).json({ message: "Error saving payment", error: err.message });
    res.status(201).json({ message: "Payment saved!", paymentId: this.lastID });
  });
});

// =====================
// HTTPS Server
// =====================
const options = {
  key: fs.readFileSync("./localhost+2-key.pem"),
  cert: fs.readFileSync("./localhost+2.pem")
};

const PORT = 3001;
https.createServer(options, app).listen(PORT, () => {
  console.log(`Secure server running on https://localhost:${PORT}`);
});
