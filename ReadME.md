# 🏦 CAP International Bank - Secure Payment Portal

> A production-ready secure customer international payments portal with enterprise-grade security features and dual automated DevSecOps pipelines.

**Student:** ST10260322 and ST10262898  
**Course:** INSY7314  


---

## 🎯 Overview

This application is a secure international payments portal that implements multiple layers of security to protect against common web vulnerabilities. Built with React (frontend) and Node.js/Express (backend), it demonstrates industry best practices for secure web application development.

### Key Features
- User registration and authentication with session management
- International payment processing with multi-currency support
- Real-time password strength validation
- Comprehensive input validation and sanitization
- Encrypted communication via SSL/TLS
- Automated security scanning with dual CI/CD pipelines

---

## 🔒 Security Features

### 1. Password Security 
- **Bcrypt hashing** with salting (10 rounds)
- **Real-time password strength meter** with visual feedback
- **Complex password requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&#)
- Password validation on both frontend and backend

### 2. Input Whitelisting 
- **RegEx pattern matching** for all input fields
- **Professional validation** using validator.js library
- **NoSQL injection prevention** - blocks MongoDB operators
- **Length limits** to prevent buffer overflow attacks
- **HTML sanitization** using sanitize-html
- **Multiple validation layers:**
  - Type checking
  - Format validation
  - Length validation
  - Content sanitization

### 3. SSL/TLS Security 
- **TLS 1.2 and 1.3 only** (older versions disabled)
- **Perfect Forward Secrecy** enabled
- **HSTS** (HTTP Strict Transport Security) with 1-year max-age
- **Strong cipher suites** for encryption
- **Secure session management:**
  - HttpOnly cookies
  - Secure flag (HTTPS only)
  - SameSite: Strict
  - 1-hour session timeout
- **SSL compression disabled** (prevents CRIME attack)

### 4. Protection Against Attacks 
- **CSRF Protection** - Token-based validation for all state-changing requests
- **Helmet.js** - XSS protection, clickjacking prevention, CSP
- **Rate Limiting** - 100 requests per 15 minutes per IP (brute force protection)
- **CORS** - Restricted to specific origin
- **NoSQL Injection Prevention** - Operator blocking and sanitization
- **Request Size Limiting** - 10KB max body size (DoS prevention)
- **Field Count Limiting** - Max 20 fields per request
- **Additional Security Headers:**
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin

### 5. DevSecOps Pipeline 
**Dual automated security pipelines:**

#### GitHub Actions Pipeline
- Vulnerability scanning with npm audit
- Dependency security checks
- Hardcoded secret detection
- Security middleware verification
- Automated on every push
- Daily scheduled scans at 2 AM UTC
- 90-day report retention

#### CircleCI Pipeline
- Redundant security scanning
- Independent vulnerability checks
- Additional validation layer
- Parallel job execution
- Real-time status monitoring

---

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

### Required Software
1. **Node.js** (v18.0 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (v8.0 or higher)
   - Comes with Node.js
   - Verify: `npm --version`

3. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

4. **mkcert** (for SSL certificates)
   - macOS: `brew install mkcert`
   - Windows (Chocolatey): `choco install mkcert`
   - Linux: `sudo apt install mkcert`
   - Verify: `mkcert --version`

### Optional (for viewing pipelines)
- GitHub account (to view GitHub Actions)
- CircleCI account (to view CircleCI pipelines)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/ST10260322/CapInternationalBank.git
cd CapInternationalBank

Step 2: Install Dependencies

Backend:
cd backend
npm install

Frontend:
cd ../frontend
npm install

Step 3: Trust SSL Certificates
# Install mkcert root certificate (one-time setup)
mkcert -install


Step 4: Start the Application
Terminal 1 - Backend Server:
cd backend
node server.js

Terminal 2 - Frontend Server:
cd frontend
npm start

Browser will automatically open to https://localhost:3000





🎮 Demo Accounts
Customer Account

Email: user@test.com
Password: Test123!@#

Employee Account

Email: messi@mail.com
Password: @Messi123!
Employee ID: EMP002





📁 Project Structure

CapInternationalBank/
├── backend/
│   ├── server.js              # Main Express server (900+ lines)
│   ├── database.js            # MongoDB Atlas connection
│   ├── models/                # User & Payment schemas
│   ├── middleware/            # Employee authentication
│   ├── *.pem                  # SSL certificates
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── utils/             # Password strength validator
│   │   └── api.js             # Axios with CSRF
│   └── package.json
├── .github/workflows/         # GitHub Actions pipeline
├── .circleci/                 # CircleCI pipeline
└── README.md


🛠️ Technology Stack
Frontend: React, React Router, Axios
Backend: Node.js, Express, MongoDB Atlas
Security: Bcrypt, Helmet.js, CSURF, Validator.js, Express-rate-limit
DevOps: GitHub Actions, CircleCI, npm audit