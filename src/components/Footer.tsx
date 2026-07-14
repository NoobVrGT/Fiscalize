import { Link } from "react-router-dom";
import { Mail, Type } from "lucide-react";
import { useTheme } from "../lib/theme";
import Logo from "./Logo";

export default function Footer() {
  const { largeText, toggleLargeText } = useTheme();

  return (
    <footer
      id="contact"
      className="border-t border-navy-100 bg-surface dark:border-navy-800 dark:bg-navy-950"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-navy-500 dark:text-navy-300">
            Learn. Save. Grow. Fiscalize helps teens build lifelong financial
            habits through personalized goals, gamified learning, and
            interactive lessons.
          </p>
          <button
            type="button"
            onClick={toggleLargeText}
            aria-pressed={largeText}
            className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-navy-700 dark:text-navy-200 dark:hover:text-emerald-400"
          >
            <Type className="size-4" aria-hidden="true" />
            {largeText ? "Standard text size" : "Large text mode"}
          </button>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-navy-400 dark:text-navy-300">
            Explore
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["Features", "/#features"],
              ["How It Works", "/#how-it-works"],
              ["About", "/#about"],
              ["FAQ", "/#faq"],
            ].map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-navy-600 transition-colors hover:text-emerald-700 dark:text-navy-200 dark:hover:text-emerald-400"
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/start"
                className="text-navy-600 transition-colors hover:text-emerald-700 dark:text-navy-200 dark:hover:text-emerald-400"
              >
                Get Started
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-navy-400 dark:text-navy-300">
            Contact
          </h2>
          <a
            href="mailto:hello@fiscalize.app"
            className="mt-4 inline-flex items-center gap-2 text-sm text-navy-600 transition-colors hover:text-emerald-700 dark:text-navy-200 dark:hover:text-emerald-400"
          >
            <Mail className="size-4" aria-hidden="true" />
            hello@fiscalize.app
          </a>
        </div>
      </div>

      <div className="border-t border-navy-100 py-5 text-center text-xs text-navy-400 dark:border-navy-800 dark:text-navy-400">
        © {new Date().getFullYear()} Fiscalize. Built to make money make sense.
      </div>
    </footer>
  );
}
