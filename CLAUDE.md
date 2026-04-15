# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Type-check + build for production (tsc -b && vite build)
npm run lint       # Run ESLint (flat config)
npm run preview    # Preview the production build locally
```

No test runner is configured yet.

## Architecture

This is a React 19 + TypeScript + Vite SPA for "Cumbre PPLN 2026". The UI language is Spanish.

**Routing** (`src/router/AppRouter.tsx`) uses React Router v7 with two routes:
- `/` → `LoginPage` (renders the `Login` component)
- `/dashboard` → `Dashboard`

**Layer separation:**
- `src/components/` — reusable UI components (e.g., `Login/`)
- `src/pages/` — route-level pages that compose components (`LoginPage`, `Dashboard`)
- `src/types/` — shared TypeScript interfaces (`auth.types.ts` defines `User`, `AuthState`, `LoginCredentials`, `AuthResponse`)
- `src/styles/` — shared CSS

**Auth:** The auth types and login form scaffold exist, but backend integration is not yet implemented (placeholder comment in `Login.tsx`). The `@anthropic-ai/sdk` package is installed but not yet wired up.

**TypeScript config** is strict (`noUnusedLocals`, `noUnusedParameters`, `strictNullChecks`). ESLint uses the flat config format with `react-hooks` and `react-refresh` plugins.