import type { ReactNode } from "react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import AchievementToast from "./AchievementToast";

/** Layout wrapper for signed-in app pages: top nav, bottom tab bar, badge toasts. */
export default function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <>
      <Navbar />
      <main
        id="main"
        className={`mx-auto min-h-dvh ${wide ? "max-w-7xl" : "max-w-5xl"} px-5 pb-32 pt-28 sm:px-8 lg:pb-24`}
      >
        {children}
      </main>
      <BottomNav />
      <AchievementToast />
    </>
  );
}
