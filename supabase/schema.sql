create table public.users (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  "displayName" text,
  "photoURL" text,
  role text not null default 'user' check (role in ('user', 'admin')),
  "emailVerified" boolean not null default false,
  "journalKey" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.todos (
  id uuid primary key default gen_random_uuid(), "userId" uuid not null references auth.users(id) on delete cascade,
  text text not null, done boolean not null default false, priority text not null default 'medium' check (priority in ('low','medium','high')), "dueDate" date, "createdAt" timestamptz not null default now()
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(), "userId" uuid not null references auth.users(id) on delete cascade,
  description text not null, amount numeric not null, category text not null, "createdAt" timestamptz not null default now()
);
create table public."importantDates" (
  id uuid primary key default gen_random_uuid(), "userId" uuid not null references auth.users(id) on delete cascade,
  title text not null, date date not null, notes text not null default '', "createdAt" timestamptz not null default now()
);
create table public.diary (
  id uuid primary key default gen_random_uuid(), "userId" uuid not null references auth.users(id) on delete cascade,
  title text not null, content text not null, "createdAt" timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.todos enable row level security;
alter table public.expenses enable row level security;
alter table public."importantDates" enable row level security;
alter table public.diary enable row level security;

create policy "users own profile" on public.users for all using (auth.uid() = uid) with check (auth.uid() = uid);
create policy "todos own rows" on public.todos for all using (auth.uid() = "userId") with check (auth.uid() = "userId");
create policy "expenses own rows" on public.expenses for all using (auth.uid() = "userId") with check (auth.uid() = "userId");
create policy "dates own rows" on public."importantDates" for all using (auth.uid() = "userId") with check (auth.uid() = "userId");
create policy "diary own rows" on public.diary for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (uid, email, "displayName", "emailVerified")
  values (new.id, new.email, new.raw_user_meta_data->>'display_name', new.email_confirmed_at is not null)
  on conflict (uid) do update set
    email = excluded.email,
    "displayName" = coalesce(excluded."displayName", public.users."displayName"),
    "emailVerified" = excluded."emailVerified",
    "updatedAt" = now();
  return new;
end;
$$;
create trigger on_auth_user_created after insert or update on auth.users for each row execute procedure public.handle_new_user();
