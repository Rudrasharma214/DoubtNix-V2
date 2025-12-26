import { useMutation } from '@tanstack/react-query';
import { login, register } from '../../services/auth.service.js';


export const useRegister = () => {
  return useMutation({
    mutationFn: (userData) => register(userData),
  });
}

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials) => login(credentials),
  });
};