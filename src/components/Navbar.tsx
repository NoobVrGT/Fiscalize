import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, Moon, ReceiptText, Sun, X } from "lucide-react";
import { useTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Home", hash: "" },
  { label: "Features", hash: "#features" },
  { label: "How It Works", hash: "#how-it-works" },
  { label: "About", hash: "#about" },
  { label: "FAQ", hash: "#faq" },
  { label: "Contact", hash: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { session, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const goTo = (hash: string) => {
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate(`/${hash}`);
      return;
    }
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  const solid = scrolled || menuOpen || location.pathname !== "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? "glass shadow-soft" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <button
                type="button"
                onClick={() => goTo(link.hash)}
                className="rounded-full px-4 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-700/5 hover:text-navy-800 dark:text-navy-200 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="grid size-10 place-items-center rounded-full text-navy-600 transition-colors hover:bg-navy-700/5 dark:text-navy-200 dark:hover:bg-white/10"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          {session ? (
            <>
              <Link
                to="/dashboard"
                className="hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-700/5 sm:inline-flex dark:text-navy-100 dark:hover:bg-white/10"
              >
                <LayoutDashboard className="size-4" aria-hidden="true" />
                Dashboard
              </Link>
              <Link
                to="/expenses"
                className="hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-700/5 sm:inline-flex dark:text-navy-100 dark:hover:bg-white/10"
              >
                <ReceiptText className="size-4" aria-hidden="true" />
                Expenses
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden items-center gap-1.5 rounded-full border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 sm:inline-flex dark:border-navy-600 dark:text-navy-200 dark:hover:text-emerald-400"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/start"
              className="hidden rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lift sm:inline-block"
            >
              Get Started
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-full text-navy-600 transition-colors hover:bg-navy-700/5 lg:hidden dark:text-navy-200 dark:hover:bg-white/10"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="space-y-1 px-5 pb-6 pt-2">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => goTo(link.hash)}
                    className="block w-full rounded-xl px-4 py-3 text-left font-medium text-navy-700 transition-colors hover:bg-navy-700/5 dark:text-navy-100 dark:hover:bg-white/10"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              {session ? (
                <>
                  <li>
                    <Link
                      to="/dashboard"
                      className="block rounded-xl px-4 py-3 font-medium text-navy-700 transition-colors hover:bg-navy-700/5 dark:text-navy-100 dark:hover:bg-white/10"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/transactions"
                      className="block rounded-xl px-4 py-3 font-medium text-navy-700 transition-colors hover:bg-navy-700/5 dark:text-navy-100 dark:hover:bg-white/10"
                    >
                      Transactions
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/expenses"
                      className="block rounded-xl px-4 py-3 font-medium text-navy-700 transition-colors hover:bg-navy-700/5 dark:text-navy-100 dark:hover:bg-white/10"
                    >
                      Expenses
                    </Link>
                  </li>
                  <li className="pt-2">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full rounded-xl border border-navy-200 px-4 py-3 text-center font-semibold text-navy-600 transition-colors hover:border-emerald-500 dark:border-navy-600 dark:text-navy-200"
                    >
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <li className="pt-2">
                  <Link
                    to="/start"
                    className="block rounded-xl bg-emerald-600 px-4 py-3 text-center font-semibold text-white shadow-soft transition-colors hover:bg-emerald-700"
                  >
                    Get Started
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
