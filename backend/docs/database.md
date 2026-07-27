# Database

## Overview

- **Database**: PostgreSQL
- **ORM**: Sequelize (via `@nestjs/sequelize` + `sequelize-typescript`)
- **Migrations**: Plain JavaScript files using `sequelize-cli`
- **Connection**: Configured via `ConfigService` with Joi validation
- **Timezone**: UTC (`+00:00`)
- **Auto-load models**: enabled, `synchronize: false`

## Connection Configuration

Set via environment variables (validated by `env-value-validations.ts`):

| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_HOST` | Yes | `127.0.0.1` | Database host |
| `DB_DATABASE` | Yes | - | Database name |
| `DB_USERNAME` | Yes | - | Database user |
| `DB_PASSWORD` | Yes | - | Database password |
| `DB_SSL_REJECT_UNAUTHORIZED` | No | `true` | SSL certificate verification |
| `DB_SSL_CA` | No | - | Path to CA certificate file |

Production environments use SSL with optional custom CA certificate.

## Naming Conventions

- **Table names**: `snake_case` (e.g., `users`, `password_reset_tokens`)
- **Column names**: `snake_case` (e.g., `user_id`, `is_email_verified`)
- **Model properties**: `camelCase` (Sequelize `underscored: true` handles mapping)
- **Primary keys**: UUIDs (`gen_random_uuid()` in PostgreSQL)

## Tables

### `users`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `user_id` | UUID | No | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(255) | No | - | Display name |
| `email` | VARCHAR(255) | No (unique) | - | Email address |
| `password_hash` | VARCHAR(255) | No | - | Bcrypt hash |
| `role` | VARCHAR(50) | No | `'user'` | User role |
| `is_email_verified` | BOOLEAN | No | `false` | Email verification status |
| `email_verification_token` | VARCHAR(255) | Yes | - | Verification token |
| `email_verification_token_expires_at` | DATE | Yes | - | Token expiry |
| `is_2fa_enabled` | BOOLEAN | No | `false` | 2FA toggle |
| `is_email_notifications_enabled` | BOOLEAN | No | `true` | Email notification preference |
| `language_preference` | VARCHAR(2) | No | `'en'` | Language preference (CHECK: `en`, `hi`) |
| `theme_preference` | VARCHAR(5) | No | `'light'` | Theme preference (CHECK: `light`, `dark`) |
| `created_at` | DATE | No | `CURRENT_TIMESTAMP` | Created timestamp |
| `updated_at` | DATE | No | `CURRENT_TIMESTAMP` | Updated timestamp |

### `password_reset_tokens`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | UUID | No | Primary key (UUIDV4) |
| `user_id` | UUID | No | FK → `users.user_id` (CASCADE) |
| `token` | VARCHAR(255) | No (unique) | Reset token |
| `expires_at` | DATE | No | Token expiry |
| `used_at` | DATE | Yes | When token was used |
| `created_at` | DATE | No | Created timestamp |
| `updated_at` | DATE | No | Updated timestamp |

Indexes: `token`, `user_id`.

### `user_otps`

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | UUID | No | UUIDV4 | Primary key |
| `user_id` | UUID | No | - | FK → `users.user_id` (CASCADE) |
| `otp` | VARCHAR(6) | No | - | OTP code |
| `type` | VARCHAR(50) | No | `'login_2fa'` | OTP purpose |
| `expires_at` | DATE | No | - | OTP expiry |
| `used_at` | DATE | Yes | - | When OTP was used |
| `created_at` | DATE | No | `CURRENT_TIMESTAMP` | Created timestamp |
| `updated_at` | DATE | No | `CURRENT_TIMESTAMP` | Updated timestamp |

Composite index: `(user_id, type)`.

### PostgreSQL Extensions

The initial migration installs:
- `citext` - Case-insensitive text type
- `uuid-ossp` - UUID generation functions

## Models

Models are defined using `sequelize-typescript` decorators and placed in their respective module directories:

- `src/modules/users/user.model.ts` → `User`
- `src/modules/auth/password-reset-token.model.ts` → `PasswordResetToken`
- `src/modules/auth/user-otp.model.ts` → `UserOtp`

Models are auto-loaded by Sequelize via `autoLoadModels: true` in `AppModule`.

## Repository Pattern

Data access is abstracted through repository classes:

| Repository | Model | Module |
|---|---|---|
| `UserRepository` | `User` | `users` |
| `PasswordResetTokenRepository` | `PasswordResetToken` | `auth` |
| `UserOtpRepository` | `UserOtp` | `auth` |

Repositories are `@Injectable()` and use `@InjectModel()` for model injection. They encapsulate all Sequelize queries and are exported from their modules for use by other modules.

## Migrations

Located in `src/database/sequelize/migrations/`. Written in plain JavaScript using `sequelize-cli`.

### Migration List

| File | Description |
|---|---|
| `20240730000100-add-extensions.js` | Install `citext` and `uuid-ossp` extensions |
| `20240730000200-create-users-table.js` | Create `users` table |
| `20240730000300-create-email-status-enum.js` | Create email status enum |
| `20240730000400-create-update-updated-at-trigger-function.js` | Auto-update `updated_at` trigger |
| `20240730000500-add-email-verification-columns.js` | Add email verification columns to users |
| `20240730000600-create-password-reset-tokens-table.js` | Create `password_reset_tokens` table |
| `20240730000700-add-2fa-column-to-users.js` | Add `is_2fa_enabled` to users |
| `20240730000800-create-user-otps-table.js` | Create `user_otps` table |
| `20240730000900-add-email-notifications-enabled-to-users.js` | Add `is_email_notifications_enabled` to users |
| `20240730001000-add-language-and-theme-preference-to-users.js` | Add `language_preference` and `theme_preference` to users |

### Running Migrations

```bash
# Development
npm run db:create:dev    # Create the database
npm run db:migrate:dev   # Run all pending migrations
npm run db:seed:dev      # Seed demo data

# Production
npm run db:migrate:prod  # Run migrations against production DB
```

Migration config: `src/database/sequelize/sequelize.config.js` reads from `.env.{NODE_ENV}`.

## Seeders

Located in `src/database/sequelize/seeders/`. The demo seeder creates 5 test users with pre-hashed passwords (`password123`).

## Automatic Test User Seeding

`UsersService.onModuleInit()` automatically creates a test user (`test@gmail.com` / `password123`) in non-production environments if one doesn't exist. This is skipped in production.

## Caching

Redis is used for caching when `REDIS_ENABLED=true`:

- **Cache store**: `cache-manager-redis-yet` via `@nestjs/cache-manager`
- **Rate limiting**: `@nest-lab/throttler-storage-redis` for distributed rate limiting
- **Token blacklisting**: Direct `ioredis` connection in `TokenBlacklistService`

When Redis is disabled, caching falls back to in-memory and rate limiting uses in-memory storage.
