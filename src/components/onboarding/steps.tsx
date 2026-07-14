import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Rocket,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import {
  buildPlan,
  confidenceLabel,
  useOnboarding,
} from "../../lib/onboarding";
import { useAuth } from "../../lib/auth";
import { ChipToggle, Field, inputClass, RadioPill } from "./fields";

/* ------------------------------------------------------------------ */
/* Step 1 — Welcome                                                    */
/* ------------------------------------------------------------------ */

export function StepWelcome() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lift"
      >
        <Sparkles className="size-9 text-white" aria-hidden="true" />
      </motion.div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-800 sm:text-4xl dark:text-white">
        Welcome to Fiscalize!
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-navy-500 dark:text-navy-200">
        We're excited you're here. 🎉 Answer a few quick questions and we'll
        build a money plan that's personal to you — it takes about two minutes.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — About You                                                  */
/* ------------------------------------------------------------------ */

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "India",
  "Germany", "France", "Spain", "Mexico", "Brazil", "Nigeria", "Japan",
  "South Korea", "Philippines", "Other",
];
const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Hindi", "Other"];

export function StepAboutYou() {
  const { answers, update } = useOnboarding();
  return (
    <div className="space-y-5">
      <StepTitle title="About you" subtitle="So we can say hi properly and tailor lessons to your world." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName">
          <input
            id="firstName"
            className={inputClass}
            value={answers.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            placeholder="Alex"
            autoComplete="given-name"
          />
        </Field>
        <Field label="Age" htmlFor="age">
          <input
            id="age"
            type="number"
            min={10}
            max={25}
            className={inputClass}
            value={answers.age}
            onChange={(e) => update({ age: e.target.value })}
            placeholder="16"
          />
        </Field>
        <Field label="Grade" htmlFor="grade" optional>
          <input
            id="grade"
            className={inputClass}
            value={answers.grade}
            onChange={(e) => update({ grade: e.target.value })}
            placeholder="11th grade"
          />
        </Field>
        <Field label="Country" htmlFor="country">
          <select
            id="country"
            className={inputClass}
            value={answers.country}
            onChange={(e) => update({ country: e.target.value })}
          >
            <option value="" disabled>Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Preferred language" htmlFor="language">
          <select
            id="language"
            className={inputClass}
            value={answers.language}
            onChange={(e) => update({ language: e.target.value })}
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — Financial Goals                                            */
/* ------------------------------------------------------------------ */

export const GOAL_OPTIONS = [
  "Save for a car", "Buy a gaming PC", "Save for college",
  "Build an emergency fund", "Stop impulse spending", "Learn budgeting",
  "Learn investing", "Save for travel", "Other",
];

export function StepGoals() {
  const { answers, update } = useOnboarding();
  const toggle = (goal: string, on: boolean) =>
    update({
      goals: on ? [...answers.goals, goal] : answers.goals.filter((g) => g !== goal),
    });

  return (
    <div className="space-y-5">
      <StepTitle
        title="What are you working toward?"
        subtitle="Pick as many as you like — we'll build your plan around them."
      />
      <fieldset>
        <legend className="sr-only">Financial goals (select all that apply)</legend>
        <div className="flex flex-wrap gap-2.5">
          {GOAL_OPTIONS.map((goal) => (
            <ChipToggle
              key={goal}
              label={goal}
              checked={answers.goals.includes(goal)}
              onChange={(on) => toggle(goal, on)}
            />
          ))}
        </div>
      </fieldset>
      {answers.goals.includes("Other") && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Field label="Tell us your goal" htmlFor="customGoal">
            <input
              id="customGoal"
              className={inputClass}
              value={answers.customGoal}
              onChange={(e) => update({ customGoal: e.target.value })}
              placeholder="e.g. Save for a summer music camp"
            />
          </Field>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Spending Habits                                            */
/* ------------------------------------------------------------------ */

export function StepHabits() {
  const { answers, update } = useOnboarding();
  return (
    <div className="space-y-8">
      <StepTitle title="Your money habits" subtitle="No judgment — this just helps us pick the right starting point." />

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-navy-700 dark:text-navy-100">
          How often do you buy things impulsively?
        </legend>
        <div className="flex gap-2.5">
          {(["never", "sometimes", "often"] as const).map((option) => (
            <RadioPill
              key={option}
              name="impulse"
              label={option[0].toUpperCase() + option.slice(1)}
              checked={answers.impulseFrequency === option}
              onChange={() => update({ impulseFrequency: option })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-navy-700 dark:text-navy-100">
          Do you currently budget?
        </legend>
        <div className="flex gap-2.5">
          {(["yes", "no"] as const).map((option) => (
            <RadioPill
              key={option}
              name="budgets"
              label={option === "yes" ? "Yes" : "No"}
              checked={answers.budgets === option}
              onChange={() => update({ budgets: option })}
            />
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="confidence" className="mb-3 block text-sm font-semibold text-navy-700 dark:text-navy-100">
          How confident are you managing money?
        </label>
        <input
          id="confidence"
          type="range"
          min={1}
          max={5}
          step={1}
          value={answers.confidence}
          onChange={(e) => update({ confidence: Number(e.target.value) })}
          aria-valuetext={confidenceLabel(answers.confidence)}
          className="w-full accent-emerald-600"
        />
        <div className="mt-2 flex justify-between text-xs text-navy-400 dark:text-navy-300">
          <span>Beginner</span>
          <span
            aria-live="polite"
            className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
          >
            {confidenceLabel(answers.confidence)}
          </span>
          <span>Expert</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — Interests                                                  */
/* ------------------------------------------------------------------ */

export const INTEREST_OPTIONS = [
  "Budgeting", "Saving", "Investing", "Credit", "Banking", "Taxes",
  "Entrepreneurship", "Cryptocurrency", "Financial Safety",
];

export function StepInterests() {
  const { answers, update } = useOnboarding();
  const toggle = (topic: string, on: boolean) =>
    update({
      interests: on
        ? [...answers.interests, topic]
        : answers.interests.filter((t) => t !== topic),
    });

  return (
    <div className="space-y-5">
      <StepTitle
        title="What topics would you like to learn?"
        subtitle="We'll put your favorites first in your learning path."
      />
      <fieldset>
        <legend className="sr-only">Learning topics (select all that apply)</legend>
        <div className="flex flex-wrap gap-2.5">
          {INTEREST_OPTIONS.map((topic) => (
            <ChipToggle
              key={topic}
              label={topic}
              checked={answers.interests.includes(topic)}
              onChange={(on) => toggle(topic, on)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 6 — Referral                                                   */
/* ------------------------------------------------------------------ */

const REFERRAL_OPTIONS = [
  "School", "Teacher", "Friend", "TikTok", "Instagram", "YouTube",
  "Google Search", "GitHub", "Event or Competition", "Other",
];

export function StepReferral() {
  const { answers, update } = useOnboarding();
  return (
    <div className="space-y-5">
      <StepTitle title="One last thing" subtitle="How did you hear about Fiscalize?" />
      <Field label="I found Fiscalize through…" htmlFor="referral">
        <select
          id="referral"
          className={inputClass}
          value={answers.referralSource}
          onChange={(e) => update({ referralSource: e.target.value })}
        >
          <option value="" disabled>Choose one</option>
          {REFERRAL_OPTIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 7 — Personalized Plan                                          */
/* ------------------------------------------------------------------ */

export function StepPlan() {
  const { answers, complete } = useOnboarding();
  const { session } = useAuth();
  const plan = buildPlan(answers);
  // Signed-in users go straight to their dashboard (answers sync there);
  // new visitors create an account first so the plan is saved to it.
  const destination = session ? "/dashboard" : "/signup";

  const items = [
    { icon: BookOpen, label: "Recommended Learning Path", value: plan.learningPath },
    { icon: Target, label: "First Goal", value: plan.firstGoal },
    { icon: Award, label: "Weekly Challenge", value: plan.weeklyChallenge },
    { icon: Zap, label: "Daily XP Goal", value: `${plan.dailyXpGoal} XP per day` },
  ];

  return (
    <div>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto mb-5 grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lift"
        >
          <Rocket className="size-8 text-navy-900" aria-hidden="true" />
        </motion.div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-800 dark:text-white">
          {plan.greeting}
        </h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-navy-500 dark:text-navy-200">
          {plan.summary}
        </p>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <motion.li
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.1 }}
            className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft dark:border-navy-700 dark:bg-navy-800"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </div>
            <p className="mt-2 font-medium text-navy-800 dark:text-white">{item.value}</p>
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-10 text-center"
      >
        <Link
          to={destination}
          onClick={complete}
          className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-10 py-4 text-lg font-semibold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          Start My Journey
          <Rocket className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" aria-hidden="true" />
        </Link>
        {!session && (
          <p className="mt-3 text-sm text-navy-400 dark:text-navy-300">
            You'll create a free account so your plan is saved.
          </p>
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-navy-500 dark:text-navy-200">{subtitle}</p>
    </div>
  );
}
