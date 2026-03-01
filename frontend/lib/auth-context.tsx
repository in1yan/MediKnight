'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, SignupData } from './types';
import { ROLE_PERMISSIONS } from './constants';
import { authApi, ApiUser, SignupPayload } from './api';

interface AuthContextType {
  user: User | null;
  pendingEmail: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ requiresMfa: boolean; role?: string }>;
  signup: (data: SignupData) => Promise<void>;
  verifyMfa: (token: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapApiUser(apiUser: ApiUser): User {
  const role = apiUser.role as UserRole;
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.full_name || apiUser.email,
    role,
    avatar: apiUser.avatar,
    permissions: ROLE_PERMISSIONS[role] || [],
    mfaEnabled: true,
    lastLogin: new Date().toISOString(),
    dateOfBirth: apiUser.date_of_birth,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) setUserState(JSON.parse(storedUser));
      const storedEmail = localStorage.getItem('auth_pending_email');
      if (storedEmail) setPendingEmail(storedEmail);
    } catch (error) {
      console.error('Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ requiresMfa: boolean; role?: string }> => {
    const result = await authApi.login(email, password);

    if (!result.mfa_required && result.access_token && result.user) {
      // Demo user — skip OTP, store session immediately
      const mappedUser = mapApiUser(result.user);
      setUserState(mappedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(mappedUser));
        localStorage.setItem('auth_access_token', result.access_token);
        localStorage.setItem('auth_refresh_token', result.refresh_token!);
        localStorage.removeItem('auth_pending_email');
      }
      return { requiresMfa: false, role: result.user.role };
    }

    // Regular user — needs OTP
    setPendingEmail(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_pending_email', email);
    }
    return { requiresMfa: true };
  };

  const signup = async (data: SignupData) => {
    const payload: SignupPayload = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      date_of_birth: data.date_of_birth,
      // role is determined server-side from the whitelist
    };
    await authApi.signup(payload);
    // After signup, always proceed to MFA
    setPendingEmail(data.email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_pending_email', data.email);
    }
  };

  const verifyMfa = async (token: string): Promise<User> => {
    if (!pendingEmail) throw new Error('No pending login session');
    const result = await authApi.verifyMfa(pendingEmail, token);
    const mappedUser = mapApiUser(result.user);
    setUserState(mappedUser);
    setPendingEmail(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(mappedUser));
      localStorage.setItem('auth_access_token', result.access_token);
      localStorage.setItem('auth_refresh_token', result.refresh_token);
      localStorage.removeItem('auth_pending_email');
    }
    return mappedUser;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setUserState(null);
    setPendingEmail(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_pending_email');
      localStorage.removeItem('auth_access_token');
      localStorage.removeItem('auth_refresh_token');
    }
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser && typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
    }
  };

  const value: AuthContextType = {
    user,
    pendingEmail,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    verifyMfa,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

