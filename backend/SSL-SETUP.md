# SSL/TLS Security Configuration

## Overview
This application uses HTTPS with enhanced TLS configuration for secure data transmission.

## Security Features Implemented

### 1. TLS Version Control
- **Minimum Version**: TLS 1.2
- **Maximum Version**: TLS 1.3
- **Disabled**: TLS 1.0, TLS 1.1, SSL v2, SSL v3 (known vulnerabilities)

### 2. Strong Cipher Suites
Using modern cipher suites that provide:
- Perfect Forward Secrecy (PFS)
- AEAD (Authenticated Encryption with Associated Data)
- Protection against known attacks (BEAST, CRIME, POODLE)

### 3. HSTS (HTTP Strict Transport Security)
- **Max-Age**: 31536000 seconds (1 year)
- **Include Subdomains**: Enabled
- **Preload**: Enabled

### 4. Session Security
- Secure cookies (HTTPS only)
- HttpOnly flag (prevents XSS)
- SameSite: Strict
- Session timeout: 1 hour

### 5. Certificate Management
- Self-signed certificates for development (localhost)
- Generated using mkcert
- For production: Use Let's Encrypt or commercial CA

## Certificate Generation
Certificates were generated using mkcert:
```bash
mkcert localhost 127.0.0.1 ::1