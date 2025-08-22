"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signIn, signOut, registerUser, signInWithGoogle, resetPassword as firebaseResetPassword } from '@/lib/firebase/auth';
import { registerDevice, canUseDevice, updateDeviceLastActive, generateDeviceId } from '@/lib/firebase/device-manager';
import { createUserProfile, getUserProfile } from '@/lib/firebase/subscription-manager';
import type { UserProfile } from '@/lib/firebase/subscription-manager';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  deviceAllowed: boolean;
  currentDeviceId: string | null;
  login: (email: string, password: string) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>; // Alias para login
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<boolean>;
  register: (email: string, password: string) => Promise<User>;
  registerWithEmail: (email: string, password: string) => Promise<User>; // Alias para register
  resetPassword: (email: string) => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceAllowed, setDeviceAllowed] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
    
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user && typeof window !== 'undefined') {
        // Crear o actualizar perfil de usuario
        await createUserProfile(user.uid, user.email || '', user.displayName || '');
        
        // Obtener perfil completo
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        
        // Obtener ID del dispositivo actual
        const deviceId = generateDeviceId();
        setCurrentDeviceId(deviceId);
        
        // Verificar si el dispositivo está permitido
        const allowed = await canUseDevice(user.uid);
        setDeviceAllowed(allowed);
        
        // Si está permitido, registrar/actualizar el dispositivo
        if (allowed && deviceId) {
          await registerDevice(user.uid);
        }
      } else {
        setUserProfile(null);
        setDeviceAllowed(true);
        setCurrentDeviceId(null);
      }
      
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
      userProfile,
      loading, 
      deviceAllowed,
      currentDeviceId,
      login, 
      loginWithEmail, 
      loginWithGoogle, 
      logout, 
      register, 
      registerWithEmail, 
      resetPassword,
      refreshUserProfile
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