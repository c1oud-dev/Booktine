import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import AdminPage from '../pages/AdminPage';
import BookDetailPage from '../pages/BookDetailPage';
import BooksPage from '../pages/BooksPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import LogoutPage from '../pages/LogoutPage';
import MyPage from '../pages/MyPage';
import ProgressPage from '../pages/ProgressPage';
import RecommendationPage from '../pages/RecommendationPage';
import ReminderPage from '../pages/ReminderPage';
import NotFoundPage from '../pages/NotFoundPage';
import OAuthCallbackPage from '../pages/OAuthCallbackPage';
import SignupPage from '../pages/SignupPage';
import PrivateRoute from './PrivateRoute';

const pageTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
} as const;


export function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
            <Route element={<PrivateRoute />}>
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/recommendations" element={<RecommendationPage />} />
              <Route path="/reminders" element={<ReminderPage />} />
              <Route path="/logout" element={<LogoutPage />} />
            </Route>
            <Route element={<PrivateRoute requireAdmin />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
