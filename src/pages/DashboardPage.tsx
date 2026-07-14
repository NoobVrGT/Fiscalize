import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  BookOpen,
  Check,
  Landmark,
  PiggyBank,
  Plus,
  Settings2,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import TransactionModal from "../components/bank/TransactionModal";
import TransferModal from "../components/bank/TransferModal";
import { CategoryBadge } from "../components/bank/categories";
import { AccountActivityChart, SpendingByCategoryChart } from "../components/bank/BankCharts";
import { formatMoney, useBank, type Account } from "../lib/bank";
import { inputClass, Field } from "../components/onboarding/fields";
import { usePageMeta } from "../lib/usePageMeta";

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-navy-100 bg-white p-6 shadow-soft dark:border-navy-700 dark:bg-navy-800 ${className}`}>
      {children}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  accent?: "up" | "down";
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-sm font-semibold text-navy-400 dark:text-navy-300">
        <Icon className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        {label}
      </div>
      <p
        className={`mt-2 font-display text-2xl font-bold ${
          accent === "up"
            ? "text-emerald-700 dark:text-emerald-400"
            : accent === "down"
              ? "text-gold-600 dark:text-gold-400"
              : "text-navy-800 dark:text-white"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}

/** Small modal to configure an account's starting balance. */
function StartingBalanceModal({ account, onClose }: { account: Account | null; onClose: () => void }) {
  const { setStartingBalance } = useBank();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!account) return;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Enter a positive amount (or 0).");
      return;
    }
    setBusy(true);
    const err = await setStartingBalance(account.id, Math.round(parsed * 100) / 100);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <Modal open={account !== null} onClose={onClose} title={`Starting balance — ${account?.name ?? ""}`} maxWidth="max-w-sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-navy-500 dark:text-navy-200">
          Current: {account ? formatMoney(account.startingBalance) : ""}. Your balance is
          recalculated from this plus all transactions.
        </p>
        <Field label="New starting balance ($)" htmlFor="starting-balance">
          <input
            id="starting-balance"
            type="number"
            required
            min="0"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={account ? String(account.startingBalance) : "500"}
          />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-navy-200 px-6 py-3 font-semibold text-navy-600 transition-colors hover:border-navy-400 dark:border-navy-600 dark:text-navy-200">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:translate-y-0">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function DashboardPage() {
  usePageMeta("Your Dashboard — Fiscalize");
  const {
    loading,
    error,
    profile,
    checking,
    savings,
    transactions,
    goals,
    lessons,
    totalXp,
    completeLesson,
    summary,
  } = useBank();
  const [lessonBusy, setLessonBusy] = useState(false);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState<Account | null>(null);

  const name = profile?.first_name?.trim() || "friend";
  const recent = transactions.slice(0, 6);

  if (loading) {
    return (
      <>
        <Navbar />
        <main id="main" className="grid min-h-dvh place-items-center" role="status" aria-live="polite">
          <div className="flex items-center gap-3 text-navy-500 dark:text-navy-300">
            <span className="size-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" aria-hidden="true" />
            Loading your money…
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto min-h-dvh max-w-7xl px-5 pb-24 pt-28 sm:px-8">
        {error && (
          <p role="alert" className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
            Something went wrong loading your data: {error}
          </p>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-800 sm:text-4xl dark:text-white">
              Hey, {name} 👋
            </h1>
            <p className="mt-2 text-navy-500 dark:text-navy-200">
              Your virtual bank — 100% educational, 100% yours.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTransferOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-5 py-3 font-semibold text-navy-700 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-navy-600 dark:text-navy-100 dark:hover:text-emerald-400"
            >
              <ArrowLeftRight className="size-4" aria-hidden="true" />
              Transfer
            </button>
            <button
              type="button"
              onClick={() => setTxModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lift"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add Transaction
            </button>
          </div>
        </motion.div>

        {/* Balances */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="relative">
            <button
              type="button"
              onClick={() => setEditingBalance(checking)}
              aria-label="Configure checking starting balance"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-navy-300 transition-colors hover:bg-navy-700/5 hover:text-navy-600 dark:hover:bg-white/10 dark:hover:text-navy-100"
            >
              <Settings2 className="size-4" />
            </button>
            <div className="flex items-center gap-2 text-sm font-semibold text-navy-400 dark:text-navy-300">
              <Landmark className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Checking
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-navy-800 dark:text-white">
              {formatMoney(summary.checkingBalance)}
            </p>
          </Card>
          <Card className="relative">
            <button
              type="button"
              onClick={() => setEditingBalance(savings)}
              aria-label="Configure savings starting balance"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-navy-300 transition-colors hover:bg-navy-700/5 hover:text-navy-600 dark:hover:bg-white/10 dark:hover:text-navy-100"
            >
              <Settings2 className="size-4" />
            </button>
            <div className="flex items-center gap-2 text-sm font-semibold text-navy-400 dark:text-navy-300">
              <PiggyBank className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Savings
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-navy-800 dark:text-white">
              {formatMoney(summary.savingsBalance)}
            </p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-sm font-semibold text-navy-400 dark:text-navy-300">
              <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Total Money
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatMoney(summary.totalBalance)}
            </p>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <StatTile icon={TrendingUp} label="Income this month" value={formatMoney(summary.monthlyIncome)} accent="up" />
          <StatTile icon={TrendingDown} label="Spent this month" value={formatMoney(summary.monthlyExpenses)} accent="down" />
          <StatTile icon={Banknote} label="Total saved" value={formatMoney(summary.totalSaved)} />
        </div>

        {/* Learning progress */}
        <Card className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              <BookOpen className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-navy-800 dark:text-white">
                Lesson 1: Where does your money actually go?
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-navy-400 dark:text-navy-300">
                <Zap className="size-3.5 text-gold-500" aria-hidden="true" />
                {totalXp} XP earned so far
              </p>
            </div>
          </div>
          {lessons.some((l) => l.lesson_slug === "money-flow-101") ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Check className="size-4" aria-hidden="true" />
              Completed
            </span>
          ) : (
            <button
              type="button"
              disabled={lessonBusy}
              onClick={async () => {
                setLessonBusy(true);
                await completeLesson("money-flow-101", 15);
                setLessonBusy(false);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white disabled:opacity-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-navy-900"
            >
              Mark complete (+15 XP)
            </button>
          )}
        </Card>

        {/* Charts */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-navy-800 dark:text-white">Spending by Category</h2>
              <Link
                to="/expenses"
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Expense tracker
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mb-4 text-sm text-navy-400 dark:text-navy-300">All expenses, all time</p>
            <SpendingByCategoryChart />
          </Card>
          <Card>
            <h2 className="font-display font-semibold text-navy-800 dark:text-white">Account Activity</h2>
            <p className="mb-4 text-sm text-navy-400 dark:text-navy-300">Balance history for both accounts</p>
            <AccountActivityChart />
          </Card>
        </div>

        {/* Goals + recent transactions */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="flex items-center gap-2 font-display font-semibold text-navy-800 dark:text-white">
              <Target className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Goal Progress
            </h2>
            <p className="mb-5 text-sm text-navy-400 dark:text-navy-300">
              Measured against your savings balance
            </p>
            {goals.length === 0 ? (
              <p className="py-6 text-sm text-navy-400 dark:text-navy-300">
                No goals yet —{" "}
                <Link to="/start" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                  finish onboarding
                </Link>{" "}
                to set some!
              </p>
            ) : (
              <ul className="space-y-5">
                {goals.map((goal) => {
                  const pct = Math.min(100, Math.round((summary.savingsBalance / goal.targetAmount) * 100));
                  return (
                    <li key={goal.id}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-medium text-navy-700 dark:text-navy-100">{goal.name}</span>
                        <span className="font-semibold text-navy-500 dark:text-navy-300">
                          {pct >= 100 ? "Done ✓" : `${pct}% of ${formatMoney(goal.targetAmount)}`}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${goal.name}: ${pct}%`}
                        className="h-2.5 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700"
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-gold-500" : "bg-emerald-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display font-semibold text-navy-800 dark:text-white">Recent Transactions</h2>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                View all
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="py-6 text-sm text-navy-400 dark:text-navy-300">
                Nothing yet. Hit “Add Transaction” to record your first income or expense.
              </p>
            ) : (
              <ul className="divide-y divide-navy-50 dark:divide-navy-700/50">
                {recent.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy-800 dark:text-white">{t.name}</p>
                      <p className="mt-0.5 text-xs text-navy-400 dark:text-navy-300">
                        {new Date(`${t.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <CategoryBadge category={t.category} />
                      <span
                        className={`font-semibold ${
                          t.type === "income" ? "text-emerald-700 dark:text-emerald-400" : "text-navy-800 dark:text-white"
                        }`}
                      >
                        {t.type === "income" ? "+" : "−"}{formatMoney(t.amount)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <p className="mt-10 text-center text-xs text-navy-400 dark:text-navy-400">
          The Fiscalize Banking Simulator is a learning tool with virtual money only.
          It is not connected to any real bank or financial institution.
        </p>
      </main>
      <Footer />

      <TransactionModal open={txModalOpen} onClose={() => setTxModalOpen(false)} />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
      <StartingBalanceModal account={editingBalance} onClose={() => setEditingBalance(null)} />
    </>
  );
}
