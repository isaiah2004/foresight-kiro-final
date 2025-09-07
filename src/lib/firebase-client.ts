import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { useAuth } from '@clerk/nextjs';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const db = getFirestore(app);
export const firebaseAuth = getAuth(app);

/**
 * Custom hook to authenticate with Firebase using Clerk token
 */
export function useFirebaseAuth() {
  const { getToken, isSignedIn } = useAuth();
  
  const signInToFirebase = async () => {
    if (!isSignedIn) {
      throw new Error('User is not signed in to Clerk');
    }
    
    try {
      // Get the Firebase token from Clerk
      const token = await getToken({ template: 'integration_firebase' });
      
      if (!token) {
        throw new Error('Failed to get Firebase token from Clerk');
      }
      
      // Sign in to Firebase with the custom token
      await signInWithCustomToken(firebaseAuth, token);
      
      return firebaseAuth.currentUser;
    } catch (error) {
      console.error('Failed to sign in to Firebase:', error);
      throw error;
    }
  };
  
  return { signInToFirebase, firebaseAuth };
}

export default app;
