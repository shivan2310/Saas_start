# Architecture

**Analysis Date:** 2026-10-01

## Pattern Overview

Nivio is built on the **Next.js 14 App Router** utilizing a **Client-Side Heavy (BaaS)** architectural model backed by **Supabase**. While Next.js provides server routing, metadata generation, and static asset delivery, all business domain interactions (auth, tasks, expenses, diary, calendar) execute on the client through dedicated service modules interfacing directly with Supabase via Row Level Security (RLS).

Additionally, the architecture incorporates a **Zero-Knowledge Client-Side Cryptographic Subsystem** for sensitive user records (journal/diary), ensuring plaintext content is never exposed to the database or backend network requests.

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│                                                             │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │ Dashboard / Pages│  │ Context / Hooks│  │ UI & Layout │  │
│  └────────┬─────────┘  └───────┬────────┘  └──────┬──────┘  │
│           │                    │                  │         │
│           ▼                    ▼                  │         │
│  ┌──────────────────────────────────────────────┐ │         │
│  │           Modular Domain Services            │ │         │
│  │ (auth, user, todo, expense, date, diary)     │ │         │
│  └────────┬──────────────────────┬──────────────┘ │         │
│           │                      │                │         │
│           │                      ▼                │         │
│           │          ┌───────────────────────┐    │         │
│           │          │ Web Crypto Subsystem  │    │         │
│           │          │ (AES-GCM / PBKDF2)    │    │         │
│           │          └───────────────────────┘    │         │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────┐           │
│  │          Supabase Client SDK (RLS)           │           │
│  └───────────────────────┬──────────────────────┘           │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS / WSS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase Cloud                        │
│                                                             │
│  ┌──────────────────────┐      ┌─────────────────────────┐  │
│  │    Supabase Auth     │      │   PostgreSQL Database   │  │
│  │ (Session / JWT / RL) ├─────►│ (Row Level Security RLS)│  │
│  └──────────────────────┘      └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Layers

### 1. Presentation & Routing Layer (`app/`, `components/`)
- **Pages (`app/`):** Next.js App Router structure. Marketing at `app/page.tsx`, auth screens under `app/(auth)`, and authenticated views under `app/dashboard/*`.
- **Dashboard Shell (`app/dashboard/layout.tsx`):** Acts as the client-side authentication gate; checks session state and renders the `Sidebar`, `TopNavbar`, and page body.
- **Design System (`components/ui/`):** Composable primitives (`Button`, `Card`, `Input`, `Modal`, `Toast`, `Skeleton`).
- **Feature Modules (`components/dashboard/`, `components/auth/`, `components/landing/`):** High-level feature compositions (e.g. `DonutChart`, `FlowingRibbons`, `NivioLanding`).

### 2. State & Context Layer (`context/`, `hooks/`)
- **`AuthContext.tsx`:** Coordinates user session, profiles from `public.users`, email verification status, and auth state changes via Supabase event listeners.
- **`ThemeContext.tsx`:** Manages theme preferences (`dark`, `light`, `system`) and persists them to `localStorage`.
- **Ergonomic Hooks (`hooks/`):** Exposes `useAuth()` and `useTheme()` for clean consumer consumption.

### 3. Service Layer (`services/`)
- Encapsulates direct database mutations and queries behind typed async functions:
  - `authService.ts`: Sign-in, sign-up, password reset, sign-out, session key lifecycle.
  - `userService.ts`: User profile retrieval, profile updates, and wrapped journal key updates.
  - `todoService.ts`: CRUD operations for tasks with priority and due date backward compatibility.
  - `expenseService.ts`: Expense logging, categories, and deletion.
  - `dateService.ts`: Important date reminders and scheduling.
  - `diaryService.ts`: Encrypted diary retrieval, encryption upon insertion, decryption on read.
  - `index.ts`: Unified barrel exports.

### 4. Cryptographic Security Layer (`lib/journalCrypto.ts`)
- Implements Web Crypto API (`crypto.subtle`) primitives:
  - **Cipher:** AES-256-GCM.
  - **Key Derivation:** PBKDF2-SHA-256 with 210,000 iterations.
  - **Key Wrapping:** The user's account password wraps a randomly generated journal master key, allowing multi-device synchronization without the server ever holding the decryption key.

### 5. Data & Policy Layer (`supabase/`)
- PostgreSQL relational tables configured with Row Level Security.
- Every table enforces `auth.uid() = "userId"` or `auth.uid() = uid` for read, write, update, and delete operations.

## Data Flow

### Standard Domain Data Flow (e.g., Todos / Expenses)
1. User interacts with UI (e.g. adds an expense in `app/dashboard/expenses/page.tsx`).
2. Page calls `expenseService.addExpense(userId, description, amount, category)`.
3. `expenseService` executes `@supabase/supabase-js` query `supabase.from("expenses").insert(...)`.
4. Supabase transmits query over HTTPS with user's JWT.
5. Postgres validates JWT signature and executes RLS policy (`expenses own rows`).
6. Query completes and returns typed record to service.
7. Page updates local React state and triggers feedback toast.

### Zero-Knowledge Encrypted Journal Flow
1. User writes an entry in `app/dashboard/diary/page.tsx`.
2. `diaryService.addEntry(userId, title, content)` is invoked.
3. Service calls `journalCrypto.encryptJournal(payload, sessionKey)`.
4. Web Crypto API produces ciphertext envelope with random IV and serialized metadata: `nivio:journal:v1:{...}`.
5. Plaintext is destroyed in memory; only ciphertext is sent to Supabase `diary` table.
6. On fetch, `diaryService.getUserEntries()` fetches envelopes and decrypts them on-device before passing to UI.

## Key Abstractions

- **`User` (`types/index.ts`):** Canonical application user representation combining Supabase auth metadata and `public.users` table fields.
- **`TodoItem`, `ExpenseItem`, `ImportantDateItem`, `DiaryEntry`:** Domain interfaces matching database row shapes.
- **`EncryptedJournalEnvelope` (`lib/journalCrypto.ts`):** Versioned JSON envelope standardizing ciphertext payload, cipher algorithm, key mode, and IV.

## Entry Points

- **`app/layout.tsx`:** Root Next.js layout providing global HTML structure, fonts (`Inter`, `JetBrains Mono`), `ThemeProvider`, and `AuthProvider`.
- **`middleware.ts`:** Global edge interceptor injecting security headers (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`).
- **`app/page.tsx`:** Default root route serving the marketing landing page.
- **`app/dashboard/layout.tsx`:** Entry boundary to the protected SaaS experience.

## Error Handling

- **Error Boundaries:** `components/common/ErrorBoundary.tsx` wraps critical layouts and dashboard sections.
- **Auth Error Mapping:** `lib/authErrors.ts` parses raw Supabase error codes (e.g. `invalid_credentials`, `user_already_exists`) into user-friendly messages.
- **Service Errors:** Service methods throw standard errors that calling components catch to show error toasts.

## Cross-Cutting Concerns

- **Zero-Trust Security:** Client never trusts the server with journal plaintexts; server never trusts client requests without Postgres RLS evaluation.
- **Dark/Light Mode Theme:** CSS variables configured in `app/globals.css` with seamless switching via Tailwind `dark` class toggle.
- **HTTP Security Headers:** Complete CSP and MIME policies enforced by Next.js Edge Middleware.

---

*Architecture analysis: 2026-10-01*
*Update after structural or architectural shifts*
