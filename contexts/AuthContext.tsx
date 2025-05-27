import React, { createContext, useState, useEffect, useRef } from 'react';
import { firebaseAuth } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';

interface AuthContextProps {
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (isMounted.current) {
        setUser(user);
        setIsInitialized(true);
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      
      if (isMounted.current) {
        setUser(userCredential.user);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (isMounted.current) {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      if (isMounted.current) {
        setUser(userCredential.user);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (isMounted.current) {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const signOut = async () => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    
    try {
      await firebaseSignOut(firebaseAuth);
      if (isMounted.current) {
        setUser(null);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      if (isMounted.current) {
        setError(error.message || 'Failed to sign out');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const resetPassword = async (email: string) => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (isMounted.current) {
        setError(error.message || 'Failed to send reset email');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    
    try {
      if (user) {
        await updateProfile(user, data);
        // Force refresh user to get updated profile
        if (isMounted.current) {
          setUser({ ...user });
        }
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      if (isMounted.current) {
        setError(error.message || 'Failed to update profile');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitialized,
        isLoading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}