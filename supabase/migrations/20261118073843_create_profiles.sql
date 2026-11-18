-- One profile per Auth user, removed together with the user.
create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 50),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Owner-only access. Rows are created by the trigger below and removed by the
-- cascade, so signed-in users only need to read and update their own row.
revoke all on public.profiles from anon, authenticated;
grant select, update (display_name) on public.profiles to authenticated;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile when a user signs up. The function lives in a schema that
-- the Data API does not expose, and nobody can call it directly.
create schema if not exists private;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();
