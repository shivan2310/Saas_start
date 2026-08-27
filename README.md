# Nivio

Nivio is a comprehensive, private personal organizer built with a modern tech stack. It helps you manage your day-to-day life with features like task tracking, expense management, journaling, and event scheduling—all in one secure place.

## ✨ Features

- **Personal Dashboard**: A quick overview of your day, showing remaining to-dos, upcoming important dates, recent journal entries, and a spending summary.
- **To-Do List**: Track tasks and stay organized.
- **Expense Tracking**: Log expenses, categorize them, and visualize your spending trends over the last 7 days.
- **Journal / Diary**: Write down your thoughts, notes, and daily reflections.
- **Important Dates**: Never miss an important event, meeting, or milestone.
- **Secure Authentication**: Email and password authentication with email verification.
- **Row Level Security (RLS)**: Your data is entirely private. Postgres RLS ensures users can only access their own profile and data.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (Postgres + Supabase Auth)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Local Setup

1. **Create a Supabase project**: Go to [Supabase](https://supabase.com/) and create a new project.
2. **Database Schema**: In the Supabase SQL Editor, run the schema file located at [`supabase/schema.sql`](./supabase/schema.sql). This will set up the necessary tables (users, expenses, todos, dates, diary) and RLS policies.
3. **Configure Authentication**: Enable email/password auth in Supabase and configure the Site URL and Redirect URLs (e.g., `http://localhost:3000/dashboard` for local development).
4. **Environment Variables**: Copy `.env.example` to `.env.local` and add your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Install Dependencies**:
   ```bash
   npm install
   ```

6. **Run the Development Server**:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture & Security

- **Client-Side Supabase Integration**: The app uses `supabase/client.ts` for the browser Supabase client.
- **Authentication Context**: `context/AuthContext.tsx` observes the Supabase session, handles route protection, and loads the user profile.
- **Services Layer**: Operations for auth, profile, task, expense, date, and diary are abstracted into the `services/` directory.
- **Data Security**: `supabase/schema.sql` defines Postgres tables, triggers, and Row Level Security (RLS) policies. Each row is strictly tied to `auth.uid()`.
- **Security Headers**: `middleware.ts` applies security headers for enhanced protection.