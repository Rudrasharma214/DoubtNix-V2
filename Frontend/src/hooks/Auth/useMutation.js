import { useMutation } from '@tanstack/react-query';
import { 
  login,
  register, 
  verifyEmail, 
  verifyLoginEmail,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
} from '../../services/auth.service.js';


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

export const useEmailverification = () => {
  return useMutation({
    mutationFn: (otpData) => verifyEmail(otpData),
  });
};

export const useLoginVerification = () => {
  return useMutation({
    mutationFn: (otpData) => verifyLoginEmail(otpData),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => {
      return logout();
    },
  }); 
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => {
      return changePassword(data);
    },
  });
};

export const useForgotPassword = (email) => {
  return useMutation({
    mutationFn: (email) => {
      return forgotPassword(email);
    },
  });
};

export const useResetPassword = (data) => {
  return useMutation({
    mutationFn: (data) => {
      return resetPassword(data);
    },
  });
};