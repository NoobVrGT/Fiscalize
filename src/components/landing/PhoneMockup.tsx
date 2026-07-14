import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Coins,
  Flame,
  PiggyBank,
  ShieldQuestion,
  TrendingUp,
  Zap,
} from "lucide-react";

function ProgressBar({
  value,
  colorClass,
  label,
}: {
  value: number;
  colorClass: string;
  label: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700"
    >
      <motion.div
        className={`h-full rounded-full ${colorClass}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

/** Hand-built app screen shown inside the hero. Decorative, but readable. */
export default function PhoneMockup() {
  return (
    <div className="relative mx-auto w-fit" aria-label="Preview of the Fiscalize app">
      {/* Glow behind the phone */}
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[3rem] bg-gradient-to-tr from-emerald-500/25 via-transparent to-gold-400/25 blur-2xl"
      />

      {/* Phone frame */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.65, 0.36, 1] }}
        className="relative w-[290px] rounded-[2.4rem] border-8 border-navy-800 bg-surface shadow-lift sm:w-[310px] dark:border-navy-700 dark:bg-navy-900"
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-navy-800 dark:bg-navy-700"
        />

        <div className="space-y-3 px-4 pb-6 pt-10">
          {/* Greeting + streak */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-navy-400 dark:text-navy-300">Good morning</p>
              <p className="font-display text-sm font-bold text-navy-800 dark:text-white">
                Hey, Jordan 👋
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1.5 dark:bg-gold-500/15">
              <Flame className="size-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
              <span className="text-xs font-bold text-gold-700 dark:text-gold-300">
                7-day streak
              </span>
            </div>
          </div>

          {/* XP progress */}
          <div className="rounded-2xl bg-white p-3.5 shadow-soft dark:bg-navy-800">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-navy-700 dark:text-navy-100">
                <Zap className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Level 4 · 320 XP
              </span>
              <span className="text-navy-400 dark:text-navy-300">80 XP to Level 5</span>
            </div>
            <ProgressBar value={80} colorClass="bg-emerald-500" label="XP progress: 80%" />
          </div>

          {/* Savings goal */}
          <div className="rounded-2xl bg-white p-3.5 shadow-soft dark:bg-navy-800">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-navy-700 dark:text-navy-100">
                <PiggyBank className="size-3.5 text-navy-500 dark:text-navy-300" aria-hidden="true" />
                First Car Fund
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                $1,240 / $2,000
              </span>
            </div>
            <ProgressBar value={62} colorClass="bg-navy-500 dark:bg-navy-400" label="Savings goal progress: 62%" />
          </div>

          {/* Spending confirmation */}
          <div className="rounded-2xl border border-gold-300/60 bg-gold-100/60 p-3.5 dark:border-gold-500/30 dark:bg-gold-500/10">
            <div className="flex items-start gap-2.5">
              <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden="true" />
              <div className="text-xs">
                <p className="font-semibold text-navy-800 dark:text-gold-100">
                  Pause before you buy 🤔
                </p>
                <p className="mt-0.5 text-navy-500 dark:text-navy-200">
                  $59.99 sneakers — still want them tomorrow?
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded-full bg-emerald-600 px-3 py-1 font-semibold text-white">
                    Wait 24h
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 font-semibold text-navy-600 dark:bg-navy-800 dark:text-navy-200">
                    Buy now
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson progress */}
          <div className="rounded-2xl bg-white p-3.5 shadow-soft dark:bg-navy-800">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-navy-700 dark:text-navy-100">
                <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Budgeting Basics
              </span>
              <span className="text-navy-400 dark:text-navy-300">3 of 5 lessons</span>
            </div>
            <ProgressBar value={60} colorClass="bg-emerald-500" label="Lesson progress: 60%" />
          </div>
        </div>
      </motion.div>

      {/* Floating accents */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="glass absolute -left-10 top-16 hidden items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-soft sm:flex"
      >
        <Coins className="size-5 text-gold-500" />
        <span className="text-xs font-bold">+25 coins</span>
      </motion.div>

      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="glass absolute -right-10 top-40 hidden items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-soft sm:flex"
      >
        <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-bold">Savings up 18%</span>
      </motion.div>

      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="glass absolute -bottom-4 -left-6 hidden items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-soft sm:flex"
      >
        <Award className="size-5 text-navy-500 dark:text-navy-300" />
        <span className="text-xs font-bold">Badge unlocked!</span>
      </motion.div>
    </div>
  );
}
