import { useContext } from 'react';
import { AuthContext } from '../../context/authContext.jsx';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Return null instead of throwing so components can handle gracefully
  if (!context) {
    console.warn('useAuth must be used within an AuthProvider');
    return null;
  }
  
  return context;
};
