
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { supabaseService } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if a user was logged in previously
    const storedUsername = sessionStorage.getItem('bat_trung_username');
    if (storedUsername) {
        return supabaseService.getUser(storedUsername);
    }
    return null;
  });

  const login = useCallback((name: string) => {
    const userData = supabaseService.loginOrRegister(name);
    sessionStorage.setItem('bat_trung_username', name);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('bat_trung_username');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
      setUser(updatedUser);
      // The service already persists the user, so we just update the state
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
