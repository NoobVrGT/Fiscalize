-- ============================================================
-- Fiscalize Finance: quizzes, achievements, daily challenges,
-- and richer goals. Run in the Supabase SQL Editor (safe to re-run).
-- ============================================================

-- Goals get their own saved amount and an optional deadline.
alter table public.goals
  add column if not exists current_amount numeric(12, 2) not null default 0 check (current_amount >= 0);
alter table public.goals
  add column if not exists deadline date;

-- Quiz results (retakes allowed; XP awarded on first pass only, app-side).
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_slug text not null,
  score int not null check (score >= 0),
  total int not null check (total > 0),
  xp_earned int not null default 0 check (xp_earned >= 0),
  created_at timestamptz not null default now()
);
create index if not exists quiz_results_user_idx on public.quiz_results (user_id, created_at desc);

-- Earned badges.
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_slug text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_slug)
);

-- Daily challenges and practice activities (one completion per day each).
create table if not exists public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_slug text not null,
  challenge_date date not null default current_date,
  xp_earned int not null default 0 check (xp_earned >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, challenge_slug, challenge_date)
);
create index if not exists challenge_completions_user_idx on public.challenge_completions (user_id, challenge_date desc);

-- Row Level Security
alter table public.quiz_results enable row level security;
alter table public.achievements enable row level security;
alter table public.challenge_completions enable row level security;

drop policy if exists "quiz_results_select_own" on public.quiz_results;
drop policy if exists "quiz_results_insert_own" on public.quiz_results;
create policy "quiz_results_select_own" on public.quiz_results for select using (auth.uid() = user_id);
create policy "quiz_results_insert_own" on public.quiz_results for insert with check (auth.uid() = user_id);

drop policy if exists "achievements_select_own" on public.achievements;
drop policy if exists "achievements_insert_own" on public.achievements;
create policy "achievements_select_own" on public.achievements for select using (auth.uid() = user_id);
create policy "achievements_insert_own" on public.achievements for insert with check (auth.uid() = user_id);

drop policy if exists "challenge_completions_select_own" on public.challenge_completions;
drop policy if exists "challenge_completions_insert_own" on public.challenge_completions;
create policy "challenge_completions_select_own" on public.challenge_completions for select using (auth.uid() = user_id);
create policy "challenge_completions_insert_own" on public.challenge_completions for insert with check (auth.uid() = user_id);

-- Goal mutations the app needs.
drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
