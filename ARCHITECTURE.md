# Architecture

The app uses Next.js App Router and a client-side Supabase integration.

- `supabase/client.ts` creates the browser Supabase client.
- `context/AuthContext.tsx` observes the Supabase session and loads the user profile.
- `services/` contains auth, profile, task, expense, date, and diary operations.
- `supabase/schema.sql` defines the Postgres tables, trigger, and Row Level Security policies.
- `middleware.ts` applies security headers.
