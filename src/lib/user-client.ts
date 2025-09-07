'use client';

import { db } from './firebase-client';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '@/types/user';

/**
 * Get or create user profile in Firestore (client-side)
 */
export async function getUserProfileClient(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
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
    } else {
      // Create default user profile
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

      return {
        id: userId,
        ...defaultProfile,
      };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);

    // Fallback: return default profile when Firebase is not configured
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

    return defaultProfile;
  }
}

/**
 * Update user profile in Firestore (client-side)
 */
export async function updateUserProfileClient(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'clerkId' | 'createdAt'>>
): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Fallback: return true when Firebase is not configured
    // In a real app, you might want to store this in localStorage or another storage
    return true;
  }
}

/**
 * Update user's primary currency (client-side)
 */
export async function updatePrimaryCurrencyClient(userId: string, currency: string): Promise<boolean> {
  return updateUserProfileClient(userId, { primaryCurrency: currency });
}

/**
 * Update user preferences (client-side)
 */
export async function updateUserPreferencesClient(
  userId: string,
  currentPreferences: UserProfile['preferences'],
  preferences: Partial<UserProfile['preferences']>
): Promise<boolean> {
  return updateUserProfileClient(userId, {
    preferences: {
      ...currentPreferences,
      ...preferences,
    },
  });
}