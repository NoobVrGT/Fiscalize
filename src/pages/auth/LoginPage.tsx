import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { Field, inputClass } from "../../components/onboarding/fields";
import { useAuth } from "../../lib/auth";
import { usePageMeta } from "../../lib/usePageMeta";

/**
 * Quick-login easter egg: typing the secret email-code and password-code
 * signs in as the admin account. Only SHA-256 fingerprints of the codes live
 * in this (public) codebase — never the codes themselves. The admin
 * account's real password is derived from the typed password-code at runtime
 * (code repeated twice), so it isn't in the repo either.
 *
 * To change a code: run in any browser console —
 *   crypto.subtle.digest("SHA-256", new TextEncoder().encode("NewCode"))
 *     .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("")))
 * then replace the hash below, and update the admin account's password to
 * "NewCodeNewCode" from the reset-password flow.
 */
const ADMIN_CODE_HASH = "37d2b12d5d9abc2a364ef9448767ee03938e383c0284193477dc7618f4b7c6c2";
const ADMIN_EMAIL = "bash0@fiscalize.app";

async function sha256Hex(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LoginPage() {
  usePageMeta("Log in — Fiscalize");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // Secret admin quick-login: the same code typed in both fields.
    const [emailHash, passwordHash] = await Promise.all([sha256Hex(email), sha256Hex(password)]);
    const isSecret = emailHash === ADMIN_CODE_HASH && passwordHash === ADMIN_CODE_HASH;

    if (!isSecret && !/^\S+@\S+\.\S+$/.test(email)) {
      setBusy(false);
      setError("Please enter a valid email address.");
      return;
    }

    const result = isSecret
      ? await signIn(ADMIN_EMAIL, `${password}${password}`)
      : await signIn(email, password);
    setBusy(false);
    if (result.error) {
      setError(isSecret ? "Admin quick-login failed — has the admin account been created yet?" : result.error);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to keep your streak alive.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
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
            autoComplete="current-password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
          <LogIn className="size-4" aria-hidden="true" />
          {busy ? "Logging in…" : "Log in"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Forgot password?
          </Link>
          <span className="text-navy-500 dark:text-navy-300">
            New here?{" "}
            <Link to="/signup" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
