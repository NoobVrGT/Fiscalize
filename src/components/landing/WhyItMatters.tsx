import { PiggyBank, ShieldCheck, Sprout } from "lucide-react";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

const REASONS = [
  {
    icon: PiggyBank,
    title: "Learn budgeting early",
    body: "Money habits formed as a teen stick for life. Fiscalize turns budgeting from a chore into a skill you actually enjoy building.",
    accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    icon: ShieldCheck,
    title: "Reduce impulse spending",
    body: "Gentle nudges and reflection prompts help you pause before you purchase — so your money goes where you actually want it.",
    accent: "bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-400",
  },
  {
    icon: Sprout,
    title: "Build lifelong financial confidence",
    body: "From your first savings goal to understanding credit, grow the confidence to make smart money decisions on your own.",
    accent: "bg-navy-100 text-navy-700 dark:bg-navy-500/25 dark:text-navy-200",
  },
];

export default function WhyItMatters() {
  return (
    <section id="about" className="bg-surface py-24 dark:bg-navy-900/40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Why it matters"
          title="Money skills are life skills"
          description="Most people never get taught how money works. We're changing that — starting young, and making it stick."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {REASONS.map((reason, i) => (
            <Reveal key={reason.title} delay={i * 0.12}>
              <div className="group h-full rounded-3xl bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift dark:bg-navy-800">
                <div
                  className={`mb-5 grid size-13 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${reason.accent}`}
                >
                  <reason.icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-navy-800 dark:text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 leading-relaxed text-navy-500 dark:text-navy-200">
                  {reason.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
