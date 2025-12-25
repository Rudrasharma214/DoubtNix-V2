import api from './api.js';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
}

export const verifyEmail = async (data) => {
  const response = await api.get(`/auth/verify-email`, { data: { userId: data.userId, otp: data.otp } });
  return response.data;
}

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}

export const verifyLoginEmail = async (data) => {
  const response = await api.get(`/auth/verify-login-otp`, { data: { userId: data.userId, otp: data.otp } });
  return response.data;
}

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
}

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh-token');
  return response.data;
}