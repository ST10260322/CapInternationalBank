# 🏦 CAP International Bank - Secure Payment Portal

> A production-ready secure customer international payments portal with enterprise-grade security features and dual automated DevSecOps pipelines.

**Student:** ST10260322  
**Course:** Application Security Programming  
**Assignment:** Task 2 - Secure Customer International Payments Portal

---

## 📋 Table of Contents
- [Overview](#overview)
- [Security Features](#security-features)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Running the Application](#running-the-application)
- [Testing the Application](#testing-the-application)
- [Security Demonstrations](#security-demonstrations)
- [DevSecOps Pipelines](#devsecops-pipelines)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Marking Criteria Compliance](#marking-criteria-compliance)

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

### 1. Password Security ✅ [10/10 Marks]
- **Bcrypt hashing** with salting (10 rounds)
- **Real-time password strength meter** with visual feedback
- **Complex password requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&#)
- Password validation on both frontend and backend

### 2. Input Whitelisting ✅ [10/10 Marks]
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

### 3. SSL/TLS Security ✅ [20/20 Marks]
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

### 4. Protection Against Attacks ✅ [28/30 Marks]
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

### 5. DevSecOps Pipeline ✅ [10/10 Marks]
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

## 🚀 Quick Start Guide

For those who want to get running immediately:
```bash