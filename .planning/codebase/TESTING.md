# Testing Strategy & State

**Analysis Date:** 2026-10-01

## Current State: No Test Suite Configured

> [!WARNING]
> This codebase currently has **no automated test runner, test files, or test scripts** configured in `package.json`.
> Verification is currently performed via manual testing, linting (`npm run lint`), and build checks (`npm run build`).

## Test Framework (Recommended Target)

To establish an automated test suite matching the Next.js 14 + Supabase architecture:

- **Unit & Integration:** `Vitest` (fast execution, native TypeScript & ESM support)
- **Component Testing:** `@testing-library/react` + `@testing-library/user-event`
- **DOM Environment:** `jsdom` or `happy-dom`
- **E2E Testing:** `Playwright` (multi-browser testing for auth flows and protected routes)

## Recommended File Organization

When adding tests, follow co-located naming conventions:

```
services/
├── todoService.ts
└── todoService.test.ts        # Unit tests co-located with services
lib/
├── journalCrypto.ts
└── journalCrypto.test.ts      # Critical cryptographic roundtrip tests
components/
└── ui/
    ├── Button.tsx
    └── Button.test.tsx        # UI primitive interaction tests
```

## Mocking Strategy

When testing components and services in isolation:

1. **Supabase Client Mocking:**
   - Mock `@/supabase/client` to return predictable query builder responses:
   ```typescript
   vi.mock("@/supabase/client", () => ({
     supabase: {
       from: vi.fn(() => ({
         select: vi.fn().mockReturnThis(),
         eq: vi.fn().mockReturnThis(),
         order: vi.fn().mockResolvedValue({ data: [], error: null }),
         insert: vi.fn().mockReturnThis(),
         update: vi.fn().mockReturnThis(),
         delete: vi.fn().mockReturnThis(),
       })),
       auth: {
         getUser: vi.fn(),
         onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
       },
     },
   }));
   ```

2. **Web Crypto API Mocking:**
   - Node.js 18+ includes global `crypto.subtle`, enabling realistic encryption/decryption tests for `lib/journalCrypto.ts` without heavy mocking.

3. **Next.js Navigation:**
   - Mock `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`).

## High-Priority Test Coverage Targets

When introducing tests, prioritize in the following order:

1. **`lib/journalCrypto.ts` (Critical Security):**
   - Key derivation consistency from password + salt
   - AES-GCM encryption/decryption roundtrip
   - Envelope serialization and corruption handling
   - Key unwrapping failure with incorrect password
2. **`services/` (Data Integrity):**
   - RLS payload construction (correct `userId` insertion)
   - Backward-compatibility handling (e.g., omitted `dueDate` field)
   - Proper error propagation when Supabase returns an error
3. **`context/AuthContext.tsx` & `DashboardLayout` (Access Control):**
   - Unauthenticated redirect to `/login`
   - Unverified email redirect to `/verify-email`
   - Session preservation across route transitions
4. **`lib/validations/auth.ts` (Form Validation):**
   - Password strength rules, email format verification

## Verification Commands (Current)

Until an automated test suite is installed, the following commands verify codebase integrity:

```bash
# Verify static types
npm run build

# Run ESLint validation
npm run lint
```

---

*Testing analysis: 2026-10-01*
*Update upon installing test framework*
