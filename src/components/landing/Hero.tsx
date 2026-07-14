import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import PhoneMockup from "./PhoneMockup";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      {/* Ambient background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-[32rem] rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute right-0 top-24 size-[26rem] rounded-full bg-navy-400/10 blur-3xl dark:bg-navy-500/20" />
        <div className="absolute bottom-0 left-0 size-[20rem] rounded-full bg-gold-400/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Learn. Save. Grow.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-navy-800 sm:text-5xl lg:text-6xl dark:text-white"
          >
            Smart Money Habits <span className="text-gradient">Start Young.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg leading-relaxed text-navy-500 dark:text-navy-200"
          >
            Financial literacy doesn't have to be boring. Fiscalize makes
            learning about money fun through personalized goals, interactive
            lessons, and rewarding challenges.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/start"
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 font-semibold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Get Started
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-navy-200 px-7 py-3.5 font-semibold text-navy-700 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-navy-600 dark:text-navy-100 dark:hover:text-emerald-400"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 text-sm text-navy-400 dark:text-navy-300"
          >
            Free for students · No credit card required · Built for ages 13+
          </motion.p>
        </div>

        <PhoneMockup />
      </div>
    </section>
  );
}
