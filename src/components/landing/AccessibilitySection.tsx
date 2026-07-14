import { Captions, Eye, Keyboard, Mic, Type, Volume2 } from "lucide-react";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

const ITEMS = [
  { icon: Volume2, title: "Screen reader support", body: "Every screen is fully labeled and navigable." },
  { icon: Keyboard, title: "Keyboard navigation", body: "Do everything without touching a mouse." },
  { icon: Eye, title: "Colorblind friendly", body: "Validated palettes that never rely on color alone." },
  { icon: Type, title: "Large text mode", body: "Bump up the type size across the whole app." },
  { icon: Captions, title: "Captions", body: "Every video and audio lesson is captioned." },
  { icon: Mic, title: "Voice assistance", body: "Navigate lessons and log savings hands-free." },
];

export default function AccessibilitySection() {
  return (
    <section className="bg-surface py-24 dark:bg-navy-900/40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Accessibility"
          title="Built for every learner"
          description="Financial confidence should be available to everyone. Fiscalize is designed to WCAG AA from day one."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.07}>
              <div className="flex h-full items-start gap-4 rounded-3xl bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:bg-navy-800">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-navy-800 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy-500 dark:text-navy-200">
                    {item.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
