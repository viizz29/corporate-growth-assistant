# Nest + React App Boilerplate

Full-stack boilerplate with a **NestJS** backend and a **React** frontend. Includes authentication, i18n, WebSocket support, and Docker packaging.

## Architecture

```text
├── backend/     # NestJS 11 API server
├── frontend/    # React 19 SPA (Vite)
└── .github/     # CI workflows (placeholder)
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Material UI 7, Tailwind CSS, React Router 7, TanStack Query, Formik + Yup, i18next, Socket.IO client |
| Backend | NestJS 11, TypeScript, Sequelize, PostgreSQL, Redis, JWT, Swagger, Nodemailer |
| Testing | Vitest + React Testing Library (frontend), Jest + Supertest (backend) |
| Infra | Docker (Nginx + Node), PM2 (backend production) |

## Getting Started

### Prerequisites

- Node.js (LTS)
- PostgreSQL
- Redis

### Install & run

```bash
# Backend
cd backend
cp .env.example .env.local   # configure DB, Redis, JWT, SMTP
npm ci
npm run db:create:dev        # create database
npm run db:migrate:dev       # run Sequelize migrations
npm run db:seed:dev          # optional demo data
npm run start:dev            # http://localhost:3000

# Frontend
cd frontend
cp .env.example .env.local   # configure backend URL
npm ci
npm run dev                  # http://localhost:5173
```

### API

| Group | Prefix |
|---|---|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Health | `/api/health` |

Swagger UI at `http://localhost:3000/docs` (dev only).

## Scripts

| Command | Scope | Purpose |
|---|---|---|
| `npm run start:dev` | backend | Dev server with watch |
| `npm run build` | both | Compile to `dist/` |
| `npm run db:create:dev` | backend | Create database |
| `npm run db:migrate:dev` | backend | Run Sequelize migrations |
| `npm run db:seed:dev` | backend | Seed demo data |
| `npm test` | both | Unit tests |
| `npm run test:e2e` | backend | E2E tests |
| `npm run dev` | frontend | Start Vite dev server |
| `npm run lint` | both | Lint with ESLint |

## Docker

Both `frontend/` and `backend/` include their own `Dockerfile`.

- **Frontend** -- builds Vite app and serves via Nginx (proxies `/api` and `/ws` to backend).
- **Backend** -- multi-stage build: compile NestJS, install production deps, run from `dist/`.

### Build & run (combined)

```bash
# Build backend Docker image (includes frontend static build)
./build-docker-image.sh

# Run the container
./run-docker-image.sh
```

The backend serves the frontend static files in production via `@nestjs/serve-static`.

## Environment Variables

See each directory's `.env.example` for the full list:

- **Backend**: `JWT_SECRET`, `DB_*`, `REDIS_*`, `SMTP_*`, `PORT`, `CORS_ORIGIN`, `COOKIE_*`, `BCRYPT_ROUNDS`, `SOCKETIO_*`
- **Frontend**: `VITE_APP_NAME`, `VITE_MOCK_API_ON`, `VITE_BACKEND_SERVER`, `VITE_API_BASE_URL`, `VITE_SOCKETIO_ENABLED`, `VITE_SOCKETIO_ENDPOINT`
