import { useEffect, useState, type FormEvent } from "react";
import { ArrowDown } from "lucide-react";
import Modal from "../Modal";
import { Field, inputClass } from "../onboarding/fields";
import { formatMoney, useBank } from "../../lib/bank";

export default function TransferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { accounts, balanceOf, transfer } = useBank();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || accounts.length < 2) return;
    setError(null);
    setAmount("");
    const checking = accounts.find((a) => a.type === "checking");
    const savings = accounts.find((a) => a.type === "savings");
    setFromId(checking?.id ?? accounts[0].id);
    setToId(savings?.id ?? accounts[1].id);
  }, [open, accounts]);

  const fromBalance = fromId ? balanceOf(fromId) : 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Amount must be a positive number.");
      return;
    }
    if (parsed > fromBalance) {
      setError(`That's more than the ${formatMoney(fromBalance)} available in this account.`);
      return;
    }
    if (fromId === toId) {
      setError("Pick two different accounts.");
      return;
    }
    setBusy(true);
    const err = await transfer(fromId, toId, Math.round(parsed * 100) / 100);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  return (
    <Modal open={open} onClose={onClose} title="Transfer between accounts" maxWidth="max-w-md">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="From" htmlFor="transfer-from">
          <select
            id="transfer-from"
            className={inputClass}
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {formatMoney(balanceOf(a.id))}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={swap}
            aria-label="Swap accounts"
            className="grid size-10 place-items-center rounded-full border border-navy-200 text-navy-500 transition-all hover:rotate-180 hover:border-emerald-500 hover:text-emerald-700 dark:border-navy-600 dark:text-navy-300 dark:hover:text-emerald-400"
          >
            <ArrowDown className="size-4" />
          </button>
        </div>

        <Field label="To" htmlFor="transfer-to">
          <select
            id="transfer-to"
            className={inputClass}
            value={toId}
            onChange={(e) => setToId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {formatMoney(balanceOf(a.id))}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Amount ($)" htmlFor="transfer-amount">
          <input
            id="transfer-amount"
            type="number"
            required
            min="0.01"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50.00"
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
            {busy ? "Transferring…" : "Transfer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
