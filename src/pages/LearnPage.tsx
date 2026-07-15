import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ChevronRight, Lock, TriangleAlert, Zap } from "lucide-react";
import AppShell from "../components/AppShell";
import { CATEGORIES, TOTAL_LESSONS } from "../content/lessons";
import { levelFromXp } from "../lib/gamification";
import { useBank } from "../lib/bank";
import { usePageMeta } from "../lib/usePageMeta";

export default function LearnPage() {
  usePageMeta("Learn — Fiscalize");
  const { lessons, totalXp, learningUnavailable } = useBank();
  const done = new Set(lessons.map((l) => l.lesson_slug));
  const level = levelFromXp(totalXp);

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-800 sm:text-4xl dark:text-white">
          Learn
        </h1>
        <p className="mt-2 text-navy-500 dark:text-navy-200">
          {done.size} of {TOTAL_LESSONS} lessons complete · Level {level.level} — {level.title}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div
            role="progressbar"
            aria-valuenow={level.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Level progress: ${level.xpIntoLevel} of ${level.xpForLevel} XP`}
            className="h-2.5 max-w-sm flex-1 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700"
              style={{ width: `${level.progressPct}%` }}
            />
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-navy-500 dark:text-navy-300">
            <Zap className="size-4 text-gold-500" aria-hidden="true" />
            {level.xpIntoLevel}/{level.xpForLevel} XP
          </span>
        </div>
      </motion.div>

      {learningUnavailable && (
        <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-gold-400/50 bg-gold-100/70 p-4 text-sm text-navy-800 dark:border-gold-500/30 dark:bg-gold-500/10 dark:text-gold-100">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
          <p>
            Quiz scores, XP, and badges need one database update: run{" "}
            <code className="font-mono font-semibold">supabase/add_learning.sql</code> in your Supabase
            SQL Editor, then reload. Lessons still work meanwhile!
          </p>
        </div>
      )}

      <div className="mt-8 space-y-8">
        {CATEGORIES.map((category, ci) => {
          const completed = category.lessons.filter((l) => done.has(l.slug)).length;
          return (
            <motion.section
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * ci }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-navy-800 dark:text-white">
                  <span aria-hidden="true" className="text-2xl">{category.emoji}</span>
                  {category.name}
                </h2>
                <span className="text-sm font-semibold text-navy-400 dark:text-navy-300">
                  {completed}/{category.lessons.length}
                </span>
              </div>
              <p className="mb-4 text-sm text-navy-500 dark:text-navy-300">{category.tagline}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {category.lessons.map((lesson) => {
                  const isDone = done.has(lesson.slug);
                  return (
                    <li key={lesson.slug}>
                      <Link
                        to={`/learn/${category.slug}/${lesson.slug}`}
                        className={`group flex items-center gap-4 rounded-2xl border p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift ${
                          isDone
                            ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/10"
                            : "border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid size-10 shrink-0 place-items-center rounded-full ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : "bg-navy-100 text-navy-400 dark:bg-navy-700 dark:text-navy-300"
                          }`}
                        >
                          {isDone ? <Check className="size-5" /> : <Lock className="size-4 opacity-0" />}
                          {!isDone && <span className="absolute text-sm font-bold">{lesson.minutes}m</span>}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display font-semibold text-navy-800 dark:text-white">
                            {lesson.title}
                          </span>
                          <span className="text-xs text-navy-400 dark:text-navy-300">
                            {isDone ? "Completed ✓ — review anytime" : `${lesson.minutes} min · +${lesson.xp} XP + quiz`}
                          </span>
                        </span>
                        <ChevronRight
                          className="size-5 shrink-0 text-navy-300 transition-transform group-hover:translate-x-1 dark:text-navy-500"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          );
        })}
      </div>
    </AppShell>
  );
}
