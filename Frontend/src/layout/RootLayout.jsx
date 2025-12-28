import { Outlet } from 'react-router-dom';
import Layout from './layout';

/**
 * RootLayout wraps all routes with the main Layout component
 * Uses Outlet to render nested route elements
 */
function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default RootLayout;
