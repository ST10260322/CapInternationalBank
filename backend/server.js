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
import cookieParser from "cookie-parser";
import crypto from 'crypto';
import { employeeAuthMiddleware } from "./middleware/employeeAuth.js";
import mongoose from "./database.js"; // MongoDB connection
import User from "./models/User.js";
import Payment from "./models/Payment.js";
import ExpressBrute from "express-brute";
import MongooseStore from "express-brute-mongoose";
import hpp from "hpp";
import { registerSchema, loginSchema, paymentSchema, employeeLoginSchema } from './validation/schemas.js';
import { validate } from './middleware/validate.js';
import { securityLogger, logSecurityEvent, SecurityEvents } from './utils/logger.js'; 



// Generate unique account number
function generateAccountNumber() {
  // Format: ACC + timestamp + random 4 digits
  // Example: ACC1730152430001234
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ACC${timestamp}${random}`;
}

const app = express();

// Minimal middleware needed for /csrf-token endpoint
app.use(cookieParser());
app.use(cors({
  origin: "https://localhost:3000",
  credentials: true
}));


app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});



// CSRF Token Endpoint
app.get("/csrf-token", (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('_csrf', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',  
      path: '/',
      domain: 'localhost'  
    });
    console.log('[CSRF Token] Token generated and cookie set:', token);
    res.json({ csrfToken: token });
  } catch (error) {
    console.error('[CSRF Token] Error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});


// Express Brute Configuration for Brute Force Protection
const bruteForceSchema = new mongoose.Schema({
  _id: String,
  data: {
    count: Number,
    lastRequest: Date,
    firstRequest: Date
  },
  expires: { type: Date, index: { expires: '1d' }}
});

const BruteForceModel = mongoose.model("bruteforce", bruteForceSchema);
const bruteForceStore = new MongooseStore(BruteForceModel);

const bruteforce = new ExpressBrute(bruteForceStore, {
  freeRetries: 15,
  minWait: 1 * 60 * 1000,
  maxWait: 5 * 60 * 1000,
  lifetime: 60 * 60,
  failCallback: function (req, res, next, nextValidRequestDate) {
    
    logSecurityEvent(SecurityEvents.BRUTE_FORCE_BLOCKED, {
      ip: req.ip,
      path: req.path,
      nextValidRequestDate: nextValidRequestDate
    });
    
    res.status(429).json({ 
      message: "Too many failed login attempts. Please try again later.",
      nextValidRequestDate: nextValidRequestDate 
    });
  }
});


// Security Middleware
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



// Limit request body size to prevent DoS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));






// Additional SSL/TLS Security Headers
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












// Session Middleware
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


// CSRF Protection 

const csrfProtection = csrf({ 
  cookie: {
    key: '_csrf',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});




















// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res) => {
  
    logSecurityEvent(SecurityEvents.RATE_LIMIT_EXCEEDED, {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      message: "Too many requests from this IP, please try again later."
    });
  }
});

app.use("/login", limiter);
app.use("/register", limiter);
app.use("/payments", limiter);

// Rate limiting for employee routes
app.use("/employee/login", limiter);
app.use("/employee/create-user", limiter);
app.use("/employee/stats", limiter);
app.use("/employee/users", limiter);
app.use("/employee/transactions", limiter);

// HTTP Parameter Pollution Protection
app.use(hpp({
  whitelist: ['currency', 'amount', 'page', 'limit', 'status', 'search', 'sortBy', 'sortOrder']
}));





//Input Validation with Length Limits
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


//Input Validation

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
  if (!reference) return true; 
  // Allow alphanumeric, spaces, and common punctuation
  return validator.isLength(reference, { max: 200 }) &&
         /^[A-Za-z0-9\s\-_.,!?()]+$/.test(reference);
}






// NoSQL Injection Middleware
const noSQLInjectionMiddleware = (req, res, next) => {
  console.log('[NoSQL Middleware] Checking request...');
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('[NoSQL Middleware] Original body:', req.body);
      req.body = sanitizeRequestBody(req.body);
      console.log('[NoSQL Middleware] Sanitized body:', req.body);
    }
    
    if (req.query && Object.keys(req.query).length > 0) {
      validateQueryOrParams(req.query, 'query');
    }
    
    if (req.params && Object.keys(req.params).length > 0) {
      validateQueryOrParams(req.params, 'params');
    }
    
    console.log('[NoSQL Middleware] ✅ Passed');
    next();
  } catch (error) {
    console.error('[NoSQL Middleware] ❌ ERROR:', error.message);
    
    
    logSecurityEvent(SecurityEvents.NOSQL_INJECTION_ATTEMPT, {
      ip: req.ip,
      path: req.path,
      method: req.method,
      error: error.message,
      body: JSON.stringify(req.body)
    });
    
    return res.status(400).json({ 
      message: "Invalid request format", 
      error: error.message 
    });
  }
};

// Apply middleware to all routes
app.use(noSQLInjectionMiddleware);





// NoSQL Injection Prevention

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


/**
 * Validates query or params without modifying them
 */
function validateQueryOrParams(obj, type) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    // Check for MongoDB operators
    if (key.startsWith('$')) {
      throw new Error(`Invalid ${type}: Operators not allowed`);
    }
    
    // Check nested objects
    if (typeof value === 'object' && value !== null) {
      preventNoSQLInjection(value, key);
    }
  }
}








// Request Size Validation Middleware
const validateRequestSize = (req, res, next) => {
  console.log('[Request Size Validator] Checking...');
  
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log('[Request Size Validator] ✅ No body or empty body');
    return next();
  }
  
  const MAX_FIELDS = 20;
  
  if (Object.keys(req.body).length > MAX_FIELDS) {
    console.log('[Request Size Validator] ❌ Too many fields');
    return res.status(400).json({ 
      message: "Too many fields in request body" 
    });
  }
  
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string' && value.length > 10000) {
      console.log(`[Request Size Validator] ❌ Field '${key}' too long`);
      return res.status(400).json({ 
        message: `Field '${key}' exceeds maximum length of 10000 characters` 
      });
    }
  }
  
  console.log('[Request Size Validator] ✅ Passed');
  next();
};

// Apply to all routes
app.use(validateRequestSize);










// SSL/TLS Certificate Information
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


// SSL/TLS Information Endpoint
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









// Routes
app.get("/", (req, res) => res.send("Backend is running!"));










// Register Route - DISABLED (Only employees can create accounts)
app.post("/register", async (req, res) => {
  console.log('[Register] Self-registration attempt blocked');
  
  logSecurityEvent(SecurityEvents.UNAUTHORIZED_ACCESS, {
    route: '/register',
    ip: req.ip,
    reason: 'Self-registration disabled - customers must be created by employees'
  });
  
  return res.status(403).json({ 
    message: "Self-registration is disabled. Please contact our support team to create an account.",
    contactInfo: "Visit your nearest CAP International Bank branch or call 1-800-CAP-BANK"
  });
});

















// Login Route 
app.post("/login", validate(loginSchema), bruteforce.prevent, async (req, res) => {
  let { accountNumber, password } = req.body;

  // Type checking - ensure strings only
  if (typeof accountNumber !== 'string' || typeof password !== 'string') {
    logSecurityEvent(SecurityEvents.INVALID_INPUT, {
      route: '/login',
      ip: req.ip,
      reason: 'Invalid input type'
    });
    return res.status(400).json({ message: "Invalid input format" });
  }

  accountNumber = sanitizeHtml(accountNumber.trim());
  password = sanitizeHtml(password);

  if (!accountNumber || !password) {
    return res.status(400).json({ message: "Account number and password are required" });
  }

  try {
    // Find user by account number
    const user = await User.findOne({ 
      accountNumber: { $eq: accountNumber }  
    });
    
    if (!user) {
      logSecurityEvent(SecurityEvents.LOGIN_FAILURE, {
        accountNumber: accountNumber,
        ip: req.ip,
        reason: 'Account not found'
      });
      return res.status(400).json({ message: "Invalid account number or password" });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      logSecurityEvent(SecurityEvents.ACCOUNT_LOCKED, {
        accountNumber: accountNumber,
        userId: user._id,
        ip: req.ip,
        lockTimeRemaining: lockTimeRemaining
      });
      return res.status(423).json({ 
        message: `Account is locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      await user.incLoginAttempts();
      
      logSecurityEvent(SecurityEvents.LOGIN_FAILURE, {
        accountNumber: accountNumber,
        userId: user._id,
        ip: req.ip,
        loginAttempts: user.loginAttempts + 1,
        reason: 'Incorrect password'
      });
      
      const updatedUser = await User.findById(user._id);
      if (updatedUser.isLocked) {
        logSecurityEvent(SecurityEvents.ACCOUNT_LOCKED, {
          accountNumber: accountNumber,
          userId: user._id,
          ip: req.ip,
          reason: 'Too many failed attempts'
        });
        return res.status(423).json({ 
          message: "Too many failed login attempts. Your account has been locked for 2 hours."
        });
      }
      
      return res.status(400).json({ message: "Invalid account number or password" });
    }

    // Successful login - reset login attempts if any exist
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
      logSecurityEvent(SecurityEvents.ACCOUNT_UNLOCKED, {
        accountNumber: accountNumber,
        userId: user._id,
        ip: req.ip
      });
    }

    req.session.userId = user._id;
    
    logSecurityEvent(SecurityEvents.LOGIN_SUCCESS, {
      accountNumber: accountNumber,
      userId: user._id,
      ip: req.ip,
      sessionId: req.session.id
    });
    
    // Return user name for welcome message
    res.json({ 
      message: "Login successful!", 
      userId: user._id,
      name: user.name,           
      surname: user.surname     
    });
  } catch (err) {
    securityLogger.error('Login error', {
      error: err.message,
      stack: err.stack,
      ip: req.ip
    });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});









// Auth Middleware
function authMiddleware(req, res, next) {
  if (!req.session.userId) {
    
    logSecurityEvent(SecurityEvents.UNAUTHORIZED_ACCESS, {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    return res.status(401).json({ message: "Unauthorized: Please log in first" });
  }
  next();
}









// Payment Route 
app.post("/payments", authMiddleware, validate(paymentSchema), async (req, res) => {
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














// Employee Login Route
app.post("/employee/login", validate(employeeLoginSchema), bruteforce.prevent, async (req, res) => {
  let { email, password } = req.body;

  // Type checking - ensure strings only
  if (typeof email !== 'string' || typeof password !== 'string') {
    logSecurityEvent(SecurityEvents.INVALID_INPUT, {
      route: '/employee/login',
      ip: req.ip,
      reason: 'Invalid input type'
    });
    return res.status(400).json({ message: "Invalid input format" });
  }

  email = sanitizeHtml(email.trim().toLowerCase());
  password = sanitizeHtml(password);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  if (!validateEmail(email)) {
    logSecurityEvent(SecurityEvents.INVALID_INPUT, {
      route: '/employee/login',
      email: email,
      ip: req.ip,
      reason: 'Invalid email format'
    });
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ 
      email: { $eq: email },
      isEmployee: true  
    });
    
    if (!user) {
      logSecurityEvent(SecurityEvents.LOGIN_FAILURE, {
        email: email,
        ip: req.ip,
        reason: 'Employee account not found'
      });
      return res.status(400).json({ message: "Invalid credentials or not an employee account" });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      logSecurityEvent(SecurityEvents.ACCOUNT_LOCKED, {
        email: email,
        userId: user._id,
        ip: req.ip,
        lockTimeRemaining: lockTimeRemaining,
        accountType: 'employee'
      });
      return res.status(423).json({ 
        message: `Account is locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      await user.incLoginAttempts();
      
      logSecurityEvent(SecurityEvents.LOGIN_FAILURE, {
        email: email,
        userId: user._id,
        ip: req.ip,
        loginAttempts: user.loginAttempts + 1,
        reason: 'Incorrect password',
        accountType: 'employee'
      });
      
      const updatedUser = await User.findById(user._id);
      if (updatedUser.isLocked) {
        logSecurityEvent(SecurityEvents.ACCOUNT_LOCKED, {
          email: email,
          userId: user._id,
          ip: req.ip,
          reason: 'Too many failed attempts',
          accountType: 'employee'
        });
        return res.status(423).json({ 
          message: "Too many failed login attempts. Your account has been locked for 2 hours."
        });
      }
      
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Successful login - reset login attempts if any exist
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
      logSecurityEvent(SecurityEvents.ACCOUNT_UNLOCKED, {
        email: email,
        userId: user._id,
        ip: req.ip,
        accountType: 'employee'
      });
    }

    req.session.userId = user._id;
    req.session.isEmployee = true;
    
    logSecurityEvent(SecurityEvents.LOGIN_SUCCESS, {
      email: email,
      userId: user._id,
      ip: req.ip,
      sessionId: req.session.id,
      accountType: 'employee'
    });
    
    res.json({ 
      message: "Employee login successful!", 
      userId: user._id,
      isEmployee: true,
      employeeId: user.employeeId,
      name: user.name,
      department: user.department
    });
  } catch (err) {
    securityLogger.error('Employee login error', {
      error: err.message,
      stack: err.stack,
      ip: req.ip
    });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});









// CREATE USER ACCOUNT (Employee Only)
app.post("/employee/create-user", employeeAuthMiddleware, validate(registerSchema), async (req, res) => {
  console.log('[Create User] Employee creating new user account');
  
  let { name, surname, idNumber, email, password } = req.body;

  // Type checking - ensure all inputs are strings
  if (typeof name !== 'string' || typeof surname !== 'string' || 
      typeof idNumber !== 'string' || typeof email !== 'string' || 
      typeof password !== 'string') {
    
    logSecurityEvent(SecurityEvents.INVALID_INPUT, {
      route: '/employee/create-user',
      employeeId: req.employee._id,
      ip: req.ip,
      reason: 'Invalid input type'
    });
    
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

    // Generate unique account number
    const accountNumber = generateAccountNumber();

    const newUser = await User.create({
      name,
      surname,
      idNumber,
      accountNumber,
      email,
      password: hashedPassword
    });

    // Security logging for employee-created user
    logSecurityEvent(SecurityEvents.SESSION_CREATED, {
      email: email,
      accountNumber: accountNumber,
      userId: newUser._id,
      createdBy: req.employee._id,
      createdByEmployeeId: req.employee.employeeId,
      ip: req.ip,
      action: 'User created by employee'
    });

    // Return user details (employee needs to give these to customer)
    res.status(201).json({ 
      message: "User account created successfully!", 
      user: {
        userId: newUser._id,
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        accountNumber: accountNumber,
        temporaryPassword: password, // Return the plain password so employee can give to customer
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      // Check which field caused the duplicate
      const field = err.keyPattern.email ? 'Email' : 'Account number';
      
      logSecurityEvent(SecurityEvents.SUSPICIOUS_ACTIVITY, {
        email: email,
        employeeId: req.employee._id,
        ip: req.ip,
        reason: `Attempted duplicate user creation - ${field} already exists`
      });
      
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    // Security logging for creation errors
    securityLogger.error('User creation error', {
      error: err.message,
      employeeId: req.employee._id,
      ip: req.ip
    });
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
});









// Get Employee Dashboard Stats
app.get("/employee/stats", employeeAuthMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isEmployee: false });
    const totalEmployees = await User.countDocuments({ isEmployee: true });
    
    const totalTransactions = await Payment.countDocuments();
    const pendingTransactions = await Payment.countDocuments({ status: 'pending' });
    const approvedTransactions = await Payment.countDocuments({ status: 'approved' });
    const rejectedTransactions = await Payment.countDocuments({ status: 'rejected' });
    
    // Calculate total transaction value
    const transactionStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" }
        }
      }
    ]);
    
    // Get recent activity (last 5 transactions)
    const recentActivity = await Payment.find()
      .populate('userId', 'name surname email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users: {
        total: totalUsers,
        employees: totalEmployees
      },
      transactions: {
        total: totalTransactions,
        pending: pendingTransactions,
        approved: approvedTransactions,
        rejected: rejectedTransactions,
        totalAmount: transactionStats[0]?.totalAmount || 0,
        avgAmount: transactionStats[0]?.avgAmount || 0
      },
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
});


// Get All Users (with pagination and search)
app.get("/employee/users", employeeAuthMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = { isEmployee: false };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { surname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});


// Get User Details with Transaction History
app.get("/employee/users/:userId", employeeAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const transactions = await Payment.find({ userId })
      .sort({ createdAt: -1 });
    
    const transactionStats = await Payment.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      user,
      transactions,
      stats: transactionStats[0] || {
        totalAmount: 0,
        totalTransactions: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user details", error: err.message });
  }
});



// Get All Transactions (with filtering)
app.get("/employee/transactions", employeeAuthMiddleware, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { recipientName: { $regex: search, $options: 'i' } },
        { bank: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } },
        { recipientEmail: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const transactions = await Payment.find(query)
      .populate('userId', 'name surname email')
      .populate('reviewedBy', 'name surname employeeId')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Payment.countDocuments(query);
    
    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalTransactions: count
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions", error: err.message });
  }
});



// Get Single Transaction Details
app.get("/employee/transactions/:transactionId", employeeAuthMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Payment.findById(transactionId)
      .populate('userId', 'name surname email idNumber')
      .populate('reviewedBy', 'name surname employeeId department');
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    res.json({ transaction });
  } catch (err) {
    res.status(500).json({ message: "Error fetching transaction", error: err.message });
  }
});


// Approve Transaction
app.post("/employee/transactions/:transactionId/approve", employeeAuthMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.params;
    let { comment } = req.body;
    
    // Sanitize comment
    comment = comment ? sanitizeHtml(comment.trim()) : '';
    
    const transaction = await Payment.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ 
        message: `Transaction already ${transaction.status}` 
      });
    }
    
    transaction.status = 'approved';
    transaction.reviewedBy = req.employee._id;
    transaction.reviewedAt = new Date();
    transaction.reviewComment = comment;
    
    await transaction.save();
    
    // Populate for response
    await transaction.populate('userId', 'name surname email');
    await transaction.populate('reviewedBy', 'name surname employeeId');
    
    res.json({ 
      message: "Transaction approved successfully", 
      transaction 
    });
  } catch (err) {
    res.status(500).json({ message: "Error approving transaction", error: err.message });
  }
});



// Reject Transaction
app.post("/employee/transactions/:transactionId/reject", employeeAuthMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.params;
    let { comment } = req.body;
    
    // Sanitize comment
    comment = comment ? sanitizeHtml(comment.trim()) : '';
    
    if (!comment) {
      return res.status(400).json({ 
        message: "Rejection reason is required" 
      });
    }
    
    const transaction = await Payment.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ 
        message: `Transaction already ${transaction.status}` 
      });
    }
    
    transaction.status = 'rejected';
    transaction.reviewedBy = req.employee._id;
    transaction.reviewedAt = new Date();
    transaction.reviewComment = comment;
    
    await transaction.save();
    
    // Populate for response
    await transaction.populate('userId', 'name surname email');
    await transaction.populate('reviewedBy', 'name surname employeeId');
    
    res.json({ 
      message: "Transaction rejected successfully", 
      transaction 
    });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting transaction", error: err.message });
  }
});


// Get Employee Profile
app.get("/employee/profile", employeeAuthMiddleware, async (req, res) => {
  try {
    const employee = await User.findById(req.employee._id).select('-password');
    
    // Get review statistics
    const reviewStats = await Payment.aggregate([
      { $match: { reviewedBy: mongoose.Types.ObjectId(req.employee._id) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stats = {
      approved: 0,
      rejected: 0
    };
    
    reviewStats.forEach(stat => {
      if (stat._id === 'approved') stats.approved = stat.count;
      if (stat._id === 'rejected') stats.rejected = stat.count;
    });
    
    res.json({
      employee,
      reviewStats: stats
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});





// Security Logs Endpoint (for demonstration/monitoring)
app.get("/security-logs", employeeAuthMiddleware, (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const logsDir = path.join(__dirname, 'logs');
    const today = new Date().toISOString().split('T')[0];
    const securityLogFile = path.join(logsDir, `security-${today}.log`);
    
    if (fs.existsSync(securityLogFile)) {
      const logs = fs.readFileSync(securityLogFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .slice(-50) // Last 50 entries
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });
      
      res.json({ logs, count: logs.length });
    } else {
      res.json({ logs: [], message: 'No security logs for today' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error reading logs', error: err.message });
  }
});





// HTTPS Server with Enhanced Security
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