import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import BooksPage from '../pages/BooksPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import LogoutPage from '../pages/LogoutPage';
import MyPage from '../pages/MyPage';
import NotFoundPage from '../pages/NotFoundPage';
import SignupPage from '../pages/SignUpPage';
import PrivateRoute from './PrivateRoute';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/books" element={<BooksPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
