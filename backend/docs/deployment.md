# Deployment

## Docker Build

The backend is containerized using a multi-stage Dockerfile.

### Dockerfile Stages

| Stage | Base Image | Purpose |
|---|---|---|
| `builder` | `node:22-bookworm-slim` | Install all deps, compile TypeScript |
| `deps` | `node:22-bookworm-slim` | Install production-only deps |
| `production` | `node:22-bookworm-slim` | Final runner image |

### Production Image Contents

```
/app/
├── node_modules/       # Production dependencies only
├── dist/               # Compiled JavaScript
├── assets/             # Mail templates, swagger JS
└── public/             # Frontend build (copied from frontend/dist)
```

### Building the Image

```bash
./build-docker-image.sh
```

This script:
1. Prompts for the production hostname (e.g., `https://example.com`)
2. Sets `VITE_BACKEND_SERVER` in `frontend/.env.production`
3. Builds the frontend with `npm run build`
4. Copies `frontend/dist/` into `backend/public/`
5. Builds the Docker image tagged as `app001:latest`

### Running the Container

```bash
./run-docker-image.sh
```

Runs the container with:
- `--env-file ./backend/.env.production`
- Port mapping: `-p 5701:5701`
- Container name: `app001`

### Exposed Port

The production container listens on port **5701**.

## Environment Configuration

### Production Environment Variables

The `.env.production` file must be configured before deployment:

```bash
# Required
JWT_SECRET=<strong-random-secret-min-32-chars>
DB_HOST=<database-host>
DB_DATABASE=<database-name>
DB_USERNAME=<database-user>
DB_PASSWORD=<database-password>
PUBLIC_HOST_WITH_PORT=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
COOKIE_DOMAIN=your-domain.com
COOKIE_SECURE=true

# Optional
REDIS_ENABLED=true
REDIS_HOST=<redis-host>
REDIS_PORT=6379
REDIS_USER=<redis-user>
REDIS_PASSWORD=<redis-password>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USERNAME=<email>
SMTP_PASSWORD=<app-password>
MAIL_FROM_ADDRESS=<email>
MAIL_FROM_NAME="App001"

DB_SSL_REJECT_UNAUTHORIZED=true
DB_SSL_CA=/path/to/ca-certificate.pem
```

### Environment Variable Loading

- `ConfigModule` reads `.env.{NODE_ENV}` (e.g., `.env.production`)
- In production (`NODE_ENV=production`), env files are ignored (`ignoreEnvFile: true`)
- Environment variables are validated on startup using Joi (`src/lib/env-value-validations.ts`)

## Static File Serving

- The frontend build is copied to `backend/public/`
- `@nestjs/serve-static` serves files from `FRONTEND_BUILD_PATH` (default: `public`)
- Catch-all route: `/{*path}` serves `index.html` for SPA routing

## Health Checks

The application exposes health endpoints for container orchestration:

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Full health check (DB, Redis, memory, disk) |
| `GET /api/health/live` | Liveness probe (always 200) |
| `GET /api/health/ready` | Readiness probe (DB + Redis) |

## Production Checklist

1. Generate a strong `JWT_SECRET`: `openssl rand -base64 48`
2. Set `COOKIE_SECURE=true` and `COOKIE_DOMAIN` to your domain
3. Configure `CORS_ORIGIN` to your frontend domain
4. Set up PostgreSQL with SSL (configure `DB_SSL_CA` if needed)
5. Set up Redis for caching, rate limiting, and token blacklisting
6. Configure SMTP credentials for email delivery
7. Set `SCHEDULED_TASKS_ENABLED=true` if background tasks are needed
8. Set `ENABLE_NOTIFICATION_EMAILS=true` for email notifications
9. Run database migrations: `npm run db:migrate:prod`

## CORS Configuration

- **Development**: All origins allowed
- **Production**: Only `CORS_ORIGIN` env var value (default: `http://localhost:3000`)
- **Credentials**: Always enabled

## Security Headers

Helmet middleware is applied globally via `app.use(helmet())`, adding standard security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (in production)
- And others per Helmet defaults

## Rate Limiting

Production rate limiting uses Redis for distributed tracking:
- Global: 20 requests per 60 seconds
- Auth endpoints: 3-10 requests per 60 seconds (per-endpoint)
- Storage: Redis-backed when `REDIS_ENABLED=true`, in-memory otherwise
