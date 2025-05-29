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

// Set this to true to use mock authentication instead of Firebase
// This allows any email/password to work for development purposes
const USE_MOCK_AUTH = true;

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

// Helper function to create a mock user object that mimics Firebase User
const createMockUser = (email: string, displayName?: string): User => {
  return {
    uid: `mock-uid-${Date.now()}`,
    email,
    emailVerified: true,
    displayName: displayName || email.split('@')[0],
    isAnonymous: false,
    photoURL: null,
    providerData: [],
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    },
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({
      token: 'mock-token',
      signInProvider: 'password',
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      issuedAtTime: new Date().toISOString(),
      authTime: new Date().toISOString(),
      claims: {}
    }),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    providerId: 'firebase'
  } as User;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    if (USE_MOCK_AUTH) {
      // For mock auth, just initialize without waiting for Firebase
      setIsInitialized(true);
      return () => {
        isMounted.current = false;
      };
    } else {
      // Real Firebase auth
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
    }
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_AUTH) {
        // Create a mock user instead of using Firebase
        console.log('Using mock authentication for sign up');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        const mockUser = createMockUser(email, name);
        
        if (isMounted.current) {
          setUser(mockUser);
        }
      } else {
        // Real Firebase authentication
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        
        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        
        if (isMounted.current) {
          setUser(userCredential.user);
        }
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
      if (USE_MOCK_AUTH) {
        // Use mock authentication
        console.log('Using mock authentication for sign in');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        const mockUser = createMockUser(email);
        
        if (isMounted.current) {
          setUser(mockUser);
        }
      } else {
        // Real Firebase authentication
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (isMounted.current) {
          setUser(userCredential.user);
        }
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
      if (USE_MOCK_AUTH) {
        // Mock sign out
        console.log('Using mock authentication for sign out');
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        
        if (isMounted.current) {
          setUser(null);
        }
      } else {
        // Real Firebase sign out
        await firebaseSignOut(firebaseAuth);
        if (isMounted.current) {
          setUser(null);
        }
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
      if (USE_MOCK_AUTH) {
        // Mock password reset
        console.log('Using mock authentication for password reset');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        console.log(`Mock password reset email sent to ${email}`);
      } else {
        // Real Firebase password reset
        await sendPasswordResetEmail(firebaseAuth, email);
      }
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
        if (USE_MOCK_AUTH) {
          // Mock profile update
          console.log('Using mock authentication for profile update');
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
          
          // Update the mock user object
          const updatedUser = {
            ...user,
            displayName: data.displayName || user.displayName,
            photoURL: data.photoURL || user.photoURL
          };
          
          if (isMounted.current) {
            setUser(updatedUser as User);
          }
        } else {
          // Real Firebase profile update
          await updateProfile(user, data);
          // Force refresh user to get updated profile
          if (isMounted.current) {
            setUser({ ...user });
          }
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