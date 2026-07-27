```markdown
# High Level Design Document

## 1. System Overview

The system is a NestJS 11-based backend serving a corporate growth application that allows Job Seekers to manage their personal profiles, input job advertisements, and receive ATS compatibility scores along with actionable recommendations. The application supports account security via JWT and two-factor authentication, email notifications, and provides customized PDF resume generation using predefined templates in English and Hindi. The backend serves a RESTful API under `/api/v1` and optionally offers real-time communication via Socket.IO.

## 2. User Roles

- **Job Seeker (User):**  
  Authenticated users who create and manage profiles (personal, educational, professional), input job advertisement details, view ATS scores and recommendations, generate resumes, configure account settings (language, theme, 2FA), and receive notifications.

- **System (Automated):**  
  Backend services that perform ATS scoring, resume PDF generation, send email notifications/reminders, and enforce security measures.

*(Admin or employer roles are out of scope.)*

## 3. Major Modules

### 3.1 Auth Module
- Handles user registration, login/logout, JWT issuance, 2FA via OTP, email verification, password reset, token blacklisting using Redis.
- Exposes endpoints such as register, login, logout, verify-email, resend-verification, forgot-password, reset-password, toggle-2fa.

### 3.2 Users Module
- Manages user profile CRUD operations (personal details, education, work experience, skills, projects).
- Manages user preferences: language (English/Hindi), UI theme (light/dark), email notification settings.
- Exposes endpoints for profile retrieval and update, email preferences.

### 3.3 Job Advertisements Module *(New Module to be implemented)*
- Stores and manages job advertisement data input by users including job description, requirements, and other relevant fields.
- Supports structured and semi-structured input for parsing ATS criteria.

### 3.4 ATS Scoring Module *(New or Service within Core Module)*
- Implements business logic to compare user profile with job advertisement data.
- Calculates an ATS compatibility score (numeric/percentage).
- Generates actionable feedback/suggestions to improve the user's profile and thus score.

### 3.5 Resume Generation Module *(New Module)*
- Generates customized PDF resumes using pre-built templates based on user profile and targeted job advertisement.
- Supports resume preview before download.
- Enforces ATS score threshold to limit resume generation.

### 3.6 Mail Module
- Provides email sending capabilities with SMTP provider abstraction.
- Sends notifications: verification emails, password resets, OTP codes for 2FA, reminders about profile/job deadlines.

### 3.7 Health Module
- Provides system health endpoints (`/api/health`, `/api/health/live`, `/api/health/ready`).

### 3.8 Chat Module *(Optional/Conditional)*
- Supports real-time Socket.IO communication (conditional on `SOCKETIO_ENDPOINT_ON`).
- Can be leveraged for future notifications or admin communication.

## 4. Service Boundaries

| Service/Module            | Responsibilities                                                                                      | Interfaces/Endpoints                           |
|--------------------------|----------------------------------------------------------------------------------------------------|-----------------------------------------------|
| Auth Module              | User authentication, JWT issuance, 2FA, email verification, password reset                         | `/api/v1/auth/*`                              |
| Users Module             | User profile and preferences management                                                           | `/api/v1/users/*`                             |
| Job Advertisements Module| CRUD for job advertisement data and criteria                                                      | `/api/v1/job-ads/*` (suggested)               |
| ATS Scoring Module       | Compute ATS score and generate improvement recommendations                                        | May expose endpoints like `/api/v1/ats/score`|
| Resume Generation Module | Generate and preview resumes as PDFs, enforce ATS threshold                                       | `/api/v1/resumes/*` (generate, preview)       |
| Mail Module              | Email dispatch for verification, OTPs, password resets, reminders                                  | Internal API consumed by Auth and Notification components |
| Health Module            | System health monitoring                                                                           | `/api/health*`                                |
| Chat Module (optional)   | Real-time communication and broadcast messaging                                                   | WebSocket `/ws`                               |

## 5. Database Overview

### 5.1 Database: PostgreSQL

- **Users Table:** Stores user account info including authentication fields (password hash, 2FA flag, email verification tokens), preferences (language, theme, notification toggle).
  
- **Additional User Profile Tables (to be designed):**  
  Separate tables for:
  - Personal details (extended user info)
  - Education entries
  - Work experience entries
  - Skills
  - Projects

- **Job Advertisements Table (to be designed):**  
  Stores job ad details, possibly with structured fields such as title, description, requirements, location, and metadata for ATS parsing.

- **ATS Scores and Recommendations Table (optional):**  
  Stores computed ATS scores and suggested improvements per user-job ad pair, may be calculated on-demand or cached.

- **Password Reset Tokens, User OTPs, and Token Blacklists:**  
  Existing tables for secure authentication workflows.

- **Audit & Metadata:**  
  Timestamps (`created_at`, `updated_at`), UUID primary keys, consistent snake_case column naming.

### 5.2 Caching & Session

- Redis used as cache layer and for token blacklisting.
- Redis-managed rate limiting.
- Redis optional; fallback to in-memory enabled.

## 6. External Integrations

- **SMTP Email Provider:**  
  Nodemailer configured via SMTP with support for secure mail transport, email templates with Handlebars.

- **Redis:**  
  For caching, distributed rate limiting, and token blacklisting.

- **PostgreSQL:**  
  Primary data store with secure SSL enabled in production.

- **Docker:**  
  Containerized deployment environment.

## 7. Security Considerations

- **Authentication:**  
  JWT with HS256 algorithm, mandatory 2FA with email OTPs enforced as per user settings.

- **Token handling:**  
  Access tokens delivered via httpOnly, secure cookies with domain and sameSite policies; fallback Authorization header used.

- **Token Blacklisting:**  
  Blacklisted JWTs stored in Redis for immediate invalidation.

- **Password Security:**  
  bcrypt password hashing with recommended rounds (default 12).

- **Email Verification:**  
  Required for account activation; tokens have expiration and single-use enforcement.

- **Rate Limiting:**  
  Global and per-endpoint throttling enforced using NestJS throttler backed by Redis when available.

- **Data Validation:**  
  Strict validation pipes strip unknown props and forbid non-whitelisted fields.

- **Security Headers:**  
  Helmet middleware configured to set HTTP headers.

- **CORS:**  
  Restricted origins in production via env var; credentials always enabled.

- **Sensitive Data:**  
  Environment variables validated, secrets never exposed in responses.

- **Secure Communication:**  
  SSL/TLS enforced for DB connections and cookie transport in production.

- **Error Handling:**  
  Consistent error response format without leaking internal details.

- **2FA:**  
  Enforced via OTP tokens with expiry, single-use, stored securely.

- **Resume Generation:**  
  Limited to users meeting ATS score threshold to prevent abuse.

## 8. Deployment Architecture

### 8.1 Containerization

- Multi-stage Docker build producing lightweight production image.
- Frontend build artifacts copied into backend container for static serving.
- Container listens on port 5701.

### 8.2 Environment Configuration

- Environment variables loaded per environment (.env files for local, env vars injected in production).
- Strict validation using Joi.
- SSL configuration enabled for DB and cookies.

### 8.3 Scaling & Availability

- Stateless backend enabling horizontal scaling behind load balancers.
- Redis as a centralized cache and rate limiter.
- PostgreSQL as primary consistent data store.

### 8.4 Health and Readiness

- Kubernetes or orchestrator friendly health endpoints (`/api/health/live`, `/api/health/ready`).
- Automatic shutdown hooks for graceful termination.

### 8.5 Security Enhancements

- HTTPS termination (outside container scope, handled by ingress/load balancer).
- Secure cookie settings and Helmet middleware inside app.

### 8.6 Logging & Monitoring *(Future Enhancement)*

- System to emit structured logs and metrics (not described in current boilerplate).

---

# Summary

This backend system is a modular, secure, and performant NestJS application that provides comprehensive user management, ATS scoring, resume generation, and notification support. It leverages PostgreSQL for reliable data persistence, Redis for caching and security, and SMTP for transactional emails. Authentication is robust with mandatory 2FA and email verification. The system supports localization (English/Hindi) and UI theming which are persisted as user preferences. The architecture supports seamless deployment within containerized environments with production-grade security and observability features.
```