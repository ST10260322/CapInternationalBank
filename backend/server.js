import fs from "fs";
import https from "https";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";
import validator from "validator";
import csrf from "csurf";


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
    },
    // Added HSTS (HTTP Strict Transport Security)
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
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

// Limit request body size to prevent DoS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));




// =====================
// Additional SSL/TLS Security Headers
// =====================
app.use((req, res, next) => {
  // Ensure secure protocol
  if (req.protocol !== 'https') {
    return res.status(403).send('HTTPS Required');
  }
  
  // Additional security headers for SSL/TLS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Indicate that the connection is secure
  res.setHeader('X-Forwarded-Proto', 'https');
  
  next();
});











// =====================
// Session Middleware
// =====================
app.use(
  session({
    secret: "super-secret-key", 
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 3600000,
      domain: 'localhost'
    },
    proxy: true
  })
);

// =====================
// CSRF Protection
// =====================
const csrfProtection = csrf({ 
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  },
  // Accept CSRF token from header (for API requests)
  value: (req) => {
    return req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;
  }
});

// Apply CSRF protection to all routes except GET requests to /csrf-token
app.use((req, res, next) => {
  // Skip CSRF for token endpoint and safe methods
  if (req.path === '/csrf-token' || req.path === '/' || req.path === '/ssl-info') {
    return next();
  }
  csrfProtection(req, res, next);
});

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ 
      message: 'Invalid CSRF token. Request rejected for security.',
      error: 'CSRF_VALIDATION_FAILED'
    });
  }
  next(err);
});












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

/// =====================
// Helper: Input Validation with Length Limits
// =====================
function validateInput(field, type) {
  // Length validation first (prevents buffer overflow attacks)
  const maxLengths = {
    name: 50,
    idNumber: 13,
    accountNumber: 12,
    email: 100,
    password: 128,
    reference: 200,
    swiftCode: 11,
    bank: 100
  };
  
  // Check if field exceeds maximum length
  if (maxLengths[type] && field.length > maxLengths[type]) {
    return false;
  }
  
  // Regex patterns for format validation
  const regexes = {
    name: /^[A-Za-z\s]+$/,
    idNumber: /^\d{13}$/,
    accountNumber: /^\d{6,12}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    currency: /^(USD|ZAR|EUR|GBP|JPY)$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    bank: /^[A-Za-z\s]+$/,
    reference: /^[A-Za-z0-9\s\-_.,!?()]+$/,
    swiftCode: /^[A-Z0-9]{8,11}$/
  };
  
  return regexes[type] ? regexes[type].test(field) : true;
}

// =====================
// Enhanced Input Validation
// =====================

// Validate email using validator.js
function validateEmail(email) {
  return validator.isEmail(email, {
    allow_display_name: false,
    require_tld: true,
    allow_utf8_local_part: false
  });
}

// Validate SWIFT code (8 or 11 alphanumeric characters)
function validateSWIFT(swiftCode) {
  if (!swiftCode) return true; // Optional field
  return validator.isLength(swiftCode, { min: 8, max: 11 }) && 
         validator.isAlphanumeric(swiftCode);
}

// Validate currency code
function validateCurrency(currency) {
  const validCurrencies = ['USD', 'ZAR', 'EUR', 'GBP', 'JPY'];
  return validCurrencies.includes(currency);
}

// Validate amount (must be numeric and positive)
function validateAmount(amount) {
  return validator.isDecimal(String(amount), { 
    force_decimal: false, 
    decimal_digits: '0,2',
    locale: 'en-US' 
  }) && parseFloat(amount) > 0;
}

// Validate account number
function validateAccountNumber(accountNumber) {
  return validator.isNumeric(accountNumber) && 
         validator.isLength(accountNumber, { min: 6, max: 12 });
}

// Validate ID number (13 digits for South African ID)
function validateIDNumber(idNumber) {
  return validator.isNumeric(idNumber) && 
         validator.isLength(idNumber, { min: 13, max: 13 });
}

// Validate name fields (letters and spaces only)
function validateName(name) {
  return validator.isAlpha(name.replace(/\s/g, ''), 'en-US') && 
         validator.isLength(name, { min: 1, max: 50 });
}

// Sanitize and validate reference field
function validateReference(reference) {
  if (!reference) return true; // Optional field
  // Allow alphanumeric, spaces, and common punctuation
  return validator.isLength(reference, { max: 200 }) &&
         /^[A-Za-z0-9\s\-_.,!?()]+$/.test(reference);
}





// =====================
// NoSQL Injection Middleware
// =====================
const noSQLInjectionMiddleware = (req, res, next) => {
  try {
    if (req.body) {
      req.body = sanitizeRequestBody(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeRequestBody(req.query);
    }
    
    if (req.params) {
      req.params = sanitizeRequestBody(req.params);
    }
    
    next();
  } catch (error) {
    return res.status(400).json({ 
      message: "Invalid request format", 
      error: error.message 
    });
  }
};

// Apply middleware to all routes
app.use(noSQLInjectionMiddleware);




// =====================
// NoSQL Injection Prevention
// =====================

/**
 * Prevents NoSQL injection by blocking MongoDB operators
 * @param {any} input - The input to sanitize
 * @param {string} fieldName - Name of the field (for error messages)
 * @returns {any} - Sanitized input
 * @throws {Error} - If malicious operators detected
 */
function preventNoSQLInjection(input, fieldName = "input") {
  // If input is an object, check for MongoDB operators
  if (typeof input === 'object' && input !== null) {
    // Check all keys in the object
    const keys = Object.keys(input);
    
    for (const key of keys) {
      // Block any keys starting with $ (MongoDB operators)
      if (key.startsWith('$')) {
        throw new Error(`Invalid ${fieldName}: MongoDB operators not allowed`);
      }
      
      // Recursively check nested objects
      if (typeof input[key] === 'object' && input[key] !== null) {
        preventNoSQLInjection(input[key], fieldName);
      }
    }
  }
  
  return input;
}

/**
 * Sanitizes all request body fields against NoSQL injection
 * @param {object} body - Request body
 * @returns {object} - Sanitized body
 */
function sanitizeRequestBody(body) {
  if (typeof body !== 'object' || body === null) {
    return body;
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(body)) {
    // Prevent operator injection in keys
    if (key.startsWith('$')) {
      throw new Error('Invalid request: Operators not allowed in field names');
    }
    
    // If value is object, check for operators
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      preventNoSQLInjection(value, key);
    }
    
    sanitized[key] = value;
  }
  
  return sanitized;
}








// =====================
// Request Size Validation Middleware
// =====================
const validateRequestSize = (req, res, next) => {
  // Check if request body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    return next();
  }
  
  // Maximum allowed fields in request
  const MAX_FIELDS = 20;
  
  // Check number of fields
  if (Object.keys(req.body).length > MAX_FIELDS) {
    return res.status(400).json({ 
      message: "Too many fields in request body" 
    });
  }
  
  // Check each field length
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string' && value.length > 10000) {
      return res.status(400).json({ 
        message: `Field '${key}' exceeds maximum length of 10000 characters` 
      });
    }
  }
  
  next();
};

// Apply to all routes
app.use(validateRequestSize);









// =====================
// SSL/TLS Certificate Information
// =====================
function logCertificateInfo() {
  try {
    const cert = fs.readFileSync("./localhost+2.pem", 'utf8');
    console.log("✅ SSL/TLS Configuration:");
    console.log("   - Certificate loaded successfully");
    console.log("   - TLS Version: 1.2 - 1.3");
    console.log("   - Perfect Forward Secrecy: Enabled");
    console.log("   - HSTS: Enabled (max-age: 1 year)");
    console.log("   - Cipher Suite: Modern, Secure Ciphers Only");
  } catch (err) {
    console.error("❌ Certificate loading error:", err.message);
  }
}

// =====================
// SSL/TLS Information Endpoint
// =====================
app.get("/ssl-info", (req, res) => {
  const sslInfo = {
    secure: req.secure,
    protocol: req.protocol,
    encrypted: req.connection.encrypted || false,
    tlsVersion: req.connection.getCipher ? req.connection.getCipher().version : 'N/A',
    cipher: req.connection.getCipher ? req.connection.getCipher().name : 'N/A',
    certificateInfo: {
      subject: 'localhost',
      issuer: 'mkcert',
      validFrom: 'Certificate start date',
      validTo: 'Certificate expiry date',
      algorithm: 'RSA or ECDSA'
    },
    securityFeatures: {
      hsts: 'Enabled (1 year)',
      perfectForwardSecrecy: 'Enabled',
      tlsVersion: 'TLS 1.2 - 1.3',
      sessionTimeout: '5 minutes'
    }
  };
  
  res.json(sslInfo);
});








// =====================
// Routes
// =====================
app.get("/", (req, res) => res.send("Backend is running!"));

// =====================
// CSRF Token Endpoint
// =====================
app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});





// ---------------------
// Register Route (Enhanced with Length Limits)
// ---------------------
app.post("/register", async (req, res) => {
  let { name, surname, idNumber, email, password } = req.body;

  // Type checking - ensure all inputs are strings
  if (typeof name !== 'string' || typeof surname !== 'string' || 
      typeof idNumber !== 'string' || typeof email !== 'string' || 
      typeof password !== 'string') {
    return res.status(400).json({ message: "Invalid input format" });
  }

  // Length validation (prevent buffer overflow)
  if (name.length > 50) return res.status(400).json({ message: "Name too long (max 50 characters)" });
  if (surname.length > 50) return res.status(400).json({ message: "Surname too long (max 50 characters)" });
  if (idNumber.length > 20) return res.status(400).json({ message: "ID number too long" });
  if (email.length > 100) return res.status(400).json({ message: "Email too long (max 100 characters)" });
  if (password.length > 128) return res.status(400).json({ message: "Password too long (max 128 characters)" });

  // Sanitization
  name = sanitizeHtml(name.trim());
  surname = sanitizeHtml(surname.trim());
  idNumber = idNumber.replace(/\D/g, "");
  email = sanitizeHtml(email.trim().toLowerCase());
  password = sanitizeHtml(password);

  // Validation
  if (!name || !surname || !idNumber || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Enhanced validation using validator.js
  if (!validateName(name)) {
    return res.status(400).json({ message: "Invalid name format (letters only, max 50 characters)" });
  }
  
  if (!validateName(surname)) {
    return res.status(400).json({ message: "Invalid surname format (letters only, max 50 characters)" });
  }
  
  if (!validateIDNumber(idNumber)) {
    return res.status(400).json({ message: "Invalid ID Number (must be exactly 13 digits)" });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  
  if (!validateInput(password, "password")) {
    return res.status(400).json({ 
      message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&#)" 
    });
  }

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
// Login Route (Enhanced with NoSQL Protection)
// ---------------------
app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  // Type checking - ensure strings only
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: "Invalid input format" });
  }

  email = sanitizeHtml(email.trim().toLowerCase());
  password = sanitizeHtml(password);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    // Use explicit string matching to prevent operator injection
    const user = await User.findOne({ 
      email: { $eq: email }  // Explicit equality check
    });
    
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
// Payment Route (Enhanced with Length Limits)
// ---------------------
app.post("/payments", authMiddleware, async (req, res) => {
  let { recipientName, bank, accountNumber, recipientEmail, currency, amount, reference, swiftCode } = req.body;
  const userId = req.session.userId;

  // Sanitization
  recipientName = sanitizeHtml(recipientName?.trim() || "");
  bank = sanitizeHtml(bank?.trim() || "");
  accountNumber = (accountNumber || "").replace(/\D/g, "");
  recipientEmail = sanitizeHtml(recipientEmail?.trim().toLowerCase() || "");
  reference = sanitizeHtml(reference?.trim() || "");
  swiftCode = sanitizeHtml(swiftCode?.trim().toUpperCase() || "");

  // Length validation (prevent buffer overflow)
  if (recipientName.length > 50) return res.status(400).json({ message: "Recipient name too long" });
  if (bank.length > 100) return res.status(400).json({ message: "Bank name too long" });
  if (accountNumber.length > 12) return res.status(400).json({ message: "Account number too long" });
  if (recipientEmail.length > 100) return res.status(400).json({ message: "Email too long" });
  if (reference && reference.length > 200) return res.status(400).json({ message: "Reference too long (max 200 characters)" });
  if (swiftCode && swiftCode.length > 11) return res.status(400).json({ message: "SWIFT code too long" });

  // Check for missing fields
  const missing = [];
  if (!recipientName) missing.push("recipientName");
  if (!bank) missing.push("bank");
  if (!accountNumber) missing.push("accountNumber");
  if (!recipientEmail) missing.push("recipientEmail");
  if (!currency) missing.push("currency");
  if (!amount) missing.push("amount");
  
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  // Enhanced validation
  if (!validateName(recipientName)) {
    return res.status(400).json({ message: "Invalid recipient name format" });
  }
  
  if (!validateName(bank)) {
    return res.status(400).json({ message: "Invalid bank name format" });
  }
  
  if (!validateAccountNumber(accountNumber)) {
    return res.status(400).json({ message: "Invalid account number (6-12 digits required)" });
  }
  
  if (!validateEmail(recipientEmail)) {
    return res.status(400).json({ message: "Invalid recipient email format" });
  }
  
  if (!validateCurrency(currency)) {
    return res.status(400).json({ message: "Unsupported currency (USD, ZAR, EUR, GBP, JPY only)" });
  }
  
  if (!validateAmount(amount)) {
    return res.status(400).json({ message: "Invalid amount (must be a positive number with max 2 decimal places)" });
  }
  
  if (!validateReference(reference)) {
    return res.status(400).json({ message: "Invalid reference format (max 200 characters, alphanumeric only)" });
  }
  
  if (!validateSWIFT(swiftCode)) {
    return res.status(400).json({ message: "Invalid SWIFT code (8-11 alphanumeric characters)" });
  }

  try {
    const newPayment = await Payment.create({
      userId,
      recipientName,
      bank,
      accountNumber,
      recipientEmail,
      currency,
      amount: parseFloat(amount),
      reference,
      swiftCode
    });

    res.status(201).json({ message: "Payment saved!", paymentId: newPayment._id });
  } catch (err) {
    res.status(500).json({ message: "Error saving payment", error: err.message });
  }
});












// =====================
// HTTPS Server with Enhanced Security
// =====================
const options = {
  key: fs.readFileSync("./localhost+2-key.pem"),
  cert: fs.readFileSync("./localhost+2.pem"),
  
  // Enhanced TLS Configuration
  minVersion: 'TLSv1.2',  // Minimum TLS version (disables TLS 1.0 and 1.1)
  maxVersion: 'TLSv1.3',  // Maximum TLS version
  
  // Cipher suites for strong encryption (Perfect Forward Secrecy)
  ciphers: [
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305',
    'DHE-RSA-AES128-GCM-SHA256',
    'DHE-RSA-AES256-GCM-SHA384'
  ].join(':'),
  
  // Prefer server ciphers over client ciphers
  honorCipherOrder: true,
  
  // Enable session resumption for performance
  sessionTimeout: 300,
  
  // Disable SSL compression (prevents CRIME attack)
  secureOptions: 0x00040000  // SSL_OP_NO_COMPRESSION constant value
};

const PORT = 3001;

// Log certificate information when server starts
logCertificateInfo();

// Create and start the HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Secure server running on https://localhost:${PORT}`);
});