# Testing

## Overview

- **Unit tests**: Jest with `ts-jest`
- **E2E tests**: Jest + Supertest
- **Test naming**: `*.spec.ts` (unit), `*.e2e-spec.ts` (E2E)
- **Test location**: Co-located with source for unit tests, `test/` directory for E2E

## Commands

```bash
npm test              # Run all unit tests (single run)
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run with coverage report
npm run test:debug    # Debug tests with Node inspector
npm run test:e2e      # Run E2E tests
```

## Unit Test Configuration

Configured in `package.json`:

```json
{
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "moduleNameMapper": { "^src/(.*)$": "<rootDir>/$1" },
  "testEnvironment": "node"
}
```

- Root directory: `src/`
- Module path mapping: `src/*` resolves correctly
- Environment: Node.js

## E2E Test Configuration

Configured in `test/jest-e2e.json`:

```json
{
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

## Test Patterns

### Unit Test Structure

Tests follow the Arrange-Act-Assert pattern with `describe` blocks for each method:

```typescript
describe('MethodName', () => {
  it('should do expected behavior', async () => {
    // Arrange
    repository.findByEmail.mockResolvedValue(mockUser as any);

    // Act
    const result = await service.methodName('input');

    // Assert
    expect(repository.findByEmail).toHaveBeenCalledWith('input');
    expect(result).toEqual(expectedOutput);
  });
});
```

### Mocking Strategy

**NestJS Testing Module**: Services are tested in isolation using `Test.createTestingModule()` with mock providers:

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    ServiceUnderTest,
    {
      provide: Dependency,
      useValue: {
        method: jest.fn(),
      },
    },
  ],
}).compile();

service = module.get(ServiceUnderTest);
dependency = module.get(Dependency);
```

**External modules** are mocked with `jest.mock()`:

```typescript
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomBytes: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue('mock-token-hex'),
    }),
    randomInt: jest.fn().mockReturnValue(123456),
    randomUUID: jest.fn().mockReturnValue('mock-uuid'),
  };
});
```

### Guard Tests

Guards are tested by creating a mock `ExecutionContext` and testing the `canActivate` method:

```typescript
const mockContext = (path: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ route: { path }, url: path }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  }) as unknown as ExecutionContext;
```

### E2E Test Structure

```typescript
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
```

## Existing Test Files

### Unit Tests

| File | Coverage |
|---|---|
| `auth/auth.service.spec.ts` | Register, login, 2FA, password reset, email verification |
| `auth/auth.controller.spec.ts` | Controller method delegation |
| `users/users.service.spec.ts` | CRUD, email preferences, test user seeding |
| `users/users.controller.spec.ts` | Controller method delegation |
| `common/guards/jwt-auth.guard.spec.ts` | Public route bypass, JWT delegation |
| `common/guards/email-verified.guard.spec.ts` | Email verification check |
| `common/field-name-transformer.interceptor.spec.ts` | snake_case to camelCase conversion |
| `app/app.service.spec.ts` | AppService basics |
| `app/app.controller.spec.ts` | AppController basics |
| `health/health.controller.spec.ts` | Health check endpoints |
| `health/redis-health-indicator.spec.ts` | Redis health check |
| `mail/mail.service.spec.ts` | Mail sending methods |
| `mail/template.service.spec.ts` | Template rendering |
| `mail/providers/smtp.provider.spec.ts` | SMTP transport |

### E2E Tests

| File | Coverage |
|---|---|
| `test/app.e2e-spec.ts` | Root endpoint (`GET /`) |

## Mocking Conventions

- **Repositories**: All methods mocked with `jest.fn()`, return values set per test
- **Services** (MailService, etc.): Methods mocked to resolve or reject
- **ConfigService**: Uses `jest.fn((key, defaultValue) => ...)` pattern
- **External modules** (bcrypt, crypto): Mocked at module level with `jest.mock()`
- **JWT Service**: Mocked with `sign` and `verify` methods
- **Response objects**: Not typically mocked in unit tests (passthrough `@Res()`)

## Test User

In non-production environments, `UsersService.onModuleInit()` auto-seeds:
- Email: `test@gmail.com`
- Password: `password123`
- Pre-verified: `isEmailVerified: true`

This is useful for manual testing but does not affect automated test suites.
