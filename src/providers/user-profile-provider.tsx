'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { UserProfile } from '@/types/user';

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'clerkId' | 'createdAt'>>) => Promise<boolean>;
  updatePrimaryCurrency: (currency: string) => Promise<boolean>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const userProfileData = useUserProfile();

  return (
    <UserProfileContext.Provider value={userProfileData}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfileContext() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }
  return context;
}