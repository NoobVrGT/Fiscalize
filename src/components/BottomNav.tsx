import { NavLink } from "react-router-dom";
import {
  Bot,
  GraduationCap,
  Home,
  Target,
  Trophy,
  User,
} from "lucide-react";

const ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/practice", label: "Practice", icon: Trophy },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/coach", label: "Coach", icon: Bot },
  { to: "/profile", label: "Profile", icon: User },
];

/** Mobile app-style bottom navigation, shown on signed-in pages. */
export default function BottomNav() {
  return (
    <nav
      aria-label="App"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-navy-700"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-navy-400 hover:text-navy-700 dark:text-navy-300 dark:hover:text-white"
                }`
              }
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
