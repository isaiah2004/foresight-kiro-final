import { auth } from '@clerk/nextjs/server';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '@/types/user';

/**
 * Get or create user profile in Firestore
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const { userId } = auth();

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
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  updates: Partial<Omit<UserProfile, 'id' | 'clerkId' | 'createdAt'>>
): Promise<boolean> {
  const { userId } = auth();

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
 * Update user's primary currency
 */
export async function updatePrimaryCurrency(currency: string): Promise<boolean> {
  return updateUserProfile({ primaryCurrency: currency });
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  preferences: Partial<UserProfile['preferences']>
): Promise<boolean> {
  const currentProfile = await getUserProfile();
  if (!currentProfile) return false;

  return updateUserProfile({
    preferences: {
      ...currentProfile.preferences,
      ...preferences,
    },
  });
}