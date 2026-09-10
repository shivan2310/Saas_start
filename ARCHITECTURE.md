# Architecture

Nivio is built on the Next.js 14 App Router with client-side Supabase integration, zero-trust cryptographic layers, and a modular domain architecture.

## Key Layers

- **`supabase/client.ts`**: Initializes the client-side Supabase browser client with Row Level Security.
- **`supabase/schema.sql`**: Defines relational tables (`users`, `todos`, `expenses`, `importantDates`, `diary`), triggers, and RLS policies.
- **`lib/journalCrypto.ts`**: Web Crypto API implementation providing AES-256-GCM zero-knowledge client-side encryption and PBKDF2-SHA-256 key wrapping.
- **`services/`**: Modular domain services for data operations:
  - `authService.ts`: Registration, login, password recovery, email verification, and session key orchestration.
  - `userService.ts`: User profile retrieval, updates, and wrapped journal key management.
  - `todoService.ts`: Task creation, priority management, due dates, and completion status.
  - `expenseService.ts`: Financial logging, categorizations, and expense deletion.
  - `dateService.ts`: Important dates and reminder scheduling.
  - `diaryService.ts`: Encrypted journal storage, on-device encryption/decryption, and migration.
  - `personalService.ts`: Unified facade preserving backward compatibility across personal domains.
  - `index.ts`: Central barrel export for all services.
- **`components/`**:
  - `common/`: Cross-cutting components including `ErrorBoundary`.
  - `ui/`: Design system primitives (`Button`, `Card`, `Input`, `Modal`, `Toast`, etc.).
  - `dashboard/`: Dashboard layout elements (`Sidebar`, `TopNavbar`, `DonutChart`, `ExpenseChart`).
  - `landing/`: Marketing and landing experience (`NivioLanding`, `Hero`, `Features`, `CTA`).
  - `layout/`: Shared navigation and footer layouts.
  - `index.ts`: Central barrel export for components.
- **`context/` & `hooks/`**: Global auth and theme state providers with ergonomic custom hooks (`useAuth`, `useTheme`).
- **`middleware.ts`**: Enforces strict HTTP security headers (HSTS, CSP, Clickjacking protection, MIME sniffing protection).
