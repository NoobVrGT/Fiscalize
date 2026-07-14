# Fiscalize

Learn. Save. Grow. — A financial literacy platform for teens with personalized
onboarding, gamified learning, and a fully virtual banking simulator.

Built with React, TypeScript, Tailwind CSS, Framer Motion, React Router,
Recharts, and Supabase (Auth + PostgreSQL with Row Level Security).

> The banking simulator is **educational only** — virtual money, no connection
> to any real bank or financial institution.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

The marketing site and onboarding work immediately. Auth and the banking
simulator need a (free) Supabase project:

## Connect Supabase (~2 minutes)

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Create the schema**: in the Supabase Dashboard open **SQL Editor**, paste the
   contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This
   creates the tables, Row Level Security policies, the signup trigger (which
   provisions each new user's profile + virtual accounts), and the atomic
   transfer function.
3. **Add credentials**: copy `.env.example` to `.env.local` and fill in your
   project's URL and anon/public key (Dashboard → Project Settings → API).
4. **Configure auth redirects**: Dashboard → Authentication → URL Configuration →
   set **Site URL** to `http://localhost:5173` and add
   `http://localhost:5173/reset-password` to **Redirect URLs**. (Repeat with your
   production domain when you deploy.)
5. Restart the dev server. Sign up, verify your email, and you're in.

## What's where

| Path | Purpose |
|---|---|
| `supabase/schema.sql` | Database schema, RLS policies, triggers, transfer RPC |
| `src/lib/supabase.ts` | Supabase client (reads `.env.local`) |
| `src/lib/auth.tsx` | Session state + sign up / login / logout / password reset |
| `src/lib/bank.tsx` | Banking simulator data layer: accounts, transactions, balances, analytics |
| `src/lib/onboarding.tsx` | Onboarding answers, plan generation, profile sync |
| `src/pages/` | Landing, onboarding (`/start`), auth pages, dashboard, transactions |
| `src/components/bank/` | Transaction modal/table, transfer modal, charts, category badges |

## Security model

- Supabase Auth with email verification and persistent sessions.
- Every table has Row Level Security: users can only read/write rows where
  `user_id = auth.uid()` — enforced in the database, not just the UI.
- Account transfers run through a `security invoker` Postgres function so RLS
  applies to both sides of the transfer atomically.
- The anon key in `.env.local` is safe to expose to the browser by design;
  RLS is the actual access control.
