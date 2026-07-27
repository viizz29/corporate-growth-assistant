# Nest + React App Boilerplate -- Frontend

React frontend boilerplate with authentication, layout system, i18n, and testing setup. Designed to pair with a NestJS backend.

## Stack

- React 19 + TypeScript
- Vite
- Material UI 7
- Tailwind CSS
- React Router 7
- TanStack Query
- Axios
- Formik + Yup
- i18next (English + Hindi)
- Socket.IO client
- Vitest + Testing Library
- MSW (mock service worker)

## Getting Started

### Install dependencies

```bash
npm ci
```

### Start the app

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

## Scripts

```bash
npm run dev        # start dev server
npm run build      # type-check and build
npm run preview    # preview production build
npm run lint       # lint with eslint
npm test           # run tests with vitest
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description | Default |
|---|---|---|
| `VITE_APP_NAME` | App display name | `App Name` |
| `VITE_MOCK_API_ON` | Set `true` to use MSW mocked APIs | `false` |
| `VITE_BACKEND_SERVER` | NestJS backend URL | `http://localhost:3000` |
| `VITE_API_BASE_URL` | API path prefix | `""` |
| `VITE_SOCKETIO_ENABLED` | Enable Socket.IO connection | `false` |
| `VITE_SOCKETIO_ENDPOINT` | Socket.IO path | `/ws` |

## Folder Structure

```text
src/
├── api/                 # axios client and API wrappers
├── assets/              # images and icons
├── components/          # shared UI components
│   ├── data-display/    # tables, stat cards, empty/loading states
│   ├── forms/           # dynamic form components
│   ├── layouts/         # sidebar, header, page wrappers
│   ├── modals/          # alert, confirmation, generic modals
│   ├── navigation/      # breadcrumbs, language switcher
│   └── schedule/        # schedule components (placeholder)
├── context/             # auth provider and hooks
├── hooks/               # custom React hooks (placeholder)
├── i18n/                # i18next config (en, hi)
├── mocks/               # MSW mock handlers
├── pages/               # route-level screens
│   ├── auth/            # login, register, password reset, email verify
│   ├── dashboard/       # dashboard page
│   ├── misc/            # 404 page
│   ├── profile/         # profile page
│   └── settings/        # settings page
├── providers/           # localStorage, socket providers
├── routes/              # React Router definitions
├── services/            # socket service
├── theme/               # MUI theme and dark/light mode context
└── utils/               # date, navigation, timezone helpers
```

## Routing

Routes are defined in `src/routes/app-routes.tsx`. All page components are lazy-loaded for code splitting.

### Public routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/resend-verification`

### Protected routes

- `/` -- Dashboard
- `/profile` -- Profile
- `/settings` -- Redirects to `/profile`

Protected pages use a `PrivateRoute` wrapper that redirects unauthenticated users to `/login`. Authenticated users visiting public auth routes are redirected to `/`.

## Architecture

The app entry point is `src/main.tsx`, which wraps the component tree with:

- `QueryClientProvider` -- server state (TanStack Query)
- `LocalStorageProvider` -- typed localStorage access
- `AuthProvider` -- JWT auth context
- `SocketProvider` -- Socket.IO connection
- `BrowserRouter` -- routing

Then `src/App.tsx` adds:

- `ThemeContext.Provider` -- dark/light mode state
- `ThemeProviderWrapper` -- MUI theme + CSS custom properties
- `LocalizationProvider` -- dayjs date pickers
- `ToastContainer` -- toast notifications

## Auth Flow

Authentication is handled in `src/context/auth-provider.tsx`:

- Uses TanStack Query to fetch user profile on mount (`GET /api/v1/users/me`)
- Hydrates auth state once the query resolves
- Exposes `user`, `logout`, and `updateProfile` via React context
- Redirects to login on token expiry (via the Axios client and navigate utility)

The shared Axios client (`src/api/client.ts`) attaches credentials via `withCredentials: true`.

## i18n

Translations are configured in `src/i18n/config.ts` with support for:

- **English** (`en`) -- default/fallback
- **Hindi** (`hi`)

Use the `useTranslation` hook and `t()` function to access translations in components.

## Testing

Tests are written with Vitest and React Testing Library. MSW provides API mocking.

```bash
npm test
```

Tests are co-located with source files using the `*.test.ts` / `*.test.tsx` naming convention.

## Docker

The frontend includes a `Dockerfile` and `nginx.conf` for containerized builds:

1. Builds the Vite app in a `node:20-alpine` builder stage
2. Copies the output into an `nginx:alpine` production stage
3. Serves static files from Nginx with SPA fallback
4. Proxies `/api` and `/ws` requests to the backend container
