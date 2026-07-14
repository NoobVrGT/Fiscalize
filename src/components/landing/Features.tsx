import { BarChart3, Brain, Gamepad2, Target } from "lucide-react";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

const FEATURES = [
  {
    icon: Target,
    title: "Personalized Goals",
    body: "Create financial goals based on your interests — a first car, a gaming PC, college, travel — and track every dollar toward them.",
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    icon: Gamepad2,
    title: "Gamified Learning",
    body: "XP, streaks, badges, achievements, levels, and mini-games turn every lesson into something you'll actually want to finish.",
    gradient: "from-gold-500 to-gold-700",
  },
  {
    icon: Brain,
    title: "Behavioral Finance",
    body: "Purchase confirmations and reflection prompts encourage smarter spending — before the money leaves your account.",
    gradient: "from-navy-500 to-navy-700",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    body: "Visual dashboards show your savings progress, spending trends, and completed goals so you always know where you stand.",
    gradient: "from-emerald-600 to-navy-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to master your money"
          description="Four ways Fiscalize turns financial literacy into a daily habit you'll keep."
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-navy-100 bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift dark:border-navy-700 dark:bg-navy-800">
                <div
                  aria-hidden="true"
                  className={`absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25 ${feature.gradient}`}
                />
                <div
                  className={`mb-5 inline-grid size-13 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${feature.gradient}`}
                >
                  <feature.icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-navy-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-relaxed text-navy-500 dark:text-navy-200">
                  {feature.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
