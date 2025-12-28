import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layout/RootLayout';
import { openRoutes } from './OpenRoutes';
import { protectedRoutes } from './ProtectedRoutes';
import NotFound from '../pages/NotFound';

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

export default AppRoutes;
