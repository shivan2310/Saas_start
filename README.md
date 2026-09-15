<p align="center">
  <img src="public/banner.svg" alt="Nivio Banner" width="100%" />
</p>

<p align="center">
  <strong>A private, all-in-one personal organizer — tasks, expenses, encrypted journal &amp; important dates in one secure place.</strong>
</p>

<p align="center">
  <a href="https://github.com/shivan2310/Saas_start"><img src="https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14"></a>
  <a href="https://github.com/shivan2310/Saas_start"><img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://github.com/shivan2310/Saas_start"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://github.com/shivan2310/Saas_start"><img src="https://img.shields.io/badge/Supabase-Auth_%26_RLS-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://github.com/shivan2310/Saas_start"><img src="https://img.shields.io/badge/Security-AES--256--GCM-6366f1?style=for-the-badge&labelColor=0a0f1e" alt="AES-256-GCM"></a>
  <img src="https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge&labelColor=0a0f1e" alt="License">
</p>

---

## 📖 Overview

**Nivio** is a modern, privacy-first personal management suite designed to replace fragmented apps with a unified, high-performance workspace. Whether tracking daily to-dos, analyzing spending trends, scheduling milestone dates, or capturing thoughts in a zero-knowledge encrypted journal, Nivio ensures all your personal data remains private, organized, and accessible.

Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase**, Nivio combines snappy client-side interactions with robust database-level security and client-side cryptography.

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /><br/>
      <sub><b>App Router &amp; SSR</b></sub>
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /><br/>
      <sub><b>Type Safety</b></sub>
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /><br/>
      <sub><b>Design System</b></sub>
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /><br/>
      <sub><b>Database &amp; Auth</b></sub>
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/Web_Crypto_API-6366F1?style=for-the-badge&logo=shield&logoColor=white" alt="Web Crypto" /><br/>
      <sub><b>AES-256-GCM</b></sub>
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" /><br/>
      <sub><b>Validation</b></sub>
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/Lucide-f67373?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide" /><br/>
      <sub><b>Icons</b></sub>
    </td>
  </tr>
</table>

---

## ✨ Key Features

### 📊 Personal Dashboard
- **Daily At-a-Glance**: Live summary cards showing pending tasks, upcoming dates, recent journal entries, and 7-day spending totals.
- **Visual Analytics**: Interactive financial breakdown charts and prioritized action items.

### ✅ Task Management
- **Prioritization & Scheduling**: Assign task priorities (`High`, `Medium`, `Low`) with optional due dates.
- **Smart Filtering**: Seamlessly filter tasks across `All`, `Today`, `Upcoming`, `Overdue`, and `Completed`.
- **Fast Search & In-Place Editing**: Instant client-side search and modal-based quick editing.

### 💰 Expense Tracking & Analytics
- **Categorized Logging**: Track expenses with predefined categories (*Food*, *Transport*, *Shopping*, *Bills*, *Health*, *Entertainment*, *Travel*, etc.) and payment methods (UPI, Cash, Cards).
- **Interactive Visualizations**: Custom SVG Donut charts by category and multi-period expense trend visualizations (`7D`, `30D`, `3M`, `6M`, `1Y`).
- **Currency Support**: Formatted in Indian Rupees (`₹`) with accurate decimal handling.

### 📔 Zero-Knowledge Encrypted Journal
- **Client-Side Cryptography**: Uses the **Web Crypto API** with **AES-256-GCM** encryption and **PBKDF2-SHA-256** key derivation (210,000 iterations).
- **True Zero-Knowledge**: Journal entries are encrypted in the browser before ever touching the database. Even database administrators cannot read your entries.
- **Automatic Migration**: Transparent on-the-fly encryption migration for any legacy unencrypted entries.
- **Searchable Reflections**: Clean note-taking editor with live keyword search.

### 📅 Important Dates & Milestones
- **Interactive Monthly Calendar**: Grid view with visual indicator dots for dates with scheduled events.
- **Upcoming Milestone Timeline**: Clean chronological list for birthdays, anniversaries, deadlines, and appointments with custom notes.

### 🎨 Multi-Theme System
- **Three Curated Themes**:
  - 🌙 **Dark Mode**: Sleek, low-contrast dark interface tailored for night focus and OLED displays.
  - ☀️ **Light Mode**: Crisp, clean off-white interface optimal for bright daylight environments.
  - 🌊 **Aqua Mode**: Vibrant marine cyan theme with custom visual accents and tokens.
- **Persistent Preference**: Stored in `localStorage` with fallback to system `prefers-color-scheme`. Instant toggle from navigation or Settings.

### ⚙️ Account & Profile Settings
- Profile picture upload (data URL/storage), display name customization, and direct password reset dispatch.

---

## 🔒 Security Architecture

Nivio adopts a **zero-trust** approach to user privacy and infrastructure security:

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client-Side)                    │
│                                                             │
│  User Password ──► PBKDF2-SHA-256 ──► AES-GCM Wrapped Key   │
│                          │                                  │
│  Raw Journal Content ───► AES-256-GCM ──► Ciphertext Payload│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (TLS 1.3)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Supabase Postgres Database                    │
│                                                             │
│  • Row-Level Security (RLS) restricts rows to auth.uid()    │
│  • Encrypted journal content stored only as ciphertext      │
│  • Zero-knowledge key escrow via user-wrapped credentials   │
└─────────────────────────────────────────────────────────────┘
```

1. **Client-Side Encryption**:
   - Key derivation: `PBKDF2-SHA-256` with `210,000` iterations and a cryptographic salt.
   - Cipher: `AES-256-GCM` with a fresh 96-bit initialization vector (`IV`) per entry.
2. **Row Level Security (RLS)**:
   - Postgres RLS is enabled on all tables (`users`, `todos`, `expenses`, `importantDates`, `diary`).
   - Every operation enforces `auth.uid() = userId` so tenants are strictly isolated.
3. **HTTP Security Headers**:
   - Configured in `middleware.ts`: Strict Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 🏗️ Project Structure

```
saas_starter/
├── app/                           # Next.js 14 App Router
│   ├── api/health/route.ts        # Health check endpoint
│   ├── dashboard/                 # Authenticated dashboard routes
│   │   ├── dates/page.tsx         # Important dates & calendar
│   │   ├── diary/page.tsx         # Encrypted journal & editor
│   │   ├── expenses/page.tsx      # Expense tracker & visual analytics
│   │   ├── settings/page.tsx      # User profile, account & theme options
│   │   ├── tasks/page.tsx         # To-do lists, filters & priorities
│   │   ├── layout.tsx             # Dashboard shell (Sidebar + TopNavbar)
│   │   └── page.tsx               # Overview dashboard metrics
│   ├── forgot-password/page.tsx   # Password reset request flow
│   ├── login/page.tsx             # User login page
│   ├── signup/page.tsx            # Account registration
│   ├── verify-email/page.tsx      # Email verification notice
│   ├── error.tsx                  # Global route error boundary
│   ├── loading.tsx                # App route suspense loading state
│   ├── not-found.tsx              # 404 page handler
│   ├── robots.ts                  # Search engine robots.txt generator
│   ├── sitemap.ts                 # XML sitemap generator
│   ├── layout.tsx                 # Root layout, fonts & theme provider
│   └── page.tsx                   # Public marketing landing page
├── components/                    # Reusable React components
│   ├── common/                    # Cross-cutting components (ErrorBoundary)
│   ├── dashboard/                 # Dashboard widgets (Sidebar, TopNavbar, DonutChart, ExpenseChart)
│   ├── landing/                   # Landing page components (Hero, Features, CTA, NivioLanding)
│   ├── layout/                    # Global shell elements (Navbar, Footer)
│   ├── ui/                        # Design system primitives (Button, Card, Input, Modal, Toast, Skeleton, etc.)
│   └── index.ts                   # Central components barrel export
├── context/                       # React context providers (AuthContext, ThemeContext)
├── hooks/                         # Ergonomic custom hooks (useAuth, useTheme)
├── lib/                           # Cryptography, validation & utility helpers
│   ├── authErrors.ts              # Human-readable auth error mappings
│   ├── journalCrypto.ts           # Web Crypto API AES-256-GCM zero-knowledge encryption
│   ├── utils.ts                   # Tailwind class merge & date formatters
│   └── validations/auth.ts        # Zod authentication validation schemas
├── public/                        # Static assets (banner.svg, journal-hero.mp4)
├── services/                      # Domain-specific Supabase data services
│   ├── authService.ts             # Authentication & session lifecycle
│   ├── dateService.ts             # Important dates CRUD operations
│   ├── diaryService.ts            # Encrypted journal CRUD & migration
│   ├── expenseService.ts          # Expense logging & category queries
│   ├── personalService.ts         # Unified service facade
│   ├── todoService.ts             # Task management operations
│   ├── userService.ts             # Profile management & encryption keys
│   └── index.ts                   # Central services barrel export
├── supabase/                      # Supabase schema & migrations
│   ├── migrations/                # Versioned SQL migrations
│   ├── client.ts                  # Supabase browser client initialization
│   └── schema.sql                 # Baseline database schema, triggers & RLS policies
├── middleware.ts                   # HTTP security headers middleware
├── next.config.mjs                # Next.js compiler & bundle configuration
├── tailwind.config.ts             # Design tokens, color palette & Tailwind config
└── tsconfig.json                  # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- A free [Supabase](https://supabase.com/) account and project

---

### 1. Clone the Repository

```bash
git clone https://github.com/shivan2310/Saas_start.git
cd Saas_start
```

---

### 2. Set Up the Database

1. Open your project on the [Supabase Dashboard](https://app.supabase.com/).
2. Navigate to the **SQL Editor**.
3. Copy and run the contents of [`supabase/schema.sql`](supabase/schema.sql) to initialize tables, indexes, triggers, and Row Level Security policies.
4. Execute any additional migrations located in [`supabase/migrations/`](supabase/migrations/) if updating an existing database instance.

---

### 3. Configure Supabase Authentication

In the Supabase Dashboard:
1. Go to **Authentication** > **Providers** > **Email** and make sure it is enabled.
2. Go to **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (or your production domain)
   - **Redirect URLs**: Add `http://localhost:3000/dashboard` and `http://localhost:3000/verify-email`

---

### 4. Configure Environment Variables

Create a `.env.local` file by copying the example:

```bash
cp .env.example .env.local
```

Add your Supabase credentials found in **Project Settings** > **API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 5. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js local development server with Turbopack / HMR |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Runs the compiled Next.js production server |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues |

---

## 🚀 Deployment

Nivio is optimized for deployment on [Vercel](https://vercel.com/):

1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Configure the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL, e.g. `https://your-app.vercel.app`)
4. In your Supabase Dashboard, update the **Site URL** and **Redirect URLs** to match your production domain.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <sub>Crafted with care using Next.js, TypeScript &amp; Supabase</sub>
</p>