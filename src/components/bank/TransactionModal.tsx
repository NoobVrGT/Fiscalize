import { useEffect, useState, type FormEvent } from "react";
import Modal from "../Modal";
import { Field, inputClass } from "../onboarding/fields";
import { useBank, type Transaction, type TransactionInput } from "../../lib/bank";
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
  type TransactionType,
} from "../../lib/database.types";

const today = () => new Date().toISOString().slice(0, 10);

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, the modal edits this transaction instead of creating one. */
  editing?: Transaction | null;
}

export default function TransactionModal({ open, onClose, editing }: TransactionModalProps) {
  const { accounts, checking, addTransaction, updateTransaction } = useBank();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [accountId, setAccountId] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Populate when opened (edit) or reset (create).
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setName(editing.name);
      setAmount(String(editing.amount));
      setType(editing.type);
      setAccountId(editing.accountId);
      setCategory(editing.category === "Transfer" ? "Other" : editing.category);
      setDate(editing.date);
      setNotes(editing.notes ?? "");
    } else {
      setName("");
      setAmount("");
      setType("expense");
      setAccountId(checking?.id ?? "");
      setCategory("Food");
      setDate(today());
      setNotes("");
    }
  }, [open, editing, checking]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }
    if (!accountId) {
      setError("Pick an account.");
      return;
    }
    const input: TransactionInput = {
      accountId,
      name: name.trim(),
      amount: Math.round(parsedAmount * 100) / 100,
      type,
      category,
      date,
      notes: notes.trim() || null,
    };
    setBusy(true);
    const err = editing
      ? await updateTransaction(editing.id, input)
      : await addTransaction(input);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit transaction" : "Add transaction"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name" htmlFor="tx-name">
          <input
            id="tx-name"
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Movie night"
            maxLength={80}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount ($)" htmlFor="tx-amount">
            <input
              id="tx-amount"
              type="number"
              required
              min="0.01"
              step="0.01"
              inputMode="decimal"
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="12.50"
            />
          </Field>
          <Field label="Date" htmlFor="tx-date">
            <input
              id="tx-date"
              type="date"
              required
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type" htmlFor="tx-type">
            <select
              id="tx-type"
              className={inputClass}
              value={type}
              onChange={(e) => {
                const next = e.target.value as TransactionType;
                setType(next);
                if (next === "income" && category !== "Income") setCategory("Income");
                if (next === "expense" && category === "Income") setCategory("Food");
              }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </Field>
          <Field label="Account" htmlFor="tx-account">
            <select
              id="tx-account"
              required
              className={inputClass}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <option value="" disabled>Pick an account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Category" htmlFor="tx-category">
          <select
            id="tx-category"
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          >
            {TRANSACTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Notes" htmlFor="tx-notes" optional>
          <textarea
            id="tx-notes"
            rows={2}
            className={inputClass}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything worth remembering about this one?"
            maxLength={280}
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-navy-200 px-6 py-3 font-semibold text-navy-600 transition-colors hover:border-navy-400 dark:border-navy-600 dark:text-navy-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Add transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
