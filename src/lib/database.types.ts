/**
 * Hand-written types for the Supabase schema (supabase/schema.sql).
 * If the schema grows, consider generating these with
 * `npx supabase gen types typescript`.
 */

export type AccountType = "checking" | "savings";
export type TransactionType = "income" | "expense";

export const TRANSACTION_CATEGORIES = [
  "Food",
  "Shopping",
  "Entertainment",
  "Transportation",
  "Bills",
  "Savings",
  "Healthcare",
  "Education",
  "Income",
  "Other",
] as const;

/** 'Transfer' is reserved for account-to-account moves and is not offered in the form. */
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number] | "Transfer";

export interface ProfileRow {
  id: string;
  first_name: string | null;
  age: number | null;
  grade: string | null;
  country: string | null;
  language: string | null;
  goals: string[];
  custom_goal: string | null;
  impulse_frequency: "never" | "sometimes" | "often" | null;
  budgets: "yes" | "no" | null;
  confidence: number | null;
  interests: string[];
  referral_source: string | null;
  onboarding_completed: boolean;
  theme: "light" | "dark";
  large_text: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountRow {
  id: string;
  user_id: string;
  type: AccountType;
  name: string;
  /** numeric comes back from PostgREST as a string */
  starting_balance: string | number;
  created_at: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  account_id: string;
  name: string;
  amount: string | number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface GoalRow {
  id: string;
  user_id: string;
  name: string;
  target_amount: string | number;
  position: number;
  created_at: string;
}

export interface BudgetRow {
  id: string;
  user_id: string;
  /** One of TRANSACTION_CATEGORIES except 'Income' (you don't budget income). */
  category: string;
  monthly_limit: string | number;
  created_at: string;
}

export interface LessonProgressRow {
  id: string;
  user_id: string;
  lesson_slug: string;
  xp_earned: number;
  completed_at: string;
}
