# Project Folder Structure

```
src/
├── api/
│   ├── auth-api.ts
│   ├── auth-api.test.ts
│   ├── client.ts
│   └── client.test.ts
│
├── assets/
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
│
├── components/
│   ├── data-display/
│   │   ├── data-table.tsx
│   │   ├── data-table.test.tsx
│   │   ├── empty-state.tsx
│   │   ├── empty-state.test.tsx
│   │   ├── loading-state.tsx
│   │   ├── loading-state.test.tsx
│   │   ├── mui-skeleton-table.tsx
│   │   ├── mui-skeleton-table.test.tsx
│   │   ├── stat-card.tsx
│   │   └── stat-card.test.tsx
│   ├── forms/
│   │   ├── dynamic-field.tsx
│   │   ├── dynamic-field.test.tsx
│   │   ├── dynamic-form.tsx
│   │   ├── dynamic-form.test.tsx
│   │   └── form-card.tsx
│   ├── layouts/
│   │   ├── header-component.tsx
│   │   ├── main-layout.tsx
│   │   ├── page-header.tsx
│   │   ├── page-wrapper.tsx
│   │   ├── sidebar-header-component.tsx
│   │   ├── sidebar-menu-item.tsx
│   │   ├── theme-toggle-button.tsx
│   │   └── user-menu.tsx
│   ├── modals/
│   │   ├── alert-modal.tsx
│   │   ├── alert-modal.test.tsx
│   │   ├── confirm-delete-dialog.tsx
│   │   ├── confirm-delete-dialog.test.tsx
│   │   ├── confirmation-modal.tsx
│   │   ├── confirmation-modal.test.tsx
│   │   ├── generic-modal.tsx
│   │   └── generic-modal.test.tsx
│   ├── navigation/
│   │   ├── breadcrumbs-component.tsx
│   │   └── language-switcher.tsx
│   ├── schedule/
│   └── navigate-setter.tsx
│
├── context/
│   ├── auth-provider.tsx
│   ├── auth-provider.test.tsx
│   ├── use-auth.ts
│   └── use-auth.test.tsx
│
├── hooks/
│
├── i18n/
│   └── config.ts
│
├── mocks/
│   ├── auth-handlers.ts
│   ├── browser.ts
│   └── server.ts
│
├── pages/
│   ├── auth/
│   │   ├── forgot-password.tsx
│   │   ├── forgot-password-form.tsx
│   │   ├── login.tsx
│   │   ├── login.test.tsx
│   │   ├── login-form.tsx
│   │   ├── register.tsx
│   │   ├── register.test.tsx
│   │   ├── register-form.tsx
│   │   ├── register-form.test.tsx
│   │   ├── resend-verification.tsx
│   │   ├── resend-verification-form.tsx
│   │   ├── reset-password.tsx
│   │   ├── reset-password-form.tsx
│   │   └── verify-email.tsx
│   ├── dashboard/
│   │   └── dashboard.tsx
│   ├── misc/
│   │   └── not-found.tsx
│   ├── profile/
│   │   └── profile.tsx
│   └── settings/
│       └── settings.tsx
│
├── providers/
│   ├── local-storage-provider.tsx
│   ├── local-storage-provider.test.tsx
│   ├── socket-provider.tsx
│   └── socket-provider.test.tsx
│
├── routes/
│   ├── app-routes.tsx
│   └── app-routes.test.tsx
│
├── services/
│   ├── socket.ts
│   └── socket.test.ts
│
├── theme/
│   ├── theme.ts
│   ├── theme-context.ts
│   ├── theme.d.ts
│   └── theme-provider-wrapper.tsx
│
├── utils/
│   ├── format-date.ts
│   ├── format-date.test.ts
│   ├── navigate.ts
│   ├── navigate.test.ts
│   ├── timezones.ts
│   └── timezones.test.ts
│
├── App.css
├── App.tsx
├── config.ts
├── index.css
├── main.tsx
├── setup-tests.ts
└── test-utils.tsx
```

## Directory Legend

| Directory | Purpose |
|---|---|
| `api/` | Axios client + API endpoint modules |
| `assets/` | Static images (png, svg) |
| `components/data-display/` | Reusable data display components (tables, cards, states) |
| `components/forms/` | Form builder components |
| `components/layouts/` | App shell layout components |
| `components/modals/` | Modal/dialog components |
| `components/navigation/` | Navigation-related components |
| `components/schedule/` | Schedule-related components (placeholder) |
| `context/` | React context providers and hooks (auth) |
| `hooks/` | Custom React hooks (placeholder) |
| `i18n/` | Internationalization config |
| `mocks/` | MSW mock service worker handlers |
| `pages/` | Page-level components (one subdir per route) |
| `providers/` | React context providers (localStorage, socket) |
| `routes/` | Route definitions |
| `services/` | Service-layer modules (socket) |
| `theme/` | MUI theme config, types, context |
| `utils/` | Utility functions (date, navigation, timezone) |
