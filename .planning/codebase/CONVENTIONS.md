# Code Conventions & Patterns

**Analysis Date:** 2026-10-01

## Naming Patterns

- **Files & Directories:**
  - React Components: PascalCase (e.g. `DonutChart.tsx`, `Sidebar.tsx`, `LoadingSpinner.tsx`)
  - Route Handlers / Pages: Lowercase per Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`)
  - Services: camelCase with `Service` suffix (e.g. `authService.ts`, `todoService.ts`)
  - Hooks: camelCase with `use` prefix (e.g. `useAuth.ts`, `useTheme.ts`)
  - SQL Migrations: Snake-case with timestamp prefix (`YYYYMMDD_description.sql`)
- **Variables & Functions:**
  - camelCase for functions, variables, and service methods (e.g. `getUserTodos`, `addExpense`, `handleNewUser`)
  - UPPER_SNAKE_CASE for module-level constants (e.g. `JOURNAL_PREFIX`, `KEY_DERIVATION_ITERATIONS`)
- **Types & Interfaces:**
  - PascalCase for interfaces, types, and enums (e.g. `User`, `TodoItem`, `Priority`, `AuthResponse`)
  - No `I` prefix on interfaces (e.g. `TodoItem`, not `ITodoItem`)

## Code Style

- **Formatting:** Standard TypeScript / Prettier style:
  - 2 spaces indentation
  - Double quotes for JSX and standard strings
  - Semicolons enforced
  - Trailing commas in multi-line objects and arrays
- **CSS / Styling:**
  - Tailwind CSS utility classes composed with `cn()` from `@/lib/utils`
  - Design tokens rely on CSS custom properties defined in `app/globals.css` with the `dash-*` prefix:
    - Backgrounds: `bg-dash-background`, `bg-dash-surface`, `bg-dash-surface-hover`
    - Borders: `border-dash-border`, `border-dash-border-subtle`
    - Text: `text-dash-text`, `text-dash-text-muted`
    - Accents: `bg-dash-accent`, `text-dash-accent`, `bg-dash-accent-bg`

## Import Organization

Imports follow a structured grouping separated by newlines:
1. React & framework built-ins (`react`, `next/navigation`, `next/server`)
2. Third-party packages (`@supabase/supabase-js`, `lucide-react`, `motion`)
3. Internal domain modules using `@/*` root alias:
   - `@/types`
   - `@/services`
   - `@/hooks`
   - `@/context`
   - `@/components/*`
   - `@/lib/*`

Example from `app/dashboard/layout.tsx`:
```typescript
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
```

## Error Handling

- **Services:** Throw raw error instances from Supabase when requests fail (`if (error) throw error;`).
- **UI Layers:** Catch errors in UI action handlers and render user-friendly messages via toasts (`components/ui/Toast.tsx`) or inline state:
  ```typescript
  try {
    await todoService.addTodo(user.id, text, priority);
    toast.success("Task created");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Failed to create task");
  }
  ```
- **Auth Errors:** Normalized using `lib/authErrors.ts` to translate Supabase Auth API codes into human-readable sentences.
- **Uncaught Component Errors:** Captured by `components/common/ErrorBoundary.tsx` preventing entire application unmounts.

## Logging

- No verbose `console.log` in production services or production builds.
- Critical errors during key derivation or auth flows may be captured using `console.error` before graceful fallback.

## Comments & Documentation

- **Philosophy:** Follows the *Ponytail* lazy senior dev mode ([.agents/AGENT.md](file:///d:/project/saas_starter/.agents/AGENT.md)): code should be self-documenting; comments explain "why", not "what".
- **Database Fallbacks:** Explicit comments explain compatibility decisions (e.g. conditional fields for unapplied optional migrations).
- **Crypto Comments:** Detailed notes in `lib/journalCrypto.ts` explaining envelope structures, iterations count, and security trade-offs.

## Function & Module Design

- **Barrel Pattern:** Every sub-folder (`components/`, `services/`, `context/`, `hooks/`, `types/`) exposes an `index.ts` barrel file to keep imports clean and maintainable.
- **Service Objects:** Services are organized as cohesive singleton objects containing grouped async methods:
  ```typescript
  export const todoService = {
    async getUserTodos(userId: string): Promise<TodoItem[]> { ... },
    async addTodo(userId: string, text: string, ...): Promise<TodoItem> { ... },
  };
  ```
- **Polymorphic UI Primitives:** UI atoms like `Button` use Radix UI `Slot` to allow component rendering as `<a>`, `<button>`, or custom links without wrapper divs.

---

*Conventions analysis: 2026-10-01*
*Update when conventions or linting rules evolve*
