import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAccessToken } from '../api/http';

export default function PrivateRoute() {
  const location = useLocation();
  const isAuthenticated = Boolean(getAccessToken());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}