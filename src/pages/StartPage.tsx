import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Logo from "../components/Logo";
import {
  StepAboutYou,
  StepGoals,
  StepHabits,
  StepInterests,
  StepPlan,
  StepReferral,
  StepWelcome,
} from "../components/onboarding/steps";
import { useOnboarding } from "../lib/onboarding";
import { usePageMeta } from "../lib/usePageMeta";

const STEPS = [
  { name: "Welcome", component: StepWelcome },
  { name: "About you", component: StepAboutYou },
  { name: "Goals", component: StepGoals },
  { name: "Habits", component: StepHabits },
  { name: "Interests", component: StepInterests },
  { name: "Discovery", component: StepReferral },
  { name: "Your plan", component: StepPlan },
];

export default function StartPage() {
  usePageMeta("Get Started — Fiscalize", "Set up your personalized Fiscalize plan in two minutes.");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const { answers } = useOnboarding();

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const progress = (step / (STEPS.length - 1)) * 100;
  const StepComponent = STEPS[step].component;

  // Light-touch gating: only block steps that would break personalization.
  const canContinue =
    step !== 1 || (answers.firstName.trim().length > 0 && answers.age.trim().length > 0);

  const go = (delta: number) => {
    setDirection(delta);
    setStep((s) => Math.min(Math.max(s + delta, 0), STEPS.length - 1));
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Ambient background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 size-[30rem] rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[24rem] rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute -left-24 top-1/2 size-[22rem] rounded-full bg-navy-400/10 blur-3xl dark:bg-navy-500/20" />
      </div>

      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <Link
          to="/"
          className="text-sm font-medium text-navy-500 transition-colors hover:text-emerald-700 dark:text-navy-300 dark:hover:text-emerald-400"
        >
          Back to home
        </Link>
      </header>

      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 sm:px-8">
        {/* Progress */}
        <div className="mb-10">
          <div className="mb-2 flex justify-between text-xs font-semibold text-navy-400 dark:text-navy-300">
            <span aria-hidden="true">{STEPS[step].name}</span>
            <span aria-hidden="true">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Onboarding progress: step ${step + 1} of ${STEPS.length}, ${STEPS[step].name}`}
            className="h-2 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step card */}
        <div className="glass rounded-[2rem] p-7 shadow-lift sm:p-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -48 }}
              transition={{ duration: 0.32, ease: [0.21, 0.65, 0.36, 1] }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons (the plan step has its own CTA) */}
          {!isLast && (
            <div className="mt-10 flex items-center justify-between">
              {isFirst ? (
                <span />
              ) : (
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-navy-500 transition-colors hover:bg-navy-700/5 hover:text-navy-700 dark:text-navy-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => go(1)}
                disabled={!canContinue}
                className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {isFirst ? "Continue" : step === STEPS.length - 2 ? "See my plan" : "Continue"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
