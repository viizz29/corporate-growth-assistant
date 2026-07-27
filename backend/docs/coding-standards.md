# Backend Coding Standards

## Module Organization

Each feature is a self-contained NestJS module under `src/modules/`. A module contains:

```
module-name/
├── module-name.module.ts       # Module definition
├── module-name.controller.ts   # Route handlers
├── module-name.service.ts      # Business logic
├── module-name.repository.ts   # Data access (when applicable)
├── *.model.ts                  # Sequelize models (when applicable)
├── dto/                        # Data Transfer Objects
│   ├── action.dto.ts
│   └── another-action.dto.ts
└── *.spec.ts                   # Co-located unit tests
```

## File Naming

- **TypeScript source files**: `kebab-case` (e.g., `auth.service.ts`, `jwt-auth.guard.ts`)
- **Sequelize migration files**: `YYYYMMDDHHMMSS-description.js` (plain JS, not TS)
- **Test files**: `*.spec.ts` co-located with source files
- **E2E test files**: `*.e2e-spec.ts` in `test/` directory

## TypeScript Configuration

Key settings from `tsconfig.json`:

- **Target**: ES2023
- **Module**: nodenext
- **Strict null checks**: enabled
- **`noImplicitAny`**: disabled
- **Decorators**: `emitDecoratorMetadata` + `experimentalDecorators` enabled
- **Source maps**: enabled
- **Incremental compilation**: enabled

Build excludes `node_modules/`, `test/`, `dist/`, and `**/*spec.ts`.

## Class Decorator Conventions

### Controllers

```typescript
@ApiTags('module-name')
@Controller('v1/module-name')
@ApiBearerAuth('bearerAuth')  // if all routes require auth
export class ModuleNameController { ... }
```

### Services

```typescript
@Injectable()
export class ModuleNameService { ... }
```

### Repositories

```typescript
@Injectable()
export class ModuleNameRepository {
  constructor(
    @InjectModel(Model)
    private model: typeof Model,
  ) {}
}
```

## DTO Conventions

- Use `class-validator` decorators for validation
- Use `@nestjs/swagger` decorators (`@ApiProperty`, `@ApiPropertyOptional`) for documentation
- All DTOs placed in a `dto/` subdirectory within the module
- Properties use `camelCase`

```typescript
export class ExampleDto {
  @ApiProperty({ example: 'value', description: 'Description' })
  @IsString()
  @IsNotEmpty()
  fieldName: string;
}
```

## Guard & Decorator Patterns

### Public Routes

```typescript
@Public()
@Get('endpoint')
publicEndpoint() { ... }
```

### Skip Email Verification

```typescript
@SkipEmailVerification()
@Get('me')
getProfile(@CurrentUser() user: { userId: string }) { ... }
```

### Current User Extraction

```typescript
@Get('me')
getProfile(@CurrentUser() user: { userId: string }) {
  return this.service.findById(user.userId);
}
```

## Service Patterns

- Services are `@Injectable()` and receive dependencies via constructor injection
- Repository classes abstract database operations; services contain business logic
- Services throw NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, `UnauthorizedException`, `BadRequestException`, `ForbiddenException`)
- Password hashing uses `bcrypt` with configurable rounds (default 12)
- Crypto operations use Node.js `crypto` module (not third-party libraries)

## Repository Patterns

- Each repository is `@Injectable()` with `@InjectModel()` for the Sequelize model
- Methods return `Promise<Model | null>` for single records, `Promise<Model[]>` for lists
- Use `{ raw: true }` option when plain objects are needed (avoids Sequelize model instances)
- The `update` method returns `[number, Model[]]` (Sequelize convention)

## Model Conventions

- Models use `sequelize-typescript` decorators
- Primary keys are UUIDs (`DataType.UUIDV4`)
- Table names are `snake_case`
- Column names in migrations are `snake_case`
- Model properties use `camelCase` (Sequelize `underscored: true` maps between them)
- Timestamps enabled with `created_at` / `updated_at`

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Files | kebab-case | `auth.service.ts` |
| Classes | PascalCase | `AuthService` |
| Methods | camelCase | `findByEmail()` |
| Variables | camelCase | `userRepository` |
| Constants | UPPER_SNAKE_CASE | `MAIL_PROVIDER` |
| Tables | snake_case | `users`, `password_reset_tokens` |
| Columns | snake_case | `user_id`, `is_email_verified` |
| Env vars | UPPER_SNAKE_CASE | `JWT_SECRET`, `DB_HOST` |

## Import Conventions

- External packages imported first
- Internal imports use relative paths from `src/` (e.g., `src/lib/jwt-strategy`)
- No path aliases in backend (unlike frontend's `@/` alias)
- Use `import type` for type-only imports when possible

## Error Handling

- Services throw standard NestJS exceptions, not raw Error objects
- Mail sending failures are caught and logged (`console.error`) without throwing (non-blocking)
- Authentication failures throw `UnauthorizedException`
- Validation failures are handled automatically by `ValidationPipe`
- Duplicate resource conflicts throw `ConflictException`
- Missing resources throw `NotFoundException`

## Swagger Documentation

- All controllers use `@ApiTags()` for grouping
- Public endpoints use `@Public()` decorator (excluded from auth)
- Auth-protected endpoints use `@ApiBearerAuth('bearerAuth')`
- Each endpoint has `@ApiOperation()` and `@ApiResponse()` decorators
- Request bodies use `@ApiBody({ type: DtoClass })`
- DTOs use `@ApiProperty()` / `@ApiPropertyOptional()` for schema generation

## Rate Limiting

Default global: 20 requests per 60 seconds. Per-route overrides via `@Throttle()`:

```typescript
@Throttle({ default: { ttl: 60_000, limit: 5 } })
```

Auth endpoints use stricter limits (3-5 requests per 60 seconds).

## Caching

Two caching approaches are available:

1. **Interceptor-based**: `@UseInterceptors(CacheInterceptor)` + `@CacheTTL(60_000)`
2. **Manual**: Inject `CACHE_MANAGER` and use `cache.get(key)` / `cache.set(key, value, ttl)`

Cache is backed by Redis when `REDIS_ENABLED=true`, otherwise in-memory.
