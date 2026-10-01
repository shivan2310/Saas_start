# Technology Stack

**Analysis Date:** 2026-10-01

## Languages

**Primary:**
- TypeScript 5.5.4 - All application UI, API routes, context providers, services, cryptographic functions, and domain types

**Secondary:**
- SQL (PostgreSQL / PL/pgSQL) - Database schemas, triggers, functions, and Row-Level Security policies in `supabase/`
- JavaScript (ES Modules / CommonJS) - Tooling and Next.js configuration (`next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`)
- CSS - Global theme utility classes and CSS variables in `app/globals.css`

## Runtime

**Environment:**
- Node.js 20.x+ (App development and server build)
- Browser JavaScript Engine with Web Crypto API (`crypto.subtle`) support for zero-knowledge client-side encryption

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` (v3 format present)

## Frameworks

**Core:**
- Next.js 14.2.8 - App Router architecture, Server & Client Components, Route Handlers (`app/api/health/route.ts`, `app/auth/callback/route.ts`), dynamic metadata (`app/robots.ts`, `app/sitemap.ts`)
- React 18.3.1 / React DOM 18.3.1 - Component rendering, Context API, Hooks

**Testing:**
- None installed - No test runners (Jest, Vitest, Playwright, Cypress) currently configured

**Build/Dev:**
- TypeScript 5.5.4 - Type checking (`tsconfig.json`)
- PostCSS 8.4.45 / Autoprefixer 10.4.20 - CSS transformation pipeline
- Tailwind CSS 3.4.10 - Utility-first styling with custom palette extensions (`dash-*` variables)
- ESLint 8.57.0 with `eslint-config-next` 14.2.8 - Static code analysis and linting

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.110.8 - Supabase client SDK for Postgres access, Row-Level Security (RLS) enforcement, and Supabase Auth
- `zod` 3.23.8 - Schema validation (login, registration, password reset forms)
- `react-hook-form` 7.53.0 & `@hookform/resolvers` 3.9.0 - Form state management integrated with Zod resolvers
- `motion` (Framer Motion) 13.4.0 - UI transitions, animated micro-interactions, and modal/landing page animations
- `lucide-react` 0.439.0 - SVG iconography across dashboard, settings, navigation, and landing elements

**UI Primitives & Styling Helpers:**
- `@radix-ui/react-slot` 1.3.3 - Composable polymorphism for UI components (`Button`)
- `class-variance-authority` 0.7.1 - Type-safe CSS variant composition
- `clsx` 2.1.1 & `tailwind-merge` 2.6.1 - Conditional styling and deduplication utility (`lib/utils.ts`)

## Configuration

**Environment:**
- `.env.example` / `.env.local` - Environment variables consumed via `process.env`
- Required variables:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anonymous API key
  - `NEXT_PUBLIC_APP_URL` - Canonical deployed application URL for auth redirects

**Build:**
- `next.config.mjs` - Next.js compiler settings and redirects
- `tailwind.config.ts` - Custom colors (dashboard theme system, dark/light CSS variables, animations)
- `tsconfig.json` - Strict TypeScript compiler configuration, path alias `@/*` mapping to root
- `middleware.ts` - Edge middleware applying strict HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)

## Platform Requirements

**Development:**
- Windows / macOS / Linux with Node.js 18+ or 20+
- Internet connectivity or local Supabase CLI instance for Supabase service connection

**Production:**
- Vercel (Edge & Serverless Next.js deployment)
- Supabase Cloud (Managed PostgreSQL with Auth and Realtime)

---

*Stack analysis: 2026-10-01*
*Update after major dependency changes*
