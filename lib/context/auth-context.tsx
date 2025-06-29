"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signIn, signOut, registerUser, signInWithGoogle, resetPassword as firebaseResetPassword } from '@/lib/firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>; // Alias para login
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<boolean>;
  register: (email: string, password: string) => Promise<User>;
  registerWithEmail: (email: string, password: string) => Promise<User>; // Alias para register
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  const loginWithEmail = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  const loginWithGoogle = async () => {
    return await signInWithGoogle();
  };

  const logout = async () => {
    return await signOut();
  };

  const register = async (email: string, password: string) => {
    return await registerUser(email, password);
  };

  const registerWithEmail = async (email: string, password: string) => {
    return await registerUser(email, password);
  };

  const resetPassword = async (email: string) => {
    return await firebaseResetPassword(email);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithEmail, 
      loginWithGoogle, 
      logout, 
      register, 
      registerWithEmail, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 