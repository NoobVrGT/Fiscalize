import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { Field, inputClass } from "../../components/onboarding/fields";
import { useAuth } from "../../lib/auth";
import { usePageMeta } from "../../lib/usePageMeta";

/**
 * Landing page for the Supabase recovery link. The link signs the user in
 * with a temporary session; from there they can set a new password.
 */
export default function ResetPasswordPage() {
  usePageMeta("Choose a new password — Fiscalize");
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const result = await updatePassword(password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Make it something memorable — and strong.">
      {!session && (
        <p className="mb-5 rounded-xl bg-gold-100/70 px-4 py-3 text-sm text-navy-800 dark:bg-gold-500/10 dark:text-gold-100">
          This page only works when opened from a password-reset email link. If
          your link expired, request a new one from the login page.
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="New password" htmlFor="password">
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm">
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            className={inputClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Same password again"
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !session}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}
