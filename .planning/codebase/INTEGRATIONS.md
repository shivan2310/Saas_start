# Integrations & External Services

**Analysis Date:** 2026-10-01

## APIs & External Services

**Supabase Cloud:**
- **Purpose:** Primary backend-as-a-service providing database, user authentication, and realtime event subscriptions
- **SDK:** `@supabase/supabase-js` 2.110.8 via singleton client `supabase/client.ts`
- **Authentication:** Public anonymous client configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Security:** Zero-trust architecture where all table access is restricted by Postgres Row Level Security (RLS) checked against `auth.uid()`

**Web Crypto API (`crypto.subtle`):**
- **Purpose:** Zero-knowledge client-side encryption for personal journal/diary entries
- **Implementation:** `lib/journalCrypto.ts`
- **Algorithms:** AES-256-GCM for envelope encryption, PBKDF2-SHA-256 (210,000 iterations) for user key derivation and wrapping
- **Key Storage:** Wrapped key stored in `public.users.journalKey`, raw session key stored Ephemerally in browser `localStorage` under `nivio:journal:session-key:v1:<userId>`

## Data Storage

**PostgreSQL (Managed by Supabase):**
- **Tables:**
  - `public.users`: Extended profile (`uid`, `email`, `displayName`, `photoURL`, `role`, `emailVerified`, `journalKey`, `createdAt`, `updatedAt`)
  - `public.todos`: User tasks (`id`, `userId`, `text`, `done`, `priority`, `dueDate`, `createdAt`)
  - `public.expenses`: Financial tracking (`id`, `userId`, `description`, `amount`, `category`, `createdAt`)
  - `public."importantDates"`: Calendar reminders (`id`, `userId`, `title`, `date`, `notes`, `createdAt`)
  - `public.diary`: Encrypted journal records (`id`, `userId`, `title`, `content`, `createdAt`)
- **Automations:** Trigger `on_auth_user_created` executing `handle_new_user()` syncs `auth.users` into `public.users` on sign-up and email confirmation

**Client-Side Browser Storage:**
- `localStorage`:
  - `theme`: UI preference (`dark` | `light` | `system`)
  - `nivio:journal:session-key:v1:<userId>`: Decrypted session key for active diary editing
  - `nivio:journal:key:v1:<userId>`: Legacy device key fallback

## Authentication & Identity

**Provider:** Supabase Auth
- **Sign-Up & Sign-In:** Email and password with Zod schema validation (`lib/validations/auth.ts`)
- **OAuth Providers:** Google and GitHub enabled in UI (`components/auth/OAuthButtons.tsx`)
- **Email Verification:** Enforced in `app/dashboard/layout.tsx` - unverified sessions are redirected to `/verify-email`
- **Auth Callback:** Next.js Route Handler at `app/auth/callback/route.ts` exchanges auth code for session tokens
- **Session State:** Managed by React Context in `context/AuthContext.tsx` with `supabase.auth.onAuthStateChange` listener

## Monitoring & Observability

**Health Check Endpoint:**
- `app/api/health/route.ts`: Responds with JSON `{ status: "ok", timestamp: "..." }` and `Cache-Control: no-store`

**Error Boundaries:**
- `components/common/ErrorBoundary.tsx`: React error boundary capturing render exceptions with fallback UI
- `app/error.tsx`: Next.js global error page handler

## CI/CD & Deployment

**Deployment Host:**
- Vercel (Next.js App Router edge and serverless architecture)
- Domain configuration via `NEXT_PUBLIC_APP_URL`

**Database Migrations:**
- Migration scripts committed under `supabase/migrations/`:
  - `20260803_add_todo_due_date.sql`
  - `20260803_sync_email_verification.sql`
  - `20260814_add_journal_key.sql`
  - `20260827_add_expense_payment_type.sql`
- Run manually via Supabase SQL Editor or Supabase CLI

## Environment Configuration

| Variable | Required | Scope | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client & Server | Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client & Server | Anonymous public API key with RLS enforcement |
| `NEXT_PUBLIC_APP_URL` | Yes | Client & Server | Canonical URL for auth redirect handling (e.g. `https://nivio.app`) |

## Webhooks & Callbacks

- `GET /auth/callback`: Next.js route handler handling OAuth and email verification redirect loops using `supabase.auth.exchangeCodeForSession(code)`

---

*Integration analysis: 2026-10-01*
*Update after adding new third-party integrations*
