import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Bot, PencilLine, PiggyBank, Plus, Target, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Field, inputClass } from "../components/onboarding/fields";
import { formatMoney, useBank, type Goal } from "../lib/bank";
import { usePageMeta } from "../lib/usePageMeta";

function weeklySuggestion(goal: Goal): string {
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  if (remaining === 0) return "Goal reached — treat yourself (responsibly)! 🎉";
  if (goal.deadline) {
    const weeks = Math.max(Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (7 * 86_400_000)), 1);
    return `Save ${formatMoney(remaining / weeks)}/week to hit your deadline (${weeks} week${weeks === 1 ? "" : "s"} left).`;
  }
  return `Save ${formatMoney(Math.max(remaining / 10, 5))}/week and you'll be done in about ${Math.ceil(remaining / Math.max(remaining / 10, 5))} weeks.`;
}

function GoalModal({ editing, open, onClose }: { editing: Goal | null; open: boolean; onClose: () => void }) {
  const { addGoal, updateGoal } = useBank();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Populate on open
  const [lastOpen, setLastOpen] = useState(false);
  if (open && !lastOpen) {
    setLastOpen(true);
    setError(null);
    setName(editing?.name ?? "");
    setTarget(editing ? String(editing.targetAmount) : "");
    setCurrent(editing ? String(editing.currentAmount) : "0");
    setDeadline(editing?.deadline ?? "");
  }
  if (!open && lastOpen) setLastOpen(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const targetNum = Number(target);
    const currentNum = Number(current || 0);
    if (!Number.isFinite(targetNum) || targetNum <= 0) {
      setError("Target amount must be a positive number.");
      return;
    }
    if (!Number.isFinite(currentNum) || currentNum < 0) {
      setError("Current amount can't be negative.");
      return;
    }
    setBusy(true);
    const err = editing
      ? await updateGoal(editing.id, {
          name: name.trim(),
          targetAmount: targetNum,
          currentAmount: currentNum,
          deadline: deadline || null,
        })
      : await addGoal(name.trim(), targetNum, deadline || null);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit goal" : "New goal"} maxWidth="max-w-md">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="What are you saving for?" htmlFor="goal-name">
          <input id="goal-name" required maxLength={60} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gaming PC" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Target amount ($)" htmlFor="goal-target">
            <input id="goal-target" type="number" required min="1" step="0.01" inputMode="decimal" className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="500" />
          </Field>
          <Field label="Saved so far ($)" htmlFor="goal-current">
            <input id="goal-current" type="number" min="0" step="0.01" inputMode="decimal" className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="0" />
          </Field>
        </div>
        <Field label="Deadline" htmlFor="goal-deadline" optional>
          <input id="goal-deadline" type="date" className={inputClass} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>
        )}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-navy-200 px-6 py-3 font-semibold text-navy-600 transition-colors hover:border-navy-400 dark:border-navy-600 dark:text-navy-200">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50">
            {busy ? "Saving…" : editing ? "Save changes" : "Create goal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ContributeModal({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  const { contributeToGoal } = useBank();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    setBusy(true);
    const err = await contributeToGoal(goal.id, parsed);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setAmount("");
    onClose();
  };

  return (
    <Modal open={goal !== null} onClose={onClose} title={`Add savings — ${goal?.name ?? ""}`} maxWidth="max-w-sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-navy-500 dark:text-navy-200">
          {goal && `${formatMoney(goal.currentAmount)} of ${formatMoney(goal.targetAmount)} saved so far.`}
        </p>
        <Field label="Amount to add ($)" htmlFor="contribute-amount">
          <input id="contribute-amount" type="number" required min="0.01" step="0.01" inputMode="decimal" className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="20" />
        </Field>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-navy-200 px-6 py-3 font-semibold text-navy-600 transition-colors hover:border-navy-400 dark:border-navy-600 dark:text-navy-200">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50">
            {busy ? "Saving…" : "Add it"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function GoalsPage() {
  usePageMeta("Goals — Fiscalize");
  const { goals, deleteGoal, loading } = useBank();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [contributing, setContributing] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-800 sm:text-4xl dark:text-white">Goals</h1>
          <p className="mt-2 text-navy-500 dark:text-navy-200">Name it, fund it, get it.</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          New goal
        </button>
      </motion.div>

      {loading ? (
        <p className="mt-16 text-center text-navy-400 dark:text-navy-300">Loading goals…</p>
      ) : goals.length === 0 ? (
        <div className="mt-16 text-center">
          <Target className="mx-auto size-12 text-navy-200 dark:text-navy-600" aria-hidden="true" />
          <p className="mt-4 font-display text-lg font-semibold text-navy-700 dark:text-navy-100">No goals yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-navy-400 dark:text-navy-300">
            Money with a mission is money that stays saved. Create your first goal — a gaming PC, a car fund, anything.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {goals.map((goal, i) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <motion.li
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft dark:border-navy-700 dark:bg-navy-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-navy-800 dark:text-white">{goal.name}</h2>
                    <p className="mt-0.5 text-sm text-navy-400 dark:text-navy-300">
                      {formatMoney(goal.currentAmount)} of {formatMoney(goal.targetAmount)}
                      {goal.deadline && ` · by ${new Date(`${goal.deadline}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => { setEditing(goal); setModalOpen(true); }} aria-label={`Edit ${goal.name}`} className="grid size-9 place-items-center rounded-full text-navy-400 transition-colors hover:bg-navy-700/5 hover:text-navy-700 dark:text-navy-300 dark:hover:bg-white/10 dark:hover:text-white">
                      <PencilLine className="size-4" />
                    </button>
                    <button type="button" onClick={() => setDeleting(goal)} aria-label={`Delete ${goal.name}`} className="grid size-9 place-items-center rounded-full text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-navy-300 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${goal.name}: ${pct}% funded`}
                  className="mt-4 h-3 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700"
                >
                  <motion.div
                    className={`h-full rounded-full ${pct >= 100 ? "bg-gold-500" : "bg-emerald-500"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-1.5 text-right text-sm font-bold text-navy-600 dark:text-navy-200">{pct}%</p>

                <p className="mt-2 flex items-start gap-2 rounded-2xl bg-navy-50 p-3 text-sm text-navy-600 dark:bg-navy-700/40 dark:text-navy-200">
                  <Bot className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  {weeklySuggestion(goal)}
                </p>

                <button
                  type="button"
                  onClick={() => setContributing(goal)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600 px-5 py-2.5 font-semibold text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-navy-900"
                >
                  <PiggyBank className="size-4" aria-hidden="true" />
                  Add savings
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}

      <GoalModal editing={editing} open={modalOpen} onClose={() => setModalOpen(false)} />
      <ContributeModal goal={contributing} onClose={() => setContributing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete goal?"
        message={`"${deleting?.name}" and its progress will be removed. This can't be undone.`}
        busy={deleteBusy}
        onConfirm={async () => {
          if (!deleting) return;
          setDeleteBusy(true);
          await deleteGoal(deleting.id);
          setDeleteBusy(false);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </AppShell>
  );
}
