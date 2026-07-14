import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import Logo from "../Logo";
import { isSupabaseConfigured } from "../../lib/supabase";

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-[28rem] rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[22rem] rounded-full bg-gold-400/10 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-md items-center justify-between px-5 py-6">
        <Logo />
        <Link
          to="/"
          className="text-sm font-medium text-navy-500 transition-colors hover:text-emerald-700 dark:text-navy-300 dark:hover:text-emerald-400"
        >
          Back to home
        </Link>
      </header>

      <main id="main" className="mx-auto w-full max-w-md flex-1 px-5 pb-16">
        {!isSupabaseConfigured && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-gold-400/50 bg-gold-100/70 p-4 text-sm text-navy-800 dark:border-gold-500/30 dark:bg-gold-500/10 dark:text-gold-100"
          >
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
            <div>
              <p className="font-semibold">Supabase isn't connected yet</p>
              <p className="mt-1">
                Copy <code className="font-mono">.env.example</code> to{" "}
                <code className="font-mono">.env.local</code>, add your project
                URL and anon key, run <code className="font-mono">supabase/schema.sql</code>{" "}
                in the SQL editor, then restart the dev server.
              </p>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.65, 0.36, 1] }}
          className="glass rounded-[2rem] p-7 shadow-lift sm:p-9"
        >
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-800 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm text-navy-500 dark:text-navy-200">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}
