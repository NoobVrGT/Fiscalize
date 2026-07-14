import { useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { formatMoney, useBank, type Transaction } from "../../lib/bank";
import { TRANSACTION_CATEGORIES } from "../../lib/database.types";
import { inputClass } from "../onboarding/fields";
import ConfirmDialog from "../ConfirmDialog";
import TransactionModal from "./TransactionModal";
import { CategoryBadge } from "./categories";

type SortKey = "newest" | "oldest" | "highest" | "lowest";

const SORTS: Record<SortKey, (a: Transaction, b: Transaction) => number> = {
  newest: (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  highest: (a, b) => b.amount - a.amount,
  lowest: (a, b) => a.amount - b.amount,
};

const selectClass = `${inputClass} py-2.5 text-sm`;

export default function TransactionsTable() {
  const { transactions, accounts, deleteTransaction } = useBank();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (q && !`${t.name} ${t.notes ?? ""}`.toLowerCase().includes(q)) return false;
        if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
        if (accountFilter !== "all" && t.accountId !== accountFilter) return false;
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        if (fromDate && t.date < fromDate) return false;
        if (toDate && t.date > toDate) return false;
        return true;
      })
      .sort(SORTS[sort]);
  }, [transactions, search, categoryFilter, accountFilter, typeFilter, fromDate, toDate, sort]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    const err = await deleteTransaction(deleting.id);
    setDeleteBusy(false);
    if (err) {
      setDeleteError(err);
      return;
    }
    setDeleting(null);
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative xl:col-span-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-navy-400 dark:text-navy-300"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search transactions"
            className={`${selectClass} pl-11`}
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select aria-label="Filter by category" className={selectClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All categories</option>
          {[...TRANSACTION_CATEGORIES, "Transfer"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select aria-label="Filter by account" className={selectClass} value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
          <option value="all">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <select aria-label="Filter by type" className={selectClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Income & expenses</option>
          <option value="income">Income only</option>
          <option value="expense">Expenses only</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-navy-500 dark:text-navy-300">
          <span className="w-10 shrink-0">From</span>
          <input type="date" aria-label="From date" className={selectClass} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-500 dark:text-navy-300">
          <span className="w-10 shrink-0">To</span>
          <input type="date" aria-label="To date" className={selectClass} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>

        <select aria-label="Sort transactions" className={selectClass} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
        </select>

        <p className="self-center text-sm text-navy-400 dark:text-navy-300" aria-live="polite">
          {filtered.length} of {transactions.length} transactions
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-3xl border border-navy-100 bg-white shadow-soft dark:border-navy-700 dark:bg-navy-800">
        {filtered.length === 0 ? (
          <p className="px-6 py-14 text-center text-navy-400 dark:text-navy-300">
            {transactions.length === 0
              ? "No transactions yet — add your first one to get started!"
              : "Nothing matches those filters."}
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wider text-navy-400 dark:border-navy-700 dark:text-navy-300">
                <th scope="col" className="px-6 py-4 font-semibold">Transaction</th>
                <th scope="col" className="px-4 py-4 font-semibold">Category</th>
                <th scope="col" className="px-4 py-4 font-semibold">Account</th>
                <th scope="col" className="px-4 py-4 font-semibold">Date</th>
                <th scope="col" className="px-4 py-4 text-right font-semibold">Amount</th>
                <th scope="col" className="px-4 py-4 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-navy-50 transition-colors last:border-0 hover:bg-surface dark:border-navy-700/50 dark:hover:bg-navy-700/30"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-navy-800 dark:text-white">{t.name}</p>
                    {t.notes && (
                      <p className="mt-0.5 max-w-56 truncate text-xs text-navy-400 dark:text-navy-300">
                        {t.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4"><CategoryBadge category={t.category} /></td>
                  <td className="px-4 py-4 text-navy-600 dark:text-navy-200">{accountName(t.accountId)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-navy-600 dark:text-navy-200">
                    {new Date(`${t.date}T00:00:00`).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td
                    className={`px-4 py-4 text-right font-semibold whitespace-nowrap ${
                      t.type === "income"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-navy-800 dark:text-white"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"}{formatMoney(t.amount)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(t)}
                        aria-label={`Edit ${t.name}`}
                        className="grid size-9 place-items-center rounded-full text-navy-400 transition-colors hover:bg-navy-700/5 hover:text-navy-700 dark:text-navy-300 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleting(t); setDeleteError(null); }}
                        aria-label={`Delete ${t.name}`}
                        className="grid size-9 place-items-center rounded-full text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-navy-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TransactionModal open={editing !== null} onClose={() => setEditing(null)} editing={editing} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete transaction?"
        message={
          deleteError
            ? `Couldn't delete: ${deleteError}`
            : `"${deleting?.name}" (${deleting ? formatMoney(deleting.amount) : ""}) will be removed and your balance updated. This can't be undone.`
        }
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
