import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
  });


};