import { Award, ClipboardList, Compass, GraduationCap, Sparkles } from "lucide-react";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Complete your profile",
    body: "Tell us a bit about yourself so Fiscalize can meet you where you are.",
  },
  {
    icon: Compass,
    title: "Set your financial goals",
    body: "Pick what you're saving for — we'll build a plan around it.",
  },
  {
    icon: GraduationCap,
    title: "Complete lessons and challenges",
    body: "Bite-sized, interactive lessons that fit into any day.",
  },
  {
    icon: Award,
    title: "Earn rewards",
    body: "Collect XP, keep your streak alive, and unlock badges as you go.",
  },
  {
    icon: Sparkles,
    title: "Build smarter money habits",
    body: "Watch small daily wins compound into lifelong confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface py-24 dark:bg-navy-900/40">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Five steps to smarter money"
          description="Your journey from first login to lifelong habits."
        />
        <ol className="relative space-y-10 border-l-2 border-emerald-500/30 pl-8 sm:pl-10">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <li className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[calc(2rem+13px)] top-0 grid size-6 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white ring-4 ring-surface sm:-left-[calc(2.5rem+13px)] dark:ring-navy-900"
                >
                  {i + 1}
                </span>
                <div className="rounded-3xl bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:bg-navy-800">
                  <div className="flex items-center gap-3">
                    <step.icon
                      className="size-5 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <h3 className="font-display text-lg font-semibold text-navy-800 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2 leading-relaxed text-navy-500 dark:text-navy-200">
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
