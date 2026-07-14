import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { KeyRound, MailCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { Field, inputClass } from "../../components/onboarding/fields";
import { useAuth } from "../../lib/auth";
import { usePageMeta } from "../../lib/usePageMeta";

export default function ForgotPasswordPage() {
  usePageMeta("Reset password — Fiscalize");
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await resetPassword(email);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout title="Forgot your password?" subtitle="No stress — we'll email you a reset link.">
      {sent ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-navy-700 dark:bg-emerald-500/10 dark:text-navy-100">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <p>
              If an account exists for <strong>{email}</strong>, a reset link is
              on its way. Open it on this device to set a new password.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <KeyRound className="size-4" aria-hidden="true" />
            {busy ? "Sending…" : "Send reset link"}
          </button>

          <p className="text-center text-sm text-navy-500 dark:text-navy-300">
            Remembered it?{" "}
            <Link to="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
