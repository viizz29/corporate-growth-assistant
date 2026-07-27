```markdown
# Low Level Design Document

---

## Module 1: Auth Module

### Responsibilities
- User registration with password hashing and email verification.
- Authentication via JWT with support for 2FA using OTP.
- Email verification handling and resend functionality.
- Password reset via token emails.
- 2FA toggle (enable/disable).
- Token blacklisting via Redis.
- Logout by clearing authentication cookies.

### Database Entities
- **users** (existing):
  - userId: UUID (PK)
  - name, email, passwordHash, role, isEmailVerified, emailVerificationToken, emailVerificationTokenExpiresAt
  - is2faEnabled, isEmailNotificationsEnabled, createdAt, updatedAt
- **password_reset_tokens**:
  - id: UUID (PK)
  - userId: UUID (FK users)
  - token: string (unique)
  - expiresAt: date
  - usedAt: date | null
- **user_otps**:
  - id: UUID (PK)
  - userId: UUID (FK users)
  - otp: string (6-digit)
  - type: string (e.g., 'login_2fa')
  - expiresAt: date
  - usedAt: date | null
  - createdAt, updatedAt
- **(Redis)** token blacklist keys: `bl:{jti}` with TTL

### APIs

| Method  | URI                         | Description                                 | Auth          | Request DTO                | Response                    |
|---------|-----------------------------|---------------------------------------------|---------------|----------------------------|-----------------------------|
| POST    | /api/v1/auth/register       | Register new user and send verification     | Public        | RegisterDto                | { message: string }          |
| POST    | /api/v1/auth/login          | Authenticate user, return JWT or 2FA prompt | Public        | LoginDto                   | LoginResponseDto / OtpPromptDto |
| POST    | /api/v1/auth/verify-otp-login | Complete 2FA login                           | Public        | VerifyOtpLoginDto          | LoginResponseDto             |
| POST    | /api/v1/auth/logout         | Clear auth cookie                            | Authenticated | None                       | { message: string }          |
| POST    | /api/v1/auth/verify-email   | Verify email token                           | Public        | VerifyEmailDto             | { message: string }          |
| POST    | /api/v1/auth/resend-verification | Resend verification email                 | Public        | ResendVerificationDto      | { message: string }          |
| POST    | /api/v1/auth/forgot-password| Request password reset                       | Public        | ForgotPasswordDto          | { message: string }          |
| POST    | /api/v1/auth/reset-password | Reset password via token                     | Public        | ResetPasswordDto           | { message: string }          |
| POST    | /api/v1/auth/toggle-2fa     | Enable/disable 2FA                           | Authenticated | Toggle2FaDto               | { message: string }          |

### Events
- UserRegistered (internal, triggers sending verification email)
- PasswordResetRequested (triggers sending reset email)
- TwoFactorOtpGenerated (triggers sending OTP email)
- EmailVerified (internal state update)
- PasswordResetConfirmed
- TwoFactorToggled

### Dependencies
- Users Module (to access/update user records)
- Mail Module (for sending emails)
- Redis (token blacklisting, OTP caching)
- Crypto / bcrypt libraries (password and token generation)
- Config Module (env vars JWT_SECRET, expirations)
- Cache Module (Redis-backed)

---

## Module 2: Users Module

### Responsibilities
- Store and manage detailed user profile data, including:
  - Personal details (name, contact info)
  - Educational background entries
  - Work experience entries
  - Skills list
  - Projects list
- Manage user preferences:
  - Language (English/Hindi)
  - UI theme (light/dark)
  - Email notification preferences
- Provide endpoints for profile retrieval & update.
- Provide email notification preferences retrieval and update.

### Database Entities
- **users** (extended):
  - Add fields for languagePreference (enum: 'en'|'hi'), themePreference (enum: 'light'|'dark')
  - Existing email notification toggle: isEmailNotificationsEnabled
- **user_educations**:
  - id: UUID (PK)
  - userId: UUID (FK users)
  - institution, degree, fieldOfStudy, startDate, endDate, description, createdAt, updatedAt
- **user_work_experiences**:
  - id: UUID (PK)
  - userId: UUID (FK users)
  - company, role, startDate, endDate, description, createdAt, updatedAt
- **user_skills**:
  - id: UUID (PK)
  - userId: UUID (FK users)
  - skillName, proficiencyLevel (optional), createdAt, updatedAt
- **user_projects**:
  - id: UUID (PK)
  - userId: UUID (FK users)
  - projectName, description, startDate, endDate, techStack, createdAt, updatedAt

### APIs

| Method  | URI                                 | Description                             | Auth          | Request DTO                 | Response DTO                |
|---------|-------------------------------------|---------------------------------------|---------------|-----------------------------|-----------------------------|
| GET     | /api/v1/users/me                    | Get current authenticated profile     | Authenticated | None                        | UserProfileResponseDto       |
| PATCH   | /api/v1/users/me                    | Update profile fields                  | Authenticated | UpdateUserProfileDto         | UserProfileResponseDto       |
| GET     | /api/v1/users/me/email-preferences | Get email notification preferences    | Authenticated | None                        | EmailPreferencesResponseDto  |
| PUT     | /api/v1/users/me/email-preferences | Update email notification preferences | Authenticated | UpdateEmailPreferencesDto    | EmailPreferencesResponseDto  |
| POST    | /api/v1/users/educations            | Add education entry                   | Authenticated | CreateEducationDto           | EducationResponseDto         |
| PATCH   | /api/v1/users/educations/:id        | Update education entry                | Authenticated | UpdateEducationDto           | EducationResponseDto         |
| DELETE  | /api/v1/users/educations/:id        | Delete education entry                | Authenticated | None                        | { message: string }          |
| POST    | /api/v1/users/work-experiences      | Add work experience                   | Authenticated | CreateWorkExperienceDto      | WorkExperienceResponseDto    |
| PATCH   | /api/v1/users/work-experiences/:id  | Update work experience                | Authenticated | UpdateWorkExperienceDto      | WorkExperienceResponseDto    |
| DELETE  | /api/v1/users/work-experiences/:id  | Delete work experience                | Authenticated | None                        | { message: string }          |
| POST    | /api/v1/users/skills                 | Add user skill                       | Authenticated | CreateSkillDto               | SkillResponseDto             |
| PATCH   | /api/v1/users/skills/:id             | Update user skill                    | Authenticated | UpdateSkillDto               | SkillResponseDto             |
| DELETE  | /api/v1/users/skills/:id             | Delete user skill                    | Authenticated | None                        | { message: string }          |
| POST    | /api/v1/users/projects               | Add user project                    | Authenticated | CreateProjectDto             | ProjectResponseDto           |
| PATCH   | /api/v1/users/projects/:id           | Update user project                 | Authenticated | UpdateProjectDto             | ProjectResponseDto           |
| DELETE  | /api/v1/users/projects/:id           | Delete user project                 | Authenticated | None                        | { message: string }          |

### Events
- UserProfileUpdated
- UserPreferencesUpdated

### Dependencies
- Auth Module (for user identity, validation)
- Mail Module (notifications if needed)
- Sequelize ORM models for profile entities
- Config Module (defaults for preferences)

---

## Module 3: Job Advertisements Module

### Responsibilities
- Store and manage job advertisement data input by users.
- Support storing fields required for ATS scoring:
  - Job title, description, requirements, location, etc.
- Allow CRUD operations on job ads.
- Support structured/semi-structured text fields for parsing.

### Database Entities
- **job_advertisements**:
  - id: UUID (PK)
  - userId: UUID (FK users) — owner of the job ad record
  - title: string
  - description: text
  - requirements: text
  - location: string | nullable
  - language: enum('en', 'hi')
  - createdAt, updatedAt

### APIs

| Method  | URI                          | Description                     | Auth          | Request DTO             | Response DTO          |
|---------|------------------------------|---------------------------------|---------------|-------------------------|-----------------------|
| POST    | /api/v1/job-ads              | Create job advertisement         | Authenticated | CreateJobAdDto          | JobAdResponseDto      |
| GET     | /api/v1/job-ads              | List all user's job ads          | Authenticated | None                    | JobAdResponseDto[]    |
| GET     | /api/v1/job-ads/:id          | Get single job ad details        | Authenticated | None                    | JobAdResponseDto      |
| PATCH   | /api/v1/job-ads/:id          | Update job advertisement         | Authenticated | UpdateJobAdDto          | JobAdResponseDto      |
| DELETE  | /api/v1/job-ads/:id          | Delete job advertisement         | Authenticated | None                    | { message: string }   |

### Events
- JobAdCreated
- JobAdUpdated
- JobAdDeleted

### Dependencies
- Users Module (for user ownership)
- ATS Scoring Module (for consuming job ad info)
- Config Module

---

## Module 4: ATS Scoring Module

### Responsibilities
- Compare user profiles with a selected job advertisement.
- Calculate ATS compatibility score (numeric or percentage).
- Generate actionable feedback recommending skills/projects to improve.
- Enforce business logic for scoring and recommendations.

### Database Entities
- (Optional caching table or Redis cache for score results)
- May cache `ats_scores` keyed by (userId, jobAdId) with score and recommendations.

### APIs

| Method | URI                         | Description                            | Auth          | Request DTO                 | Response DTO                        |
|--------|-----------------------------|--------------------------------------|---------------|-----------------------------|-----------------------------------|
| POST   | /api/v1/ats/score           | Compute ATS score and recommendations | Authenticated | AtsScoreRequestDto           | AtsScoreResponseDto                |
| GET    | /api/v1/ats/score/:jobAdId  | Optional: Retrieve cached ATS score    | Authenticated | None                        | AtsScoreResponseDto                |

### Events
- AtsScoreComputed (internal for triggering notifications)

### Dependencies
- Users Module (profile data)
- Job Advertisements Module (job criteria)
- Cache Module (Redis) for caching scores or partial data
- Mail Module (for notification triggers)
- Resume Generation Module (to enforce ATS score threshold)

---

## Module 5: Resume Generation Module

### Responsibilities
- Generate customized PDF resumes using pre-built templates.
- Use user profile and job advertisement data as input.
- Support two languages: English and Hindi.
- Allow previewing generated resumes prior to download.
- Enforce minimum ATS score threshold before generation allowed.
- Provide multiple template options.

### Database Entities
- **resume_templates**:
  - id: UUID (PK)
  - name: string
  - language: enum('en', 'hi')
  - isActive: boolean
  - createdAt, updatedAt
- (Optionally store generated resume metadata for audit/history)

### APIs

| Method | URI                           | Description                              | Auth          | Request DTO                       | Response DTO                      |
|--------|-------------------------------|----------------------------------------|---------------|----------------------------------|---------------------------------|
| GET    | /api/v1/resumes/templates      | List available resume templates         | Authenticated | None                             | ResumeTemplateResponseDto[]      |
| POST   | /api/v1/resumes/generate       | Generate resume PDF (returns preview URL or PDF stream) | Authenticated | ResumeGenerateRequestDto         | ResumeGenerateResponseDto        |
| GET    | /api/v1/resumes/preview/:id    | Get preview of generated resume         | Authenticated | None                             | PDF stream or Base64             |

### Events
- ResumeGenerated (may trigger usage tracking or notifications)

### Dependencies
- ATS Scoring Module (check ATS score threshold before generation)
- Users Module (profile data)
- Job Advertisements Module (job ad data)
- Mail Module (sending resume or notifications)
- File System or Blob Storage (storing generated PDFs)
- PDF generation library/service (e.g., Puppeteer, pdfmake)

---

## Module 6: Mail Module

### Responsibilities
- Abstract email sending via SMTP providers.
- Provide template rendering (Handlebars).
- Send emails for:
  - Account verification
  - Password reset
  - 2FA OTP codes
  - Profile update reminders
  - Job application deadline reminders
  - Other notifications

### Database Entities
- None (stateless, uses templates and configuration)

### APIs
- Internal only; exposed methods for sending various emails.

| Method                | Description                     | Parameters                                      |
|-----------------------|---------------------------------|------------------------------------------------|
| sendEmailVerification | Send verification email         | user email, verification token                 |
| sendPasswordReset     | Send password reset email       | user email, reset token                         |
| sendTwoFactorOtp      | Send 2FA OTP email              | user email, OTP code                            |
| sendNotification      | Send custom notifications       | user email, message, optional metadata         |

### Events
- EmailSent
- EmailFailed

### Dependencies
- Config Module (SMTP, credentials)
- Template service (Handlebars)
- Logging service
- Possibly queue system for async sending (future enhancement)

---

## Module 7: Health Module

### Responsibilities
- Provide system health check endpoints:
  - Full health check (`/api/health`)
  - Liveness probe (`/api/health/live`)
  - Readiness probe (`/api/health/ready`)

### Database Entities
- None

### APIs

| Method | URI               | Description        | Auth | Response                    |
|--------|-------------------|--------------------|------|-----------------------------|
| GET    | /api/health       | Full health status  | None | HealthCheckReportDto         |
| GET    | /api/health/live  | Liveness probe      | None | { status: 'ok' }            |
| GET    | /api/health/ready | Readiness probe     | None | HealthCheckReadyReportDto    |

### Dependencies
- Database connectivity check (PostgreSQL)
- Redis connectivity check
- Memory/disk checks
- Config module

---

## Module 8: Chat Module (Optional)

### Responsibilities
- WebSocket support with Socket.IO.
- Authenticate connecting clients via JWT optionally.
- Support event broadcasting (e.g., greetings).
- Potential future use for real-time notifications or admin messaging.

### Database Entities
- None

### APIs (WebSocket Events)
- `hello` → Returns greeting string.
- `broadcast-hello` → Server broadcasts `greetings` event to all clients.

### Dependencies
- Auth Module (JWT validation on connection)
- Cache Module (optional for presence tracking or rate limiting)
- Config Module (for enabling/disabling socket.io)

---

# Cross-Cutting Concerns

### Security
- Global JWT authentication with Passport + custom JwtStrategy.
- Guards (`JwtAuthGuard`, `EmailVerifiedGuard`).
- Password hashing with bcrypt (configurable rounds).
- Token blacklisting using Redis.
- Email verification required before granting full access.
- Rate limiting via ThrottlerModule with Redis backend when enabled.
- Helmet middleware applied for HTTP security headers.
- CORS restrictions as per environment.
- Input validation with `ValidationPipe` for all endpoints.

### Localization & Theming
- Language preference stored in Users Module.
- API supports English/Hindi data where applicable (job ads, templates).
- Theme preference persisted per user.

### Caching
- Redis cache for:
  - Rate limiting data
  - Token blacklisting
  - ATS scoring caching (optional)
  - Other short-lived ephemeral data

### Logging & Monitoring
- Not explicitly defined but expected for all modules (errors, events).

### Deployment
- Docker container listens on port 5701.
- Environment variables control production behavior.
- Health endpoints for container orchestration.

---

# Summary Table of Modules & Dependencies

| Module               | Depends On                                      | Consumed By                             |
|----------------------|------------------------------------------------|---------------------------------------|
| Auth                 | Users, Mail, Redis, Config                      | App, Chat (auth)                      |
| Users                | Auth, Mail, Config                              | Auth, ATS, Resume                     |
| Job Advertisements   | Users, Config                                   | ATS, Resume                          |
| ATS Scoring          | Users, Job Advertisements, Cache, Mail, Config | Resume, Notifications                 |
| Resume Generation    | Users, Job Advertisements, ATS, Mail, Config   | UI / Clients                         |
| Mail                 | Config                                          | Auth, Users, ATS, Resume             |
| Health               | Database, Redis, Config                          | Kubernetes / Orchestrator             |
| Chat (optional)      | Auth, Config                                    | UI Clients                           |

---

# Notes

- New database tables for user profile details and job advertisements will be created with standard timestamp columns and UUID keys.
- ATS Scoring and Resume Generation modules may leverage caching and asynchronous background jobs in future enhancements.
- All APIs use DTOs with validation, and responses follow camelCase field conventions.
- All protected routes require JWT auth and email verification by default.
- Rate limits are stricter on authentication routes.
- The system enforces 2FA strictly for user security.
- Email sending is designed non-blocking; failures are logged but do not block main flows.
```