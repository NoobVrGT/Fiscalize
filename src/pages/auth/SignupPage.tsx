import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MailCheck, UserPlus } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { Field, inputClass } from "../../components/onboarding/fields";
import { useAuth } from "../../lib/auth";
import { usePageMeta } from "../../lib/usePageMeta";

export default function SignupPage() {
  usePageMeta("Sign up — Fiscalize");
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

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
    const result = await signUp(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsVerification) {
      setVerifySent(true);
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  if (verifySent) {
    return (
      <AuthLayout title="Check your email 📬" subtitle="One quick step before your journey starts.">
        <div className="space-y-5 text-navy-600 dark:text-navy-200">
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <p className="text-sm">
              We sent a verification link to <strong>{email}</strong>. Click it
              to activate your account, then come back and log in.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            Go to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Free for students — your personalized plan is waiting.">
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
        <Field label="Password" htmlFor="password">
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
        <Field label="Confirm password" htmlFor="confirm">
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
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          {busy ? "Creating account…" : "Sign up"}
        </button>

        <p className="text-center text-sm text-navy-500 dark:text-navy-300">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
