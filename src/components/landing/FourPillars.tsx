import { Brain, LineChart, Target, Trophy } from "lucide-react";
import Reveal from "../Reveal";

const PILLARS = [
  {
    icon: Target,
    title: "Personalized Goals",
    body: "Every plan starts with what you care about.",
  },
  {
    icon: Trophy,
    title: "Gamification",
    body: "Progress that feels like play, not homework.",
  },
  {
    icon: LineChart,
    title: "Analytics",
    body: "See your money story in clear, friendly charts.",
  },
  {
    icon: Brain,
    title: "Behavioral Finance",
    body: "Science-backed nudges for smarter decisions.",
  },
];

export default function FourPillars() {
  return (
    <section className="relative overflow-hidden bg-navy-800 py-24 dark:bg-navy-900">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -left-24 top-0 size-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-gold-400/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-emerald-400">
            The four pillars
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built on what actually works
          </h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.1}>
              <div className="group h-full rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400/40 hover:bg-white/10">
                <pillar.icon
                  className="mb-4 size-8 text-emerald-400 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                />
                <h3 className="font-display text-lg font-semibold text-white">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-200">
                  {pillar.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
