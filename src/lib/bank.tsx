import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  AchievementRow,
  BudgetRow,
  ChallengeCompletionRow,
  GoalRow,
  LessonProgressRow,
  ProfileRow,
  QuizResultRow,
  TransactionCategory,
  TransactionRow,
  TransactionType,
} from "./database.types";
import { badgeBySlug, computeStreak, type BadgeDef } from "./gamification";
import { QUIZ_XP, TOTAL_LESSONS } from "../content/lessons";

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
  currentAmount: number;
  deadline: string | null;
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
  currentAmount: Number(row.current_amount ?? 0),
  deadline: row.deadline ?? null,
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
  quizResults: QuizResultRow[];
  achievements: AchievementRow[];
  challenges: ChallengeCompletionRow[];
  /** True when the learning tables are missing (add_learning.sql not run yet). */
  learningUnavailable: boolean;
  totalXp: number;
  streak: number;
  newBadge: BadgeDef | null;
  dismissBadge: () => void;
  completeLesson: (slug: string, xp: number) => Promise<string | null>;
  completeQuiz: (slug: string, score: number, total: number) => Promise<{ error: string | null; xpEarned: number }>;
  completeChallenge: (slug: string, xp: number) => Promise<string | null>;
  addGoal: (name: string, targetAmount: number, deadline: string | null) => Promise<string | null>;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id">>) => Promise<string | null>;
  deleteGoal: (id: string) => Promise<string | null>;
  contributeToGoal: (id: string, amount: number) => Promise<string | null>;
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
  const [quizResults, setQuizResults] = useState<QuizResultRow[]>([]);
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);
  const [challenges, setChallenges] = useState<ChallengeCompletionRow[]>([]);
  const [learningUnavailable, setLearningUnavailable] = useState(false);
  const [newBadge, setNewBadge] = useState<BadgeDef | null>(null);
  const awarding = useRef(false);

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

    const [profileRes, accountsRes, txRes, goalsRes, lessonsRes, budgetsRes, quizRes, achRes, chalRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("accounts").select("*").order("type"),
        supabase.from("transactions").select("*"),
        supabase.from("goals").select("*").order("position"),
        supabase.from("lesson_progress").select("*"),
        supabase.from("budgets").select("*"),
        supabase.from("quiz_results").select("*"),
        supabase.from("achievements").select("*"),
        supabase.from("challenge_completions").select("*"),
      ]);

    setProfile((profileRes.data as ProfileRow | null) ?? null);
    setLessons(((lessonsRes.data ?? []) as LessonProgressRow[]));

    // Learning tables shipped after launch — degrade gracefully until
    // add_learning.sql has been run in this Supabase project.
    if (quizRes.error || achRes.error || chalRes.error) {
      setLearningUnavailable(true);
      setQuizResults([]);
      setAchievements([]);
      setChallenges([]);
    } else {
      setLearningUnavailable(false);
      setQuizResults((quizRes.data ?? []) as QuizResultRow[]);
      setAchievements((achRes.data ?? []) as AchievementRow[]);
      setChallenges((chalRes.data ?? []) as ChallengeCompletionRow[]);
    }

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
      setQuizResults([]);
      setAchievements([]);
      setChallenges([]);
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

  const completeQuiz = useCallback(
    async (slug: string, score: number, total: number): Promise<{ error: string | null; xpEarned: number }> => {
      if (!user) return { error: "Not signed in", xpEarned: 0 };
      // XP only on the first attempt; retakes are recorded for stats.
      const firstAttempt = !quizResults.some((q) => q.quiz_slug === slug);
      const xpEarned = firstAttempt ? Math.round((QUIZ_XP * score) / total) : 0;
      const { data, error: err } = await supabase
        .from("quiz_results")
        .insert({ user_id: user.id, quiz_slug: slug, score, total, xp_earned: xpEarned })
        .select()
        .single();
      if (err) return { error: err.message, xpEarned: 0 };
      setQuizResults((prev) => [...prev, data as QuizResultRow]);
      return { error: null, xpEarned };
    },
    [user, quizResults],
  );

  const completeChallenge = useCallback(
    async (slug: string, xp: number): Promise<string | null> => {
      if (!user) return "Not signed in";
      const { data, error: err } = await supabase
        .from("challenge_completions")
        .insert({ user_id: user.id, challenge_slug: slug, xp_earned: xp })
        .select()
        .single();
      if (err) {
        // Unique violation = already completed today; treat as success.
        if (err.code === "23505") return null;
        return err.message;
      }
      setChallenges((prev) => [...prev, data as ChallengeCompletionRow]);
      return null;
    },
    [user],
  );

  const addGoal = useCallback(
    async (name: string, targetAmount: number, deadline: string | null): Promise<string | null> => {
      if (!user) return "Not signed in";
      const { data, error: err } = await supabase
        .from("goals")
        .insert({ user_id: user.id, name, target_amount: targetAmount, deadline, position: goals.length })
        .select()
        .single();
      if (err) return err.message;
      setGoals((prev) => [...prev, parseGoal(data as GoalRow)]);
      return null;
    },
    [user, goals.length],
  );

  const updateGoal = useCallback(
    async (id: string, patch: Partial<Omit<Goal, "id">>): Promise<string | null> => {
      const row: Record<string, unknown> = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.targetAmount !== undefined) row.target_amount = patch.targetAmount;
      if (patch.currentAmount !== undefined) row.current_amount = patch.currentAmount;
      if (patch.deadline !== undefined) row.deadline = patch.deadline;
      const { data, error: err } = await supabase.from("goals").update(row).eq("id", id).select().single();
      if (err) return err.message;
      setGoals((prev) => prev.map((g) => (g.id === id ? parseGoal(data as GoalRow) : g)));
      return null;
    },
    [],
  );

  const deleteGoal = useCallback(async (id: string): Promise<string | null> => {
    const { error: err } = await supabase.from("goals").delete().eq("id", id);
    if (err) return err.message;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    return null;
  }, []);

  const contributeToGoal = useCallback(
    async (id: string, amount: number): Promise<string | null> => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return "Goal not found";
      return updateGoal(id, { currentAmount: Math.round((goal.currentAmount + amount) * 100) / 100 });
    },
    [goals, updateGoal],
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

  const totalXp = useMemo(
    () =>
      lessons.reduce((s, l) => s + l.xp_earned, 0) +
      quizResults.reduce((s, q) => s + q.xp_earned, 0) +
      challenges.reduce((s, c) => s + c.xp_earned, 0),
    [lessons, quizResults, challenges],
  );

  const streak = useMemo(
    () =>
      computeStreak([
        ...lessons.map((l) => l.completed_at),
        ...quizResults.map((q) => q.created_at),
        ...challenges.map((c) => c.created_at),
      ]),
    [lessons, quizResults, challenges],
  );

  // Award any badges the user now deserves but hasn't earned yet.
  useEffect(() => {
    if (!user || loading || learningUnavailable || awarding.current) return;
    const earned = new Set(achievements.map((a) => a.badge_slug));
    const deserved = ["journey-begins"];
    if (lessons.length >= 1) deserved.push("first-lesson");
    if (lessons.length >= 10) deserved.push("finance-explorer");
    if (lessons.length >= TOTAL_LESSONS) deserved.push("curriculum-champ");
    if (quizResults.some((q) => q.total > 0 && q.score === q.total)) deserved.push("quiz-whiz");
    if (budgets.length >= 1) deserved.push("first-budget");
    if (goals.length >= 1) deserved.push("first-goal");
    if (transactions.filter((t) => t.category === "Savings" || (savings !== null && t.accountId === savings.id && t.type === "income")).length >= 3) deserved.push("smart-saver");
    if (streak >= 3) deserved.push("streak-3");
    if (challenges.some((c) => c.challenge_slug === "budget-simulator")) deserved.push("budget-boss");
    if (challenges.some((c) => c.challenge_slug === "investing-simulator")) deserved.push("investor");

    const missing = deserved.filter((slug) => !earned.has(slug));
    if (missing.length === 0) return;
    awarding.current = true;
    void (async () => {
      for (const slug of missing) {
        const { data } = await supabase
          .from("achievements")
          .insert({ user_id: user.id, badge_slug: slug })
          .select()
          .single();
        if (data) {
          setAchievements((prev) => [...prev, data as AchievementRow]);
          const def = badgeBySlug(slug);
          if (def && slug !== "journey-begins") setNewBadge(def);
        }
      }
      awarding.current = false;
    })();
  }, [user, loading, learningUnavailable, achievements, lessons, quizResults, budgets, goals, transactions, savings, streak, challenges]);

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
        quizResults,
        achievements,
        challenges,
        learningUnavailable,
        totalXp,
        streak,
        newBadge,
        dismissBadge: () => setNewBadge(null),
        completeLesson,
        completeQuiz,
        completeChallenge,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
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
