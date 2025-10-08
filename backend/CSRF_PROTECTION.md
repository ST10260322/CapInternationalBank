# CSRF Protection Implementation

## Overview
Cross-Site Request Forgery (CSRF) protection prevents unauthorized commands from being transmitted from a user that the web application trusts.

## How It Works
1. Server generates a unique CSRF token for each session
2. Token is sent to the client via `/csrf-token` endpoint
3. Client includes token in header (`X-CSRF-Token`) for all state-changing requests
4. Server validates token before processing request

## Protected Routes
All POST, PUT, DELETE, and PATCH requests require a valid CSRF token:
- `/register`
- `/login`
- `/payments`

## Token Delivery
- Token retrieved via GET request to `/csrf-token`
- Included in `X-CSRF-Token` header for subsequent requests
- Token is session-specific and expires with the session

## Security Benefits
- Prevents unauthorized state-changing operations
- Protects against one-click attacks
- Validates request origin
- Works in conjunction with SameSite cookies

## Implementation Details
- Uses `csurf` middleware
- Cookie-based token storage with httpOnly flag
- Secure flag enabled (HTTPS only)
- SameSite: Strict
- Custom error handling for invalid tokens