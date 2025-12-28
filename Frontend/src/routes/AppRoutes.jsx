import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import { openRoutes } from './OpenRoutes';
import { protectedRoutes } from './ProtectedRoutes';

/**
 * Create browser router with all routes
 * Wraps routes with RootLayout which includes the main Layout component
 */
const AppRoutes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        index: true,
        element: <Navigate to="/welcome" replace />,
      },
      ...openRoutes,
      ...protectedRoutes,
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

/**
 * 404 Not Found Page
 */
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600">Page not found</p>
      <a href="/dashboard" className="mt-4 text-blue-600 hover:underline">
        Go back home
      </a>
    </div>
  );
}

export default AppRoutes;
