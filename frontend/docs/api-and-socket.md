# API Client & WebSocket Architecture

---

## HTTP API Client

### Configuration (`src/config.ts`)

| Variable | Env Key | Default |
|---|---|---|
| `APP_NAME` | `VITE_APP_NAME` | `"App Name"` |
| `MOCK_API_ON` | `VITE_MOCK_API_ON` | `false` |
| `BACKEND_SERVER` | `VITE_BACKEND_SERVER` | `"http://localhost:3000"` |
| `API_BASE_URL` | `VITE_API_BASE_URL` | `""` |
| `SOCKETIO_ENABLED` | `VITE_SOCKETIO_ENABLED` | `false` |
| `SOCKETIO_ENDPOINT` | `VITE_SOCKETIO_ENDPOINT` | `"/ws"` |

### Axios Client (`src/api/client.ts`)

A shared Axios instance configured with:

```ts
baseURL = MOCK_API_ON
  ? API_BASE_URL                          // e.g. "/api" (relative)
  : `${BACKEND_SERVER}${API_BASE_URL}`    // e.g. "http://localhost:3000/api"
```

The client uses `withCredentials: true` for cookie-based auth. A response interceptor rejects errors without special 401 handling (auth state is managed by the `AuthProvider` via TanStack Query).

---

### API Modules

All modules import the shared `api` client from `./client`.

#### `src/api/auth-api.ts`

| Function | Method | Endpoint | Returns |
|---|---|---|---|
| `loginApi` | POST | `/api/v1/auth/login` | `{ token, user }` |
| `registerApi` | POST | `/api/v1/auth/register` | Response |
| `logoutApi` | POST | `/api/v1/auth/logout` | — |
| `getProfileApi` | GET | `/api/v1/users/me` | `UserProfileInfo` |
| `updateProfileApi` | PATCH | `/api/v1/users/me` | `UserProfileInfo` |
| `getEmailPreferencesApi` | GET | `/api/v1/users/me/email-preferences` | `EmailPreferences` |
| `updateEmailPreferencesApi` | PUT | `/api/v1/users/me/email-preferences` | `EmailPreferences` |
| `resendEmailVerificationLink` | POST | `/api/v1/auth/resend-verification` | Response |
| `verifyEmailApi` | POST | `/api/v1/auth/verify-email` | Response data |
| `forgotPasswordApi` | POST | `/api/v1/auth/forgot-password` | Response data |
| `resetPasswordApi` | POST | `/api/v1/auth/reset-password` | Response data |
| `verifyOtpLoginApi` | POST | `/api/v1/auth/verify-otp-login` | Response data |
| `toggle2faApi` | POST | `/api/v1/auth/toggle-2fa` | Response data |

**Types:**

```ts
type UserProfileInfo = {
  userId: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  is2faEnabled: boolean;
  isEmailNotificationsEnabled: boolean;
};

type UserProfileUpdateData = { name: string; email: string; };
type EmailPreferences = { emailNotifications: boolean; };
```

---

### Mock API (`src/mocks/`)

When `VITE_MOCK_API_ON=true`, MSW (Mock Service Worker) intercepts requests in the browser.

| Handler | Method | URL | Returns |
|---|---|---|---|
| `login` | POST | `/api/v1/auth/login` | Hardcoded JWT + user object |

Setup in `src/main.tsx`:
```ts
if (MOCK_API_ON) {
  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}
```

MSW is also configured for tests via `src/mocks/server.ts` (node server) and `src/setup-tests.ts`.

---

## WebSocket Architecture

### Singleton Socket Connection (`src/services/socket.ts`)

A singleton `SocketConnection` class wraps `socket.io-client`:

```
┌─────────────────────────────────────────────────────┐
│                    SocketConnection                  │
├─────────────────────────────────────────────────────┤
│  - socket: Socket | null                            │
│  - listeners: ListenerMap                           │
├─────────────────────────────────────────────────────┤
│  + connect(): void                                  │
│  + disconnect(): void                               │
│  + addEventListener<K>(event, listener): () => void │
│  + test(): void                                     │
└─────────────────────────────────────────────────────┘
         ▲
         │ singleton
         │
   getSocket(): SocketConnection
```

**Connect flow:**
1. `connect()` creates a new `io` instance pointing to `BACKEND_SERVER`
2. Transport forced to `websocket` only
3. `autoConnect: false` — connection is explicit
4. `socket.onAny` catches all events and dispatches to registered typed listeners
5. `socket.connect()` is called explicitly

**Event system:**

| Event | Payload |
|---|---|
| `new_message` | `{ roomId, content: { type, content } }` |
| `message_delivered` | `{ messageId }` |
| `message_read` | `{ messageId, readAt }` |

Listeners are registered via `addEventListener` which returns an unsubscribe function.

### Socket Provider (`src/providers/socket-provider.tsx`)

```
main.tsx
  └── QueryClientProvider
        └── LocalStorageProvider
              └── AuthProvider
                    └── SocketProvider         ← here
                          └── BrowserRouter
                                └── ...
```

**Behavior:**
- Calls `getSocket()` once to get the singleton
- Reads `isAuthReady` from `AuthContext`
- When `isAuthReady && SOCKETIO_ENABLED`, calls `socket.connect()`
- On unmount or `isAuthReady` change, calls `socket.disconnect()`
- Exposes `useSocket()` hook that returns the `SocketConnection` instance

**Usage in components:**
```tsx
import { useSocket } from "@/providers/socket-provider";

function MyComponent() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    const unsub = socket.addEventListener("new_message", (payload) => {
      console.log(payload);
    });
    return unsub;
  }, [socket]);
}
```

### Architecture Diagram

```
┌──────────────┐     MSW (when MOCK_API_ON=true)
│  Component   │◄──── intercepts HTTP
└──────┬───────┘
       │ HTTP (axios)          WebSocket
       ▼                              ▼
┌──────────────┐           ┌──────────────────────┐
│  API Modules │           │  SocketConnection     │
│  (auth-api)  │           │  (singleton service)  │
└──────┬───────┘           └──────────┬───────────┘
       │                              │
       ▼                              ▼
┌──────────────┐           ┌──────────────────────┐
│  Axios Client│           │  socket.io-client    │
│  (withCreds) │           │  (websocket only)    │
└──────┬───────┘           └──────────────────────┘
       │
       ▼
┌──────────────────┐
│  Backend Server  │
│  (:3000)         │
└──────────────────┘
```
