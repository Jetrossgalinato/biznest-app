# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + build (parallel)
npm run build-only   # Vite build without type-check
npm run type-check   # vue-tsc type checking only
npm run lint         # Run oxlint then eslint (both with --fix)
npm run format       # Prettier format src/
npm run test:unit    # Run Vitest unit tests
npm run preview      # Preview production build
```

Node version requirement: `^20.19.0 || >=22.12.0`

## Architecture

Vue 3 SPA admin dashboard with geospatial features (hazard/zoning map layers), user management, roles/permissions, and CSV/PDF reporting. Backed by Supabase (PostgreSQL + Auth + RPC).

### Layer Responsibilities

| Layer | Location | Role |
|---|---|---|
| Views | `src/views/` | Route-level orchestration — fetch via services, coordinate stores. No direct API calls. |
| Components | `src/components/` | Presentational only. No direct API calls, no store imports (receive props, emit events). |
| Services | `src/services/` | All Supabase calls live here. Never call `fetch`/`axios` outside services. |
| Stores | `src/stores/` | Pinia setup-syntax stores — hold reactive state, call services, expose computed getters. |
| Composables | `src/composables/` | Stateful Vue hooks with `use` prefix (e.g. `useAuth`, `usePagination`). |
| Types | `src/types/` | Centralized interfaces, enums. No `any`. |
| Utils | `src/utils/` | Stateless pure helpers — no Vue imports. |
| Layouts | `src/layouts/` | Top-level wrappers (`OuterLayout`, `AuthLayout`, `InnerLayout`) containing `<router-view />`. |

### Routing & Auth Guards

Routes are defined in `src/router/index.ts`. Navigation guards enforce:
- `meta.requiresAuth` — redirects to `/auth` if not logged in
- `meta.requiresGuest` — redirects to `/admin` if already logged in
- `meta.requiresSuperadmin` — checks `useAuthStore().isSuperAdmin`

Guards wait for `store.isInitialized` before making decisions to avoid race conditions with the Supabase auth listener.

Route layout mapping:
- `/` → `OuterLayout` (landing)
- `/auth/*` → `AuthLayout` (login, register)
- `/admin/*` → `InnerLayout` (sidebar + navbar, all protected)

### State Management

Pinia stores use setup syntax. Each store integrates with `useAlertContext()` to display errors. Key stores:
- `useAuthStore` — session, user, `isLoggedIn`, `isSuperAdmin`, `initializeAuthListener()`
- `useUsersStore` — user list with search/role filter computed properties
- `useReportsStore`, `useRolesStore` — domain-specific state

### Supabase Data Fetching

`src/services/supabase.client.ts` exports a lazy singleton client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Services prefer RPC functions (`.rpc()`) with fallback to direct table queries (`.from().select()`).

Error handling: services throw `Error` with descriptive messages → caught in store actions → surfaced via `useAlertContext().showAlert()`.

### Map Features

Map composables in `src/composables/map/`:
- `useLeafletMapAdapter` / `useGoogleMapAdapter` — abstract the mapping library
- `useBarangayBorders` — loads geospatial boundary data

Map components in `src/components/map/` — hazard and zoning overlays rendered as Leaflet layers.

## Code Conventions

- All Vue components use `<script setup lang="ts">` — no Options API
- Use `@/` absolute imports, not relative paths
- Naming: Components (PascalCase), composables (camelCase with `use` prefix), TS files (kebab-case or camelCase)
- TypeScript strict mode — no `any`
- Tailwind CSS for all styling; Reka UI for primitives; Lucide Vue Next for icons