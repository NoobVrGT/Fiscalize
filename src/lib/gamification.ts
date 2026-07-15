import { TOTAL_LESSONS } from "../content/lessons";

/* ------------------------------------------------------------------ */
/* Levels                                                              */
/* ------------------------------------------------------------------ */

export const XP_PER_LEVEL = 250;

const LEVEL_TITLES: Record<number, string> = {
  1: "Money Beginner",
  2: "Coin Counter",
  3: "Cash Cadet",
  4: "Savings Scout",
  5: "Budget Builder",
  6: "Money Manager",
  7: "Smart Spender",
  8: "Investment Apprentice",
  9: "Market Navigator",
  10: "Finance Pro",
};

export interface LevelInfo {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForLevel: number;
  progressPct: number;
}

export function levelFromXp(totalXp: number): LevelInfo {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  return {
    level,
    title: LEVEL_TITLES[Math.min(level, 10)] ?? "Finance Pro",
    xpIntoLevel,
    xpForLevel: XP_PER_LEVEL,
    progressPct: Math.round((xpIntoLevel / XP_PER_LEVEL) * 100),
  };
}

/* ------------------------------------------------------------------ */
/* Streak: consecutive days (ending today or yesterday) with activity  */
/* ------------------------------------------------------------------ */

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function computeStreak(activityDates: string[]): number {
  const days = new Set(activityDates.map((d) => d.slice(0, 10)));
  if (days.size === 0) return 0;
  const cursor = new Date();
  // A streak survives until you miss a full day — start from today,
  // or yesterday if today has no activity yet.
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/* ------------------------------------------------------------------ */
/* Money Skill Score (0–100)                                           */
/* ------------------------------------------------------------------ */

export interface SkillInputs {
  lessonsCompleted: number;
  quizAccuracy: number; // 0..1, or NaN if no quizzes yet
  hasBudget: boolean;
  savingsRate: number; // saved / income this month, 0..1 (clamped)
  streak: number;
}

export function moneySkillScore(s: SkillInputs): number {
  const lessonScore = Math.min(s.lessonsCompleted / TOTAL_LESSONS, 1) * 35;
  const quizScore = (Number.isFinite(s.quizAccuracy) ? s.quizAccuracy : 0) * 25;
  const budgetScore = s.hasBudget ? 15 : 0;
  const savingsScore = Math.min(Math.max(s.savingsRate, 0), 1) * 15;
  const streakScore = Math.min(s.streak / 7, 1) * 10;
  return Math.round(lessonScore + quizScore + budgetScore + savingsScore + streakScore);
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

export interface BadgeDef {
  slug: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: BadgeDef[] = [
  { slug: "journey-begins", name: "Journey Begins", emoji: "🚀", description: "Created your Fiscalize account" },
  { slug: "first-lesson", name: "First Steps", emoji: "📖", description: "Complete your first lesson" },
  { slug: "quiz-whiz", name: "Quiz Whiz", emoji: "🧠", description: "Score 100% on any quiz" },
  { slug: "first-budget", name: "First Budget", emoji: "📊", description: "Set your first category budget" },
  { slug: "first-goal", name: "Goal Getter", emoji: "🎯", description: "Create your first savings goal" },
  { slug: "smart-saver", name: "Smart Saver", emoji: "🐷", description: "Record 3 savings transactions" },
  { slug: "streak-3", name: "On Fire", emoji: "🔥", description: "Keep a 3-day learning streak" },
  { slug: "budget-boss", name: "Budget Boss", emoji: "💼", description: "Complete the budget simulator" },
  { slug: "investor", name: "Investor", emoji: "📈", description: "Complete the investing simulator" },
  { slug: "finance-explorer", name: "Finance Explorer", emoji: "🧭", description: "Complete 10 lessons" },
  { slug: "curriculum-champ", name: "Curriculum Champ", emoji: "🏆", description: "Complete every lesson" },
];

export const badgeBySlug = (slug: string) => BADGES.find((b) => b.slug === slug);

/* ------------------------------------------------------------------ */
/* Daily challenges: deterministic rotation by date                    */
/* ------------------------------------------------------------------ */

export interface ChallengeDef {
  slug: string;
  title: string;
  description: string;
  xp: number;
}

export const DAILY_CHALLENGES: ChallengeDef[] = [
  { slug: "needs-wants-5", title: "Needs vs Wants", description: "Look at your last 5 purchases and label each one a need or a want.", xp: 15 },
  { slug: "log-spending", title: "Log It", description: "Record every transaction from today in your tracker — even tiny ones.", xp: 15 },
  { slug: "lesson-a-day", title: "Learn Something", description: "Complete any lesson today.", xp: 20 },
  { slug: "save-5", title: "Save $5", description: "Transfer at least $5 from checking to savings.", xp: 20 },
  { slug: "no-spend", title: "No-Spend Day", description: "Get through today without any non-essential purchase.", xp: 25 },
  { slug: "price-compare", title: "Comparison Shopper", description: "Before your next purchase, compare prices in at least two places.", xp: 15 },
  { slug: "check-budget", title: "Budget Check-in", description: "Open your Expenses page and review how each budget is doing.", xp: 10 },
];

export function todaysChallenge(date = new Date()): ChallengeDef {
  const daysSinceEpoch = Math.floor(date.getTime() / 86_400_000);
  return DAILY_CHALLENGES[daysSinceEpoch % DAILY_CHALLENGES.length];
}
