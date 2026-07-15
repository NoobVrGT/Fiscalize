-- ============================================================
-- Fiscalize database schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL).
-- Idempotent: safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- Profiles: one row per user, created automatically on signup.
-- Holds onboarding answers and app settings.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  age int,
  grade text,
  country text,
  language text,
  goals text[] not null default '{}',
  custom_goal text,
  impulse_frequency text check (impulse_frequency in ('never', 'sometimes', 'often')),
  budgets text check (budgets in ('yes', 'no')),
  confidence int check (confidence between 1 and 5),
  interests text[] not null default '{}',
  referral_source text,
  onboarding_completed boolean not null default false,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  large_text boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Virtual bank accounts (educational simulator — no real banks).
-- Exactly one checking + one savings per user.
-- ------------------------------------------------------------
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('checking', 'savings')),
  name text not null,
  starting_balance numeric(12, 2) not null default 0 check (starting_balance >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, type)
);

-- ------------------------------------------------------------
-- Transactions. Balances are derived:
--   balance = starting_balance + sum(income) - sum(expense)
-- 'Transfer' category is reserved for account-to-account moves.
-- ------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null check (
    category in (
      'Food', 'Shopping', 'Entertainment', 'Transportation', 'Bills',
      'Savings', 'Healthcare', 'Education', 'Income', 'Other', 'Transfer'
    )
  ),
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc, created_at desc);
create index if not exists transactions_account_idx
  on public.transactions (account_id);

-- ------------------------------------------------------------
-- Savings goals (seeded from onboarding, editable later).
-- ------------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null default 500 check (target_amount > 0),
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Lesson progress / XP.
-- ------------------------------------------------------------
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_slug text not null,
  xp_earned int not null default 0 check (xp_earned >= 0),
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_slug)
);

-- ------------------------------------------------------------
-- Row Level Security: every user sees only their own rows.
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.lesson_progress enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "accounts_select_own" on public.accounts;
drop policy if exists "accounts_insert_own" on public.accounts;
drop policy if exists "accounts_update_own" on public.accounts;
drop policy if exists "accounts_delete_own" on public.accounts;
create policy "accounts_select_own" on public.accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on public.accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on public.accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "accounts_delete_own" on public.accounts for delete using (auth.uid() = user_id);

drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

drop policy if exists "goals_select_own" on public.goals;
drop policy if exists "goals_insert_own" on public.goals;
drop policy if exists "goals_update_own" on public.goals;
drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

drop policy if exists "lesson_progress_select_own" on public.lesson_progress;
drop policy if exists "lesson_progress_insert_own" on public.lesson_progress;
drop policy if exists "lesson_progress_delete_own" on public.lesson_progress;
create policy "lesson_progress_select_own" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "lesson_progress_insert_own" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "lesson_progress_delete_own" on public.lesson_progress for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Auto-provision on signup: profile row + the two virtual
-- accounts with a default starting balance (configurable later).
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;

  insert into public.accounts (user_id, type, name, starting_balance)
  values
    (new.id, 'checking', 'Virtual Checking', 500),
    (new.id, 'savings', 'Virtual Savings', 200)
  on conflict (user_id, type) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Atomic transfer between the caller's own accounts.
-- SECURITY INVOKER so RLS still applies to both inserts.
-- ------------------------------------------------------------
create or replace function public.transfer_between_accounts(
  from_account uuid,
  to_account uuid,
  transfer_amount numeric,
  transfer_date date default current_date,
  transfer_note text default null
)
returns void
language plpgsql
security invoker
as $$
declare
  from_name text;
  to_name text;
begin
  if transfer_amount <= 0 then
    raise exception 'Transfer amount must be positive';
  end if;
  if from_account = to_account then
    raise exception 'Cannot transfer to the same account';
  end if;

  select name into from_name from public.accounts where id = from_account and user_id = auth.uid();
  select name into to_name from public.accounts where id = to_account and user_id = auth.uid();
  if from_name is null or to_name is null then
    raise exception 'Account not found';
  end if;

  insert into public.transactions (user_id, account_id, name, amount, type, category, date, notes)
  values
    (auth.uid(), from_account, 'Transfer to ' || to_name, transfer_amount, 'expense', 'Transfer', transfer_date, transfer_note),
    (auth.uid(), to_account, 'Transfer from ' || from_name, transfer_amount, 'income', 'Transfer', transfer_date, transfer_note);
end;
$$;
-- ============================================================
-- Expense tracker: monthly budgets per category.
-- Run this in the Supabase SQL Editor (safe to re-run).
-- ============================================================

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (
    category in (
      'Food', 'Shopping', 'Entertainment', 'Transportation', 'Bills',
      'Savings', 'Healthcare', 'Education', 'Other'
    )
  ),
  monthly_limit numeric(12, 2) not null check (monthly_limit > 0),
  created_at timestamptz not null default now(),
  unique (user_id, category)
);

alter table public.budgets enable row level security;

drop policy if exists "budgets_select_own" on public.budgets;
drop policy if exists "budgets_insert_own" on public.budgets;
drop policy if exists "budgets_update_own" on public.budgets;
drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_select_own" on public.budgets for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets for delete using (auth.uid() = user_id);

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

