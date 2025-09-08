'use client';

import { useUser } from '@clerk/nextjs';
import { UserProfile } from '@/types/user';
import { useState, useCallback, useEffect } from 'react';

// Define the shape of user metadata stored in Clerk
interface ClerkUserMetadata {
  primaryCurrency?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };
  [key: string]: any; // Allow additional properties
}

export function useUserProfileClient() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user profile from Clerk metadata
  const getUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      console.log('📖 Getting user profile from Clerk metadata for user:', user.id);
      
      // Get metadata from Clerk (stored in unsafeMetadata for client-side read/write)
      const metadata = (user.unsafeMetadata as ClerkUserMetadata) || {};
      
      const userProfile: UserProfile = {
        id: user.id,
        clerkId: user.id,
        primaryCurrency: metadata.primaryCurrency || 'USD',
        preferences: {
          theme: metadata.preferences?.theme || 'system',
          language: metadata.preferences?.language || 'en',
          timezone: metadata.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        },
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      };
      
      setProfile(userProfile);
      console.log('✅ User profile loaded from Clerk metadata');
      return userProfile;
      
    } catch (error: any) {
      console.error('❌ Error getting user profile:', error);
      setError(error.message || 'Failed to get user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update user profile in Clerk metadata
  const updateUserProfile = useCallback(async (
    updates: Partial<Omit<UserProfile, 'id' | 'clerkId' | 'createdAt'>>
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      console.log('📝 Updating user profile in Clerk metadata for user:', user.id, 'with updates:', updates);
      
      // Get current metadata
      const currentMetadata = (user.unsafeMetadata as ClerkUserMetadata) || {};
      
      // Prepare the updated metadata
      const updatedMetadata: ClerkUserMetadata = {
        ...currentMetadata,
      };
      
      // Update primary currency if provided
      if (updates.primaryCurrency !== undefined) {
        updatedMetadata.primaryCurrency = updates.primaryCurrency;
      }
      
      // Update preferences if provided
      if (updates.preferences !== undefined) {
        updatedMetadata.preferences = {
          ...currentMetadata.preferences,
          ...updates.preferences,
        };
      }
      
      // Update the user metadata in Clerk
      await user.update({
        unsafeMetadata: updatedMetadata,
      });

      console.log('✅ User profile updated successfully in Clerk metadata');
      
      // Refresh the profile
      await getUserProfile();
      return true;
      
    } catch (error: any) {
      console.error('❌ Error updating user profile:', error);
      setError(error.message || 'Failed to update user profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, getUserProfile]);

  // Auto-load profile when user is loaded
  useEffect(() => {
    if (isLoaded && user && !profile && !loading) {
      getUserProfile();
    }
  }, [isLoaded, user, profile, loading, getUserProfile]);

  return {
    profile,
    loading: loading || !isLoaded,
    error,
    getUserProfile,
    updateUserProfile,
    // Keep these for backward compatibility (now no-ops)
    isConnecting: false,
    firebaseUser: null,
    signInToFirebase: async () => null,
  };
}
