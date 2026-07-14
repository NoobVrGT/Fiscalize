import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { useChartColors } from "../../lib/chartColors";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const SAVINGS = [120, 260, 410, 520, 700, 940].map((v, i) => ({ month: MONTHS[i], savings: v }));
const XP = [180, 240, 220, 310, 380, 450].map((v, i) => ({ month: MONTHS[i], xp: v }));
const SPENDING = [95, 82, 88, 64, 58, 46].map((v, i) => ({ month: MONTHS[i], spending: v }));
const WEEK = [
  { day: "M", minutes: 12 },
  { day: "T", minutes: 18 },
  { day: "W", minutes: 8 },
  { day: "T", minutes: 22 },
  { day: "F", minutes: 15 },
  { day: "S", minutes: 25 },
  { day: "S", minutes: 10 },
];
const GOALS = [
  { name: "First Car Fund", pct: 62 },
  { name: "Emergency Fund", pct: 84 },
  { name: "New Headphones", pct: 100 },
];

function ChartCard({
  title,
  subtitle,
  children,
  description,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  description: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-navy-100 bg-white p-6 shadow-soft dark:border-navy-700 dark:bg-navy-800">
      <h3 className="font-display font-semibold text-navy-800 dark:text-white">{title}</h3>
      <p className="mb-4 text-sm text-navy-400 dark:text-navy-300">{subtitle}</p>
      <div className="min-h-44 flex-1" role="img" aria-label={description}>
        {children}
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  const colors = useChartColors();

  const tooltipStyle = {
    backgroundColor: colors.tooltipBg,
    color: colors.tooltipText,
    border: "none",
    borderRadius: "0.75rem",
    boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.3)",
    fontSize: "0.8rem",
    padding: "0.5rem 0.75rem",
  } as const;
  const axisProps = {
    stroke: colors.axis,
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  } as const;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Dashboard preview"
          title="Your money story, at a glance"
          description="Friendly, clear analytics that show exactly how far you've come."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Reveal>
            <ChartCard
              title="Savings Growth"
              subtitle="Total saved · last 6 months"
              description="Area chart: savings grew steadily from $120 in January to $940 in June."
            >
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={SAVINGS} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.emerald} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={colors.emerald} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={colors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`$${v}`, "Saved"]}
                    cursor={{ stroke: colors.axis, strokeDasharray: "3 3" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke={colors.emerald}
                    strokeWidth={2}
                    fill="url(#savingsFill)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Reveal>

          <Reveal delay={0.08}>
            <ChartCard
              title="XP Earned"
              subtitle="Monthly experience points"
              description="Bar chart: XP earned per month rose from 180 in January to 450 in June."
            >
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={XP} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid stroke={colors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`${v} XP`, "Earned"]}
                    cursor={{ fill: colors.grid, opacity: 0.4 }}
                  />
                  <Bar dataKey="xp" fill={colors.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Reveal>

          <Reveal delay={0.16}>
            <ChartCard
              title="Lesson Completion"
              subtitle="Budgeting Basics course"
              description="Progress ring: 18 of 24 lessons complete, 75 percent."
            >
              <div className="flex h-full items-center justify-center gap-6">
                <svg viewBox="0 0 120 120" className="size-36" aria-hidden="true">
                  <circle cx="60" cy="60" r="50" fill="none" stroke={colors.grid} strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={colors.emerald}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${0.75 * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                    transform="rotate(-90 60 60)"
                  />
                  <text
                    x="60"
                    y="57"
                    textAnchor="middle"
                    className="fill-navy-800 font-display text-2xl font-bold dark:fill-white"
                  >
                    75%
                  </text>
                  <text x="60" y="76" textAnchor="middle" className="fill-navy-400 text-[10px] dark:fill-navy-300">
                    18 of 24
                  </text>
                </svg>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-navy-700 dark:text-navy-100">On track 🎉</p>
                  <p className="text-navy-400 dark:text-navy-300">
                    6 lessons left —<br />about 2 weeks at your pace.
                  </p>
                </div>
              </div>
            </ChartCard>
          </Reveal>

          <Reveal delay={0.08}>
            <ChartCard
              title="Spending Trends"
              subtitle="Impulse purchases per month ($)"
              description="Line chart: impulse spending fell from $95 in January to $46 in June."
            >
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={SPENDING} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={colors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`$${v}`, "Impulse spend"]}
                    cursor={{ stroke: colors.axis, strokeDasharray: "3 3" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spending"
                    stroke={colors.gold}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors.gold, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Reveal>

          <Reveal delay={0.16}>
            <ChartCard
              title="Goal Progress"
              subtitle="Active savings goals"
              description="Goal progress: First Car Fund 62%, Emergency Fund 84%, New Headphones complete."
            >
              <ul className="flex h-full flex-col justify-center gap-5">
                {GOALS.map((goal) => (
                  <li key={goal.name}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium text-navy-700 dark:text-navy-100">{goal.name}</span>
                      <span className="font-semibold text-navy-500 dark:text-navy-300">
                        {goal.pct === 100 ? "Done ✓" : `${goal.pct}%`}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${goal.pct}%`,
                          backgroundColor: goal.pct === 100 ? colors.gold : colors.emerald,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </ChartCard>
          </Reveal>

          <Reveal delay={0.24}>
            <ChartCard
              title="Weekly Activity"
              subtitle="Minutes learned per day"
              description="Bar chart: learning minutes each day this week, peaking at 25 minutes on Saturday."
            >
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={WEEK} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid stroke={colors.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="day" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`${v} min`, "Learning"]}
                    cursor={{ fill: colors.grid, opacity: 0.4 }}
                  />
                  <Bar dataKey="minutes" fill={colors.emerald} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
