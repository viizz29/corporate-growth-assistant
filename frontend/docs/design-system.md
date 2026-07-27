# Design System

## Overview

This project uses **MUI (Material UI) v7** as its primary UI framework and styling engine. Tailwind CSS classes have been migrated to MUI `sx` props. The theme supports light and dark modes with a consistent design language across all components.

---

## Theme

Defined in `src/theme/theme.ts`, augmented via `src/theme/theme.d.ts`.

### Palette

| Token | Light | Dark |
|---|---|---|
| `primary.main` | `#1976d2` | `#90caf9` |
| `primary.light` | `#42a5f5` | `#e3f2fd` |
| `primary.dark` | `#1565c0` | `#42a5f5` |
| `secondary.main` | `#9c27b0` | `#ce93d8` |
| `background.default` | `#f5f5f5` | `#0f172a` |
| `background.paper` | `#ffffff` | `#1e293b` |
| `text.primary` | `#1a1a2e` | `#f1f5f9` |
| `text.secondary` | `#64748b` | `#94a3b8` |
| `divider` | `#e2e8f0` | `#334155` |
| `error.main` | `#ef4444` | `#f87171` |
| `warning.main` | `#f59e0b` | `#fbbf24` |
| `success.main` | `#22c55e` | `#4ade80` |
| `info.main` | `#3b82f6` | `#60a5fa` |

### Typography

| Variant | Size | Weight |
|---|---|---|
| `h1` | 2rem | 700 |
| `h2` | 1.5rem | 600 |
| `h3` | 1.25rem | 600 |
| `h4` | 1rem | 600 |
| `body1` | 1rem | 400 |
| `body2` | 0.875rem | 400 |

- Font family: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`

### Shape

- Default `borderRadius`: `12px`
- Buttons: `borderRadius: 8px`

### Component Overrides

- **MuiButton**: `textTransform: "none"`, `borderRadius: 8`
- **MuiPaper**: `borderRadius: 12`

---

## CSS Custom Properties

Injected onto `:root` by `ThemeProviderWrapper` (`src/theme/theme-provider-wrapper.tsx`), derived from the MUI theme:

```
--color-primary         --color-primary-light    --color-primary-dark
--color-secondary
--color-bg              --color-surface
--color-text            --color-text-secondary
--color-border
--color-error           --color-warning          --color-success  --color-info
```

These variables are bridged to Tailwind classes via `tailwind.config.js` (kept for backward compatibility).

---

## Dark Mode

Managed through React state in `App.tsx`:

1. **Initialization**: Reads `app-theme-mode` from `localStorage`, defaults to `"light"`
2. **Toggle**: `ThemeContext.toggleTheme()` flips the mode
3. **Side effects**: On mode change, `localStorage` is updated and the `dark` class on `<html>` is toggled (for any remaining Tailwind `dark:` selectors)
4. **Consumption**: Components read `mode` from `ThemeContext` or use MUI's theme callback in `sx` props

---

## Component Architecture

### Layout Components (`src/components/layouts/`)

| Component | Purpose |
|---|---|
| `main-layout.tsx` | App shell: drawer + header + `<Outlet />` |
| `header-component.tsx` | Top app bar with menu, date, theme toggle, user menu |
| `page-wrapper.tsx` | Shared page wrapper with gradient background |
| `page-header.tsx` | Reusable page header component |
| `sidebar-header-component.tsx` | Drawer header with app name |
| `sidebar-menu-item.tsx` | Sidebar navigation item |
| `theme-toggle-button.tsx` | Light/dark mode toggle |
| `user-menu.tsx` | Login state + user dropdown |

### Modal Components (`src/components/modals/`)

| Component | Base Component | Usage |
|---|---|---|
| `generic-modal.tsx` | MUI `Dialog` | Flexible modal with title, content, actions |
| `alert-modal.tsx` | `GenericModal` | Informational alerts (success/error/warning/info) |
| `confirmation-modal.tsx` | `GenericModal` | Confirm/cancel dialogs |
| `confirm-delete-dialog.tsx` | `GenericModal` | Delete confirmation dialog |

### Data Display Components (`src/components/data-display/`)

| Component | Purpose |
|---|---|
| `data-table.tsx` | Reusable data table |
| `empty-state.tsx` | Empty state placeholder |
| `loading-state.tsx` | Loading state indicator |
| `mui-skeleton-table.tsx` | Table loading skeleton |
| `stat-card.tsx` | Statistics display card |

### Form Components (`src/components/forms/`)

- `dynamic-form.tsx` + `dynamic-field.tsx`: Generic form builder
- `form-card.tsx`: Form card wrapper

### Navigation Components (`src/components/navigation/`)

- `breadcrumbs-component.tsx`: Navigation breadcrumbs (MUI-based)
- `language-switcher.tsx`: i18n language selector

### Other Components

- `navigate-setter.tsx`: Bridges React Router's `useNavigate` to a module-level utility for use outside of React components

---

## Styling Conventions

1. **Primary method**: MUI `sx` prop with theme token references (e.g., `bgcolor: "background.paper"`, `color: "text.primary"`)
2. **Theme callbacks**: Use `(theme) => ...` in `sx` when styles depend on mode (e.g., gradient backgrounds)
3. **Avoid**: Tailwind classes, inline `style` objects, plain CSS files
4. **Component overrides**: Use MUI's `styled()` API or `sx` — do not create `.module.css` files

### Theme Token Reference

Use these semantic tokens instead of hardcoded colors:

| sx value | Maps to |
|---|---|
| `bgcolor: "background.default"` | Page background |
| `bgcolor: "background.paper"` | Card/surface background |
| `color: "text.primary"` | Primary text |
| `color: "text.secondary"` | Secondary/muted text |
| `borderColor: "divider"` | Borders |
| `color: "primary.main"` | Primary brand color |
| `color: "error.main"` | Error state |

---

## Patterns

### Page Wrapper

Every page should be wrapped in `<PageWrapper>` to get the consistent gradient background:

```tsx
import PageWrapper from "@/components/layouts/page-wrapper";

export default function MyPage() {
  return <PageWrapper>{/* content */}</PageWrapper>;
}
```

### Gradient Background

The gradient is defined once in `PageWrapper` and applied to all pages:

- **Light**: `linear-gradient(135deg, rgba(25, 118, 210, 0.12), rgba(236, 64, 122, 0.08) 46%, transparent 72%)`
- **Dark**: `linear-gradient(135deg, rgba(25, 118, 210, 0.22), rgba(156, 39, 176, 0.12) 45%, transparent 72%)`
