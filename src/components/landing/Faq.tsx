import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

const FAQS = [
  {
    q: "Is Fiscalize free?",
    a: "Yes! Fiscalize is completely free for students. Every lesson, challenge, and goal-tracking tool is included — no credit card, no hidden tiers.",
  },
  {
    q: "Who can use Fiscalize?",
    a: "Fiscalize is designed for teens and young adults ages 13 and up. Whether you're saving for your first big purchase or getting ready for college, the lessons adapt to your level.",
  },
  {
    q: "How does it stop impulse buying?",
    a: "Before a non-essential purchase, Fiscalize shows a gentle confirmation — how the purchase affects your goals, plus a short reflection prompt. Many users choose our 24-hour rule: if you still want it tomorrow, go for it.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. Your data is encrypted in transit and at rest, we never sell personal information, and you can export or delete your account data at any time.",
  },
  {
    q: "Can I change my goals later?",
    a: "Of course. Goals grow with you — edit amounts, deadlines, or swap goals entirely whenever you like. Your progress and XP always carry over.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft dark:border-navy-700 dark:bg-navy-800">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display font-semibold text-navy-800 transition-colors hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
        >
          {q}
          <ChevronDown
            aria-hidden="true"
            className={`size-5 shrink-0 text-emerald-600 transition-transform duration-300 dark:text-emerald-400 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <p className="px-6 pb-5 leading-relaxed text-navy-500 dark:text-navy-200">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions? Answered."
          description="Everything you (or your parents) might want to know."
        />
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 0.06}>
              <FaqItem q={faq.q} a={faq.a} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
