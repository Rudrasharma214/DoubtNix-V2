import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { logout as logoutService } from '../services/auth.service.js';
import { useGetUser } from '../hooks/Auth/useQueries.js';
import { useQueryClient } from '@tanstack/react-query';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState(() => localStorage.getItem('accessToken'));

  // Fetch user ONLY if token exists
  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetUser({
    enabled: Boolean(token),
  });

  const user = data?.data || data?.user || data || null;
  const isAuthenticated = Boolean(token && user);

  const setAccessToken = (newToken) => {
    localStorage.setItem('accessToken', newToken);
    setTokenState(newToken);
    // Invalidate the user query to trigger a fresh fetch
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const getAccessToken = () => localStorage.getItem('accessToken');

  const logout = async () => {
    try {
      // API interceptor will automatically attach token
      const response = await logoutService();
      console.log('Logout successful:', response);
      localStorage.removeItem('accessToken');
      setTokenState(null);
      queryClient.clear();
      
      return { success: true, message: 'Logged out successfully' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Logout failed';
      localStorage.removeItem('accessToken');
      setTokenState(null);
      queryClient.clear();
      
      throw new Error(errorMessage);
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading: isLoading,
      error: isError
        ? error?.response?.data?.message || 'Failed to fetch user'
        : null,
      setAccessToken,
      getAccessToken,
      logout,
    }),
    [isAuthenticated, user, isLoading, isError, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
