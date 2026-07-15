import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Check, Flame, LineChart as LineChartIcon, PiggyBank, RefreshCw, Trophy, Zap } from "lucide-react";
import AppShell from "../components/AppShell";
import { formatMoney, useBank } from "../lib/bank";
import { todaysChallenge } from "../lib/gamification";
import { useChartColors } from "../lib/chartColors";
import { usePageMeta } from "../lib/usePageMeta";

const todayKey = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/* Daily challenge                                                     */
/* ------------------------------------------------------------------ */

function DailyChallengeCard() {
  const { challenges, completeChallenge, streak } = useBank();
  const challenge = todaysChallenge();
  const doneToday = challenges.some(
    (c) => c.challenge_slug === challenge.slug && c.challenge_date === todayKey(),
  );
  const [busy, setBusy] = useState(false);

  return (
    <section className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8 dark:border-navy-700 dark:bg-navy-800">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold-100 dark:bg-gold-500/15" aria-hidden="true">
            <Flame className="size-6 text-gold-600 dark:text-gold-400" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
              Today's challenge · {streak > 0 ? `${streak}-day streak 🔥` : "start your streak!"}
            </p>
            <h2 className="font-display text-lg font-bold text-navy-800 dark:text-white">{challenge.title}</h2>
            <p className="mt-0.5 text-sm text-navy-500 dark:text-navy-200">{challenge.description}</p>
          </div>
        </div>
        {doneToday ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Check className="size-4" aria-hidden="true" />
            Done today (+{challenge.xp} XP)
          </span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await completeChallenge(challenge.slug, challenge.xp);
              setBusy(false);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50"
          >
            <Zap className="size-4" aria-hidden="true" />
            I did it! (+{challenge.xp} XP)
          </button>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Budget simulator                                                    */
/* ------------------------------------------------------------------ */

const SIM_INCOME = 2000;
const SIM_RENT = 800;
const SIM_CATEGORIES = [
  { key: "food", label: "Food", start: 300, max: 700 },
  { key: "entertainment", label: "Entertainment", start: 250, max: 600 },
  { key: "transportation", label: "Transportation", start: 150, max: 400 },
  { key: "shopping", label: "Shopping", start: 150, max: 600 },
] as const;

function BudgetSimulator() {
  const { completeChallenge, challenges } = useBank();
  const alreadyDone = challenges.some((c) => c.challenge_slug === "budget-simulator");
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(SIM_CATEGORIES.map((c) => [c.key, c.start])),
  );
  const [result, setResult] = useState<{ score: number; feedback: string[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const spent = SIM_RENT + Object.values(values).reduce((a, b) => a + b, 0);
  const savings = SIM_INCOME - spent;
  const savingsRate = savings / SIM_INCOME;

  const finish = async () => {
    const feedback: string[] = [];
    let score = Math.round(Math.min(Math.max(savingsRate, 0), 0.3) / 0.3 * 70);
    if (savings < 0) {
      feedback.push(`You overspent by ${formatMoney(-savings)} — in real life that's debt territory. Pull back the fun categories first.`);
      score = 5;
    } else if (savingsRate < 0.1) {
      feedback.push(`You saved ${Math.round(savingsRate * 100)}%. Try pushing toward 15-20% — future you will high-five present you.`);
    } else if (savingsRate < 0.2) {
      feedback.push(`You saved ${Math.round(savingsRate * 100)}% — solid! The classic target is 20%; you're nearly there.`);
    } else {
      feedback.push(`You saved ${Math.round(savingsRate * 100)}% — at or above the 20% gold standard. Excellent budgeting instincts. 🏆`);
      score += 20;
    }
    if (values.entertainment + values.shopping > SIM_INCOME * 0.3) {
      feedback.push("Heads up: wants (entertainment + shopping) are above the 30% guideline from the 50/30/20 rule.");
    } else {
      feedback.push("Your wants stayed within the 30% guideline — nicely balanced.");
      score += 10;
    }
    score = Math.min(score, 100);
    setResult({ score, feedback });
    if (!alreadyDone) {
      setBusy(true);
      await completeChallenge("budget-simulator", 40);
      setBusy(false);
    }
  };

  return (
    <section className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8 dark:border-navy-700 dark:bg-navy-800">
      <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-navy-800 dark:text-white">
        <PiggyBank className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        Budget Simulator
      </h2>
      <p className="mt-1 text-sm text-navy-500 dark:text-navy-200">
        You earn {formatMoney(SIM_INCOME)}/month. Rent is fixed at {formatMoney(SIM_RENT)} — you decide the rest. Whatever's left becomes savings.
      </p>

      <div className="mt-6 space-y-5">
        <div className="flex items-center justify-between rounded-2xl bg-navy-50 px-4 py-3 text-sm dark:bg-navy-700/40">
          <span className="font-semibold text-navy-700 dark:text-navy-100">🏠 Rent (fixed)</span>
          <span className="font-bold text-navy-800 dark:text-white">{formatMoney(SIM_RENT)}</span>
        </div>
        {SIM_CATEGORIES.map((cat) => (
          <div key={cat.key}>
            <div className="mb-1 flex justify-between text-sm">
              <label htmlFor={`sim-${cat.key}`} className="font-semibold text-navy-700 dark:text-navy-100">
                {cat.label}
              </label>
              <span className="font-bold text-navy-800 dark:text-white">{formatMoney(values[cat.key])}</span>
            </div>
            <input
              id={`sim-${cat.key}`}
              type="range"
              min={0}
              max={cat.max}
              step={10}
              value={values[cat.key]}
              onChange={(e) => {
                setResult(null);
                setValues((v) => ({ ...v, [cat.key]: Number(e.target.value) }));
              }}
              className="w-full accent-emerald-600"
            />
          </div>
        ))}
      </div>

      <div
        className={`mt-6 flex items-center justify-between rounded-2xl px-5 py-4 ${
          savings < 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-emerald-50 dark:bg-emerald-500/10"
        }`}
        aria-live="polite"
      >
        <span className={`font-semibold ${savings < 0 ? "text-red-700 dark:text-red-300" : "text-emerald-900 dark:text-emerald-100"}`}>
          {savings < 0 ? "Over budget!" : "Left for savings"}
        </span>
        <span className={`font-display text-xl font-bold ${savings < 0 ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
          {formatMoney(savings)} ({Math.round(savingsRate * 100)}%)
        </span>
      </div>

      {result ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl border border-gold-400/40 bg-gold-100/50 p-5 dark:border-gold-500/25 dark:bg-gold-500/10">
          <p className="font-display text-lg font-bold text-navy-800 dark:text-gold-100">
            Coach's score: {result.score}/100 {result.score >= 80 ? "🏆" : result.score >= 50 ? "⭐" : "📚"}
          </p>
          {result.feedback.map((f) => (
            <p key={f} className="mt-2 text-sm leading-relaxed text-navy-700 dark:text-navy-100">{f}</p>
          ))}
          {!alreadyDone && <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400"><Zap className="size-4" aria-hidden="true" />+40 XP earned</p>}
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={finish}
          disabled={busy}
          className="mt-5 w-full rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50"
        >
          Submit my budget
        </button>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Investing simulator                                                 */
/* ------------------------------------------------------------------ */

const START_CASH = 10_000;
const ASSETS = [
  { key: "stocks", label: "Single Stocks", mean: 0.009, vol: 0.06, blurb: "Highest potential, wildest ride" },
  { key: "etfs", label: "Index ETFs", mean: 0.007, vol: 0.032, blurb: "Diversified market basket" },
  { key: "bonds", label: "Bonds", mean: 0.003, vol: 0.012, blurb: "Steady and calm" },
  { key: "cash", label: "Cash", mean: 0.002, vol: 0, blurb: "Safe, barely grows" },
] as const;

function randNormal() {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function InvestingSimulator() {
  const { completeChallenge, challenges } = useBank();
  const colors = useChartColors();
  const alreadyDone = challenges.some((c) => c.challenge_slug === "investing-simulator");
  const [alloc, setAlloc] = useState<Record<string, number>>({ stocks: 25, etfs: 40, bonds: 20, cash: 15 });
  const [series, setSeries] = useState<{ month: string; value: number }[] | null>(null);
  const [busy, setBusy] = useState(false);

  const totalPct = Object.values(alloc).reduce((a, b) => a + b, 0);

  const run = async () => {
    const weights = ASSETS.map((a) => alloc[a.key] / 100);
    let holdings = weights.map((w) => START_CASH * w);
    const points = [{ month: "Start", value: START_CASH }];
    for (let m = 1; m <= 12; m++) {
      holdings = holdings.map((value, i) => {
        const asset = ASSETS[i];
        const monthReturn = asset.mean + asset.vol * randNormal();
        return value * (1 + monthReturn);
      });
      points.push({ month: `M${m}`, value: Math.round(holdings.reduce((a, b) => a + b, 0)) });
    }
    setSeries(points);
    if (!alreadyDone) {
      setBusy(true);
      await completeChallenge("investing-simulator", 40);
      setBusy(false);
    }
  };

  const final = series ? series[series.length - 1].value : null;
  const gain = final !== null ? final - START_CASH : 0;

  return (
    <section className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8 dark:border-navy-700 dark:bg-navy-800">
      <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-navy-800 dark:text-white">
        <LineChartIcon className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        Investing Simulator
      </h2>
      <p className="mt-1 text-sm text-navy-500 dark:text-navy-200">
        You have {formatMoney(START_CASH)} of virtual money. Split it across asset types, then simulate 12 months of markets. (Every run is different — just like real markets.)
      </p>

      <div className="mt-6 space-y-5">
        {ASSETS.map((asset) => (
          <div key={asset.key}>
            <div className="mb-1 flex justify-between text-sm">
              <label htmlFor={`inv-${asset.key}`} className="font-semibold text-navy-700 dark:text-navy-100">
                {asset.label} <span className="font-normal text-navy-400 dark:text-navy-300">— {asset.blurb}</span>
              </label>
              <span className="font-bold text-navy-800 dark:text-white">{alloc[asset.key]}%</span>
            </div>
            <input
              id={`inv-${asset.key}`}
              type="range"
              min={0}
              max={100}
              step={5}
              value={alloc[asset.key]}
              onChange={(e) => {
                setSeries(null);
                setAlloc((a) => ({ ...a, [asset.key]: Number(e.target.value) }));
              }}
              className="w-full accent-emerald-600"
            />
          </div>
        ))}
      </div>

      <p
        className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
          totalPct === 100
            ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100"
            : "bg-gold-100/70 text-navy-800 dark:bg-gold-500/10 dark:text-gold-100"
        }`}
        aria-live="polite"
      >
        Allocated: {totalPct}% {totalPct === 100 ? "— ready to invest!" : "(adjust until it's exactly 100%)"}
      </p>

      {series && final !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <div role="img" aria-label={`Portfolio simulation: started at ${formatMoney(START_CASH)}, ended at ${formatMoney(final)}`}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={colors.grid} strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="month" stroke={colors.axis} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.axis} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ backgroundColor: colors.tooltipBg, color: colors.tooltipText, border: "none", borderRadius: "0.75rem", fontSize: "0.8rem" }}
                  formatter={(v) => [formatMoney(Number(v)), "Portfolio"]}
                />
                <Line type="monotone" dataKey="value" stroke={gain >= 0 ? colors.emerald : colors.gold} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={`mt-4 rounded-2xl p-5 ${gain >= 0 ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-gold-100/60 dark:bg-gold-500/10"}`}>
            <p className="font-display text-lg font-bold text-navy-800 dark:text-white">
              After 12 months: {formatMoney(final)} ({gain >= 0 ? "+" : "−"}{formatMoney(Math.abs(gain))})
            </p>
            <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-navy-200">
              {gain >= 0
                ? "Your portfolio grew with market performance. Notice the bumps along the way — that's volatility, and riding through it is exactly what long-term investors do."
                : "Your portfolio ended down this year — that happens! Markets fall in roughly 1 of every 4 years. This is why investing is for long-timeline money: historically, staying invested through down years has been rewarded."}
              {alloc.stocks >= 50 && " Your heavy stock allocation made the swings bigger — more potential, more turbulence."}
              {alloc.cash >= 50 && " With mostly cash, you barely moved — safe, but inflation quietly wins that trade over time."}
            </p>
            {!alreadyDone && <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400"><Zap className="size-4" aria-hidden="true" />+40 XP earned</p>}
          </div>
        </motion.div>
      )}

      <button
        type="button"
        onClick={run}
        disabled={totalPct !== 100 || busy}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {series ? <><RefreshCw className="size-4" aria-hidden="true" /> Simulate another year</> : "Simulate 12 months"}
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function PracticePage() {
  usePageMeta("Practice — Fiscalize");
  const { learningUnavailable } = useBank();
  // Memoize so the challenge doesn't change mid-session at midnight edge cases.
  useMemo(() => todaysChallenge(), []);

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight text-navy-800 sm:text-4xl dark:text-white">
          <Trophy className="size-8 text-gold-500" aria-hidden="true" />
          Practice
        </h1>
        <p className="mt-2 text-navy-500 dark:text-navy-200">
          Daily missions and risk-free simulators — all virtual money, all real learning.
        </p>
      </motion.div>

      {learningUnavailable && (
        <p role="alert" className="mt-6 rounded-2xl border border-gold-400/50 bg-gold-100/70 p-4 text-sm text-navy-800 dark:border-gold-500/30 dark:bg-gold-500/10 dark:text-gold-100">
          To save challenge progress and XP, run <code className="font-mono font-semibold">supabase/add_learning.sql</code> in your Supabase SQL Editor, then reload.
        </p>
      )}

      <div className="mt-8 space-y-6">
        <DailyChallengeCard />
        <BudgetSimulator />
        <InvestingSimulator />
      </div>
    </AppShell>
  );
}
