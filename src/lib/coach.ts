import { CATEGORIES, TOTAL_LESSONS } from "../content/lessons";
import { formatMoney } from "./bank";
import type { Goal } from "./bank";

/**
 * Fiscalize AI Coach — a rules-based guidance engine that personalizes
 * answers using the user's real Fiscalize data. No external AI service
 * needed; swap `coachReply` for an API call later if desired.
 */

export interface CoachContext {
  name: string;
  checkingBalance: number;
  savingsBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  spendingByCategory: { category: string; amount: number }[];
  goals: Goal[];
  hasBudget: boolean;
  lessonsCompleted: number;
  completedLessonSlugs: Set<string>;
  streak: number;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

function nextLessonSuggestion(ctx: CoachContext): string {
  for (const cat of CATEGORIES) {
    const next = cat.lessons.find((l) => !ctx.completedLessonSlugs.has(l.slug));
    if (next) return `“${next.title}” in ${cat.name} (${cat.emoji} ${next.minutes} min, +${next.xp} XP)`;
  }
  return "a review of your favorite topic — you've finished everything! 🏆";
}

function goalPlan(goal: Goal): string {
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  if (remaining === 0) return `“${goal.name}” is fully funded — congrats! 🎉`;
  if (goal.deadline) {
    const weeks = Math.max(Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (7 * 86_400_000)), 1);
    return `For “${goal.name}”: you need ${formatMoney(remaining)} more, and with ${weeks} week${weeks === 1 ? "" : "s"} until your deadline that's about ${formatMoney(remaining / weeks)} per week. Totally doable if you treat it like a bill you pay yourself first.`;
  }
  return `For “${goal.name}”: you need ${formatMoney(remaining)} more. Saving ${formatMoney(Math.max(remaining / 10, 5))} a week would get you there in about ${Math.max(Math.ceil(remaining / Math.max(remaining / 10, 5)), 1)} weeks. Want it faster? Set a deadline on the goal and I'll do the math.`;
}

function spendingAnalysis(ctx: CoachContext): string {
  if (ctx.spendingByCategory.length === 0) {
    return "I don't see any expenses recorded yet, so there's nothing to analyze — add your spending in the tracker and ask me again. Real data makes my advice way better!";
  }
  const [top, second] = ctx.spendingByCategory;
  const lines = [
    `Your biggest spending category is **${top.category}** at ${formatMoney(top.amount)}.`,
  ];
  if (second) lines.push(`Second place: ${second.category} at ${formatMoney(second.amount)}.`);
  if (ctx.monthlyIncome > 0) {
    const rate = (ctx.monthlyIncome - ctx.monthlyExpenses) / ctx.monthlyIncome;
    lines.push(
      rate >= 0.2
        ? `This month you kept ${pct(rate)} of your income — that's at or above the classic 20% savings target. Strong. 💪`
        : rate >= 0
          ? `This month you kept ${pct(rate)} of your income. The classic target is 20% — try trimming a little from ${top.category} to close the gap.`
          : `Heads up: you spent more than you brought in this month. Let's look at ${top.category} first — it's your biggest lever.`,
    );
  }
  if (!ctx.hasBudget) lines.push("Tip: set a monthly budget for your top category on the Expenses page — a limit you can see is a limit you can hit.");
  return lines.join("\n\n");
}

function budgetHelp(ctx: CoachContext): string {
  const income = ctx.monthlyIncome;
  if (income > 0) {
    return [
      `Let's build one from your real numbers. Your income this month is ${formatMoney(income)}, so the 50/30/20 rule suggests:`,
      `• Needs: ${formatMoney(income * 0.5)}\n• Wants: ${formatMoney(income * 0.3)}\n• Savings: ${formatMoney(income * 0.2)}`,
      `Since you're young and probably have few true needs, I'd challenge you to flip it — try saving 30-40% while you can. Set category limits on the Expenses page and I'll help you track them.`,
      `Want the full walkthrough? The “Creating a budget” lesson takes 5 minutes.`,
    ].join("\n\n");
  }
  return [
    "Happy to help! A budget is just three steps: know your income, list your expenses, and give every dollar a job (needs, wants, savings).",
    "I don't see any income recorded this month — add your allowance, job pay, or gift money as income transactions, then ask me again and I'll build your 50/30/20 split with real numbers.",
    "Meanwhile, the “Creating a budget” lesson in Budgeting is a great 5-minute start.",
  ].join("\n\n");
}

function affordAnswer(ctx: CoachContext, message: string): string {
  const match = message.replace(/,/g, "").match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  const price = match ? Number(match[1]) : null;
  const spendable = ctx.checkingBalance;
  if (price === null) {
    return `Good instinct to ask first! Tell me the price — like “can I afford $40 sneakers?” — and I'll check it against your checking balance (currently ${formatMoney(spendable)}) and your goals.`;
  }
  if (price > spendable) {
    return [
      `Right now, no — it's ${formatMoney(price)} and your checking has ${formatMoney(spendable)}.`,
      `But “not yet” isn't “never”: make it a goal and save toward it. Want me to help you figure out a weekly savings amount?`,
    ].join("\n\n");
  }
  const shareOfBalance = price / Math.max(spendable, 1);
  const verdict =
    shareOfBalance > 0.5
      ? `Technically yes — but it would eat ${pct(shareOfBalance)} of your checking account. That's a big bite. My honest advice: sleep on it for 24 hours. If you still want it tomorrow, and it doesn't derail your goals, go for it.`
      : `Yes — ${formatMoney(price)} fits within your ${formatMoney(spendable)} checking balance (about ${pct(shareOfBalance)} of it).`;
  const goalNote =
    ctx.goals.length > 0
      ? `Just remember your goal “${ctx.goals[0].name}” — every dollar spent is a dollar that doesn't go there. Is this worth more to you than getting there sooner?`
      : `One more question to ask yourself: is this a need or a want? Wants are fine — as long as you choose them on purpose.`;
  return `${verdict}\n\n${goalNote}`;
}

function savingHelp(ctx: CoachContext): string {
  const lines = [
    "Here's the playbook that actually works:",
    "**1. Pay yourself first.** The moment money arrives, move a slice to savings — before you spend anything. Even 10% builds real money.\n**2. Make it automatic.** Use the Transfer button so savings happens by system, not willpower.\n**3. Name your goal.** Money saved for “a $500 gaming PC by June” survives temptation way better than money saved for “someday.”",
  ];
  if (ctx.monthlyIncome > 0) {
    lines.push(`With your ${formatMoney(ctx.monthlyIncome)} income this month, saving 20% means ${formatMoney(ctx.monthlyIncome * 0.2)}. Start there and level up.`);
  }
  if (ctx.goals.length > 0) lines.push(goalPlan(ctx.goals[0]));
  else lines.push("You don't have a goal set yet — create one on the Goals page and I'll calculate your weekly savings plan.");
  return lines.join("\n\n");
}

function investingHelp(ctx: CoachContext): string {
  return [
    "Investing, in one breath: you buy things expected to grow — mostly tiny pieces of companies — so your money earns money while you sleep.",
    "The three ideas that matter most:\n**1. Compound growth** — earnings earn their own earnings; the curve bends up over time.\n**2. Diversification** — own many companies (an index ETF), not one lottery ticket.\n**3. Time horizon** — invest only money you won't need for 5+ years. Your age is a superpower here: a dollar invested as a teen can double 5-6 times before retirement.",
    ctx.completedLessonSlugs.has("what-is-investing")
      ? "You've started the Investing lessons — nice. Try the Investing Simulator on the Practice page to feel how markets move, risk-free."
      : "The Investing category in Learn walks through all of this in about 25 minutes total — start with “What is investing?”. Then test yourself in the Investing Simulator with virtual money.",
  ].join("\n\n");
}

function explainTopic(message: string): string | null {
  const topics: [RegExp, string][] = [
    [/compound/i, "Compound interest is growth on top of growth: your money earns returns, and those returns start earning their own returns. Quick trick — the Rule of 72: divide 72 by the yearly rate to get how many years a sum takes to double. At 8%, money doubles every ~9 years. The full “Compound interest” lesson has the wild 40-year numbers."],
    [/credit score/i, "A credit score (300-850) is a report card telling lenders how reliably you repay. Paying on time is the biggest factor (35%), then keeping card usage under 30% of your limit. A good score later means cheaper loans for cars, apartments, everything. The Credit category covers it all."],
    [/credit card/i, "A credit card spends the bank's money — you repay later. One rule makes it a great tool instead of a trap: pay the FULL balance every month, and never charge what you couldn't pay in cash today. Carry a balance and you're paying 20-30% yearly interest."],
    [/inflation/i, "Inflation means prices rise a little every year (~2-3%), so cash quietly buys less over time. It's why long-term money should grow (savings interest, investing) instead of sitting still."],
    [/interest/i, "Interest is the price of money. Save, and the bank pays YOU for holding your deposit. Borrow, and you pay THEM. Same force, opposite directions — the whole game is keeping interest working for you, not against you."],
    [/etf|index fund/i, "An ETF is one share that contains a whole basket of investments — buy one S&P 500 ETF share and you own slivers of 500 companies at once. Instant diversification, tiny fees, and historically it beats most professional stock-pickers over long periods."],
    [/stock/i, "A stock is a tiny piece of ownership in a company — its growth AND its risks. You profit if the price rises or the company pays dividends. Single stocks are risky (any company can stumble), which is why baskets (ETFs) are the usual starting point."],
    [/budget/i, "A budget is deciding where your money goes BEFORE you spend it: know your income, list your expenses, give every dollar a job. The 50/30/20 rule (needs/wants/savings) is a solid starting recipe — ask me to 'help me make a budget' and I'll use your real numbers."],
    [/emergency fund/i, "An emergency fund is your financial airbag: money set aside for true surprises (unexpected + necessary + urgent). Even $100-300 keeps small problems from becoming debt. Build it before the fun goals — then refill it whenever you use it."],
    [/debt|loan/i, "Debt is rented money — interest is the rent, and it compounds against you if ignored. If you ever have several debts: pay minimums on all, then attack either the highest interest rate (avalanche, best math) or smallest balance (snowball, best motivation) first."],
  ];
  for (const [re, answer] of topics) if (re.test(message)) return answer;
  return null;
}

export function coachReply(message: string, ctx: CoachContext): string {
  const m = message.toLowerCase().trim();

  if (/^(hi|hey|hello|yo|sup|hola)\b/.test(m) || m.length < 4) {
    return `Hey ${ctx.name}! 👋 I'm your Fiscalize Coach. I can see your real numbers, so ask me things like “can I afford $30?”, “help me make a budget”, “analyze my spending”, or “explain compound interest.” What's on your mind?`;
  }
  if (/afford|should i buy|can i buy|worth buying/.test(m)) return affordAnswer(ctx, message);
  if (/analy|where.*money.*go|biggest|spend too much|my spending/.test(m)) return spendingAnalysis(ctx);
  if (/budget/.test(m) && /(make|create|help|build|start|set)/.test(m)) return budgetHelp(ctx);
  if (/how.*save|save money|saving|stop spending/.test(m)) return savingHelp(ctx);
  if (/invest/.test(m)) return investingHelp(ctx);
  if (/goal/.test(m)) {
    if (ctx.goals.length === 0)
      return "You don't have any goals yet — head to the Goals page and create one (name, amount, deadline). Then ask me again and I'll build you a savings plan with real math.";
    return ctx.goals.map(goalPlan).join("\n\n");
  }
  if (/what.*(next|learn)|recommend|which lesson/.test(m)) {
    const done = ctx.lessonsCompleted;
    return [
      done === 0
        ? "Fresh start — love it. Begin with Money Basics; it makes everything else click."
        : `You've finished ${done} of ${TOTAL_LESSONS} lessons${ctx.streak > 1 ? ` and you're on a ${ctx.streak}-day streak 🔥` : ""}. Keep the momentum!`,
      `Next up I'd suggest: ${nextLessonSuggestion(ctx)}.`,
    ].join("\n\n");
  }

  const explained = explainTopic(m);
  if (explained) return explained;

  return [
    `Good question! I'm best at these — try one:`,
    `• “Can I afford $25?” — real answer from your real balance\n• “Analyze my spending” — where your money actually goes\n• “Help me make a budget” — 50/30/20 with your numbers\n• “How do I save money?” — the playbook\n• “Explain investing” (or credit, interest, inflation…)\n• “What should I learn next?”`,
  ].join("\n\n");
}

export const COACH_SUGGESTIONS = [
  "Analyze my spending",
  "Help me make a budget",
  "How do I save money?",
  "Explain compound interest",
  "What should I learn next?",
  "Can I afford $30?",
];
