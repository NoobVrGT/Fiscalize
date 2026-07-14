import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";

/**
 * Onboarding data model. Kept flat and JSON-serializable so it can be posted
 * to an API / persisted to a database later without reshaping.
 */
export interface OnboardingAnswers {
  firstName: string;
  age: string;
  grade: string;
  country: string;
  language: string;
  goals: string[];
  customGoal: string;
  impulseFrequency: "never" | "sometimes" | "often" | "";
  budgets: "yes" | "no" | "";
  confidence: number; // 1 (beginner) – 5 (expert)
  interests: string[];
  referralSource: string;
}

export const EMPTY_ANSWERS: OnboardingAnswers = {
  firstName: "",
  age: "",
  grade: "",
  country: "",
  language: "English",
  goals: [],
  customGoal: "",
  impulseFrequency: "",
  budgets: "",
  confidence: 2,
  interests: [],
  referralSource: "",
};

const STORAGE_KEY = "fiscalize-onboarding";
const PENDING_KEY = "fiscalize-onboarding-pending";

/**
 * Local persistence keeps answers while the visitor is anonymous; once they
 * sign in, `syncOnboardingToSupabase` moves the data into their profile.
 */
export const onboardingStore = {
  save(answers: OnboardingAnswers): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    localStorage.setItem(PENDING_KEY, "true");
  },
  load(): OnboardingAnswers | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return { ...EMPTY_ANSWERS, ...(JSON.parse(raw) as OnboardingAnswers) };
    } catch {
      return null;
    }
  },
  hasPendingSync(): boolean {
    return localStorage.getItem(PENDING_KEY) === "true";
  },
  clearPendingSync(): void {
    localStorage.removeItem(PENDING_KEY);
  },
};

/**
 * Push locally-collected onboarding answers into the signed-in user's
 * profile and seed their savings goals. Called once after auth.
 */
export async function syncOnboardingToSupabase(
  userId: string,
  answers: OnboardingAnswers,
): Promise<string | null> {
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    first_name: answers.firstName.trim() || null,
    age: answers.age ? Number(answers.age) : null,
    grade: answers.grade.trim() || null,
    country: answers.country || null,
    language: answers.language || null,
    goals: answers.goals,
    custom_goal: answers.customGoal.trim() || null,
    impulse_frequency: answers.impulseFrequency || null,
    budgets: answers.budgets || null,
    confidence: answers.confidence,
    interests: answers.interests,
    referral_source: answers.referralSource || null,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  });
  if (profileError) return profileError.message;

  // Seed savings goals from the selected onboarding goals (idempotent).
  const goalNames = answers.goals.filter((g) => g !== "Other");
  if (answers.goals.includes("Other") && answers.customGoal.trim()) {
    goalNames.push(answers.customGoal.trim());
  }
  if (goalNames.length > 0) {
    const { data: existing } = await supabase.from("goals").select("name");
    const existingNames = new Set((existing ?? []).map((g: { name: string }) => g.name));
    const rows = goalNames
      .filter((name) => !existingNames.has(name))
      .map((name, i) => ({ user_id: userId, name, target_amount: 500, position: i }));
    if (rows.length > 0) {
      const { error: goalsError } = await supabase.from("goals").insert(rows);
      if (goalsError) return goalsError.message;
    }
  }

  onboardingStore.clearPendingSync();
  return null;
}

interface OnboardingContextValue {
  answers: OnboardingAnswers;
  update: (patch: Partial<OnboardingAnswers>) => void;
  complete: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    () => onboardingStore.load() ?? EMPTY_ANSWERS,
  );

  const update = useCallback((patch: Partial<OnboardingAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }, []);

  const complete = useCallback(() => {
    setAnswers((prev) => {
      onboardingStore.save(prev);
      return prev;
    });
  }, []);

  return (
    <OnboardingContext.Provider value={{ answers, update, complete }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Personalized plan derivation                                        */
/* ------------------------------------------------------------------ */

export interface PersonalizedPlan {
  greeting: string;
  summary: string;
  learningPath: string;
  firstGoal: string;
  weeklyChallenge: string;
  dailyXpGoal: number;
}

const CONFIDENCE_LEVELS = ["Beginner", "Casual", "Comfortable", "Confident", "Expert"];

export function confidenceLabel(value: number): string {
  return CONFIDENCE_LEVELS[Math.min(Math.max(value, 1), 5) - 1];
}

export function buildPlan(a: OnboardingAnswers): PersonalizedPlan {
  const name = a.firstName.trim() || "friend";
  const goals = a.goals.filter((g) => g !== "Other");
  if (a.goals.includes("Other") && a.customGoal.trim()) {
    goals.push(a.customGoal.trim());
  }

  const focusParts: string[] = [];
  if (a.impulseFrequency === "often") focusParts.push("reduce impulse spending");
  if (goals.length > 0) focusParts.push(goals[0].toLowerCase().replace(/^save/, "saving").replace(/^buy/, "buying").replace(/^build/, "building").replace(/^learn/, "learning").replace(/^stop/, "stopping"));
  if (a.budgets === "no") focusParts.push("build strong budgeting habits");
  if (focusParts.length === 0) focusParts.push("build smart everyday money habits");

  const focus =
    focusParts.length === 1
      ? focusParts[0]
      : `${focusParts.slice(0, -1).join(", ")} and ${focusParts[focusParts.length - 1]}`;

  const level = a.confidence <= 2 ? "beginner" : a.confidence <= 4 ? "intermediate" : "advanced";
  const topics = a.interests.slice(0, 3);
  const learningPath =
    topics.length > 0
      ? `${level[0].toUpperCase() + level.slice(1)} track: ${topics.join(" → ")}`
      : `${level[0].toUpperCase() + level.slice(1)} track: Budgeting → Saving → Financial Safety`;

  const weeklyChallenge =
    a.impulseFrequency === "often" || a.impulseFrequency === "sometimes"
      ? "The 24-Hour Rule: wait a full day before any non-essential purchase"
      : "No-Spend Weekend: find three free ways to have fun";

  return {
    greeting: `Welcome, ${name}!`,
    summary: `Based on your goals, we'll focus on helping you ${focus}. You'll start with ${level} lessons, daily challenges, and a custom savings plan designed just for you.`,
    learningPath,
    firstGoal: goals[0] ?? "Save your first $100",
    weeklyChallenge,
    dailyXpGoal: a.confidence >= 4 ? 50 : 30,
  };
}
