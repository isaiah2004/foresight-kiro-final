/**
 * Firebase Configuration
 * 
 * This module initializes and configures Firebase for the Foresight application.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Get Firebase configuration from environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

// Validate Firebase configuration
const validateFirebaseConfig = (config: FirebaseConfig): boolean => {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  return requiredFields.every(field => config[field] && config[field].length > 0);
};

// Initialize Firebase app
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    if (!validateFirebaseConfig(firebaseConfig)) {
      throw new Error('Invalid Firebase configuration. Please check your environment variables.');
    }
    
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize Firestore
  db = getFirestore(app);
  
  // Initialize Auth
  auth = getAuth(app);

  // Connect to Firestore emulator in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firestore emulator');
    } catch (error) {
      console.warn('Failed to connect to Firestore emulator:', error);
    }
  }

} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

// Export Firebase instances
export { app, db, auth };

// Export configuration for testing
export { firebaseConfig };

// Export utility functions
export const isFirebaseConfigured = (): boolean => {
  return validateFirebaseConfig(firebaseConfig);
};

export const getFirebaseProjectId = (): string => {
  return firebaseConfig.projectId;
};

export const isEmulatorMode = (): boolean => {
  return process.env.NODE_ENV === 'development' && 
         process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
};