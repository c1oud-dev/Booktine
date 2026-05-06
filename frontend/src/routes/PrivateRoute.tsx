import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/auth/AuthContext';

export default function PrivateRoute({ requireAdmin = false }: { requireAdmin?: boolean }) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
          <Spinner label="세션을 확인하는 중..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}