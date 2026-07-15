-- ============================================================
-- Admin flag. Run AFTER creating the admin account via the
-- app's signup page (email: bash0@fiscalize.app).
-- Safe to re-run.
-- ============================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

update public.profiles
set is_admin = true
where id in (select id from auth.users where email = 'bash0@fiscalize.app');
