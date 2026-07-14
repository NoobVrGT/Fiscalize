import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-navy-700 dark:text-navy-100"
      >
        {label}
        {optional && (
          <span className="ml-1.5 font-normal text-navy-400 dark:text-navy-300">(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy-800 placeholder:text-navy-300 transition-colors focus:border-emerald-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-400";

/** Multi-select pill. Renders as a real checkbox for assistive tech. */
export function ChipToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-emerald-600 ${
        checked
          ? "border-emerald-600 bg-emerald-600 text-white shadow-soft"
          : "border-navy-200 bg-white text-navy-600 hover:border-emerald-400 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-200"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {checked && <Check className="size-4" aria-hidden="true" />}
      {label}
    </label>
  );
}

export function RadioPill({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-emerald-600 ${
        checked
          ? "border-emerald-600 bg-emerald-600 text-white shadow-soft"
          : "border-navy-200 bg-white text-navy-600 hover:border-emerald-400 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-200"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}
