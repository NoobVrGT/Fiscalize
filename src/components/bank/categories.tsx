import {
  ArrowLeftRight,
  Banknote,
  Bus,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { TransactionCategory } from "../../lib/database.types";

interface CategoryMeta {
  icon: LucideIcon;
  /** Badge chip classes (bg + text) for light/dark. Icon + label always shown, never color alone. */
  chip: string;
}

export const CATEGORY_META: Record<TransactionCategory, CategoryMeta> = {
  Food: { icon: UtensilsCrossed, chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  Shopping: { icon: ShoppingBag, chip: "bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300" },
  Entertainment: { icon: Clapperboard, chip: "bg-navy-100 text-navy-700 dark:bg-navy-600/40 dark:text-navy-100" },
  Transportation: { icon: Bus, chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  Bills: { icon: Receipt, chip: "bg-navy-100 text-navy-700 dark:bg-navy-600/40 dark:text-navy-100" },
  Savings: { icon: PiggyBank, chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  Healthcare: { icon: HeartPulse, chip: "bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300" },
  Education: { icon: GraduationCap, chip: "bg-navy-100 text-navy-700 dark:bg-navy-600/40 dark:text-navy-100" },
  Income: { icon: Banknote, chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  Other: { icon: Tag, chip: "bg-navy-100 text-navy-600 dark:bg-navy-600/40 dark:text-navy-200" },
  Transfer: { icon: ArrowLeftRight, chip: "bg-navy-100 text-navy-600 dark:bg-navy-600/40 dark:text-navy-200" },
};

export function CategoryBadge({ category }: { category: TransactionCategory }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.Other;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.chip}`}
    >
      <meta.icon className="size-3.5" aria-hidden="true" />
      {category}
    </span>
  );
}
