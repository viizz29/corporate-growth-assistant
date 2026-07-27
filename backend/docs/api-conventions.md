# API Conventions

## Base URL

All API endpoints are prefixed with `/api/v1` (configurable via `API_BASE_URL` env var).

Health endpoints bypass this prefix: `/api/health`.

## Request/Response Format

- **Content-Type**: `application/json` for all API requests and responses
- **Field naming**: Responses automatically convert `snake_case` DB columns to `camelCase` via `FieldNameTransformerInterceptor`
- **Validation**: Request bodies are validated by `ValidationPipe` with `whitelist: true` (strips unknown properties) and `forbidNonWhitelisted: true` (rejects unknown properties)

## Authentication

- JWT tokens delivered via **httpOnly cookies** (`access_token`) and/or **Authorization header** (`Bearer <token>`)
- The JWT strategy extracts tokens from cookies first, then falls back to the Authorization header
- Protected routes require a valid JWT; public routes use the `@Public()` decorator
- Email-verified users only: most protected routes additionally require `isEmailVerified: true` (skip with `@SkipEmailVerification()`)

## Swagger Documentation

- Available at `/docs` in non-production environments
- Uses Bearer auth scheme (`bearerAuth`) for JWT token testing
- Custom initialization script served from `/api/swagger-init.js`

## Rate Limiting

| Scope | Limit | TTL |
|---|---|---|
| Global default | 20 requests | 60s |
| Auth controller (all routes) | 10 requests | 60s |
| Register | 5 requests | 60s |
| Login | 5 requests | 60s |
| Forgot password | 3 requests | 60s |
| Resend verification | 3 requests | 60s |

Rate limiting is backed by Redis when `REDIS_ENABLED=true`.

## Auth Endpoints

### `POST /api/v1/auth/register`

Register a new user account.

**Request:**
```json
{
  "name": "John",
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
```

**Password requirements:** Min 8 characters, must include uppercase, lowercase, number, and special character.

**Response (201):**
```json
{
  "message": "Account created successfully. Please check your email to verify your account."
}
```

**Errors:** `409` - Email already in use.

---

### `POST /api/v1/auth/login`

Authenticate a user. Returns JWT token (or OTP prompt if 2FA enabled).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
```

**Response without 2FA (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "uuid",
    "name": "John",
    "email": "user@example.com"
  }
}
```

**Response with 2FA enabled (200):**
```json
{
  "requiresOtp": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:** `401` - Invalid credentials or unverified email.

---

### `POST /api/v1/auth/verify-otp-login`

Complete 2FA login with OTP code.

**Request:**
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIs...",
  "otp": "123456"
}
```

**Response (200):** Same as login response without 2FA.

**Errors:** `401` - Invalid/expired OTP or temp token.

---

### `POST /api/v1/auth/logout`

Clear the authentication cookie.

**Auth required.**

**Response (200):**
```json
{
  "message": "Logged out successfully."
}
```

---

### `POST /api/v1/auth/verify-email`

Verify email address using the token sent via email.

**Request:**
```json
{
  "token": "abc123..."
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully. You can now log in."
}
```

**Errors:** `400` - Invalid/expired token or already verified.

---

### `POST /api/v1/auth/resend-verification`

Resend the email verification link.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification email resent successfully. Please check your email."
}
```

---

### `POST /api/v1/auth/forgot-password`

Request a password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

Note: Always returns the same message regardless of whether the email exists (prevents user enumeration).

---

### `POST /api/v1/auth/reset-password`

Reset password using the token from the email.

**Request:**
```json
{
  "token": "abc123...",
  "password": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset successfully."
}
```

**Errors:** `400` - Invalid/expired/used token.

---

### `POST /api/v1/auth/toggle-2fa`

Enable or disable two-factor authentication.

**Auth required.**

**Request:**
```json
{
  "enabled": true
}
```

**Response (200):**
```json
{
  "message": "Two-factor authentication enabled."
}
```

## User Endpoints

### `GET /api/v1/users/me`

Get the authenticated user's profile.

**Auth required.** (email verification skipped)

**Response (200):**
```json
{
  "userId": "uuid",
  "name": "John",
  "email": "user@example.com",
  "role": "user",
  "isEmailVerified": true,
  "is2faEnabled": false,
  "isEmailNotificationsEnabled": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

Note: `passwordHash` is never returned in responses.

---

### `PATCH /api/v1/users/me`

Update the authenticated user's profile.

**Auth required.** (email verification skipped)

**Request (all fields optional):**
```json
{
  "name": "Jane",
  "email": "newemail@example.com"
}
```

**Response (200):** Updated user profile (same shape as `GET /me`).

**Errors:** `409` - Email already in use by another account.

---

### `GET /api/v1/users/me/email-preferences`

Get email notification preferences.

**Auth required.** (email verification skipped)

**Response (200):**
```json
{
  "emailNotifications": true
}
```

---

### `PUT /api/v1/users/me/email-preferences`

Update email notification preferences.

**Auth required.** (email verification skipped)

**Request:**
```json
{
  "emailNotifications": false
}
```

**Response (200):**
```json
{
  "emailNotifications": false
}
```

## Health Endpoints

### `GET /api/health`

Full health check (database, Redis, memory, disk).

### `GET /api/health/live`

Liveness probe - always returns `200` with `{ "status": "ok" }`.

### `GET /api/health/ready`

Readiness probe (database, Redis).

## WebSocket (Socket.IO)

Enabled when `SOCKETIO_ENDPOINT_ON=true`. Default path: `/ws`.

**Connection:** Requires JWT token in `auth.token` or `Authorization` header.

**Events:**
- `hello` - Returns a greeting string
- `broadcast-hello` - Broadcasts a greeting to all connected clients via `greetings` event

## CORS Configuration

- **Development**: All origins allowed (`origin: true`)
- **Production**: Restricted to `CORS_ORIGIN` env var (default: `http://localhost:3000`)
- **Credentials**: Always enabled (`credentials: true`)

## Error Response Format

All error responses follow NestJS conventions:

```json
{
  "statusCode": 400,
  "message": ["field-specific error messages"],
  "error": "Bad Request"
}
```

For single string messages:

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```
