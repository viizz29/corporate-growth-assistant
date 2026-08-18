# Corporate Growth Assistant

Corporate Growth Assistant is a full-stack web app for job seekers who want to tune their profile and resume for specific job advertisements. Users maintain profile data, save target job ads, compute ATS compatibility scores, get improvement recommendations, and generate tailored PDF resumes once the score meets the configured threshold.

## What It Does

- Account registration, login, email verification, password reset, logout, and optional email OTP 2FA.
- Profile management for personal details, education, work experience, skills, and projects.
- Job advertisement CRUD with title, description, requirements, location, and language.
- ATS scoring that compares profile data with a target job ad and caches the result.
- Optional OpenAI or Azure OpenAI feedback for ATS recommendations and resume tailoring.
- Resume template listing, PDF generation, inline preview, download, and history.
- English/Hindi UI support, light/dark theme preferences, and email notification preferences.
- Health/readiness endpoints, Swagger in non-production, Redis-backed throttling/cache when enabled, and Docker packaging.

## Project Layout

```text
.
├── backend/      # NestJS API, PostgreSQL models/migrations, PDF generation
├── frontend/     # React 19 + Vite SPA
├── docs/         # Requirements, API, database, HLD/LLD, workflows, screens
├── build-docker-image.sh
└── run-docker-image.sh
```

## Tech Stack

| Area | Stack |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Material UI 7, React Router 7, TanStack Query, Formik/Yup, i18next, Socket.IO client, Vitest |
| Backend | NestJS 11, TypeScript, Sequelize, PostgreSQL, Redis, JWT, Swagger, Nodemailer, React PDF, Socket.IO |
| AI | OpenAI-compatible Chat Completions API or Azure OpenAI, optional |
| Testing | Vitest/Testing Library on frontend, Jest/Supertest on backend |
| Deployment | Docker, backend static serving for frontend build |

## Getting Started

Prerequisites:

- Node.js LTS
- PostgreSQL
- Redis, unless `REDIS_ENABLED=false`
- SMTP credentials if email delivery is enabled
- OpenAI or Azure OpenAI credentials if AI feedback/tailoring is enabled

Backend:

```bash
cd backend
cp .env.example .env.local
npm ci
npm run db:create:dev
npm run db:migrate:dev
npm run db:seed:dev
npm run start:dev
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Local defaults:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs` in non-production
- API prefix: `/api/v1` by default in frontend calls

## Main API Areas

| Area | Prefix |
| --- | --- |
| Auth | `/api/v1/auth` |
| Users and profile subresources | `/api/v1/users` |
| Job advertisements | `/api/v1/job-ads` |
| ATS scores | `/api/v1/ats` |
| Resumes and templates | `/api/v1/resumes` |
| Health | `/api/health` |

## Common Scripts

| Command | Directory | Purpose |
| --- | --- | --- |
| `npm run dev` | `frontend/` | Start Vite dev server |
| `npm run build` | `frontend/` | Type-check and build SPA |
| `npm test` | `frontend/` | Run Vitest tests once |
| `npm run start:dev` | `backend/` | Start Nest in watch mode with `NODE_ENV=local` |
| `npm run build` | `backend/` | Compile backend to `dist/` |
| `npm run db:create:dev` | `backend/` | Create local database |
| `npm run db:migrate:dev` | `backend/` | Run Sequelize migrations |
| `npm run db:seed:dev` | `backend/` | Seed demo users, profile data, and job ads |
| `npm test` | `backend/` | Run Jest unit tests |
| `npm run test:e2e` | `backend/` | Run backend e2e tests |

## Environment

See `backend/.env.example` and `frontend/.env.example` for the baseline variables.

Important backend values include:

- `JWT_SECRET`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_ENABLED`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_USER`, `REDIS_PASSWORD`
- `SMTP_*`, `MAIL_FROM_*`, `ENABLE_NOTIFICATION_EMAILS`
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_API_BASE_URL`
- `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT_NAME`, `AZURE_OPENAI_API_VERSION`
- `STORAGE_LOCATION` for generated resume storage
- `PUBLIC_HOST_WITH_PORT`, `CORS_ORIGIN`, `COOKIE_DOMAIN`, `COOKIE_SECURE`

Important frontend values include:

- `VITE_APP_NAME`
- `VITE_BACKEND_SERVER`
- `VITE_API_BASE_URL`
- `VITE_MOCK_API_ON`
- `VITE_SOCKETIO_ENABLED`, `VITE_SOCKETIO_ENDPOINT`

## Docker

The root scripts build a production image that bundles the frontend static build into the backend image:

```bash
./build-docker-image.sh
./run-docker-image.sh
```

`build-docker-image.sh` asks for the public host, builds `frontend/dist`, copies it to `backend/public`, and builds `app001:latest`. `run-docker-image.sh` starts the image with `backend/.env.production` and maps host port `5701`.

## Project Docs

The `docs/` folder contains the fuller product and architecture references:

- `docs/requirements.md`
- `docs/apis.md`
- `docs/database.md`
- `docs/hld.md`
- `docs/lld.md`
- `docs/screens.md`
- `docs/workflows.md`
