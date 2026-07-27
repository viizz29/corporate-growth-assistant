# App001 Backend

NestJS 11 backend with authentication, user management, email, health checks, and optional WebSocket support.

## Stack

- NestJS 11, TypeScript, Sequelize, PostgreSQL, Redis
- JWT, Swagger, Nodemailer, Handlebars, Jest

## Modules

| Module | Description |
|---|---|
| `auth` | Register, login, email verification, password reset, 2FA |
| `users` | Profile management, email preferences |
| `mail` | SMTP mail transport with Handlebars templates |
| `health` | Health/liveness/readiness endpoints (DB, Redis, memory, disk) |
| `chat` | Optional Socket.IO gateway (JWT-authenticated) |

## Getting Started

```bash
npm ci
# Start PostgreSQL & Redis, then:
npm run migrate:dev
npm run start:dev
```

## API

| Group | Prefix |
|---|---|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Health | `/api/health` |

Swagger UI at `/docs`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Compile to `dist/` |
| `npm run migrate:dev` | Run Sequelize migrations |
| `npm run seed:dev` | Seed demo data |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E tests |

## Env

Copy `.env.example` to `.env.local` and configure:
- `JWT_SECRET`, `DB_*`, `REDIS_*`, `SMTP_*`
