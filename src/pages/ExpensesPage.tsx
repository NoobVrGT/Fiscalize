import { useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import { CategoryBadge } from "../components/bank/categories";
import { Field, inputClass } from "../components/onboarding/fields";
import { formatMoney, useBank } from "../lib/bank";
import { TRANSACTION_CATEGORIES } from "../lib/database.types";
import { useChartColors } from "../lib/chartColors";
import { usePageMeta } from "../lib/usePageMeta";

/** Categories you can budget for (income isn't an expense). */
const BUDGET_CATEGORIES = TRANSACTION_CATEGORIES.filter((c) => c !== "Income");

const monthKey = (d: Date) => d.toISOString().slice(0, 7);

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Progress state for a budgeted category — always icon + text, never color alone. */
function budgetStatus(spent: number, limit: number) {
  const pct = (spent / limit) * 100;
  if (pct >= 100)
    return { pct: Math.min(pct, 100), bar: "bg-red-500", label: `Over by ${formatMoney(spent - limit)}`, text: "text-red-600 dark:text-red-400" };
  if (pct >= 80)
    return { pct, bar: "bg-gold-500", label: `${formatMoney(limit - spent)} left — getting close`, text: "text-gold-600 dark:text-gold-400" };
  return { pct, bar: "bg-emerald-500", label: `${formatMoney(limit - spent)} left`, text: "text-emerald-700 dark:text-emerald-400" };
}

function BudgetModal({
  category,
  currentLimit,
  onClose,
}: {
  category: string | null;
  currentLimit: number | null;
  onClose: () => void;
}) {
  const { setBudget } = useBank();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!category) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    setBusy(true);
    const err = await setBudget(category, Math.round(parsed * 100) / 100);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <Modal
      open={category !== null}
      onClose={onClose}
      title={`${currentLimit ? "Edit" : "Set"} budget — ${category ?? ""}`}
      maxWidth="max-w-sm"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-navy-500 dark:text-navy-200">
          How much do you want to allow for {category?.toLowerCase()} each month?
        </p>
        <Field label="Monthly limit ($)" htmlFor="budget-amount">
          <input
            id="budget-amount"
            type="number"
            required
            min="0.01"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={currentLimit ? String(currentLimit) : "100"}
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
            {busy ? "Saving…" : "Save budget"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function ExpensesPage() {
  usePageMeta("Expense Tracker — Fiscalize");
  const { loading, transactions, budgets, budgetsUnavailable, removeBudget } = useBank();
  const colors = useChartColors();

  const currentMonth = monthKey(new Date());
  const [month, setMonth] = useState(currentMonth);
  const [budgetModal, setBudgetModal] = useState<string | null>(null);

  // Real spending only: expenses, excluding transfers between own accounts.
  const expenses = useMemo(
    () => transactions.filter((t) => t.type === "expense" && t.category !== "Transfer"),
    [transactions],
  );

  const monthExpenses = useMemo(
    () => expenses.filter((t) => t.date.startsWith(month)),
    [expenses, month],
  );

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthExpenses) map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    return map;
  }, [monthExpenses]);

  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const prevMonth = shiftMonth(month, -1);
  const prevTotal = expenses
    .filter((t) => t.date.startsWith(prevMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  const delta = totalSpent - prevTotal;

  const trend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const ym = shiftMonth(currentMonth, i - 5);
      const total = expenses.filter((t) => t.date.startsWith(ym)).reduce((s, t) => s + t.amount, 0);
      return { month: monthLabel(ym).split(" ")[0].slice(0, 3), total: Math.round(total * 100) / 100 };
    });
  }, [expenses, currentMonth]);

  // Budgeted categories first (by % used), then unbudgeted ones with spending.
  const rows = useMemo(() => {
    const budgetMap = new Map(budgets.map((b) => [b.category, b.monthlyLimit]));
    return BUDGET_CATEGORIES.map((category) => ({
      category,
      spent: spentByCategory.get(category) ?? 0,
      limit: budgetMap.get(category) ?? null,
    }))
      .filter((r) => r.limit !== null || r.spent > 0)
      .sort((a, b) => {
        if (a.limit !== null && b.limit !== null) return b.spent / b.limit - a.spent / a.limit;
        if (a.limit !== null) return -1;
        if (b.limit !== null) return 1;
        return b.spent - a.spent;
      });
  }, [budgets, spentByCategory]);

  const unbudgeted = BUDGET_CATEGORIES.filter((c) => !budgets.some((b) => b.category === c));

  const tooltipStyle = {
    backgroundColor: colors.tooltipBg,
    color: colors.tooltipText,
    border: "none",
    borderRadius: "0.75rem",
    boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.3)",
    fontSize: "0.8rem",
    padding: "0.5rem 0.75rem",
  } as const;

  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto min-h-dvh max-w-5xl px-5 pb-24 pt-28 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-800 sm:text-4xl dark:text-white">
            Expense Tracker
          </h1>
          <p className="mt-2 text-navy-500 dark:text-navy-200">
            Set monthly budgets and see exactly where your money goes.
          </p>
        </motion.div>

        {budgetsUnavailable && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-gold-400/50 bg-gold-100/70 p-4 text-sm text-navy-800 dark:border-gold-500/30 dark:bg-gold-500/10 dark:text-gold-100">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
            <p>
              One quick database update needed: run{" "}
              <code className="font-mono font-semibold">supabase/add_budgets.sql</code> in your
              Supabase SQL Editor to enable budgets, then reload this page.
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid place-items-center py-24" role="status" aria-live="polite">
            <div className="flex items-center gap-3 text-navy-500 dark:text-navy-300">
              <span className="size-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" aria-hidden="true" />
              Loading your expenses…
            </div>
          </div>
        ) : (
          <>
            {/* Month picker + summary */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMonth(shiftMonth(month, -1))}
                  aria-label="Previous month"
                  className="grid size-10 place-items-center rounded-full border border-navy-200 text-navy-500 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-navy-600 dark:text-navy-300 dark:hover:text-emerald-400"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <span className="min-w-40 text-center font-display text-lg font-bold text-navy-800 dark:text-white" aria-live="polite">
                  {monthLabel(month)}
                </span>
                <button
                  type="button"
                  onClick={() => setMonth(shiftMonth(month, 1))}
                  disabled={month >= currentMonth}
                  aria-label="Next month"
                  className="grid size-10 place-items-center rounded-full border border-navy-200 text-navy-500 transition-colors hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-30 dark:border-navy-600 dark:text-navy-300 dark:hover:text-emerald-400"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-400 dark:text-navy-300">
                    <Wallet className="size-4" aria-hidden="true" /> Spent
                  </p>
                  <p className="font-display text-2xl font-bold text-navy-800 dark:text-white">
                    {formatMoney(totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-400 dark:text-navy-300">vs last month</p>
                  <p
                    className={`flex items-center gap-1 font-display text-2xl font-bold ${
                      delta > 0 ? "text-gold-600 dark:text-gold-400" : "text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {delta > 0 ? <TrendingUp className="size-5" aria-hidden="true" /> : <TrendingDown className="size-5" aria-hidden="true" />}
                    {delta >= 0 ? "+" : "−"}{formatMoney(Math.abs(delta))}
                  </p>
                </div>
              </div>
            </div>

            {/* Budgets */}
            <section className="mt-8 rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8 dark:border-navy-700 dark:bg-navy-800">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-navy-800 dark:text-white">
                  Budgets · {monthLabel(month)}
                </h2>
                {!budgetsUnavailable && unbudgeted.length > 0 && (
                  <label className="flex items-center gap-2 text-sm text-navy-500 dark:text-navy-300">
                    Add budget:
                    <select
                      aria-label="Add a budget for a category"
                      className={`${inputClass} w-auto py-2 text-sm`}
                      value=""
                      onChange={(e) => e.target.value && setBudgetModal(e.target.value)}
                    >
                      <option value="" disabled>Pick category</option>
                      {unbudgeted.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {rows.length === 0 ? (
                <p className="py-8 text-center text-navy-400 dark:text-navy-300">
                  No spending or budgets for this month yet. Add a budget above, or record an
                  expense from your dashboard.
                </p>
              ) : (
                <ul className="space-y-6">
                  {rows.map(({ category, spent, limit }) => {
                    const status = limit ? budgetStatus(spent, limit) : null;
                    return (
                      <li key={category}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <CategoryBadge category={category as never} />
                            <span className="text-sm font-semibold text-navy-700 dark:text-navy-100">
                              {formatMoney(spent)}
                              {limit && <span className="font-normal text-navy-400 dark:text-navy-300"> of {formatMoney(limit)}</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {status && <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>}
                            <button
                              type="button"
                              onClick={() => setBudgetModal(category)}
                              aria-label={`${limit ? "Edit" : "Set"} budget for ${category}`}
                              className="grid size-8 place-items-center rounded-full text-navy-400 transition-colors hover:bg-navy-700/5 hover:text-navy-700 dark:text-navy-300 dark:hover:bg-white/10 dark:hover:text-white"
                            >
                              <PencilLine className="size-4" />
                            </button>
                            {limit && (
                              <button
                                type="button"
                                onClick={() => void removeBudget(category)}
                                aria-label={`Remove budget for ${category}`}
                                className="grid size-8 place-items-center rounded-full text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-navy-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        {status ? (
                          <div
                            role="progressbar"
                            aria-valuenow={Math.round(status.pct)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${category} budget: ${Math.round(status.pct)}% used`}
                            className="h-2.5 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700"
                          >
                            <div className={`h-full rounded-full transition-all duration-500 ${status.bar}`} style={{ width: `${status.pct}%` }} />
                          </div>
                        ) : (
                          <p className="text-xs text-navy-400 dark:text-navy-300">No budget set — click the pencil to add one.</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Trend */}
            <section className="mt-6 rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8 dark:border-navy-700 dark:bg-navy-800">
              <h2 className="font-display text-lg font-semibold text-navy-800 dark:text-white">Spending Trend</h2>
              <p className="mb-4 text-sm text-navy-400 dark:text-navy-300">Total expenses, last 6 months</p>
              <div role="img" aria-label={`Monthly spending trend: ${trend.map((t) => `${t.month} ${formatMoney(t.total)}`).join(", ")}`}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap="35%">
                    <CartesianGrid stroke={colors.grid} strokeDasharray="3 6" vertical={false} />
                    <XAxis dataKey="month" stroke={colors.axis} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke={colors.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatMoney(Number(v)), "Spent"]} cursor={{ fill: colors.grid, opacity: 0.4 }} />
                    <Bar dataKey="total" fill={colors.gold} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />

      <BudgetModal
        category={budgetModal}
        currentLimit={budgets.find((b) => b.category === budgetModal)?.monthlyLimit ?? null}
        onClose={() => setBudgetModal(null)}
      />
    </>
  );
}
