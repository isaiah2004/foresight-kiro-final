'use client';

import { useAuth } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signInWithCustomToken, getAuth } from 'firebase/auth';
import { UserProfile } from '@/types/user';
import { useState, useCallback, useEffect } from 'react';

export function useUserProfileClient() {
  const { getToken, userId, isSignedIn } = useAuth();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign in to Firebase with Clerk token
  const signInToFirebase = useCallback(async () => {
    if (!isSignedIn || !userId) {
      throw new Error('User is not signed in to Clerk');
    }
    
    if (firebaseUser) {
      return firebaseUser;
    }

    setIsConnecting(true);
    try {
      console.log('🔄 Attempting to get Firebase token from Clerk...');
      
      // Get the Firebase token from Clerk
      const token = await getToken({ template: 'integration_firebase' });
      
      console.log('🔍 Firebase token result:', token ? 'Token received' : 'No token received');
      
      if (!token) {
        console.error('❌ No Firebase token received from Clerk');
        throw new Error('Failed to get Firebase token from Clerk. Make sure you have configured the Firebase integration template named "integration_firebase" in your Clerk Dashboard.');
      }
      
      console.log('🔄 Signing into Firebase with custom token...');
      
      // Sign in to Firebase with the custom token
      const auth = getAuth();
      const result = await signInWithCustomToken(auth, token);
      setFirebaseUser(result.user);
      
      console.log('✅ Successfully signed into Firebase:', result.user?.uid);
      
      return result.user;
    } catch (error: any) {
      console.error('❌ Failed to sign in to Firebase:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isSignedIn, userId, getToken, firebaseUser]);

  // Get user profile from Firestore
  const getUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!userId) return null;

    setLoading(true);
    setError(null);

    try {
      console.log('📖 Getting user profile for userId:', userId);
      
      // Try to sign into Firebase, but continue even if it fails
      let firebaseAuthWorked = false;
      try {
        await signInToFirebase();
        firebaseAuthWorked = true;
        console.log('✅ Firebase authentication successful');
      } catch (firebaseError: any) {
        console.warn('⚠️  Firebase authentication failed, continuing without it:', firebaseError.message);
        console.log('📝 This is expected if Clerk-Firebase integration needs configuration');
      }

      const userDocRef = doc(db, 'users', userId);
      console.log('🔍 Fetching document from Firestore...');
      
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log('✅ User document found in Firestore');
        const data = userDoc.data();
        const userProfile: UserProfile = {
          id: userDoc.id,
          clerkId: userId,
          primaryCurrency: data.primaryCurrency || 'USD',
          preferences: {
            theme: data.preferences?.theme || 'system',
            language: data.preferences?.language || 'en',
            timezone: data.preferences?.timezone || 'UTC',
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
        setProfile(userProfile);
        return userProfile;
      } else {
        console.log('📝 User document not found, creating default profile...');
        
        // If we can't authenticate with Firebase, just return a default profile
        // without trying to save it to Firestore
        if (!firebaseAuthWorked) {
          console.log('⚠️  Returning default profile without saving to Firestore');
          const defaultProfile: UserProfile = {
            id: userId,
            clerkId: userId,
            primaryCurrency: 'USD',
            preferences: {
              theme: 'system',
              language: 'en',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setProfile(defaultProfile);
          return defaultProfile;
        }
        
        // Create default user profile in Firestore
        const defaultProfile: Omit<UserProfile, 'id'> = {
          clerkId: userId,
          primaryCurrency: 'USD',
          preferences: {
            theme: 'system',
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(userDocRef, {
          ...defaultProfile,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const newProfile: UserProfile = {
          id: userId,
          ...defaultProfile,
        };
        setProfile(newProfile);
        console.log('✅ Created new user profile in Firestore');
        return newProfile;
      }
    } catch (error: any) {
      console.error('❌ Error getting user profile:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
      });
      
      // If it's a permission error and we have the userId, return a default profile
      if (error.code === 'permission-denied' && userId) {
        console.log('🔄 Permission denied, returning local default profile');
        const fallbackProfile: UserProfile = {
          id: userId,
          clerkId: userId,
          primaryCurrency: 'USD',
          preferences: {
            theme: 'system',
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setProfile(fallbackProfile);
        setError('Using local settings. Firebase integration needs configuration.');
        return fallbackProfile;
      }
      
      // Set a more user-friendly error message based on the error type
      if (error.code === 'permission-denied') {
        setError('Firebase permission denied. Check your Clerk-Firebase integration setup.');
      } else if (error.code === 'unavailable') {
        setError('Firebase service unavailable. Please try again later.');
      } else {
        setError(error.message || 'Failed to get user profile');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, signInToFirebase]);

  // Update user profile in Firestore
  const updateUserProfile = useCallback(async (
    updates: Partial<Omit<UserProfile, 'id' | 'clerkId' | 'createdAt'>>
  ): Promise<boolean> => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      console.log('📝 Updating user profile for userId:', userId, 'with updates:', updates);
      
      // Try to sign into Firebase first, but don't fail if it doesn't work
      try {
        await signInToFirebase();
        console.log('✅ Firebase authentication successful for update');
      } catch (firebaseError: any) {
        console.warn('⚠️  Firebase authentication failed for update, but continuing:', firebaseError.message);
      }

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: new Date(),
      });

      console.log('✅ User profile updated successfully');
      
      // Refresh the profile
      await getUserProfile();
      return true;
    } catch (error: any) {
      console.error('❌ Error updating user profile:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
      });
      
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check your Clerk-Firebase integration setup.');
      } else if (error.code === 'unavailable') {
        setError('Firebase service unavailable. Please try again later.');
      } else {
        setError(error.message || 'Failed to update user profile');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, signInToFirebase, getUserProfile]);

  // Auto-load profile when user signs in
  useEffect(() => {
    if (isSignedIn && userId && !profile && !loading) {
      getUserProfile();
    }
  }, [isSignedIn, userId, profile, loading, getUserProfile]);

  return {
    profile,
    loading,
    error,
    isConnecting,
    firebaseUser,
    getUserProfile,
    updateUserProfile,
    signInToFirebase,
  };
}
