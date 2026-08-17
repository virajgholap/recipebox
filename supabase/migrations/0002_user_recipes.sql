-- Recipe Box — recipes people add themselves
--
-- Run after 0001_init.sql. Safe to re-run.
--
-- These live in their own table rather than in public.recipes on purpose. The
-- catalogue is curated and read-only from the browser; this is user-generated
-- and writable by exactly one person. Mixing the two would mean opening an
-- insert policy on the catalogue, and then the anon key could write to it.

create table if not exists public.user_recipes (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users (id) on delete cascade,
  name              text        not null check (char_length(name) between 1 and 200),
  blurb             text        not null default '',
  cuisine           text        not null default 'other'
                      check (cuisine in ('indian', 'mexican', 'other')),
  source            jsonb       not null default '{}'::jsonb,
  source_url        text        not null,
  image_url         text,
  cook_time_minutes integer     not null default 30 check (cook_time_minutes between 1 and 6000),
  servings          integer     not null default 4 check (servings between 1 and 99),
  hue               integer     not null default 20 check (hue between 0 and 360),
  tags              text[]      not null default '{}',
  one_pan           boolean     not null default false,
  make_ahead        boolean     not null default false,
  added_at          date        not null default current_date,
  ingredients       jsonb       not null default '[]'::jsonb,
  steps             jsonb       not null default '[]'::jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists user_recipes_user_idx on public.user_recipes (user_id, added_at desc);

-- One save per URL per person, so pasting the same link twice updates rather
-- than quietly building a pile of duplicates.
create unique index if not exists user_recipes_user_url_idx
  on public.user_recipes (user_id, source_url);

alter table public.user_recipes enable row level security;

drop policy if exists "Users can read their own recipes" on public.user_recipes;
create policy "Users can read their own recipes"
  on public.user_recipes for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own recipes" on public.user_recipes;
create policy "Users can add their own recipes"
  on public.user_recipes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own recipes" on public.user_recipes;
create policy "Users can update their own recipes"
  on public.user_recipes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own recipes" on public.user_recipes;
create policy "Users can delete their own recipes"
  on public.user_recipes for delete
  to authenticated
  using (auth.uid() = user_id);

-- recipe_progress.recipe_id points at public.recipes, so progress on a
-- user-added recipe would violate that foreign key. Drop the constraint and
-- keep recipe_id as a free-form key that works for both tables.
alter table public.recipe_progress
  drop constraint if exists recipe_progress_recipe_id_fkey;
