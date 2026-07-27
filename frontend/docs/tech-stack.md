# Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | React | ^19.2.4 |
| **Language** | TypeScript | ~5.9.3 |
| **Build tool** | Vite | ^8.0.1 |
| **Package manager** | npm | — |

---

## UI & Styling

| Library | Version | Purpose |
|---|---|---|
| MUI Core | ^7.3.9 | Primary UI component library (Material Design 3) |
| MUI Icons | ^7.3.9 | Material icon set |
| MUI X Date Pickers | ^9.7.0 | Date picker components |
| Emotion | ^11.14.0 | CSS-in-JS engine for MUI (`@emotion/react`, `@emotion/styled`) |
| Tailwind CSS | ^3.4.19 | Utility CSS (bridged to MUI theme vars, legacy usage) |
| PostCSS | ^8.5.8 | CSS post-processor (Tailwind pipeline) |
| react-toastify | ^11.0.5 | Toast/notification system |

---

## State Management

| Library | Version | Purpose |
|---|---|---|
| TanStack Query | ^5.95.2 | Server state / async data fetching (API queries & mutations) |

---

## Routing

| Library | Version | Purpose |
|---|---|---|
| React Router | ^7.13.2 | Client-side routing with lazy-loaded routes |

---

## Forms & Validation

| Library | Version | Purpose |
|---|---|---|
| Formik | ^2.4.9 | Form state management |
| Yup | ^1.7.1 | Form validation schemas |

---

## Networking

| Library | Version | Purpose |
|---|---|---|
| Axios | ^1.14.0 | HTTP client with interceptors (auth, 401 handling) |
| socket.io-client | ^4.8.3 | WebSocket client (real-time events) |

---

## Authentication

| Library | Version | Purpose |
|---|---|---|
| jwt-decode | ^4.0.0 | Decode JWT tokens client-side for user info |

---

## Internationalization

| Library | Version | Purpose |
|---|---|---|
| i18next | ^26.0.3 | i18n engine |
| react-i18next | ^17.0.2 | React bindings for i18next |

---

## Date & Time

| Library | Version | Purpose |
|---|---|---|
| dayjs | ^1.11.21 | Date manipulation (with utc and timezone plugins) |

---

## Testing

| Library | Version | Purpose |
|---|---|---|
| Vitest | ^4.1.2 | Unit & integration test runner |
| Testing Library (React) | ^16.3.2 | Component testing utilities |
| Testing Library (jest-dom) | ^6.9.1 | DOM matchers |
| Testing Library (user-event) | ^14.6.1 | Simulated user interactions |
| MSW | ^2.12.14 | API mocking (browser + server) |
| jsdom | ^29.0.1 | DOM environment for tests |

---

## Tooling & Build

| Library | Version | Purpose |
|---|---|---|
| TypeScript | ~5.9.3 | Type checking |
| Vite | ^8.0.1 | Dev server + production bundler |
| @vitejs/plugin-react | ^6.0.1 | Vite React plugin |
| ESLint | ^9.39.4 | Linting |
| typescript-eslint | ^8.57.0 | TypeScript ESLint rules |
| Autoprefixer | ^10.4.27 | CSS vendor prefixes |
