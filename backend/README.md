# Corporate Growth Assistant Backend

NestJS backend for Corporate Growth Assistant. It provides account security, user profile management, job advertisement storage, ATS scoring, optional AI feedback, and tailored PDF resume generation.

## Stack

- NestJS 11 + TypeScript
- Sequelize + PostgreSQL
- Redis-backed cache, token blacklist, and throttling when enabled
- JWT auth with httpOnly cookie support and bearer-token support
- Email verification, password reset, and OTP-based 2FA through Nodemailer
- Swagger/OpenAPI in non-production environments
- React PDF renderers for classic, modern, and executive resume templates
- Optional Socket.IO gateway
- Jest and Supertest

## Getting Started

```bash
npm ci
cp .env.example .env.local
npm run db:create:dev
npm run db:migrate:dev
npm run db:seed:dev
npm run start:dev
```

The server listens on `http://localhost:3000` by default. Swagger is available at `http://localhost:3000/docs` outside production.

The seed data creates demo users, profile data, and job ads. The seeded password in the current seeder is `password123`.

## Main Modules

| Module | Description |
| --- | --- |
| `auth` | Registration, login, logout, email verification, password reset, token revocation, and 2FA |
| `users` | User profile, preferences, education, work experience, skills, and projects |
| `job-ads` | Saved job advertisements for each authenticated user |
| `ats` | Local ATS scoring, recommendation caching, threshold metadata, and optional AI feedback |
| `resumes` | Resume templates, AI-assisted tailoring, PDF generation, preview, download, and history |
| `mail` | SMTP transport and Handlebars email templates |
| `health` | Liveness/readiness and dependency checks |
| `chat` | Optional Socket.IO gateway controlled by `SOCKETIO_ENDPOINT_ON` |

## API Overview

The global prefix defaults to `/api/v1`.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/verify-otp-login`, `POST /auth/logout`, `POST /auth/verify-email`, `POST /auth/resend-verification`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/toggle-2fa` |
| Profile | `GET/PATCH /users/me`, `GET/PUT /users/me/email-preferences` |
| Education | `GET/POST /users/educations`, `PATCH/DELETE /users/educations/:id` |
| Work experience | `GET/POST /users/work-experiences`, `PATCH/DELETE /users/work-experiences/:id` |
| Skills | `GET/POST /users/skills`, `PATCH/DELETE /users/skills/:id` |
| Projects | `GET/POST /users/projects`, `PATCH/DELETE /users/projects/:id` |
| Job ads | `GET/POST /job-ads`, `GET/PATCH/DELETE /job-ads/:id` |
| ATS | `POST /ats/score`, `GET /ats/scores`, `GET /ats/score/:jobAdId` |
| Resumes | `GET /resumes`, `GET /resumes/templates`, `POST /resumes/generate`, `GET /resumes/preview/:previewId` |

Health endpoints are mounted outside the versioned API under `/api/health`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Start Nest in watch mode with `NODE_ENV=local` |
| `npm run start:prod` | Run compiled `dist/main` |
| `npm run build` | Compile backend |
| `npm run db:create:dev` | Create local PostgreSQL database |
| `npm run db:drop:dev` | Drop local PostgreSQL database |
| `npm run db:migrate:dev` | Run local Sequelize migrations |
| `npm run db:seed:dev` | Seed demo data |
| `npm run lint` | Run ESLint with autofix |
| `npm test` | Run Jest unit tests |
| `npm run test:cov` | Run Jest with coverage |
| `npm run test:e2e` | Run e2e tests |

## Environment Variables

Copy `.env.example` to `.env.local` for development. Important groups:

- App/API: `APP_NAME`, `PORT`, `API_BASE_URL`, `DOCS_URL`, `PUBLIC_HOST_WITH_PORT`, `FRONTEND_BUILD_PATH`, `STORAGE_LOCATION`
- Auth/security: `JWT_SECRET`, `COOKIE_DOMAIN`, `COOKIE_SECURE`, `BCRYPT_ROUNDS`, `CORS_ORIGIN`
- Database: `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SSL_REJECT_UNAUTHORIZED`, optional `DB_SSL_CA`
- Redis: `REDIS_ENABLED`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_USER`, `REDIS_PASSWORD`
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, `ENABLE_NOTIFICATION_EMAILS`
- Token lifetimes: `VERIFICATION_TOKEN_EXPIRY_HOURS`, `PASSWORD_RESET_TOKEN_EXPIRY_HOURS`, `OTP_EXPIRY_MINUTES`
- AI: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_API_BASE_URL`, or `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT_NAME`, `AZURE_OPENAI_API_VERSION`
- Optional realtime: `SOCKETIO_ENDPOINT_ON`, `SOCKETIO_ENDPOINT`

If AI credentials are absent, the ATS and resume flows keep using deterministic/local behavior where available and skip AI-generated feedback or tailoring.

## Data Model

Migrations define tables for:

- Users and auth support tables: password reset tokens, OTPs, and JWT blacklisting.
- User profile subresources: education, work experience, skills, and projects.
- Job advertisements.
- ATS scores with recommendations and AI feedback.
- Resume templates and generated resumes, including stored filenames and tailored content.

The database uses UUID primary keys, snake_case columns, and `created_at`/`updated_at` timestamps.

## Resume Generation

The `resumes` module generates PDFs from profile data, a target job advertisement, and a selected template. Generation is gated by the ATS score threshold defined in the ATS module. Generated files are stored under the configured storage location and streamed through the preview endpoint as inline PDFs or attachments with `?download=1`.
