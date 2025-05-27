import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const firebaseAuth = auth;
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export default app;