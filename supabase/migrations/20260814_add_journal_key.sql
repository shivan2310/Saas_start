alter table public.users
add column if not exists "journalKey" text;
