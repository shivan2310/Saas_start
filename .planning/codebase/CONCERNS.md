# Technical Concerns & Debt

**Analysis Date:** 2026-10-01

## Security Considerations

### 1. Client-Side Only Route Protection
- **Issue:** Route guarding is handled in `app/dashboard/layout.tsx` using `useEffect` and `router.replace("/login")`.
- **Risk:** While Postgres Row Level Security (RLS) guarantees that data is not leaked, the initial HTML shell and client JavaScript bundles are transmitted to unauthorized users before redirection.
- **Remediation:** Implement server-side session verification in Next.js middleware using `@supabase/ssr` or cookies to redirect at the edge before client hydration.

### 2. Decrypted Session Key in LocalStorage
- **Issue:** In `lib/journalCrypto.ts`, the decrypted journal session key is stored in browser `localStorage` under `nivio:journal:session-key:v1:<userId>`.
- **Risk:** `localStorage` persists across browser sessions and is accessible to any script executing on the origin. If an XSS vulnerability is introduced, the key can be exfiltrated.
- **Remediation:** Shift session keys to in-memory React state or `sessionStorage` (which clears when the browser tab is closed).

### 3. Password Reset vs. Encrypted Journal Key Lockout
- **Issue:** The master journal key is encrypted using a key derived from the user's password (`PBKDF2-SHA-256`).
- **Risk:** If a user resets their password via email without knowing their previous password, the server cannot re-wrap their `journalKey`. The user will permanently lose access to all previous diary entries unless a recovery key/phrase exists.
- **Remediation:** Implement an exported emergency recovery key or warn users during password reset flows.

## Tech Debt & Code Hygiene

### 1. Manual Migration Application & Schema Drift
- **Issue:** Migrations in `supabase/migrations/` must be applied manually via the Supabase SQL editor. Code in `services/todoService.ts` contains conditional hacks (`...(dueDate ? { dueDate } : {})`) to accommodate databases missing migrations.
- **Remediation:** Integrate Supabase CLI into CI/CD to enforce automated, versioned schema migrations.

### 2. Missing Test Suite
- **Issue:** Zero test files exist. There are no unit tests for cryptography, no API mocks for Supabase services, and no integration tests for auth or checkout flows.
- **Remediation:** Add Vitest and testing-library to cover `journalCrypto.ts` and core services.

## Performance Bottlenecks & Scaling Limits

### 1. Unpaginated Queries
- **Issue:** `todoService.getUserTodos`, `expenseService.getUserExpenses`, and `diaryService.getUserEntries` perform raw `select("*")` without pagination or cursors.
- **Impact:** As user data accumulates (hundreds of expenses or tasks), client memory consumption and network payload sizes will scale linearly.
- **Remediation:** Introduce cursor-based or limit/offset pagination in services and infinite scroll / paginated tables in the UI.

### 2. Client-Side Decryption Overhead
- **Issue:** When opening the diary, all entries are fetched and decrypted on the client sequentially or concurrently in browser JavaScript.
- **Impact:** Decrypting large volumes of diary entries on low-end mobile devices will cause noticeable thread lag.

## Fragile Areas

- **Auth State Synchronization:** `context/AuthContext.tsx` reconciles `supabase.auth.getUser()` with custom profile records in `public.users`. If the trigger `handle_new_user()` fails during user signup, the profile will be missing, causing layout loading states to hang.
- **Crypto Envelope Backward-Compatibility:** Older entries or entries created before account-level key derivation rely on legacy device keys (`nivio:journal:key:v1:`). Modifications to `journalCrypto.ts` must maintain legacy migration logic.

---

*Concerns analysis: 2026-10-01*
*Update after addressing debts or discovering new risks*
