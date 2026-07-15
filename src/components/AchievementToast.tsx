import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useBank } from "../lib/bank";

/** Celebration popup when a new badge is earned. */
export default function AchievementToast() {
  const { newBadge, dismissBadge } = useBank();

  useEffect(() => {
    if (!newBadge) return;
    const timer = setTimeout(dismissBadge, 6000);
    return () => clearTimeout(timer);
  }, [newBadge, dismissBadge]);

  return (
    <AnimatePresence>
      {newBadge && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-[80] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 lg:bottom-8"
        >
          <div className="flex items-center gap-4 rounded-3xl border border-gold-400/40 bg-white p-4 shadow-lift dark:border-gold-500/30 dark:bg-navy-800">
            <motion.span
              initial={{ rotate: -15, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.15 }}
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gold-100 text-3xl dark:bg-gold-500/15"
              aria-hidden="true"
            >
              {newBadge.emoji}
            </motion.span>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                Badge unlocked!
              </p>
              <p className="font-display text-lg font-bold text-navy-800 dark:text-white">{newBadge.name}</p>
              <p className="truncate text-sm text-navy-500 dark:text-navy-300">{newBadge.description}</p>
            </div>
            <button
              type="button"
              onClick={dismissBadge}
              aria-label="Dismiss"
              className="ml-auto grid size-8 shrink-0 place-items-center rounded-full text-navy-400 hover:bg-navy-700/5 dark:text-navy-300 dark:hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
