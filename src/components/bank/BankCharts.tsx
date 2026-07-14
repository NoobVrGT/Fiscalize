import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "../../lib/chartColors";
import { formatMoney, useBank } from "../../lib/bank";

function useChartChrome() {
  const colors = useChartColors();
  return {
    colors,
    tooltipStyle: {
      backgroundColor: colors.tooltipBg,
      color: colors.tooltipText,
      border: "none",
      borderRadius: "0.75rem",
      boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.3)",
      fontSize: "0.8rem",
      padding: "0.5rem 0.75rem",
    } as const,
    axisProps: {
      stroke: colors.axis,
      fontSize: 11,
      tickLine: false,
      axisLine: false,
    } as const,
  };
}

const shortDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Horizontal bars: total spending per category (all time). Single hue — magnitude, not identity. */
export function SpendingByCategoryChart() {
  const { summary } = useBank();
  const { colors, tooltipStyle, axisProps } = useChartChrome();
  const data = summary.spendingByCategory;

  if (data.length === 0) {
    return (
      <p className="grid h-48 place-items-center text-sm text-navy-400 dark:text-navy-300">
        Add an expense to see your category breakdown.
      </p>
    );
  }

  return (
    <div role="img" aria-label={`Spending by category: ${data.map((d) => `${d.category} ${formatMoney(d.amount)}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 6" horizontal={false} />
          <XAxis type="number" {...axisProps} tickFormatter={(v: number) => `$${v}`} />
          <YAxis type="category" dataKey="category" {...axisProps} width={96} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [formatMoney(Number(v)), "Spent"]}
            cursor={{ fill: colors.grid, opacity: 0.4 }}
          />
          <Bar dataKey="amount" fill={colors.emerald} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Two-series area chart: cumulative checking and savings balances over time. */
export function AccountActivityChart() {
  const { summary } = useBank();
  const { colors, tooltipStyle, axisProps } = useChartChrome();
  const data = summary.activity;

  if (data.length < 2) {
    return (
      <p className="grid h-48 place-items-center text-sm text-navy-400 dark:text-navy-300">
        Add a couple of transactions to see your balance history.
      </p>
    );
  }

  return (
    <div role="img" aria-label="Account activity: checking and savings balances over time">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="activityChecking" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.emerald} stopOpacity={0.22} />
              <stop offset="100%" stopColor={colors.emerald} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="activitySavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.blue} stopOpacity={0.22} />
              <stop offset="100%" stopColor={colors.blue} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="date" {...axisProps} tickFormatter={shortDate} minTickGap={28} />
          <YAxis {...axisProps} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(label) => shortDate(String(label))}
            formatter={(value, name) => [formatMoney(Number(value)), name === "checking" ? "Checking" : "Savings"]}
            cursor={{ stroke: colors.axis, strokeDasharray: "3 3" }}
          />
          <Legend
            formatter={(value: string) => (
              <span style={{ color: colors.axis, fontSize: "0.75rem" }}>
                {value === "checking" ? "Checking" : "Savings"}
              </span>
            )}
          />
          <Area type="monotone" dataKey="checking" stroke={colors.emerald} strokeWidth={2} fill="url(#activityChecking)" dot={false} activeDot={{ r: 4 }} />
          <Area type="monotone" dataKey="savings" stroke={colors.blue} strokeWidth={2} fill="url(#activitySavings)" dot={false} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
