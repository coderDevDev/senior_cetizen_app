'use client';

import React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData
} from '@/types/auth';
import { AuthAPI } from '@/lib/api/auth';
import { ProfileAPI } from '@/lib/api/profiles';

const AuthContext = createContext<{
  authState: AuthState;
  user: User | null;
  login: (
    email: string,
    password: string,
    role?: 'student' | 'teacher'
  ) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (
    data: ForgotPasswordData
  ) => Promise<{ success: boolean; message: string }>;
  updateProfile: (
    updates: Partial<User>
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  clearError: () => void;
} | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check for current user on mount
    const checkCurrentUser = async () => {
      try {
        const { user, session } = await AuthAPI.getCurrentUser();

        if (user && session) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error checking current user:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkCurrentUser();
  }, []);

  const login = async (
    email: string,
    password: string,
    role: 'student' | 'teacher'
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const credentials: LoginCredentials = {
        email,
        password,
        role // Include the selected role if provided
      };
      const result = await AuthAPI.login(credentials);

      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));
      }

      return {
        success: result.success,
        message: result.message,
        user: result.user || undefined
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, message: errorMessage };
    }
  };

  const register = async (
    data: RegisterData
  ): Promise<{ success: boolean; message: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await AuthAPI.register(data);

      if (result.success && result.user) {
        console.log(
          'Registration successful, setting user in auth state:',
          result.user
        );
        // Auto-login after successful registration for immediate onboarding
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        console.log('Registration failed:', result.message);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, message: errorMessage };
    }
  };

  const forgotPassword = async (
    data: ForgotPasswordData
  ): Promise<{ success: boolean; message: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await AuthAPI.resetPassword(data.email);

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Password reset failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const updateProfile = async (
    updates: Partial<User>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Use ProfileAPI for profile updates
      const result = await ProfileAPI.updateProfile(updates as any);

      if (result.success && result.user) {
        setAuthState(prev => ({
          ...prev,
          user: result.user || null
        }));
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Profile update failed';
      return { success: false, message: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        user: authState.user,
        login,
        register,
        forgotPassword,
        updateProfile,
        logout,
        clearError
      }}>
      {children}
    </AuthContext.Provider>
  );
}
