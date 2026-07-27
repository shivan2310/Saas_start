# Nivio

Nivio is a private personal organizer built with Next.js, TypeScript, Tailwind CSS, Supabase Auth, and Supabase Postgres.

## Local setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. Enable email/password auth and configure the site URL plus redirect URLs (`http://localhost:3000/dashboard` and your production equivalent).
4. Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run `npm run dev` to start the app.

All application tables use Row Level Security. Each row is tied to `auth.uid()`, so users can only access their own profile and Nivio data.
