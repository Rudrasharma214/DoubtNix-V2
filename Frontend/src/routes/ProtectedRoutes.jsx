import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/Auth/useAuth';
import Dashboard from '../pages/Dashboard';

/**
 * ProtectedRoute Component: Prevents access without authentication
 */
function ProtectedRoute({ component: Component }) {
  const context = useAuth();

  if (!context) {
    return <Navigate to="/login" replace />;
  }

  const { loading, isAuthenticated } = context;

  // Still loading - show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - render component
  return <Component />;
}

/**
 * ProtectedRoutes: Routes that require authentication
 */
export const protectedRoutes = [
  {
    path: '/dashboard',
    element: <ProtectedRoute component={Dashboard} />,
  },
];

export default ProtectedRoute;
