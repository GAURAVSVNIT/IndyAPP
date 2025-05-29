import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './firebaseConfig';
import { Platform } from 'react-native';

const app = initializeApp(firebaseConfig);

// Initialize auth with different configurations based on platform
let auth;
if (Platform.OS === 'web') {
  // For web, use standard getAuth
  auth = getAuth(app);
} else {
  // For React Native, use AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export const firebaseAuth = auth;
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export default app;
