import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";
import { useTheme } from "./theme";
import { onboardingStore, syncOnboardingToSupabase } from "./onboarding";
import type {
  AccountRow,
  AccountType,
  BudgetRow,
  GoalRow,
  LessonProgressRow,
  ProfileRow,
  TransactionCategory,
  TransactionRow,
  TransactionType,
} from "./database.types";

/* ------------------------------------------------------------------ */
/* Parsed domain models (numeric strings from PostgREST → numbers)     */
/* ------------------------------------------------------------------ */

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  startingBalance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  notes: string | null;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
}

export interface TransactionInput {
  accountId: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  notes: string | null;
}

const parseAccount = (row: AccountRow): Account => ({
  id: row.id,
  type: row.type,
  name: row.name,
  startingBalance: Number(row.starting_balance),
});

const parseTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  accountId: row.account_id,
  name: row.name,
  amount: Number(row.amount),
  type: row.type,
  category: row.category,
  date: row.date,
  notes: row.notes,
  createdAt: row.created_at,
});

const parseGoal = (row: GoalRow): Goal => ({
  id: row.id,
  name: row.name,
  targetAmount: Number(row.target_amount),
});

const parseBudget = (row: BudgetRow): Budget => ({
  id: row.id,
  category: row.category,
  monthlyLimit: Number(row.monthly_limit),
});

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

export interface BankSummary {
  checkingBalance: number;
  savingsBalance: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  /** Everything ever added to savings (starting balance + net savings inflow). */
  totalSaved: number;
  spendingByCategory: { category: string; amount: number }[];
  /** Cumulative balance per account for the activity chart, oldest → newest. */
  activity: { date: string; checking: number; savings: number }[];
}

interface BankContextValue {
  loading: boolean;
  error: string | null;
  profile: ProfileRow | null;
  accounts: Account[];
  checking: Account | null;
  savings: Account | null;
  transactions: Transaction[]; // newest first
  goals: Goal[];
  budgets: Budget[];
  /** True when the budgets table is missing (add_budgets.sql not run yet). */
  budgetsUnavailable: boolean;
  setBudget: (category: string, monthlyLimit: number) => Promise<string | null>;
  removeBudget: (category: string) => Promise<string | null>;
  lessons: LessonProgressRow[];
  totalXp: number;
  completeLesson: (slug: string, xp: number) => Promise<string | null>;
  balanceOf: (accountId: string) => number;
  summary: BankSummary;
  addTransaction: (input: TransactionInput) => Promise<string | null>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<string | null>;
  deleteTransaction: (id: string) => Promise<string | null>;
  transfer: (fromId: string, toId: string, amount: number, note?: string) => Promise<string | null>;
  setStartingBalance: (accountId: string, value: number) => Promise<string | null>;
}

const BankContext = createContext<BankContextValue | null>(null);

const byDateDesc = (a: Transaction, b: Transaction) =>
  b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

export function BankProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetsUnavailable, setBudgetsUnavailable] = useState(false);
  const [lessons, setLessons] = useState<LessonProgressRow[]>([]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // Push onboarding answers collected before signup into the profile.
    if (onboardingStore.hasPendingSync()) {
      const answers = onboardingStore.load();
      if (answers) await syncOnboardingToSupabase(user.id, answers);
      else onboardingStore.clearPendingSync();
    }

    const [profileRes, accountsRes, txRes, goalsRes, lessonsRes, budgetsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("accounts").select("*").order("type"),
      supabase.from("transactions").select("*"),
      supabase.from("goals").select("*").order("position"),
      supabase.from("lesson_progress").select("*"),
      supabase.from("budgets").select("*"),
    ]);

    setProfile((profileRes.data as ProfileRow | null) ?? null);
    setLessons(((lessonsRes.data ?? []) as LessonProgressRow[]));

    // Budgets were added after launch — degrade gracefully if the table
    // hasn't been created in this Supabase project yet.
    if (budgetsRes.error) {
      setBudgetsUnavailable(true);
      setBudgets([]);
    } else {
      setBudgetsUnavailable(false);
      setBudgets(((budgetsRes.data ?? []) as BudgetRow[]).map(parseBudget));
    }

    const firstError = accountsRes.error ?? txRes.error ?? goalsRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    let accountRows = (accountsRes.data ?? []) as AccountRow[];

    // Self-heal for users created before the signup trigger existed.
    if (accountRows.length === 0) {
      const { data: created, error: createError } = await supabase
        .from("accounts")
        .insert([
          { user_id: user.id, type: "checking", name: "Virtual Checking", starting_balance: 500 },
          { user_id: user.id, type: "savings", name: "Virtual Savings", starting_balance: 200 },
        ])
        .select();
      if (createError) {
        setError(createError.message);
        setLoading(false);
        return;
      }
      accountRows = (created ?? []) as AccountRow[];
    }

    setAccounts(accountRows.map(parseAccount));
    setTransactions(((txRes.data ?? []) as TransactionRow[]).map(parseTransaction).sort(byDateDesc));
    setGoals(((goalsRes.data ?? []) as GoalRow[]).map(parseGoal));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      void loadAll();
    } else {
      setProfile(null);
      setAccounts([]);
      setTransactions([]);
      setGoals([]);
      setBudgets([]);
      setLessons([]);
      setLoading(true);
    }
  }, [user, loadAll]);

  // Persist appearance settings to the profile (local preference wins).
  const { theme, largeText } = useTheme();
  useEffect(() => {
    if (!user || !profile) return;
    if (profile.theme === theme && profile.large_text === largeText) return;
    void supabase
      .from("profiles")
      .update({ theme, large_text: largeText })
      .eq("id", user.id);
  }, [theme, largeText, user, profile]);

  /* ---------------- mutations (persist first, then update state) --- */

  const addTransaction = useCallback(
    async (input: TransactionInput): Promise<string | null> => {
      if (!user) return "Not signed in";
      const { data, error: err } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          account_id: input.accountId,
          name: input.name,
          amount: input.amount,
          type: input.type,
          category: input.category,
          date: input.date,
          notes: input.notes,
        })
        .select()
        .single();
      if (err) return err.message;
      setTransactions((prev) => [parseTransaction(data as TransactionRow), ...prev].sort(byDateDesc));
      return null;
    },
    [user],
  );

  const updateTransaction = useCallback(
    async (id: string, input: TransactionInput): Promise<string | null> => {
      const { data, error: err } = await supabase
        .from("transactions")
        .update({
          account_id: input.accountId,
          name: input.name,
          amount: input.amount,
          type: input.type,
          category: input.category,
          date: input.date,
          notes: input.notes,
        })
        .eq("id", id)
        .select()
        .single();
      if (err) return err.message;
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? parseTransaction(data as TransactionRow) : t)).sort(byDateDesc),
      );
      return null;
    },
    [],
  );

  const deleteTransaction = useCallback(async (id: string): Promise<string | null> => {
    const { error: err } = await supabase.from("transactions").delete().eq("id", id);
    if (err) return err.message;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return null;
  }, []);

  const transfer = useCallback(
    async (fromId: string, toId: string, amount: number, note?: string): Promise<string | null> => {
      const { error: err } = await supabase.rpc("transfer_between_accounts", {
        from_account: fromId,
        to_account: toId,
        transfer_amount: amount,
        transfer_note: note ?? null,
      });
      if (err) return err.message;
      await loadAll(); // two rows changed server-side; refetch keeps it simple
      return null;
    },
    [loadAll],
  );

  const setBudget = useCallback(
    async (category: string, monthlyLimit: number): Promise<string | null> => {
      if (!user) return "Not signed in";
      const { data, error: err } = await supabase
        .from("budgets")
        .upsert(
          { user_id: user.id, category, monthly_limit: monthlyLimit },
          { onConflict: "user_id,category" },
        )
        .select()
        .single();
      if (err) return err.message;
      const parsed = parseBudget(data as BudgetRow);
      setBudgets((prev) => [...prev.filter((b) => b.category !== category), parsed]);
      return null;
    },
    [user],
  );

  const removeBudget = useCallback(
    async (category: string): Promise<string | null> => {
      const { error: err } = await supabase.from("budgets").delete().eq("category", category);
      if (err) return err.message;
      setBudgets((prev) => prev.filter((b) => b.category !== category));
      return null;
    },
    [],
  );

  const completeLesson = useCallback(
    async (slug: string, xp: number): Promise<string | null> => {
      if (!user) return "Not signed in";
      const { data, error: err } = await supabase
        .from("lesson_progress")
        .upsert(
          { user_id: user.id, lesson_slug: slug, xp_earned: xp },
          { onConflict: "user_id,lesson_slug" },
        )
        .select()
        .single();
      if (err) return err.message;
      setLessons((prev) => [
        ...prev.filter((l) => l.lesson_slug !== slug),
        data as LessonProgressRow,
      ]);
      return null;
    },
    [user],
  );

  const setStartingBalance = useCallback(
    async (accountId: string, value: number): Promise<string | null> => {
      const { error: err } = await supabase
        .from("accounts")
        .update({ starting_balance: value })
        .eq("id", accountId);
      if (err) return err.message;
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, startingBalance: value } : a)),
      );
      return null;
    },
    [],
  );

  /* ---------------- derived analytics ------------------------------ */

  const checking = accounts.find((a) => a.type === "checking") ?? null;
  const savings = accounts.find((a) => a.type === "savings") ?? null;

  const balances = useMemo(() => {
    const map = new Map<string, number>();
    for (const account of accounts) map.set(account.id, account.startingBalance);
    for (const t of transactions) {
      const current = map.get(t.accountId) ?? 0;
      map.set(t.accountId, current + (t.type === "income" ? t.amount : -t.amount));
    }
    return map;
  }, [accounts, transactions]);

  const balanceOf = useCallback((accountId: string) => balances.get(accountId) ?? 0, [balances]);

  const summary = useMemo<BankSummary>(() => {
    const checkingBalance = checking ? (balances.get(checking.id) ?? 0) : 0;
    const savingsBalance = savings ? (balances.get(savings.id) ?? 0) : 0;

    const monthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const categoryTotals = new Map<string, number>();

    for (const t of transactions) {
      const isThisMonth = t.date.startsWith(monthPrefix);
      if (t.category === "Transfer") continue; // moves between own accounts aren't income/spend
      if (isThisMonth) {
        if (t.type === "income") monthlyIncome += t.amount;
        else monthlyExpenses += t.amount;
      }
      if (t.type === "expense") {
        categoryTotals.set(t.category, (categoryTotals.get(t.category) ?? 0) + t.amount);
      }
    }

    const totalSaved =
      (savings?.startingBalance ?? 0) +
      transactions
        .filter((t) => savings && t.accountId === savings.id && t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const spendingByCategory = [...categoryTotals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Cumulative balances per day (all history, oldest → newest).
    const chronological = [...transactions].sort((a, b) => -byDateDesc(a, b));
    let runningChecking = checking?.startingBalance ?? 0;
    let runningSavings = savings?.startingBalance ?? 0;
    const byDay = new Map<string, { checking: number; savings: number }>();
    for (const t of chronological) {
      const delta = t.type === "income" ? t.amount : -t.amount;
      if (checking && t.accountId === checking.id) runningChecking += delta;
      if (savings && t.accountId === savings.id) runningSavings += delta;
      byDay.set(t.date, { checking: runningChecking, savings: runningSavings });
    }
    const activity = [...byDay.entries()].map(([date, v]) => ({ date, ...v }));

    return {
      checkingBalance,
      savingsBalance,
      totalBalance: checkingBalance + savingsBalance,
      monthlyIncome,
      monthlyExpenses,
      totalSaved,
      spendingByCategory,
      activity,
    };
  }, [transactions, balances, checking, savings]);

  return (
    <BankContext.Provider
      value={{
        loading,
        error,
        profile,
        accounts,
        checking,
        savings,
        transactions,
        goals,
        budgets,
        budgetsUnavailable,
        setBudget,
        removeBudget,
        lessons,
        totalXp: lessons.reduce((sum, l) => sum + l.xp_earned, 0),
        completeLesson,
        balanceOf,
        summary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        transfer,
        setStartingBalance,
      }}
    >
      {children}
    </BankContext.Provider>
  );
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBank must be used within BankProvider");
  return ctx;
}

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
