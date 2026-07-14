import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 font-display text-xl font-bold tracking-tight"
      aria-label="Fiscalize home"
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-xl bg-navy-700 font-display text-lg font-extrabold text-emerald-400 shadow-soft dark:bg-navy-800"
      >
        F
      </span>
      <span className="text-navy-800 dark:text-white">
        Fiscal<span className="text-emerald-600 dark:text-emerald-400">ize</span>
      </span>
    </Link>
  );
}
