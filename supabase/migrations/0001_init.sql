-- Recipe Box — initial schema
--
-- Run this once against a fresh Supabase project (SQL Editor → New query →
-- paste → Run), then run supabase/seed.sql to load the twenty recipes.
--
-- Security model, in one paragraph: recipes are world-readable and nobody can
-- write them from the client — there is deliberately no insert/update/delete
-- policy on that table, so the anon key cannot modify the catalogue. Everything
-- user-owned (profile, cook progress) is readable and writable only by the user
-- who owns the row, enforced by RLS rather than by the client remembering to
-- filter. The anon key is safe to ship in the bundle precisely because of this.

-- ---------------------------------------------------------------- recipes

create table if not exists public.recipes (
  id                  text primary key,
  name                text        not null,
  blurb               text        not null default '',
  cuisine             text        not null default 'other'
                        check (cuisine in ('indian', 'mexican', 'other')),
  source              jsonb       not null default '{}'::jsonb,
  source_url          text,
  cook_time_minutes   integer     not null check (cook_time_minutes > 0),
  servings            integer     not null check (servings > 0),
  hue                 integer     not null default 0 check (hue between 0 and 360),
  tags                text[]      not null default '{}',
  one_pan             boolean     not null default false,
  make_ahead          boolean     not null default false,
  added_at            date        not null default current_date,
  ingredients         jsonb       not null default '[]'::jsonb,
  steps               jsonb       not null default '[]'::jsonb,
  created_at          timestamptz not null default now()
);

create index if not exists recipes_cuisine_idx on public.recipes (cuisine);
create index if not exists recipes_added_at_idx on public.recipes (added_at desc);
create index if not exists recipes_tags_idx on public.recipes using gin (tags);

alter table public.recipes enable row level security;

drop policy if exists "Recipes are readable by everyone" on public.recipes;
create policy "Recipes are readable by everyone"
  on public.recipes for select
  to anon, authenticated
  using (true);

-- No write policies on purpose. Seed and edit the catalogue with the service
-- role key (SQL Editor / migrations), never from the browser.

-- --------------------------------------------------------------- profiles

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create the profile row automatically on signup, for both email/password and
-- Google. Google puts the display name and picture in raw_user_meta_data under
-- different keys depending on the provider, hence the coalesce.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------- recipe_progress

-- One row per (user, recipe). Holds exactly what the detail view needs to put
-- you back where you were: your chosen yield, which ingredients you ticked off,
-- and which steps you finished.
create table if not exists public.recipe_progress (
  user_id             uuid        not null references auth.users (id) on delete cascade,
  recipe_id           text        not null references public.recipes (id) on delete cascade,
  servings            integer     not null check (servings > 0),
  checked_ingredients text[]      not null default '{}',
  completed_steps     integer[]   not null default '{}',
  updated_at          timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index if not exists recipe_progress_user_idx on public.recipe_progress (user_id);

alter table public.recipe_progress enable row level security;

drop policy if exists "Users can read their own progress" on public.recipe_progress;
create policy "Users can read their own progress"
  on public.recipe_progress for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.recipe_progress;
create policy "Users can insert their own progress"
  on public.recipe_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.recipe_progress;
create policy "Users can update their own progress"
  on public.recipe_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own progress" on public.recipe_progress;
create policy "Users can delete their own progress"
  on public.recipe_progress for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipe_progress_touch on public.recipe_progress;
create trigger recipe_progress_touch
  before update on public.recipe_progress
  for each row execute function public.touch_updated_at();
