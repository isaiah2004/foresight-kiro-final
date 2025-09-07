// User-related type definitions

export interface UserProfile {
  id: string;
  clerkId: string;
  primaryCurrency: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}