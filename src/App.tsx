import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./lib/theme";
import { AuthProvider } from "./lib/auth";
import { OnboardingProvider } from "./lib/onboarding";
import { BankProvider } from "./lib/bank";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import StartPage from "./pages/StartPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import ExpensesPage from "./pages/ExpensesPage";
import LearnPage from "./pages/LearnPage";
import LessonPage from "./pages/LessonPage";
import GoalsPage from "./pages/GoalsPage";
import CoachPage from "./pages/CoachPage";
import PracticePage from "./pages/PracticePage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

/** Reset scroll position on route change (hash links are handled per-page). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <BankProvider>{children}</BankProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <MotionConfig reducedMotion="user">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-emerald-600 focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
            >
              Skip to main content
            </a>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/start" element={<StartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
              <Route path="/transactions" element={<Protected><TransactionsPage /></Protected>} />
              <Route path="/expenses" element={<Protected><ExpensesPage /></Protected>} />
              <Route path="/learn" element={<Protected><LearnPage /></Protected>} />
              <Route path="/learn/:categorySlug/:lessonSlug" element={<Protected><LessonPage /></Protected>} />
              <Route path="/goals" element={<Protected><GoalsPage /></Protected>} />
              <Route path="/coach" element={<Protected><CoachPage /></Protected>} />
              <Route path="/practice" element={<Protected><PracticePage /></Protected>} />
              <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </MotionConfig>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
