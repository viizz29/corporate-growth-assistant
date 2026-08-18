# Corporate Growth Assistant Frontend

React/Vite frontend for Corporate Growth Assistant. It gives job seekers a workspace for maintaining profile data, saving job advertisements, reviewing ATS scores, and generating or downloading tailored resume PDFs.

## Stack

- React 19 + TypeScript
- Vite
- Material UI 7 and MUI X date pickers
- React Router 7 with lazy-loaded pages
- TanStack Query
- Axios
- Formik + Yup
- i18next with English and Hindi resources
- Socket.IO client, currently optional
- Vitest, Testing Library, MSW

## Getting Started

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Vite serves the app at `http://localhost:5173`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Run TypeScript build checks and create `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest once |

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_APP_NAME` | App display name | `Corporate Growth Assistant` |
| `VITE_MOCK_API_ON` | Use MSW mocks when `true` | `false` |
| `VITE_BACKEND_SERVER` | Backend origin | `http://localhost:3000` |
| `VITE_API_BASE_URL` | Backend base path before API routes | `/api` |
| `VITE_SOCKETIO_ENABLED` | Enable Socket.IO connection | `false` |
| `VITE_SOCKETIO_ENDPOINT` | Socket.IO path | `/ws` |

## User Flows

- Public auth pages: login, registration, forgot/reset password, email verification, and resend verification.
- Authenticated workspace: dashboard, profile summary, personal info, education, work experience, skills, projects, job advertisements, and settings.
- Email-verified workspace: ATS scoring, ATS score detail, resume generation, and past resume history.
- Preferences: language switching, light/dark theme, email notifications, and 2FA toggling.

## Routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/login` | Sign in | Public only |
| `/register` | Create account | Public only |
| `/forgot-password` | Request reset link | Public only |
| `/reset-password` | Complete reset | Public |
| `/verify-email` | Verify email token | Public |
| `/resend-verification` | Request a new verification email | Public only |
| `/verify-email-pending` | Prompt unverified users | Authenticated |
| `/` | Dashboard | Authenticated |
| `/profile` | Profile summary | Authenticated |
| `/profile/edit` | Personal info | Authenticated |
| `/profile/education` | Education entries | Authenticated |
| `/profile/work-experience` | Work experience entries | Authenticated |
| `/profile/skills` | Skill entries | Authenticated |
| `/profile/projects` | Project entries | Authenticated |
| `/job-ads` | Saved job ads | Authenticated |
| `/job-ads/new` | Create job ad | Authenticated |
| `/job-ads/:id` | Edit job ad | Authenticated |
| `/ats` | ATS score list | Verified email |
| `/ats/:jobAdId` | ATS score detail and recommendations | Verified email |
| `/resumes` | Generate resume | Verified email |
| `/resumes/history` | Generated resume history | Verified email |
| `/settings` | Account preferences | Authenticated |

## Source Layout

```text
src/
├── api/              # Axios client and typed API wrappers
├── assets/           # Static image assets
├── components/       # Shared layout, forms, data display, modals, PDF viewer
├── context/          # Auth context and hooks
├── hooks/            # TanStack Query hooks and query keys
├── i18n/             # English/Hindi translation setup
├── mocks/            # MSW handlers and test server/browser setup
├── pages/            # Route-level screens
├── providers/        # Local storage, preferences sync, socket provider
├── routes/           # React Router route tree and guards
├── services/         # Socket service
├── theme/            # MUI theme and theme context
└── utils/            # Date, navigation, and timezone helpers
```

## API Integration

The frontend uses typed wrappers in `src/api/`:

- `auth-api.ts` for account, session, email verification, reset, and 2FA calls.
- `users-api.ts` for profile, education, work experience, skills, and projects.
- `job-ads-api.ts` for job advertisement CRUD.
- `ats-api.ts` for score computation and cached score retrieval.
- `resumes-api.ts` for templates, generation, preview, download, and history.

The shared Axios client sends credentials with requests and handles auth failures through the navigation utility.

## Testing

Tests are written with Vitest and Testing Library. MSW is available for API mocking.

```bash
npm test
```
