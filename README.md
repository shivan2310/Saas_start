<p align="center">
  <img src="public/banner.svg" alt="Nivio Banner" width="100%" />
</p>

<p align="center">
  <strong>A private, all-in-one personal organizer — tasks, expenses, journal &amp; important dates in one secure place.</strong>
</p>

<p align="center">
  <a href="#-features"><img src="https://img.shields.io/badge/Features-8-6366f1?style=for-the-badge&labelColor=0a0f1e" alt="Features"></a>
  <img src="https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge&labelColor=0a0f1e" alt="License">
  <img src="https://img.shields.io/badge/PRs-Welcome-818cf8?style=for-the-badge&labelColor=0a0f1e" alt="PRs Welcome">
</p>

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /><br/>
      <sub><b>Framework</b></sub>
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /><br/>
      <sub><b>Language</b></sub>
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /><br/>
      <sub><b>Styling</b></sub>
    </td>
    <td align="center" width="140">
      <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /><br/>
      <sub><b>Database & Auth</b></sub>
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

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Personal Dashboard** | A quick-glance overview of your day — remaining to-dos, upcoming dates, recent journal entries, and a spending summary. |
| ✅ **Task Management** | Create, complete, and organize your to-do list with a clean, fast interface. |
| 💰 **Expense Tracking** | Log expenses, assign categories, and visualize spending trends over the last 7 days. |
| 📔 **Encrypted Journal** | Write down thoughts and daily reflections with **AES-256-GCM client-side encryption** — your entries are unreadable even in the database. |
| 📅 **Important Dates** | Never miss a birthday, deadline, meeting, or milestone. |
| 🔐 **Secure Auth** | Email/password authentication with email verification via Supabase Auth. |
| 🛡️ **Row Level Security** | Postgres RLS policies ensure every row is tied to `auth.uid()` — your data is strictly private. |
| 🌗 **Theme Support** | Light and dark mode with a theme context provider. |

---

## 🏗️ Project Structure

```
nivio/
├── app/
│   ├── api/                  # API routes
│   ├── dashboard/
│   │   ├── dates/            # Important dates page
│   │   ├── diary/            # Encrypted journal page
│   │   ├── expenses/         # Expense tracking page
│   │   ├── settings/         # User settings page
│   │   ├── tasks/            # Task management page
│   │   ├── layout.tsx        # Dashboard shell layout
│   │   └── page.tsx          # Dashboard home
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── forgot-password/      # Password reset flow
│   ├── verify-email/         # Email verification
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── dashboard/            # Dashboard-specific components
│   ├── landing/              # Landing page components
│   ├── layout/               # Layout components (sidebar, header)
│   └── ui/                   # Reusable UI primitives (Toast, etc.)
├── context/
│   ├── AuthContext.tsx        # Authentication state & route guard
│   └── ThemeContext.tsx       # Theme (light/dark) provider
├── hooks/                    # Custom React hooks
├── lib/
│   └── journalCrypto.ts      # AES-GCM journal encryption module
├── services/
│   ├── authService.ts        # Auth operations (signup, login, reset)
│   ├── personalService.ts    # Expenses, dates, diary CRUD
│   ├── todoService.ts        # Task CRUD
│   └── userService.ts        # User profile operations
├── supabase/
│   ├── client.ts             # Browser Supabase client
│   └── schema.sql            # Tables, triggers & RLS policies
├── middleware.ts              # Security headers middleware
└── types/                    # Shared TypeScript type definitions
```

---

## 🔒 Security Architecture

Nivio takes a **zero-trust** approach to user data:

- **Client-Side Encryption** — Journal entries are encrypted in the browser using **AES-256-GCM** before they ever leave your device. The encryption key is derived from your credentials via **PBKDF2-SHA-256** (210,000 iterations) and wrapped with a password-derived key. Even database administrators cannot read your journal.
- **Row Level Security** — All Supabase tables enforce Postgres RLS policies. Every query is scoped to `auth.uid()`, making it impossible for one user to access another's data.
- **Security Headers** — The Next.js middleware applies a strict set of HTTP security headers on every response.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nivio.git
cd nivio
```

### 2. Set up the database

Open the **Supabase SQL Editor** and run the schema file:

```
supabase/schema.sql
```

This creates all tables (`users`, `expenses`, `todos`, `dates`, `diary`), triggers, and RLS policies.

### 3. Configure authentication

In your Supabase dashboard:
1. Enable **Email/Password** auth
2. Set the **Site URL** to `http://localhost:3000`
3. Add `http://localhost:3000/dashboard` to **Redirect URLs**

### 4. Set environment variables

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're all set! 🎉

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <sub>Built with ☕ and TypeScript</sub>
</p>