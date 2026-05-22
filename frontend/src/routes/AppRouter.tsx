import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import AdminPage from '../pages/AdminPage';
import BookDetailPage from '../pages/BookDetailPage';
import BooksPage from '../pages/BooksPage';
import BooksNewPage from '../pages/BooksNewPage';
import HomePage from '../pages/HomePage';
import CommunityDetailPage from '../pages/community/CommunityDetailPage';
import CommunityFormPage from '../pages/community/CommunityFormPage';
import CommunityListPage from '../pages/community/CommunityListPage';
import LoginPage from '../pages/LoginPage';
import LogoutPage from '../pages/LogoutPage';
import MyPage from '../pages/MyPage';
import ProgressPage from '../pages/ProgressPage';
import RecommendationPage from '../pages/RecommendationPage';
import ReminderPage from '../pages/ReminderPage';
import NotFoundPage from '../pages/NotFoundPage';
import OAuthCallbackPage from '../pages/OAuthCallbackPage';
import SignupPage from '../pages/SignupPage';
import { pageSpring } from '@/lib/motion';
import PrivateRoute from './PrivateRoute';

export function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 18, scale: 0.992 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -14, scale: 0.996 }}
        transition={pageSpring}
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
              <Route path="/books/new" element={<BooksNewPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/community" element={<CommunityListPage />} />
              <Route path="/community/new" element={<CommunityFormPage mode="create" />} />
              <Route path="/community/:postId" element={<CommunityDetailPage />} />
              <Route path="/community/:postId/edit" element={<CommunityFormPage mode="edit" />} />
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
