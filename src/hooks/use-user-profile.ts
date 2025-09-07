'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserProfile } from '@/types/user';
import { getUserProfileClient, updateUserProfileClient, updatePrimaryCurrencyClient, updateUserPreferencesClient } from '@/lib/user-client';

export function useUserProfile() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!isLoaded) {
        return;
      }

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profileData = await getUserProfileClient(user.id);
        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, isLoaded]);

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'clerkId' | 'createdAt'>>) => {
    if (!user) return false;
    
    try {
      setError(null);
      const success = await updateUserProfileClient(user.id, updates);
      
      if (success && profile) {
        // Update local state
        setProfile({
          ...profile,
          ...updates,
          updatedAt: new Date(),
        });
      }
      
      return success;
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const updatePrimaryCurrencyFn = async (currency: string) => {
    if (!user) return false;
    
    try {
      setError(null);
      const success = await updatePrimaryCurrencyClient(user.id, currency);
      
      if (success && profile) {
        setProfile({
          ...profile,
          primaryCurrency: currency,
          updatedAt: new Date(),
        });
      }
      
      return success;
    } catch (err) {
      console.error('Error updating primary currency:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    if (!profile || !user) return false;
    
    try {
      setError(null);
      const success = await updateUserPreferencesClient(user.id, profile.preferences, preferences);
      
      if (success) {
        setProfile({
          ...profile,
          preferences: {
            ...profile.preferences,
            ...preferences,
          },
          updatedAt: new Date(),
        });
      }
      
      return success;
    } catch (err) {
      console.error('Error updating user preferences:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    updatePrimaryCurrency: updatePrimaryCurrencyFn,
    updatePreferences,
    isAuthenticated: !!user,
  };
}