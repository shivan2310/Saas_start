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

update public.users as profile
set
  email = auth_user.email,
  "emailVerified" = auth_user.email_confirmed_at is not null,
  "updatedAt" = now()
from auth.users as auth_user
where profile.uid = auth_user.id;
