import fs from "fs";
import https from "https";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";

// MongoDB
import "./database.js"; // MongoDB connection
import User from "./models/User.js";
import Payment from "./models/Payment.js";

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
  windowMs: 15 * 60 * 1000,
  max: 100,
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
  name = sanitizeHtml(name);
  surname = sanitizeHtml(surname);
  idNumber = idNumber.replace(/\D/g, "");
  email = sanitizeHtml(email);
  password = sanitizeHtml(password);

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
    const newUser = await User.create({
      name,
      surname,
      idNumber,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "User registered!", userId: newUser._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------------
// Login Route
// ---------------------
app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  email = sanitizeHtml(email);
  password = sanitizeHtml(password);

  if (!email || !password || !validateInput(email, "email")) {
    return res.status(400).json({ message: "Invalid email or password format" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    req.session.userId = user._id;
    res.json({ message: "Login successful!", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
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
app.post("/payments", authMiddleware, async (req, res) => {
  let { recipientName, bank, accountNumber, recipientEmail, currency, amount, reference, swiftCode } = req.body;
  const userId = req.session.userId;

  recipientName = sanitizeHtml(recipientName);
  bank = sanitizeHtml(bank);
  accountNumber = accountNumber.replace(/\D/g, "");
  recipientEmail = sanitizeHtml(recipientEmail);
  reference = sanitizeHtml(reference || "");
  swiftCode = sanitizeHtml(swiftCode || "");

  const missing = [];
  if (!recipientName) missing.push("recipientName");
  if (!bank) missing.push("bank");
  if (!accountNumber) missing.push("accountNumber");
  if (!recipientEmail) missing.push("recipientEmail");
  if (!currency) missing.push("currency");
  if (!amount) missing.push("amount");
  if (missing.length > 0) return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });

  if (!validateInput(recipientName, "name") || !validateInput(bank, "name")) return res.status(400).json({ message: "Invalid recipient or bank name" });
  if (!validateInput(accountNumber, "accountNumber")) return res.status(400).json({ message: "Invalid account number" });
  if (!validateInput(recipientEmail, "email")) return res.status(400).json({ message: "Invalid recipient email" });
  if (!validateInput(currency, "currency")) return res.status(400).json({ message: "Unsupported currency" });
  if (isNaN(amount) || Number(amount) <= 0) return res.status(400).json({ message: "Invalid amount" });

  try {
    const newPayment = await Payment.create({
      userId,
      recipientName,
      bank,
      accountNumber,
      recipientEmail,
      currency,
      amount,
      reference,
      swiftCode
    });

    res.status(201).json({ message: "Payment saved!", paymentId: newPayment._id });
  } catch (err) {
    res.status(500).json({ message: "Error saving payment", error: err.message });
  }
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
