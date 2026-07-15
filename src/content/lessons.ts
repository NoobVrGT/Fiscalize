/**
 * All learning content lives here — no database needed for the curriculum
 * itself; only each user's *progress* is stored in Supabase.
 */

export interface QuizQuestion {
  q: string;
  options: [string, string, string, string];
  /** Index into options. */
  correct: number;
  explanation: string;
}

export interface LessonSection {
  heading: string;
  body: string;
  /** Optional highlighted example box. */
  example?: string;
}

export interface Lesson {
  slug: string;
  title: string;
  minutes: number;
  xp: number;
  sections: LessonSection[];
  quiz: QuizQuestion[];
}

export interface Category {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  lessons: Lesson[];
}

export const QUIZ_XP = 50; // max XP per quiz, scaled by score

export const CATEGORIES: Category[] = [
  {
    slug: "money-basics",
    name: "Money Basics",
    emoji: "🪙",
    tagline: "Start here — what money is and how it flows.",
    lessons: [
      {
        slug: "what-is-money",
        title: "What is money?",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "Money is a tool",
            body: "Money is anything people agree to use for trading value. Before money, people bartered — traded a chicken for a haircut. Money fixes barter's biggest problem: you don't have to find someone who wants exactly what you have.",
            example: "Cash, the number in your bank account, and the money on a debit card are all the same thing: value everyone agrees to accept.",
          },
          {
            heading: "The three jobs of money",
            body: "Money does three jobs: it's a medium of exchange (you trade with it), a unit of account (prices let you compare things), and a store of value (you can save it for later). If something does all three, it can work as money.",
          },
          {
            heading: "Money is limited — that's the point",
            body: "Money is valuable because it's scarce and trusted. You have a limited amount, which means every purchase is a choice. Learning to make those choices on purpose — instead of by accident — is what financial literacy is.",
          },
        ],
        quiz: [
          {
            q: "What problem does money solve compared to bartering?",
            options: [
              "It makes everything cheaper",
              "You don't need to find someone who wants exactly what you have",
              "It removes the need to work",
              "It guarantees you'll get rich",
            ],
            correct: 1,
            explanation: "Barter requires a 'double coincidence of wants.' Money lets anyone trade with anyone.",
          },
          {
            q: "Which is NOT one of money's three jobs?",
            options: ["Medium of exchange", "Store of value", "Unit of account", "Source of happiness"],
            correct: 3,
            explanation: "Money measures, trades, and stores value. Happiness is up to you!",
          },
          {
            q: "Why does money being limited matter?",
            options: [
              "It doesn't matter",
              "It means every purchase is a trade-off you should choose on purpose",
              "It means saving is impossible",
              "It means prices never change",
            ],
            correct: 1,
            explanation: "Because money is scarce, spending on one thing means not spending on another — economists call this opportunity cost.",
          },
        ],
      },
      {
        slug: "needs-vs-wants",
        title: "Needs vs wants",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "The most useful money skill",
            body: "A need is something you must have to live and function: food, shelter, basic clothing, transportation to school or work. A want is everything else — things that are nice to have but you'd survive without.",
            example: "Lunch is a need. Bubble tea with your lunch every day? That's a want (a delicious one).",
          },
          {
            heading: "It's not about never buying wants",
            body: "Wants aren't bad! The skill is knowing which is which BEFORE you buy. People who label their spending make better choices, because it's hard to accidentally spend $60 a month on snacks when you're paying attention.",
          },
          {
            heading: "The gray zone",
            body: "Some things are both: you need a phone, but the newest $1,200 model is mostly want. A useful trick: the basic version that solves the problem is the need — everything above that is want. Budget for the need, save up for the want.",
          },
        ],
        quiz: [
          {
            q: "Which of these is a need?",
            options: ["Concert tickets", "Groceries", "A second pair of sneakers", "A game skin"],
            correct: 1,
            explanation: "Food is a survival need. The others are wants — fine to buy, but on purpose.",
          },
          {
            q: "You need a phone. The newest premium model costs $1,200. What's the smart way to think about it?",
            options: [
              "The whole $1,200 is a need",
              "Phones are always wants",
              "A working phone is the need; the premium upgrade is a want to save for",
              "Never buy phones",
            ],
            correct: 2,
            explanation: "Split gray-zone purchases: budget the functional version, save separately for the upgrade.",
          },
          {
            q: "Why label purchases as needs or wants?",
            options: [
              "So you never buy wants",
              "So spending happens on purpose instead of by accident",
              "Because wants are bad",
              "To impress your bank",
            ],
            correct: 1,
            explanation: "Awareness is the goal. Wants are part of a healthy budget — surprise spending isn't.",
          },
        ],
      },
      {
        slug: "income",
        title: "Income",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "Money flowing in",
            body: "Income is any money you receive: allowance, a part-time job, birthday money, selling things you make. Adults add salaries, business profits, and investment returns. Every financial plan starts with one question: how much comes in?",
          },
          {
            heading: "Earned vs unearned income",
            body: "Earned income trades your time for money (a job, chores, freelancing). Unearned income arrives without ongoing work — interest on savings, investment gains, gifts. Wealthy people usually got there by turning earned income into sources of unearned income.",
            example: "Babysitting $40/week = earned. Your savings account paying you $2/month interest = unearned. Small now — but that's the seed of investing.",
          },
          {
            heading: "Gross vs net",
            body: "When you get a real paycheck, the amount you earn (gross) and the amount you receive (net, after taxes and deductions) are different. Plans should always use net — the money that actually lands in your account.",
          },
        ],
        quiz: [
          {
            q: "Which is unearned income?",
            options: ["Wages from a job", "Money from chores", "Interest from a savings account", "Freelance payment"],
            correct: 2,
            explanation: "Interest arrives without trading your time — your money did the work.",
          },
          {
            q: "You earn $100 but $15 is taken out in taxes. Your net income is:",
            options: ["$100", "$115", "$85", "$15"],
            correct: 2,
            explanation: "Net = gross minus deductions. $100 − $15 = $85 — plan with this number.",
          },
          {
            q: "Why do plans start with income?",
            options: [
              "Because spending doesn't matter",
              "You can't decide where money goes without knowing how much comes in",
              "Income never changes",
              "Banks require it",
            ],
            correct: 1,
            explanation: "Income sets the ceiling — every budget divides it up.",
          },
        ],
      },
      {
        slug: "expenses",
        title: "Expenses",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "Money flowing out",
            body: "An expense is any money you spend. The two big families: fixed expenses (same amount, every time — like a phone plan or subscription) and variable expenses (change month to month — food, fun, shopping).",
            example: "Netflix $7.99/month = fixed. Snacks = variable (and sneaky — small amounts add up fast).",
          },
          {
            heading: "The latte factor",
            body: "Small repeated purchases are the most underestimated expense. $4 a day is $120 a month — $1,460 a year. You don't have to give them up; you just have to *know* about them. Tracking turns invisible money into visible money.",
          },
          {
            heading: "Track before you judge",
            body: "For one week, write down everything you spend — no changes, just observation. Almost everyone finds at least one 'wait, I spend THAT much on that?' Most money problems aren't math problems; they're visibility problems.",
          },
        ],
        quiz: [
          {
            q: "A fixed expense is one that:",
            options: [
              "You can never cancel",
              "Costs the same amount on a regular schedule",
              "Is always a need",
              "Only adults have",
            ],
            correct: 1,
            explanation: "Fixed = predictable and recurring, like subscriptions or rent. Cancelable, but consistent.",
          },
          {
            q: "$4 spent daily adds up to about how much per year?",
            options: ["$150", "$400", "$1,460", "$4,000"],
            correct: 2,
            explanation: "$4 × 365 = $1,460. Small leaks sink big ships.",
          },
          {
            q: "What's the first step to fixing spending?",
            options: ["Cut everything fun", "Track it so you can see it", "Earn more", "Ignore it"],
            correct: 1,
            explanation: "You can't manage what you can't see. Tracking comes before changing.",
          },
        ],
      },
      {
        slug: "saving",
        title: "Saving",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "Pay yourself first",
            body: "Most people save whatever's left after spending — which is usually nothing. Flip it: when money comes in, move a piece to savings FIRST, then spend what's left. That one habit beats almost every other money trick.",
            example: "Get $50? Move $10 to savings immediately. You'll adjust to spending $40 without noticing — but you'll definitely notice the savings stacking up.",
          },
          {
            heading: "Give every dollar a job",
            body: "Saving works best with a target: a car, a laptop, an emergency cushion. 'Saving for nothing' is easy to raid. Named goals with amounts and deadlines survive temptation dramatically better — that's why Fiscalize has a goals system!",
          },
          {
            heading: "Make it automatic and invisible",
            body: "Willpower is unreliable; systems aren't. Keep savings in a separate account you don't see daily. Out of sight, out of spending. Even 10% of everything you receive, saved automatically, builds real money over time.",
          },
        ],
        quiz: [
          {
            q: "'Pay yourself first' means:",
            options: [
              "Buy what you want first",
              "Move money to savings before you spend anything",
              "Pay your bills last",
              "Only save leftovers",
            ],
            correct: 1,
            explanation: "Saving first guarantees it happens. Saving leftovers guarantees it doesn't.",
          },
          {
            q: "Why do named goals beat vague saving?",
            options: [
              "They earn more interest",
              "Banks require names",
              "A specific target with a deadline is much easier to stick to",
              "They don't",
            ],
            correct: 2,
            explanation: "\"$500 gaming PC by June\" survives temptation. \"Some savings, someday\" doesn't.",
          },
          {
            q: "The most reliable way to save consistently is:",
            options: ["Strong willpower", "Automatic transfers to a separate account", "Saving only big amounts", "Waiting until you're older"],
            correct: 1,
            explanation: "Systems beat willpower. Automatic + separate = money that saves itself.",
          },
        ],
      },
    ],
  },
  {
    slug: "budgeting",
    name: "Budgeting",
    emoji: "📊",
    tagline: "Tell your money where to go instead of wondering where it went.",
    lessons: [
      {
        slug: "creating-a-budget",
        title: "Creating a budget",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "A budget is a plan, not a punishment",
            body: "A budget is just deciding — ahead of time — where your money goes. It has three steps: (1) know your income, (2) list your expenses, (3) assign every dollar a job: needs, wants, or savings.",
            example: "Income $200/month → $80 needs (bus pass, lunch), $60 wants (fun), $60 savings. Every dollar has an assignment.",
          },
          {
            heading: "Budgets fail when they're fantasy",
            body: "The #1 budgeting mistake: writing down what you WISH you spent instead of what you actually spend. Use your real transaction history (your Fiscalize expense tracker!) to set numbers you can actually hit — then tighten gradually.",
          },
          {
            heading: "Review monthly, adjust freely",
            body: "A budget is a living document. At the end of each month compare plan vs reality, then adjust. Over budget on food every single month? The food number is wrong — raise it and cut somewhere else. The budget serves you, not the other way around.",
          },
        ],
        quiz: [
          {
            q: "The three steps of building a budget are:",
            options: [
              "Earn, spend, repeat",
              "Know income, list expenses, assign every dollar a job",
              "Guess, hope, panic",
              "Save, invest, retire",
            ],
            correct: 1,
            explanation: "Income in, expenses mapped, every dollar assigned — that's the whole machine.",
          },
          {
            q: "Why do most budgets fail?",
            options: [
              "Budgets don't work",
              "They're based on wishful numbers instead of real spending",
              "Math is hard",
              "Banks sabotage them",
            ],
            correct: 1,
            explanation: "Fantasy numbers collapse on contact with reality. Start from real data, then improve.",
          },
          {
            q: "You blow your food budget three months in a row. Best move?",
            options: [
              "Give up budgeting",
              "Feel guilty and change nothing",
              "Raise the food number to reality and cut somewhere else",
              "Stop eating",
            ],
            correct: 2,
            explanation: "Persistent overage means a wrong estimate, not a moral failure. Adjust the plan.",
          },
        ],
      },
      {
        slug: "tracking-spending",
        title: "Tracking spending",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "The feedback loop",
            body: "A budget without tracking is a plan with no scoreboard. Tracking means recording every transaction and putting it in a category — exactly what your Fiscalize transactions page does. The magic isn't the recording; it's what the totals reveal.",
          },
          {
            heading: "Categories tell the story",
            body: "Individual purchases look innocent. Category totals don't lie. '$8 on a movie' feels fine; 'Entertainment: $94 this month' is information you can act on. Review your category totals weekly — it takes two minutes.",
            example: "In Fiscalize: Dashboard → Spending by Category, or the Expenses page for month-by-month budgets.",
          },
          {
            heading: "Catch it in the moment",
            body: "Log purchases when they happen, not 'later.' Later never comes, and memory is generous — studies show people underestimate their spending by 20-30% when recalling from memory.",
          },
        ],
        quiz: [
          {
            q: "Why track spending if you already have a budget?",
            options: [
              "You don't need to",
              "The budget is the plan; tracking is the scoreboard that shows if it's working",
              "Banks require it",
              "To feel bad",
            ],
            correct: 1,
            explanation: "Plan without feedback = flying blind. Tracking closes the loop.",
          },
          {
            q: "Which reveals more useful information?",
            options: [
              "One purchase at a time",
              "Category totals over a month",
              "Your gut feeling",
              "Your friend's spending",
            ],
            correct: 1,
            explanation: "Patterns live in totals. That's where the 'whoa, really?' moments come from.",
          },
          {
            q: "People recalling spending from memory typically:",
            options: ["Overestimate it", "Get it exactly right", "Underestimate it by 20-30%", "Refuse to answer"],
            correct: 2,
            explanation: "Memory is flattering. Logs are honest. Log in the moment.",
          },
        ],
      },
      {
        slug: "50-30-20-rule",
        title: "The 50/30/20 rule",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "A starting recipe",
            body: "The 50/30/20 rule divides your after-tax income: 50% to needs, 30% to wants, 20% to savings (and debt payoff). It's not a law — it's a sane default when you don't know where to start.",
            example: "$100 of income → $50 needs, $30 wants, $20 savings. $500? → $250 / $150 / $100. Same shape at any size.",
          },
          {
            heading: "For teens, flip it in your favor",
            body: "If your parents cover most needs, your 'needs' slice might be tiny — which means you can save far MORE than 20%. A teen saving 40-50% of their income is building a superpower most adults never get: the habit formed before life gets expensive.",
          },
          {
            heading: "The 20% is the non-negotiable",
            body: "If you tweak the ratios, protect the savings slice first. Needs and wants expand to fill whatever space you give them; savings only grows if it's defended. Pay yourself first — the rule just puts a number on it.",
          },
        ],
        quiz: [
          {
            q: "In 50/30/20, the numbers stand for:",
            options: [
              "Needs / wants / savings",
              "Rent / food / fun",
              "Taxes / spending / debt",
              "Stocks / bonds / cash",
            ],
            correct: 0,
            explanation: "Half to needs, 30% to wants, 20% to savings — of after-tax income.",
          },
          {
            q: "As a teen whose needs are mostly covered, you should:",
            options: [
              "Spend 80% on wants",
              "Follow 50/30/20 exactly anyway",
              "Save a much bigger slice — you may never have this chance again",
              "Ignore budgeting until 18",
            ],
            correct: 2,
            explanation: "Low needs = high savings potential. That habit compounds for life.",
          },
          {
            q: "If you customize the ratios, which slice do you protect first?",
            options: ["Wants", "Needs", "Savings", "None"],
            correct: 2,
            explanation: "Spending expands to fill available space. Savings must be defended on purpose.",
          },
        ],
      },
      {
        slug: "emergency-funds",
        title: "Emergency funds",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "Your financial airbag",
            body: "An emergency fund is money set aside for true surprises: a broken phone screen, a bike repair, a lost textbook. For adults it's 3-6 months of expenses; for a teen, even $100-300 changes everything.",
          },
          {
            heading: "It's what keeps small problems small",
            body: "Without a cushion, every surprise becomes a crisis (or debt). With one, a $90 repair is annoying instead of catastrophic. Emergency funds don't earn much — that's fine. Their job is being there, not growing.",
            example: "Rule of thumb: emergencies are unexpected, necessary, and urgent. A sale on sneakers is zero for three.",
          },
          {
            heading: "Build it first, then dream bigger",
            body: "Before saving for the fun stuff, stock the airbag. Then — and this is the discipline part — when you use it, refill it before resuming other goals. It's not 'extra money.' It's insurance you sold yourself.",
          },
        ],
        quiz: [
          {
            q: "An emergency fund is for things that are:",
            options: [
              "Fun, cheap, and frequent",
              "Unexpected, necessary, and urgent",
              "Big, planned, and exciting",
              "On sale",
            ],
            correct: 1,
            explanation: "All three tests must pass. A concert isn't an emergency, no matter how urgent it feels.",
          },
          {
            q: "The main job of an emergency fund is to:",
            options: [
              "Earn high returns",
              "Keep small problems from becoming crises or debt",
              "Pay for vacations",
              "Impress your bank",
            ],
            correct: 1,
            explanation: "It's an airbag, not an investment. Availability beats growth.",
          },
          {
            q: "You spend $80 of your emergency fund on a real emergency. Next move?",
            options: [
              "Celebrate the extra room",
              "Refill it before resuming other savings goals",
              "Close the fund",
              "Borrow more",
            ],
            correct: 1,
            explanation: "The airbag has to be re-armed. Refill first, then back to your goals.",
          },
        ],
      },
    ],
  },
  {
    slug: "banking",
    name: "Banking",
    emoji: "🏦",
    tagline: "How accounts, banks, and interest actually work.",
    lessons: [
      {
        slug: "checking-accounts",
        title: "Checking accounts",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "Your money's home base",
            body: "A checking account is for everyday money: receiving income, paying for things, moving money around. It comes with a debit card that spends YOUR money directly (unlike a credit card, which borrows).",
          },
          {
            heading: "What to watch",
            body: "Three things matter: fees (many banks charge monthly fees — student accounts usually waive them), overdrafts (spending more than you have can trigger $30+ penalties), and keeping an eye on your balance so neither surprises you.",
            example: "Your Fiscalize Virtual Checking works the same way: money in, money out, live balance — practice for the real thing.",
          },
          {
            heading: "Checking is for flow, not storage",
            body: "Checking accounts earn little or no interest. Money that just sits there is losing invisible value to inflation. Keep enough for spending plus a small buffer — everything else belongs in savings.",
          },
        ],
        quiz: [
          {
            q: "A debit card:",
            options: [
              "Borrows money from the bank",
              "Spends your own money directly from checking",
              "Builds credit history",
              "Is free money",
            ],
            correct: 1,
            explanation: "Debit = your money now. Credit = the bank's money you must repay.",
          },
          {
            q: "An overdraft happens when:",
            options: [
              "You save too much",
              "You spend more than your account holds",
              "The bank closes",
              "You use an ATM",
            ],
            correct: 1,
            explanation: "Spending past zero often triggers hefty fees. Know your balance.",
          },
          {
            q: "Why not store all your money in checking?",
            options: [
              "It's illegal",
              "It earns little interest and invites spending — savings is for storage",
              "Checking accounts expire",
              "You should",
            ],
            correct: 1,
            explanation: "Checking is the wallet; savings is the vault.",
          },
        ],
      },
      {
        slug: "savings-accounts",
        title: "Savings accounts",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "The vault that pays you",
            body: "A savings account holds money you're NOT spending — and the bank pays you interest for keeping it there. The distance from your daily spending is a feature: money you don't see is money you don't spend.",
          },
          {
            heading: "APY: the number that matters",
            body: "Interest is quoted as APY (Annual Percentage Yield) — the percent your money grows in a year. Big traditional banks often pay ~0.01%; high-yield savings accounts pay 4%+ for identical safety. Same money, 400× difference. Always compare.",
            example: "$1,000 for a year: 0.01% APY → 10 cents. 4.5% APY → $45. Just for choosing a better account.",
          },
          {
            heading: "Insured means safe",
            body: "In the US, FDIC insurance protects bank deposits up to $250,000 even if the bank itself fails (credit unions have the equivalent NCUA). Money in an insured savings account is about the safest place money can be.",
          },
        ],
        quiz: [
          {
            q: "APY measures:",
            options: [
              "Monthly fees",
              "How much your money grows in a year, as a percent",
              "Your credit score",
              "ATM limits",
            ],
            correct: 1,
            explanation: "Annual Percentage Yield — the growth rate of parked money. Higher is better.",
          },
          {
            q: "High-yield savings accounts vs big-bank savings:",
            options: [
              "Riskier",
              "Same safety, often hundreds of times more interest",
              "Only for adults",
              "Identical rates",
            ],
            correct: 1,
            explanation: "Equally insured, dramatically better APY. Comparing accounts is free money.",
          },
          {
            q: "FDIC insurance means:",
            options: [
              "Your investments can't lose value",
              "Your deposits are protected (up to $250k) even if the bank fails",
              "You can't be charged fees",
              "The government pays your bills",
            ],
            correct: 1,
            explanation: "It protects deposits, not investments — and makes savings accounts extremely safe.",
          },
        ],
      },
      {
        slug: "interest",
        title: "Interest",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "The price of money",
            body: "Interest is what it costs to use someone else's money. When you save, the bank pays YOU (you're lending them your deposit). When you borrow, you pay THEM. Same concept, opposite directions — and the direction determines whether interest is your friend or enemy.",
          },
          {
            heading: "Simple vs compound",
            body: "Simple interest pays only on your original amount. Compound interest pays on your original amount PLUS all the interest you've already earned — interest on interest. Over time the difference isn't small; it's everything.",
            example: "$1,000 at 10%: simple pays $100 every year forever. Compound: $100, then $110, then $121... After 30 years: simple = $4,000 total, compound = $17,449.",
          },
          {
            heading: "Time is the secret ingredient",
            body: "Compounding rewards early starters more than big savers. Someone who saves small amounts as a teen often ends up ahead of someone saving bigger amounts starting in their 30s. You have the one resource money can't buy: time.",
          },
        ],
        quiz: [
          {
            q: "Compound interest means earning interest on:",
            options: [
              "Only your original deposit",
              "Your deposit plus previously earned interest",
              "Other people's money",
              "Your income",
            ],
            correct: 1,
            explanation: "Interest on interest — the snowball that makes long-term saving powerful.",
          },
          {
            q: "Who typically ends up with more: a teen saving small amounts or an adult starting bigger at 35?",
            options: [
              "Always the adult",
              "Often the teen — compounding rewards time more than size",
              "They tie",
              "Neither",
            ],
            correct: 1,
            explanation: "Early money compounds through more doubling periods. Time beats amount.",
          },
          {
            q: "When you borrow money, interest is:",
            options: ["Paid to you", "A fee you pay for using someone else's money", "Optional", "Illegal"],
            correct: 1,
            explanation: "Borrowing flips the direction: now compounding works against you.",
          },
        ],
      },
      {
        slug: "banks",
        title: "How banks work",
        minutes: 4,
        xp: 20,
        sections: [
          {
            heading: "The middleman of money",
            body: "Banks take deposits from savers, lend that money to borrowers at a higher rate, and keep the difference. Your deposited money isn't sitting in a vault with your name on it — it's out working, which is exactly why banks pay you interest.",
          },
          {
            heading: "Banks, credit unions, and online banks",
            body: "Banks are for-profit companies. Credit unions are member-owned nonprofits (often better rates, fewer fees). Online banks skip physical branches and pass the savings to you as higher APY. All three are insured; they mostly differ in rates and fees.",
          },
          {
            heading: "You're the customer — act like it",
            body: "Banking is a competitive business and you're allowed to shop around. Compare fees, APY, app quality, and ATM access. Loyalty to a bank that pays you 0.01% is loyalty they're not paying you back for.",
            example: "Common teen setup: a student checking account (no fees) + a high-yield savings account. Two accounts, two jobs.",
          },
        ],
        quiz: [
          {
            q: "Banks mainly make money by:",
            options: [
              "Printing it",
              "Lending deposits at higher rates than they pay savers",
              "Charging for air conditioning",
              "Government gifts",
            ],
            correct: 1,
            explanation: "Borrow low (your deposits), lend high (loans) — the spread is their business.",
          },
          {
            q: "Credit unions differ from banks because they are:",
            options: [
              "Uninsured",
              "Member-owned nonprofits, often with better rates",
              "Only for businesses",
              "Illegal in most states",
            ],
            correct: 1,
            explanation: "Profits flow back to members as better rates and lower fees.",
          },
          {
            q: "Why do online banks often pay higher interest?",
            options: [
              "They're riskier",
              "No physical branches means lower costs passed on as better APY",
              "They print money",
              "They don't",
            ],
            correct: 1,
            explanation: "Fewer buildings, fewer costs, better rates — same insurance.",
          },
        ],
      },
    ],
  },
  {
    slug: "investing",
    name: "Investing",
    emoji: "📈",
    tagline: "Make your money work while you sleep.",
    lessons: [
      {
        slug: "what-is-investing",
        title: "What is investing?",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "Buying things that grow",
            body: "Investing means using money to buy assets — things expected to grow in value or produce income: pieces of companies (stocks), loans to governments (bonds), property, funds. Saving protects money; investing grows it.",
          },
          {
            heading: "Why saving alone isn't enough",
            body: "Inflation means prices rise ~2-3% per year, so cash quietly loses buying power. A savings account slows the leak; investing — historically ~7-10%/year for the whole US stock market over long periods — outruns it. That's the reason to invest at all.",
            example: "$100 under a mattress for 30 years still says $100 — but buys what ~$50 buys today. Invested at 8%, it becomes ~$1,000.",
          },
          {
            heading: "Long game only",
            body: "Markets swing wildly year to year — down 20% one year, up 30% the next. Investing is for money you won't need for 5+ years, which is why your emergency fund stays in savings. Time in the market smooths the ride.",
          },
        ],
        quiz: [
          {
            q: "The core difference between saving and investing:",
            options: [
              "There isn't one",
              "Saving protects money; investing puts it at risk to grow it",
              "Investing is guaranteed",
              "Saving is only for adults",
            ],
            correct: 1,
            explanation: "Different tools: savings = safety and access, investing = growth over time.",
          },
          {
            q: "Why does inflation matter to savers?",
            options: [
              "It doesn't",
              "Rising prices quietly shrink what cash can buy",
              "It only affects banks",
              "It makes saving illegal",
            ],
            correct: 1,
            explanation: "2-3% yearly price growth means idle cash loses real value. Growth is defense.",
          },
          {
            q: "Money you'll need next month belongs in:",
            options: ["Stocks", "Savings — investing is for 5+ year money", "Crypto", "A drawer"],
            correct: 1,
            explanation: "Short-term money can't ride out market swings. Match the tool to the timeline.",
          },
        ],
      },
      {
        slug: "stocks",
        title: "Stocks",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "Owning a slice of a company",
            body: "A stock (share) is a tiny piece of ownership in a company. Own Apple stock and you literally own a sliver of Apple — its profits, growth, and risks. Share prices move with how the company performs and what investors expect next.",
          },
          {
            heading: "How you make (or lose) money",
            body: "Two ways to gain: the price rises and you sell higher than you bought, or the company pays dividends (a share of profits sent to owners). And yes — prices also fall. Single stocks can drop 50%+ or go to zero if a company fails.",
            example: "Buy 1 share at $100. Company thrives → share hits $150, you're up $50. Company struggles → $60, you're down $40. Ownership cuts both ways.",
          },
          {
            heading: "The single-stock trap",
            body: "Picking individual winners is genuinely hard — most professionals fail to beat the overall market over time. That's not a reason to avoid stocks; it's the reason diversification (next lesson: ETFs) exists.",
          },
        ],
        quiz: [
          {
            q: "Owning a stock means:",
            options: [
              "Lending money to a company",
              "Owning a small piece of the company",
              "Working for the company",
              "Guaranteed profit",
            ],
            correct: 1,
            explanation: "Shareholders are part-owners — of the upside and the downside.",
          },
          {
            q: "A dividend is:",
            options: [
              "A stock market fee",
              "A share of company profits paid to shareholders",
              "A type of loan",
              "A tax",
            ],
            correct: 1,
            explanation: "Some companies distribute part of their profit to owners — income while you hold.",
          },
          {
            q: "Why is betting on a single stock risky?",
            options: [
              "Stocks are scams",
              "One company can stumble or fail — even pros struggle to pick winners",
              "It's not risky",
              "Stocks can't go down",
            ],
            correct: 1,
            explanation: "Any one company can crater. Spreading out is the professional answer.",
          },
        ],
      },
      {
        slug: "etfs",
        title: "ETFs",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "A basket instead of a bet",
            body: "An ETF (Exchange-Traded Fund) is a single share that contains many investments at once. Buy one share of an S&P 500 ETF and you own slivers of 500 large US companies simultaneously. One purchase = instant diversification.",
          },
          {
            heading: "Why diversification wins",
            body: "In a 500-company basket, one company failing barely dents you — winners offset losers. You stop betting on any single company and start betting on the economy growing over decades, which historically it has.",
            example: "The S&P 500 has averaged ~10% yearly over long periods — including crashes, recessions, and recoveries along the way.",
          },
          {
            heading: "Cheap and boring is the winning strategy",
            body: "Index ETFs charge tiny fees (often 0.03-0.1%/year) because nobody's paid to pick stocks — the fund just holds everything. Boring, cheap, diversified index funds beat the majority of professional stock-pickers over long periods. Boring wins.",
          },
        ],
        quiz: [
          {
            q: "An ETF is:",
            options: [
              "A single company's stock",
              "One share that holds a basket of many investments",
              "A savings account",
              "A cryptocurrency",
            ],
            correct: 1,
            explanation: "One purchase, hundreds of holdings — diversification in a single share.",
          },
          {
            q: "Diversification protects you because:",
            options: [
              "It guarantees profit",
              "One company's failure barely affects a basket of hundreds",
              "It avoids all taxes",
              "It doubles returns",
            ],
            correct: 1,
            explanation: "Spread across many companies, no single stumble sinks you.",
          },
          {
            q: "Over long periods, low-cost index ETFs typically:",
            options: [
              "Lose to most professionals",
              "Beat the majority of professional stock-pickers",
              "Return exactly 0%",
              "Only work in America",
            ],
            correct: 1,
            explanation: "Low fees + owning everything is shockingly hard to beat. Boring wins.",
          },
        ],
      },
      {
        slug: "compound-interest",
        title: "Compound interest",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "The eighth wonder",
            body: "Compounding is growth on top of growth. Your money earns returns; those returns earn returns; those earn returns. The curve starts flat and then bends upward — slowly, then suddenly.",
            example: "$1,000 at 8%/year: year 1 → $1,080. Year 10 → $2,159. Year 30 → $10,063. Year 40 → $21,725. Notice the last 10 years added more than the first 30.",
          },
          {
            heading: "The Rule of 72",
            body: "Quick mental math: divide 72 by your yearly return to get the years needed to DOUBLE your money. At 8%, money doubles every ~9 years. A teen's dollar has time for 5-6 doublings; a 40-year-old's has 3. Same dollar, wildly different destiny.",
          },
          {
            heading: "Start tiny, start now",
            body: "Because early years power the whole curve, $25/month starting at 16 can beat $100/month starting at 30. You can't buy back time later at any price — starting small NOW is mathematically better than starting big later.",
          },
        ],
        quiz: [
          {
            q: "Using the Rule of 72, money growing 8%/year doubles about every:",
            options: ["72 years", "9 years", "8 years", "2 years"],
            correct: 1,
            explanation: "72 ÷ 8 = 9 years per doubling.",
          },
          {
            q: "Compounding curves bend upward over time because:",
            options: [
              "Banks get generous",
              "Returns start earning their own returns",
              "Inflation",
              "They don't",
            ],
            correct: 1,
            explanation: "Growth on growth — each year's gains join the workforce.",
          },
          {
            q: "Why can $25/month at 16 beat $100/month at 30?",
            options: [
              "It can't",
              "Early money passes through more doubling periods",
              "Teens get better rates",
              "Taxes",
            ],
            correct: 1,
            explanation: "Time multiplies money more powerfully than amount. Your age is your edge.",
          },
        ],
      },
      {
        slug: "risk-vs-reward",
        title: "Risk vs reward",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "The iron law",
            body: "Higher potential returns ALWAYS come with higher risk — no exceptions. Savings accounts: safe, low return. Index funds: medium risk, solid long-term return. Single stocks and crypto: high risk, possible high reward, possible wipeout. Anyone promising high returns with no risk is describing a scam.",
          },
          {
            heading: "Risk isn't the enemy — mismatched risk is",
            body: "Risk is fine when the timeline fits: decades-away money can ride out crashes; next-month money can't. The classic mistake is taking big risks with money you need soon, or zero risk with money you won't touch for 20 years.",
            example: "Emergency fund → savings (zero risk, instant access). Retirement at 60 → index funds (decades to recover from any crash).",
          },
          {
            heading: "Scam radar",
            body: "'Guaranteed 20% returns.' 'Risk-free.' 'Act now.' 'Everyone's getting rich.' Each phrase is a red flag; together they're a siren. Real investing is transparent about risk. If it sounds too good to be true, it is — every single time.",
          },
        ],
        quiz: [
          {
            q: "The relationship between risk and reward is:",
            options: [
              "Unrelated",
              "Higher potential returns always carry higher risk",
              "More risk guarantees more money",
              "Only banks have risk",
            ],
            correct: 1,
            explanation: "It's the iron law of investing. 'High return, no risk' doesn't exist.",
          },
          {
            q: "'Guaranteed 25% returns, zero risk, act today!' This is:",
            options: [
              "A great opportunity",
              "Almost certainly a scam",
              "How banks talk",
              "Normal for ETFs",
            ],
            correct: 1,
            explanation: "Guaranteed + high + urgent = scam checklist, fully checked.",
          },
          {
            q: "Which money can afford high-risk investments?",
            options: [
              "Next month's lunch money",
              "Your emergency fund",
              "Money you won't need for many years",
              "Borrowed money",
            ],
            correct: 2,
            explanation: "Long timelines can absorb crashes and recover. Short ones can't.",
          },
        ],
      },
    ],
  },
  {
    slug: "credit",
    name: "Credit",
    emoji: "💳",
    tagline: "Borrowing, credit scores, and staying out of the debt trap.",
    lessons: [
      {
        slug: "credit-scores",
        title: "Credit scores",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "Your financial report card",
            body: "A credit score (300-850 in the US) tells lenders how reliably you repay borrowed money. It affects loan approvals, interest rates, apartment applications, even some jobs. 700+ is good; 750+ opens most doors at the best prices.",
          },
          {
            heading: "What builds it",
            body: "The big factors: paying on time (35% — the most important), how much of your available credit you use (30% — keep it under 30%), how long you've had credit (15%), plus credit mix and new applications. One late payment can sting for years.",
            example: "Two people borrow the same $20,000 for a car: score 780 might pay ~6% interest; score 600 might pay ~15%. Difference over the loan: thousands of dollars.",
          },
          {
            heading: "Starting from zero",
            body: "You start with no score, not a bad one. Common first steps around 18: becoming an authorized user on a parent's card, a student card, or a secured card — used lightly and paid in full every month. The habit IS the score.",
          },
        ],
        quiz: [
          {
            q: "The biggest factor in a credit score is:",
            options: ["Your salary", "Paying on time", "Your age", "Your bank"],
            correct: 1,
            explanation: "Payment history is 35% — reliability is what's being measured.",
          },
          {
            q: "A higher credit score gets you:",
            options: [
              "Nothing useful",
              "Lower interest rates and easier approvals",
              "Free money",
              "Higher taxes",
            ],
            correct: 1,
            explanation: "Good scores make borrowing dramatically cheaper — thousands saved on big loans.",
          },
          {
            q: "Credit utilization should generally stay:",
            options: ["At 100%", "Under 30% of your limit", "Above 50%", "At exactly 0 forever"],
            correct: 1,
            explanation: "Using a small share of available credit signals control, not dependence.",
          },
        ],
      },
      {
        slug: "credit-cards",
        title: "Credit cards",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "A tool with teeth",
            body: "A credit card lets you spend the bank's money now and repay later. Used well, it builds credit history, offers fraud protection, and earns rewards. Used badly, it charges 20-30% yearly interest — among the most expensive money on Earth.",
          },
          {
            heading: "The one rule",
            body: "Pay the FULL statement balance every month. Do that and you pay zero interest — the card is free and useful. Carry a balance and interest compounds against you daily. 'Minimum payment' is the trap: it's designed to keep you in debt for years.",
            example: "$1,000 balance at 24% APR, paying only $25 minimums: ~5 years to pay off, ~$700 in interest. Paying in full: $0 interest, ever.",
          },
          {
            heading: "The mindset that works",
            body: "Treat a credit card like a debit card with a bonus: never charge what you couldn't pay in cash right now. The card is a convenience layer over money you already have — not permission to spend money you don't.",
          },
        ],
        quiz: [
          {
            q: "The golden rule of credit cards is:",
            options: [
              "Pay the minimum",
              "Pay the full balance every month",
              "Max it out for rewards",
              "Never use it",
            ],
            correct: 1,
            explanation: "Full payment = zero interest = free tool. Anything less feeds the interest machine.",
          },
          {
            q: "Minimum payments are designed to:",
            options: [
              "Help you pay off fast",
              "Keep you in debt paying interest for years",
              "Improve your score fastest",
              "Be the smart option",
            ],
            correct: 1,
            explanation: "Minimums mostly cover interest, barely touching what you owe.",
          },
          {
            q: "The safest credit card mindset:",
            options: [
              "It's extra income",
              "Never charge what you couldn't pay in cash today",
              "Buy now, worry later",
              "Cards are evil",
            ],
            correct: 1,
            explanation: "A card should layer convenience over real money — not create fake money.",
          },
        ],
      },
      {
        slug: "loans",
        title: "Loans",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "Renting money",
            body: "A loan is borrowed money repaid over time with interest — you're renting money, and interest is the rent. Every loan has a principal (amount borrowed), an interest rate (APR), and a term (how long). All three decide the true cost.",
          },
          {
            heading: "Good debt, bad debt",
            body: "Debt that buys growing value or earning power (a reasonable student loan, a modest mortgage) can be a tool. Debt for things that lose value or vanish (gadgets, vacations, impulse buys) is a wealth leak. Ask: will this be worth more than the loan costs me?",
            example: "$10,000 borrowed at 6% for 5 years costs ~$1,600 in interest. The same at 24% (credit-card rate) costs ~$7,250. The rate IS the price tag.",
          },
          {
            heading: "Read the whole deal",
            body: "Before any loan: total repayment (not just the monthly payment), the APR, fees, and what happens if you're late. 'Low monthly payments' spread over longer terms often means paying far more in total. Lenders advertise the monthly; you should calculate the total.",
          },
        ],
        quiz: [
          {
            q: "The three parts of every loan are:",
            options: [
              "Principal, interest rate, term",
              "Bank, borrower, government",
              "Cash, card, check",
              "Monthly, yearly, forever",
            ],
            correct: 0,
            explanation: "Amount borrowed, price of borrowing, and time to repay — together they set the true cost.",
          },
          {
            q: "Which is closest to 'good debt'?",
            options: [
              "Financing a vacation",
              "A reasonable loan for education that raises earning power",
              "A loan for concert tickets",
              "Payday loans",
            ],
            correct: 1,
            explanation: "Debt that buys lasting value can be a tool. Debt for vanishing things is a leak.",
          },
          {
            q: "'Low monthly payments!' usually hides:",
            options: [
              "A gift",
              "A longer term that costs more in total interest",
              "Zero interest",
              "Nothing",
            ],
            correct: 1,
            explanation: "Stretching the term shrinks the payment but grows the total. Calculate the whole cost.",
          },
        ],
      },
      {
        slug: "debt",
        title: "Managing debt",
        minutes: 5,
        xp: 25,
        sections: [
          {
            heading: "Debt compounds too — against you",
            body: "The same compounding that grows investments grows unpaid debt. Interest charges join the balance and start earning interest themselves. That's why small debts left alone become big debts — the machine runs in reverse.",
          },
          {
            heading: "Getting out: avalanche vs snowball",
            body: "Two proven payoff strategies. Avalanche: pay minimums on everything, throw every spare dollar at the HIGHEST interest rate first (mathematically optimal). Snowball: attack the SMALLEST balance first for quick wins (psychologically powerful). Either works — the one you'll stick to is the right one.",
            example: "Debts: $500 at 24%, $2,000 at 6%. Avalanche hits the $500 first (highest rate). Snowball also hits the $500 first (smallest) — sometimes they agree!",
          },
          {
            heading: "The best debt strategy is prevention",
            body: "Everything in this course — budgets, emergency funds, pausing before purchases — exists so borrowing stays a choice, not a necessity. An emergency fund is literally anti-debt: it absorbs the surprises that push people into borrowing.",
          },
        ],
        quiz: [
          {
            q: "Unpaid debt grows because:",
            options: [
              "Banks round up",
              "Interest compounds on the balance — the growth machine in reverse",
              "It doesn't grow",
              "Inflation",
            ],
            correct: 1,
            explanation: "Interest joins the balance and earns interest itself. Ignoring debt feeds it.",
          },
          {
            q: "The avalanche method pays off first:",
            options: [
              "The smallest balance",
              "The highest interest rate",
              "The newest debt",
              "The biggest balance",
            ],
            correct: 1,
            explanation: "Killing the most expensive debt first minimizes total interest paid.",
          },
          {
            q: "The strongest anti-debt tool is:",
            options: [
              "A higher credit limit",
              "An emergency fund that absorbs surprises",
              "Ignoring bills",
              "More credit cards",
            ],
            correct: 1,
            explanation: "Most debt starts with a surprise expense and no cushion. The airbag prevents the crash.",
          },
        ],
      },
    ],
  },
];

export const ALL_LESSONS = CATEGORIES.flatMap((c) =>
  c.lessons.map((l) => ({ ...l, category: c.slug, categoryName: c.name })),
);

export const TOTAL_LESSONS = ALL_LESSONS.length;

export function findLesson(categorySlug: string, lessonSlug: string) {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  const lesson = category?.lessons.find((l) => l.slug === lessonSlug);
  return category && lesson ? { category, lesson } : null;
}
