import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Brain, Flame, LogOut, Zap } from "lucide-react";
import AppShell from "../components/AppShell";
import { useAuth } from "../lib/auth";
import { useBank } from "../lib/bank";
import { BADGES, levelFromXp, moneySkillScore } from "../lib/gamification";
import { TOTAL_LESSONS } from "../content/lessons";
import { usePageMeta } from "../lib/usePageMeta";

export default function ProfilePage() {
  usePageMeta("Profile — Fiscalize");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, achievements, lessons, quizResults, budgets, summary, totalXp, streak } = useBank();

  const level = levelFromXp(totalXp);
  const earned = new Set(achievements.map((a) => a.badge_slug));
  const name = profile?.first_name?.trim() || "Money Learner";

  const quizAccuracy =
    quizResults.length > 0
      ? quizResults.reduce((s, q) => s + q.score / q.total, 0) / quizResults.length
      : NaN;
  const skill = moneySkillScore({
    lessonsCompleted: lessons.length,
    quizAccuracy,
    hasBudget: budgets.length > 0,
    savingsRate: summary.monthlyIncome > 0 ? (summary.monthlyIncome - summary.monthlyExpenses) / summary.monthlyIncome : 0,
    streak,
  });

  const stats = [
    { icon: Zap, label: "Total XP", value: String(totalXp) },
    { icon: Flame, label: "Streak", value: `${streak} day${streak === 1 ? "" : "s"}` },
    { icon: BookOpen, label: "Lessons", value: `${lessons.length}/${TOTAL_LESSONS}` },
    { icon: Brain, label: "Skill Score", value: `${skill}/100` },
  ];

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-wrap items-center gap-5">
        <div
          aria-hidden="true"
          className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-navy-600 font-display text-3xl font-extrabold text-white shadow-lift"
        >
          {name[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-800 dark:text-white">{name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-navy-500 dark:text-navy-200">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
              Level {level.level} · {level.title}
            </span>
            <span className="truncate text-sm">{user?.email}</span>
          </p>
        </div>
      </motion.div>

      {/* Level progress */}
      <div className="mt-6 max-w-md">
        <div className="mb-1.5 flex justify-between text-sm font-semibold text-navy-500 dark:text-navy-300">
          <span>Level {level.level}</span>
          <span>{level.xpIntoLevel}/{level.xpForLevel} XP to Level {level.level + 1}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={level.progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Level progress: ${level.progressPct}%`}
          className="h-3 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${level.progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            className="rounded-3xl border border-navy-100 bg-white p-5 text-center shadow-soft dark:border-navy-700 dark:bg-navy-800"
          >
            <stat.icon className="mx-auto size-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <p className="mt-2 font-display text-xl font-bold text-navy-800 dark:text-white">{stat.value}</p>
            <p className="text-xs font-semibold text-navy-400 dark:text-navy-300">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <h2 className="mt-10 font-display text-xl font-bold text-navy-800 dark:text-white">
        Badges · {earned.size}/{BADGES.length}
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {BADGES.map((badge, i) => {
          const has = earned.has(badge.slug);
          return (
            <motion.li
              key={badge.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.04 }}
              className={`rounded-3xl border p-5 text-center shadow-soft transition-all ${
                has
                  ? "border-gold-400/50 bg-gold-100/40 dark:border-gold-500/30 dark:bg-gold-500/10"
                  : "border-navy-100 bg-white opacity-60 grayscale dark:border-navy-700 dark:bg-navy-800"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">{badge.emoji}</span>
              <p className="mt-2 font-display text-sm font-bold text-navy-800 dark:text-white">{badge.name}</p>
              <p className="mt-0.5 text-xs text-navy-400 dark:text-navy-300">
                {has ? badge.description : `Locked — ${badge.description.toLowerCase()}`}
              </p>
            </motion.li>
          );
        })}
      </ul>

      {/* Quick links + sign out */}
      <div className="mt-10 flex flex-wrap gap-3">
        {[
          ["Banking dashboard", "/dashboard"],
          ["Expense tracker", "/expenses"],
          ["All transactions", "/transactions"],
          ["Redo onboarding", "/start"],
        ].map(([label, to]) => (
          <Link
            key={to}
            to={to}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-navy-600 dark:text-navy-200 dark:hover:text-emerald-400"
          >
            {label}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        ))}
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </AppShell>
  );
}
