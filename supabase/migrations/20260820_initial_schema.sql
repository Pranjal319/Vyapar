-- ==========================================================================
-- VYAPAR SUPABASE DATABASE SCHEMA MIGRATION
-- Migration: 20260820_initial_schema.sql
-- ==========================================================================

-- 1. Create Profiles Table (Linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz default now()
);

-- 2. Create Game Progress Table (Persistent Player Progress State)
create table if not exists public.game_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_location text default 'pataliputra',
  gold integer default 250,
  knowledge integer default 0,
  unlocked_states jsonb default '["pataliputra"]'::jsonb,
  completed_questions jsonb default '[]'::jsonb,
  inventory jsonb default '{}'::jsonb,
  trade_history jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS) on both tables
alter table public.profiles enable row level security;
alter table public.game_progress enable row level security;

-- 4. Row Level Security Policies for `profiles`
drop policy if exists "Users can select own profile" on public.profiles;
create policy "Users can select own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 5. Row Level Security Policies for `game_progress`
drop policy if exists "Users can select own game progress" on public.game_progress;
create policy "Users can select own game progress" on public.game_progress
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own game progress" on public.game_progress;
create policy "Users can insert own game progress" on public.game_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own game progress" on public.game_progress;
create policy "Users can update own game progress" on public.game_progress
  for update using (auth.uid() = user_id);
