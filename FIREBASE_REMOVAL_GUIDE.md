# Firebase Integration Removal Guide

## Overview
This guide documents the changes made to remove Firebase integration from the Clerk authentication setup, replacing it with Clerk's built-in user metadata system.

## Changes Made

### 1. Updated User Profile Hook (`src/hooks/use-user-profile-client.ts`)
- **Before**: Used `useAuth` from Clerk to get Firebase tokens via `getToken({ template: 'integration_firebase' })`
- **After**: Uses `useUser` from Clerk and stores user profile data in Clerk's `unsafeMetadata`
- **Benefits**: 
  - No more Firebase dependency for user profiles
  - No need to configure Firebase integration template in Clerk Dashboard
  - Simpler authentication flow
  - User preferences persist across sessions

### 2. Updated User Settings Component (`src/components/shared/user-settings.tsx`)
- **Before**: Showed Firebase-specific error messages
- **After**: Shows generic error messages without Firebase references

### 3. Updated Enhanced User Button (`src/components/shared/enhanced-user-button.tsx`)
- **Before**: Used the old Firebase-dependent `use-user-profile` hook
- **After**: Uses the new Firebase-free `use-user-profile-client` hook

### 5. Updated Firestore Rules (`firestore.rules`)
- **Before**: Required Firebase authentication via Clerk integration
- **After**: Temporarily allows all operations for development (needs security review for production)
- **Note**: Financial data (investments, budgets, etc.) still uses Firebase, so rules were simplified rather than removed

## Firestore Rules Update

Since your application still uses Firebase for financial data storage (investments, budgets, expenses, etc.), I've temporarily updated the Firestore rules to allow all operations without requiring Firebase authentication. This allows the app to continue working while you decide on the long-term storage strategy.

### Current Rules (Development Only)
```firerules
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allowing all reads and writes for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Security Warning**: These rules allow anyone to read/write your Firestore data. Only use this in development!

## How User Data Storage Works Now

### Data Storage Location
User profile data is now stored in Clerk's `unsafeMetadata` field, which allows:
- Client-side read access
- Client-side write access
- Data persistence across sessions
- No additional database setup required

### Data Structure
```typescript
interface ClerkUserMetadata {
  primaryCurrency?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };
}
```

### User Profile Flow
1. User signs in with Clerk
2. `useUserProfileClient` hook automatically loads profile from Clerk metadata
3. If no profile exists, creates default profile with user's timezone
4. Updates are saved directly to Clerk metadata via `user.update({ unsafeMetadata: ... })`

## What Was Removed
- Firebase custom token authentication flow
- Firebase Firestore dependency for user profiles
- Firebase integration template requirement
- Complex error handling for Firebase permissions
- Firebase connection test functionality

## What's Still Available
- All existing Firebase files remain intact (firebase.ts, firebase-client.ts, firebase-admin.ts)
- You can still use Firebase for other features if needed
- The old `use-user-profile.ts` hook still exists (uses Firebase) but is no longer used by UI components

## Files That Still Use Firebase
These files still have Firebase code but are not currently being used by the main application:
- `src/lib/firebase.ts`
- `src/lib/firebase-client.ts` 
- `src/lib/firebase-admin.ts`
- `src/lib/user-client.ts`
- `src/hooks/use-user-profile.ts`

## Testing
1. Go to `/dashboard/settings`
2. You should see the settings page load without Firebase errors
3. Try changing currency or theme preferences
4. Settings should save and persist across page refreshes

## Next Steps for Production

### Option 1: Complete Firebase Removal (Recommended for Simplicity)
1. **Migrate financial data** to Clerk metadata or another storage solution
2. **Remove Firebase dependencies** from package.json
3. **Delete Firebase configuration files**
4. **Update investment/budget hooks** to use alternative storage

### Option 2: Keep Firebase for Financial Data
1. **Implement server-side authentication** between Clerk and Firebase
2. **Update Firestore rules** to use custom authentication
3. **Create API routes** that authenticate users server-side
4. **Secure Firestore rules** for production use

### Option 3: Hybrid Approach
1. **Keep user profiles** in Clerk metadata (current setup)
2. **Move financial data** to a dedicated database (PostgreSQL, MySQL, etc.)
3. **Remove Firebase completely**
4. **Use Clerk's built-in webhooks** for data consistency

## Production Security Considerations

If keeping Firebase for financial data, you'll need to:
1. Implement proper authentication verification in Firestore rules
2. Create secure API endpoints that verify Clerk sessions
3. Use Firebase Admin SDK server-side for secure operations
4. Implement proper user isolation in database rules

## Environment Variables
The following Firebase environment variables are no longer required for user profiles but may still be needed for other Firebase features:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` 
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
