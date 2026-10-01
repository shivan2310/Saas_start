# Codebase Structure

**Analysis Date:** 2026-10-01

## Directory Layout

```
d:\project\saas_starter\
├── .agents/                    # Workspace agent guidelines (Ponytail lazy senior dev)
├── .planning/                  # GSD spec-driven planning state & codebase artifacts
│   └── codebase/               # Architectural and stack documentation
├── app/                        # Next.js 14 App Router routes, layouts, and API routes
│   ├── api/                    # Route handlers (e.g. /api/health)
│   ├── auth/                   # Route handlers for auth callbacks (/auth/callback)
│   ├── dashboard/              # Authenticated user dashboard section
│   │   ├── dates/              # Important dates & reminders page
│   │   ├── diary/              # Encrypted diary / journal interface
│   │   ├── expenses/           # Financial logging & expense categorization
│   │   ├── settings/           # Account and profile settings
│   │   ├── tasks/              # Todo & task priority management
│   │   ├── layout.tsx          # Dashboard layout shell with auth guard & navigation
│   │   └── page.tsx            # Dashboard home / overview
│   ├── forgot-password/        # Password recovery page
│   ├── login/                  # User login page
│   ├── signup/                 # Registration page
│   ├── verify-email/           # Email confirmation notification page
│   ├── globals.css             # Tailwind base styles and theme CSS variables
│   ├── layout.tsx              # Root HTML document and top-level providers
│   ├── page.tsx                # Marketing landing page
│   ├── error.tsx               # Global Next.js error fallback
│   ├── loading.tsx             # Global loading spinner
│   ├── not-found.tsx           # Global 404 page
│   ├── robots.ts               # Search engine indexing rules
│   └── sitemap.ts              # XML sitemap generator
├── components/                 # Modular React UI components
│   ├── auth/                   # Auth-specific UI (OAuthButtons, AuthSplitLayout, FlowingRibbons)
│   ├── common/                 # Shared components (ErrorBoundary)
│   ├── dashboard/              # Dashboard layouts, Sidebar, TopNavbar, DonutChart
│   ├── landing/                # Marketing landing experience (NivioLanding)
│   ├── ui/                     # Design system atoms (Button, Card, Input, Modal, Toast)
│   └── index.ts                # Component barrel export
├── context/                    # Global React Context providers (AuthContext, ThemeContext)
├── hooks/                      # Custom hooks (useAuth, useTheme)
├── lib/                        # Core utilities, validation, and cryptography
│   ├── validations/            # Zod validation schemas (auth forms)
│   ├── authErrors.ts           # Human-readable Supabase error mapping
│   ├── journalCrypto.ts        # Zero-knowledge AES-256-GCM / PBKDF2 Web Crypto engine
│   └── utils.ts                # Tailwind clsx/twMerge utility
├── middleware.ts               # Edge middleware applying strict security headers
├── public/                     # Static media assets (banner.svg, journal-hero.mp4)
├── services/                   # Modular domain data services (Supabase queries)
│   ├── authService.ts          # Auth lifecycle & key management
│   ├── dateService.ts          # Important dates CRUD
│   ├── diaryService.ts         # Encrypted journal CRUD and migrations
│   ├── expenseService.ts       # Expense CRUD and category grouping
│   ├── todoService.ts          # Todo CRUD with backward-compatibility logic
│   ├── userService.ts          # Profile and wrapped key management
│   └── index.ts                # Service barrel export
├── supabase/                   # Supabase database configuration and scripts
│   ├── migrations/             # Timestamped SQL migration patches
│   ├── client.ts               # Supabase JS singleton client initialization
│   └── schema.sql              # Initial table schemas, RLS policies, and triggers
└── types/                      # Global TypeScript definitions
    ├── auth.ts                 # Auth and session type definitions
    └── index.ts                # Domain models (User, TodoItem, ExpenseItem, etc.)
```

## Directory Purposes

- `app/`: Next.js 14 App Router filesystem routing. Contains all routed pages, API handlers, route interceptors, and root CSS.
- `components/ui/`: Dumb/reusable UI primitives adhering to design system tokens. Styled with Tailwind and Radix UI.
- `components/dashboard/`: Smart dashboard domain components that handle layout navigation, charts, and metric presentation.
- `services/`: Encapsulates all network requests to Supabase. Keeps React components decoupled from database table names and SQL logic.
- `lib/`: Business utilities, cryptographic operations, and schema validators that do not render UI.
- `context/`: Stateful React Context providers for global singletons (authenticated user profile, active color theme).
- `supabase/`: Authoritative source of database truths, SQL table structures, RLS policies, and migrations.

## Key File Locations

- **Supabase Client:** `supabase/client.ts`
- **Database Schema:** `supabase/schema.sql`
- **Crypto Engine:** `lib/journalCrypto.ts`
- **Auth Guard & Shell:** `app/dashboard/layout.tsx`
- **Root Context Wiring:** `app/layout.tsx`
- **Security Middleware:** `middleware.ts`
- **Barrel Exports:** `components/index.ts`, `services/index.ts`, `context/index.ts`, `hooks/index.ts`

## Naming Conventions

- **React Components:** PascalCase filenames and exports (e.g. `DonutChart.tsx`, `AuthSplitLayout.tsx`, `ThemeToggle.tsx`).
- **Services:** camelCase with `Service` suffix (e.g. `todoService.ts`, `expenseService.ts`).
- **Custom Hooks:** camelCase with `use` prefix (e.g. `useAuth.ts`, `useTheme.ts`).
- **Utility Files:** camelCase (e.g. `journalCrypto.ts`, `authErrors.ts`).
- **SQL Migrations:** `YYYYMMDD_description.sql` (e.g. `20260827_add_expense_payment_type.sql`).

## Where to Add New Code

- **New App Route / Feature Page:**
  - Create a new directory under `app/dashboard/<feature-name>/page.tsx`.
  - Add navigation item into `components/dashboard/navItems.ts`.
- **New Domain Data Model:**
  - Define interfaces in `types/index.ts`.
  - Create a dedicated domain service under `services/<feature>Service.ts`.
  - Export from `services/index.ts`.
- **New Reusable Component:**
  - Add primitive elements to `components/ui/<Component>.tsx`.
  - Add feature-specific compositions to `components/<feature>/<Component>.tsx`.
  - Export from `components/index.ts`.
- **Database Changes:**
  - Create a new migration file in `supabase/migrations/<timestamp>_<change>.sql`.
  - Reflect updates in `supabase/schema.sql`.

## Special Directories

- `.agents/`: Holds project-specific AI agent configuration (`AGENT.md` defining the *Ponytail* lazy senior dev principles).
- `.planning/`: GSD spec-driven planning artifacts, milestone roadmaps, phase plans, and codebase maps.

---

*Structure analysis: 2026-10-01*
*Update after directory reorganizations*
