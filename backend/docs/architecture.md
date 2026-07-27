# Backend Architecture

NestJS 11 application with a modular architecture, PostgreSQL (Sequelize), Redis, and Socket.IO support.

## Directory Structure

```
backend/
├── src/
│   ├── main.ts                          # Application bootstrap
│   ├── common/                          # Shared guards, decorators, pipes, interceptors
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── email-verified.guard.ts
│   │   ├── field-name-transformer.pipe.ts
│   │   └── field-name-transformer.interceptor.ts
│   ├── lib/                             # Shared utilities
│   │   ├── jwt-strategy.ts
│   │   └── env-value-validations.ts
│   ├── database/
│   │   └── sequelize/
│   │       ├── migrations/              # Plain JS migrations (sequelize-cli)
│   │       ├── seeders/
│   │       ├── models/                  # CLI model bootstrap (index.js)
│   │       └── sequelize.config.js
│   └── modules/
│       ├── app/                         # Root module
│       │   ├── app.module.ts
│       │   ├── app.controller.ts
│       │   └── app.service.ts
│       ├── auth/                        # Authentication & authorization
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── token-blacklist.service.ts
│       │   ├── password-reset-token.model.ts
│       │   ├── password-reset-token.repository.ts
│       │   ├── user-otp.model.ts
│       │   ├── user-otp.repository.ts
│       │   └── dto/
│       ├── users/                       # User management
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── users.repository.ts
│       │   ├── user.model.ts
│       │   └── dto/
│       ├── mail/                        # Email sending (SMTP provider pattern)
│       │   ├── mail.module.ts
│       │   ├── mail.service.ts
│       │   ├── mail.interfaces.ts
│       │   ├── mail.constants.ts
│       │   ├── template.service.ts
│       │   └── providers/
│       ├── health/                      # Health checks (Terminus)
│       │   ├── health.module.ts
│       │   ├── health.controller.ts
│       │   └── redis-health-indicator.ts
│       └── chat/                        # WebSocket gateway (Socket.IO)
│           ├── chat.module.ts
│           └── chat.gateway.ts
├── test/                                # E2E tests
├── assets/                              # Static assets (mail templates, swagger JS)
├── Dockerfile
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Module Dependencies

```
AppModule
├── ConfigModule (global)
├── SequelizeModule (PostgreSQL)
├── CacheModule (Redis-backed when REDIS_ENABLED=true)
├── ThrottlerModule (rate limiting, Redis-backed when available)
├── ServeStaticModule (serves frontend build)
├── HealthModule
├── MailModule
├── UsersModule
├── AuthModule
│   ├── UsersModule
│   ├── MailModule
│   ├── PassportModule
│   └── JwtModule
└── ChatModule (conditional: only when SOCKETIO_ENDPOINT_ON=true)
    └── JwtModule
```

## Global Guards (registered in AppModule)

Applied in order via `APP_GUARD` tokens:

1. **ThrottlerGuard** - Rate limiting (20 req/60s default, per-route overrides)
2. **JwtAuthGuard** - JWT authentication (skips `@Public()` routes)
3. **EmailVerifiedGuard** - Requires verified email (skips `@Public()` and `@SkipEmailVerification()` routes)

## Global Pipes & Interceptors

- **FieldNameTransformerPipe** - Recursively processes incoming request body/query data
- **ValidationPipe** - `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **FieldNameTransformerInterceptor** - Converts snake_case/kebab-case response keys to camelCase

## Bootstrap Configuration (`main.ts`)

- Global prefix: `/api/v1` (configurable via `API_BASE_URL`)
- Swagger UI: available at `/docs` in non-production environments
- CORS: origin restricted in production, open in development
- Cookie parser and Helmet security middleware enabled
- Listens on `0.0.0.0` in production, `localhost` otherwise
- Shutdown hooks enabled

## Key Infrastructure

| Concern | Implementation |
|---|---|
| Database | PostgreSQL via `@nestjs/sequelize` + `sequelize-typescript` |
| Cache | `@nestjs/cache-manager` with optional Redis store (`cache-manager-redis-yet`) |
| Rate Limiting | `@nestjs/throttler` with optional Redis storage (`@nest-lab/throttler-storage-redis`) |
| Auth | Passport.js with JWT strategy (`passport-jwt`), cookie + header token extraction |
| WebSockets | Socket.IO via `@nestjs/websockets` + `@nestjs/platform-socket.io` |
| Email | Nodemailer with provider abstraction (`MailProvider` interface), Handlebars templates |
| Health | `@nestjs/terminus` with Sequelize, Redis, memory, and disk checks |
| Config | `@nestjs/config` with Joi validation schema |
| Static Files | `@nestjs/serve-static` serving the frontend build |

## Environment Files

| File | Purpose |
|---|---|
| `.env.local` | Local development (`NODE_ENV=local`) |
| `.env.production` | Production (loaded by Docker container) |
| `.env.example` | Documented template with all variables and defaults |

Environment loading: `ConfigModule` reads `.env.{NODE_ENV}` and ignores env files in production.
