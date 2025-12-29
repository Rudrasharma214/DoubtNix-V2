import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/Auth/useAuth';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Welcome from '../pages/Welcome';
import EmailVerification from '../pages/EmailVerication';
import ForgotPassword from '../pages/ForgotPassword';

/**
 * OpenRoute Component: Redirects authenticated users from login/register
 */
function OpenRoute({ component: Component }) {
  const context = useAuth();

  if (!context) {
    return <Component />;
  }

  const { isAuthenticated } = context;

  if (isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <Component />;
}

/**
 * OpenRoutes: Routes accessible without authentication
 */
export const openRoutes = [
  {
    path: '/welcome',
    element: <Welcome />,
  },
  {
    path: '/login',
    element: <OpenRoute component={Login} />,
  },
  {
    path: '/forgot',
    element: <OpenRoute component={ForgotPassword} />,
  },
  {
    path: '/register',
    element: <OpenRoute component={Register} />,
  },
  {
    path: '/email/verify/:id',
    element: <EmailVerification />,
  },
];

export default OpenRoute;
