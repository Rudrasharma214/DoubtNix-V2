import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/api.js';
import { logout as logoutService } from '../services/auth.service.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // Set the token in the API client
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await apiClient.get('/auth/me');
          setAuthState({
            isAuthenticated: true,
            user: response.data.data || response.data.user,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('accessToken');
          delete apiClient.defaults.headers.common['Authorization'];
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: error.response?.data?.message || 'Failed to authenticate',
          });
        }
      } else {
        // No token, not authenticated
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const setAccessToken = (token) => {
    if (token) {
      localStorage.setItem('accessToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
      }));
    }
  };

  const getAccessToken = () => {
    return localStorage.getItem('accessToken');
  };

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setAuthState(prev => ({
        ...prev,
        user: response.data.data || response.data.user,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to fetch user data',
      }));
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  };

  const value = {
    ...authState,
    setAccessToken,
    getAccessToken,
    fetchUserData,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};