# Authentication

## Overview

JWT-based authentication with cookie and header token support, optional two-factor authentication (2FA), email verification, and token blacklisting via Redis.

## Token Strategy

### JWT Configuration

- **Secret**: `JWT_SECRET` env var (min 32 characters, required)
- **Expiration**: 1 hour
- **Algorithm**: HS256 (default)
- **Claims**: `{ sub: userId, isEmailVerified: boolean, jti: string }`

### Token Delivery

1. **Cookie** (primary): `access_token` httpOnly cookie
   - `httpOnly: true`
   - `secure: true` in production (requires HTTPS)
   - `sameSite: 'none'` in production, `'lax'` in development
   - `domain`: `COOKIE_DOMAIN` env var
   - `maxAge`: 1 hour

2. **Authorization header**: `Bearer <token>` (fallback)

### Token Extraction Order

The `JwtStrategy` (`src/lib/jwt-strategy.ts`) extracts tokens in this order:
1. `request.cookies['access_token']`
2. `Authorization: Bearer <token>` header

## Authentication Flow

### Registration

```
1. Client POSTs to /api/v1/auth/register with { name, email, password }
2. Server validates input, hashes password with bcrypt (12 rounds default)
3. Server generates email verification token (32-byte random hex)
4. Server creates user with isEmailVerified: false
5. Server sends verification email (non-blocking, failures logged)
6. Server generates JWT with isEmailVerified: false
7. Server sets access_token cookie and returns { message }
```

### Email Verification

```
1. User clicks verification link from email
2. Client POSTs to /api/v1/auth/verify-email with { token }
3. Server validates token exists, hasn't expired, email not already verified
4. Server updates user: isEmailVerified: true, clears token and expiry
5. User can now log in
```

### Login (without 2FA)

```
1. Client POSTs to /api/v1/auth/login with { email, password }
2. Server finds user by email, compares bcrypt hash
3. Server checks isEmailVerified (rejects if false)
4. Server generates JWT with jti (random UUID for blacklisting)
5. Server sets access_token cookie
6. Server returns { token, user: { userId, name, email } }
```

### Login (with 2FA)

```
1. Client POSTs to /api/v1/auth/login with { email, password }
2. Server validates credentials and email verification
3. Server generates 6-digit OTP, stores in user_otps table
4. Server sends OTP email (non-blocking)
5. Server generates temporary JWT with { sub, purpose: '2fa_login' } (5min expiry)
6. Server returns { requiresOtp: true, tempToken }

7. Client POSTs to /api/v1/auth/verify-otp-login with { tempToken, otp }
8. Server verifies tempToken, checks purpose claim
9. Server validates OTP (not expired, not used, matches user)
10. Server marks OTP as used
11. Server generates full JWT
12. Server sets access_token cookie
13. Server returns { token, user }
```

### Logout

```
1. Client POSTs to /api/v1/auth/logout (requires auth)
2. Server clears access_token cookie (maxAge: 0)
3. Server returns { message }
```

Note: Logout clears the cookie but does not blacklist the JWT. Token blacklisting infrastructure exists in `TokenBlacklistService` but is not currently invoked on logout.

### Password Reset

```
1. Client POSTs to /api/v1/auth/forgot-password with { email }
2. Server finds user (if exists), invalidates previous reset tokens
3. Server generates reset token (32-byte random hex), stores with expiry
4. Server sends reset email with link (non-blocking)
5. Server always returns same message (prevents user enumeration)

6. User clicks reset link from email
7. Client POSTs to /api/v1/auth/reset-password with { token, password }
8. Server validates token (exists, not used, not expired)
9. Server hashes new password, updates user
10. Server marks token as used
```

### Resend Verification

```
1. Client POSTs to /api/v1/auth/resend-verification with { email }
2. Server validates user exists and is not yet verified
3. Server generates new verification token with fresh expiry
4. Server sends new verification email
```

## Guards

### JwtAuthGuard (`src/common/guards/jwt-auth.guard.ts`)

- Registered globally via `APP_GUARD`
- Extends Passport's `AuthGuard('jwt')`
- Checks for `@Public()` metadata; if present, skips authentication
- Delegates to Passport JWT strategy for token validation

### EmailVerifiedGuard (`src/common/guards/email-verified.guard.ts`)

- Registered globally via `APP_GUARD`
- Runs after `JwtAuthGuard` (so `request.user` is populated)
- Checks for `@Public()` or `@SkipEmailVerification()` metadata; if present, skips check
- Throws `ForbiddenException` if `user.isEmailVerified` is false

## Decorators

### `@Public()`

Marks a route as public (no JWT required). Defined in `src/common/decorators/public.decorator.ts`.

### `@SkipEmailVerification()`

Allows authenticated but unverified users to access a route. Defined in `src/common/decorators/public.decorator.ts`.

### `@CurrentUser()`

Extracts the authenticated user from `request.user`. Returns `{ userId, email, isEmailVerified }`. Defined in `src/common/decorators/current-user.decorator.ts`.

## Token Blacklisting

`TokenBlacklistService` (`src/modules/auth/token-blacklist.service.ts`) uses Redis to blacklist JWT tokens by their `jti` claim:

- Keys stored as `bl:{jti}` with TTL matching token expiry
- Only active when `REDIS_ENABLED=true`
- Currently wired into `JwtStrategy.validate()` (checks blacklist on every request)
- Not yet called during logout (token remains valid until expiry)

## Password Security

- Hashing: `bcrypt` with configurable rounds (default 12, range 10-14)
- Registration password validation: min 8 chars, must include uppercase, lowercase, number, and special character
- Reset password validation: min 8 chars

## Two-Factor Authentication (2FA)

- Opt-in per user via `POST /api/v1/auth/toggle-2fa`
- OTP is 6-digit numeric code, sent via email
- OTP expiry: `OTP_EXPIRY_MINUTES` env var (default 10 minutes)
- Previous unused OTPs for the same type are invalidated on new generation
- Temporary 2FA login token expires in 5 minutes

## Cookie Configuration

| Setting | Development | Production |
|---|---|---|
| `httpOnly` | `true` | `true` |
| `secure` | `false` | `true` |
| `sameSite` | `'lax'` | `'none'` |
| `domain` | `localhost` | `COOKIE_DOMAIN` |
| `path` | `/` | `/` |
| `maxAge` | 1 hour | 1 hour |

## WebSocket Authentication

Socket.IO connections authenticate via:
- `client.handshake.auth.token` (preferred)
- `client.handshake.headers.authorization` (Bearer token)

The gateway verifies the JWT on connection and stores the payload in `client.data.user`. Invalid tokens cause immediate disconnection.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | Yes | - | JWT signing secret (min 32 chars) |
| `COOKIE_DOMAIN` | No | `localhost` | Cookie domain |
| `COOKIE_SECURE` | No | `false` | Cookie secure flag |
| `BCRYPT_ROUNDS` | No | `12` | Bcrypt hash rounds (10-14) |
| `OTP_EXPIRY_MINUTES` | No | `10` | OTP validity duration |
| `VERIFICATION_TOKEN_EXPIRY_HOURS` | No | `24` | Email verification token lifetime |
| `PASSWORD_RESET_TOKEN_EXPIRY_HOURS` | No | `1` | Password reset token lifetime |
