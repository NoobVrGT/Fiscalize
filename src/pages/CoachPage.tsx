import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Bot, SendHorizonal, Sparkles } from "lucide-react";
import AppShell from "../components/AppShell";
import { useBank } from "../lib/bank";
import { coachReply, COACH_SUGGESTIONS, type CoachContext } from "../lib/coach";
import { usePageMeta } from "../lib/usePageMeta";

interface ChatMessage {
  role: "user" | "coach";
  text: string;
}

/** Minimal renderer: paragraphs on blank lines, **bold** spans, • lists as lines. */
function CoachText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((para, i) => (
        <p key={i} className={i > 0 ? "mt-3" : ""}>
          {para.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line.split(/(\*\*[^*]+\*\*)/g).map((part, k) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={k}>{part.slice(2, -2)}</strong>
                ) : (
                  <span key={k}>{part}</span>
                ),
              )}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

export default function CoachPage() {
  usePageMeta("AI Coach — Fiscalize");
  const { profile, summary, goals, budgets, lessons, streak } = useBank();

  const ctx: CoachContext = useMemo(
    () => ({
      name: profile?.first_name?.trim() || "friend",
      checkingBalance: summary.checkingBalance,
      savingsBalance: summary.savingsBalance,
      monthlyIncome: summary.monthlyIncome,
      monthlyExpenses: summary.monthlyExpenses,
      spendingByCategory: summary.spendingByCategory,
      goals,
      hasBudget: budgets.length > 0,
      lessonsCompleted: lessons.length,
      completedLessonSlugs: new Set(lessons.map((l) => l.lesson_slug)),
      streak,
    }),
    [profile, summary, goals, budgets, lessons, streak],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "coach",
      text: `Hey! I'm your Fiscalize Coach 🤝 I can see your accounts, spending, and goals — so my advice uses YOUR real numbers, not generic tips.\n\nAsk me anything about money, or tap a suggestion below.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setThinking(true);
    // Small delay so the reply feels conversational rather than instant.
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "coach", text: coachReply(trimmed, ctx) }]);
      setThinking(false);
    }, 600);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight text-navy-800 sm:text-4xl dark:text-white">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-soft">
            <Bot className="size-6 text-white" aria-hidden="true" />
          </span>
          Fiscalize Coach
        </h1>
        <p className="mt-2 text-navy-500 dark:text-navy-200">
          Personal guidance powered by your real Fiscalize data.
        </p>
      </motion.div>

      <div className="mt-6 flex min-h-[50vh] flex-col rounded-3xl border border-navy-100 bg-white shadow-soft dark:border-navy-700 dark:bg-navy-800">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6" role="log" aria-label="Chat with Fiscalize Coach" aria-live="polite">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed sm:max-w-[70%] ${
                  msg.role === "user"
                    ? "rounded-br-lg bg-emerald-600 text-white"
                    : "rounded-bl-lg bg-surface text-navy-700 dark:bg-navy-700/60 dark:text-navy-100"
                }`}
              >
                <CoachText text={msg.text} />
              </div>
            </motion.div>
          ))}
          {thinking && (
            <div className="flex justify-start" aria-label="Coach is typing">
              <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg bg-surface px-5 py-4 dark:bg-navy-700/60">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                    className="size-2 rounded-full bg-navy-400 dark:bg-navy-300"
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-navy-100 p-4 dark:border-navy-700">
          <div className="mb-3 flex flex-wrap gap-2">
            {COACH_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 px-3.5 py-1.5 text-xs font-semibold text-navy-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-navy-600 dark:text-navy-200 dark:hover:text-emerald-400"
              >
                <Sparkles className="size-3" aria-hidden="true" />
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              aria-label="Message the coach"
              className="flex-1 rounded-full border border-navy-200 bg-white px-5 py-3 text-sm text-navy-800 placeholder:text-navy-300 focus:border-emerald-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white dark:placeholder:text-navy-400"
              placeholder="Ask me anything about money…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              aria-label="Send message"
              className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <SendHorizonal className="size-5" />
            </button>
          </form>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-navy-400 dark:text-navy-400">
        The Coach gives educational guidance based on your Fiscalize data — it's a learning tool, not professional financial advice.
      </p>
    </AppShell>
  );
}
