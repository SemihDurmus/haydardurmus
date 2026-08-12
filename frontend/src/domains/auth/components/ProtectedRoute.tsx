import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../useAuth';

/**
 * Route guard for the admin area. While a stored token is being validated it
 * shows a spinner; if there's no authenticated admin it redirects to the login
 * page (remembering where the user was headed); otherwise it renders the route.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
