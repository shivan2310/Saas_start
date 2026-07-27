# Deployment

Set these Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (your deployed URL)

In Supabase Authentication settings, set the production Site URL and add the production `/dashboard` URL to the redirect allow list. Run `supabase/schema.sql` once in the project SQL editor before using the app.
