import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Lightbulb, X, Zap } from "lucide-react";
import AppShell from "../components/AppShell";
import { findLesson, QUIZ_XP } from "../content/lessons";
import { useBank } from "../lib/bank";
import { usePageMeta } from "../lib/usePageMeta";

type Phase = "reading" | "quiz" | "done";

export default function LessonPage() {
  const { categorySlug = "", lessonSlug = "" } = useParams();
  const found = findLesson(categorySlug, lessonSlug);
  usePageMeta(found ? `${found.lesson.title} — Fiscalize` : "Lesson — Fiscalize");

  const { lessons, completeLesson, completeQuiz, learningUnavailable } = useBank();

  const [phase, setPhase] = useState<Phase>("reading");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizXp, setQuizXp] = useState(0);
  const [lessonXpAwarded, setLessonXpAwarded] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!found) return <Navigate to="/learn" replace />;
  const { category, lesson } = found;
  const alreadyDone = lessons.some((l) => l.lesson_slug === lesson.slug);
  const question = lesson.quiz[questionIndex];

  const startQuiz = async () => {
    setSaving(true);
    // Award lesson XP the first time the reading is finished.
    if (!alreadyDone) {
      const err = await completeLesson(lesson.slug, lesson.xp);
      if (!err) setLessonXpAwarded(lesson.xp);
    }
    setSaving(false);
    setPhase("quiz");
  };

  const submitAnswer = () => {
    if (selected === null) return;
    setAnswered(true);
    if (selected === question.correct) setCorrectCount((c) => c + 1);
  };

  const nextQuestion = async () => {
    if (questionIndex + 1 < lesson.quiz.length) {
      setQuestionIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      return;
    }
    // Quiz finished — record the result.
    setSaving(true);
    const finalScore = correctCount;
    if (!learningUnavailable) {
      const result = await completeQuiz(lesson.slug, finalScore, lesson.quiz.length);
      if (!result.error) setQuizXp(result.xpEarned);
    }
    setSaving(false);
    setPhase("done");
  };

  return (
    <AppShell>
      <Link
        to="/learn"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 transition-colors hover:text-emerald-700 dark:text-navy-300 dark:hover:text-emerald-400"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Learn
      </Link>

      <div className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          {category.emoji} {category.name}
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-navy-800 dark:text-white">
          {lesson.title}
        </h1>
        <p className="mt-1 text-sm text-navy-400 dark:text-navy-300">
          {lesson.minutes} min read · +{lesson.xp} XP · quiz worth up to {QUIZ_XP} XP
          {alreadyDone && " · completed ✓"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {phase === "reading" && (
          <motion.div key="reading" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <div className="mt-8 space-y-6">
              {lesson.sections.map((section) => (
                <section
                  key={section.heading}
                  className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8 dark:border-navy-700 dark:bg-navy-800"
                >
                  <h2 className="font-display text-xl font-bold text-navy-800 dark:text-white">
                    {section.heading}
                  </h2>
                  <p className="mt-3 leading-relaxed text-navy-600 dark:text-navy-200">{section.body}</p>
                  {section.example && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                      <Lightbulb className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                      <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{section.example}</p>
                    </div>
                  )}
                </section>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={startQuiz}
                disabled={saving}
                className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 font-semibold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : `Take the quiz (${lesson.quiz.length} questions)`}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div key={`quiz-${questionIndex}`} initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }}>
            <div className="mt-8 rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8 dark:border-navy-700 dark:bg-navy-800">
              <p className="text-sm font-semibold text-navy-400 dark:text-navy-300">
                Question {questionIndex + 1} of {lesson.quiz.length}
              </p>
              <h2 className="mt-2 font-display text-xl font-bold text-navy-800 dark:text-white">{question.q}</h2>

              <div className="mt-6 space-y-3" role="radiogroup" aria-label="Answer options">
                {question.options.map((option, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === question.correct;
                  const showState = answered && (isSelected || isCorrect);
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={answered}
                      onClick={() => setSelected(i)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left font-medium transition-all ${
                        showState && isCorrect
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100"
                          : showState && isSelected
                            ? "border-red-400 bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-200"
                            : isSelected
                              ? "border-emerald-600 bg-emerald-50/50 text-navy-800 dark:bg-emerald-500/10 dark:text-white"
                              : "border-navy-200 text-navy-700 hover:border-emerald-400 dark:border-navy-600 dark:text-navy-100"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          showState && isCorrect
                            ? "bg-emerald-600 text-white"
                            : showState && isSelected
                              ? "bg-red-500 text-white"
                              : "bg-navy-100 text-navy-500 dark:bg-navy-700 dark:text-navy-200"
                        }`}
                      >
                        {showState ? (isCorrect ? <Check className="size-4" /> : <X className="size-4" />) : String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-5 rounded-2xl p-4 text-sm leading-relaxed ${
                    selected === question.correct
                      ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100"
                      : "bg-gold-100/70 text-navy-800 dark:bg-gold-500/10 dark:text-gold-100"
                  }`}
                  aria-live="polite"
                >
                  <p className="font-bold">
                    {selected === question.correct ? "Correct! 🎉" : "Not quite —"}
                  </p>
                  <p className="mt-1">{question.explanation}</p>
                </motion.div>
              )}

              <div className="mt-6 flex justify-end">
                {answered ? (
                  <button
                    type="button"
                    onClick={nextQuestion}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {questionIndex + 1 < lesson.quiz.length ? "Next question" : saving ? "Saving…" : "See results"}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={selected === null}
                    className="rounded-full bg-navy-700 px-6 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-navy-800 disabled:opacity-40 dark:bg-navy-600 dark:hover:bg-navy-500"
                  >
                    Check answer
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center">
            <div className="rounded-3xl border border-navy-100 bg-white p-10 shadow-soft dark:border-navy-700 dark:bg-navy-800">
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
                className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 text-4xl shadow-lift"
                aria-hidden="true"
              >
                {correctCount === lesson.quiz.length ? "🏆" : correctCount > 0 ? "⭐" : "📚"}
              </motion.div>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-navy-800 dark:text-white">
                {correctCount === lesson.quiz.length
                  ? "Perfect score!"
                  : `You got ${correctCount} of ${lesson.quiz.length}`}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-navy-500 dark:text-navy-200">
                {correctCount === lesson.quiz.length
                  ? "You've mastered this one. On to the next!"
                  : "Solid effort — you can retake the quiz anytime to lock it in."}
              </p>
              {(lessonXpAwarded > 0 || quizXp > 0) && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-2 font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Zap className="size-4" aria-hidden="true" />
                  +{lessonXpAwarded + quizXp} XP earned
                </p>
              )}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/learn"
                  className="rounded-full bg-emerald-600 px-7 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  Continue learning
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("quiz");
                    setQuestionIndex(0);
                    setSelected(null);
                    setAnswered(false);
                    setCorrectCount(0);
                  }}
                  className="rounded-full border border-navy-200 px-7 py-3 font-semibold text-navy-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-navy-600 dark:text-navy-200 dark:hover:text-emerald-400"
                >
                  Retake quiz
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
