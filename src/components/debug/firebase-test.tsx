'use client';

import { useUser } from '@clerk/nextjs';
import { useUserProfileClient } from '@/hooks/use-user-profile-client';

export function UserConnectionTest() {
  const { isSignedIn, user } = useUser();
  const { profile, loading, error } = useUserProfileClient();

  if (!isSignedIn) {
    return <div className="p-4 bg-yellow-100 rounded">Please sign in to test user profile</div>;
  }

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <h3 className="font-semibold">User Profile Status</h3>
      
      {loading && (
        <div className="text-blue-600">🔄 Loading user profile...</div>
      )}
      
      {profile && (
        <div className="text-green-600">
          ✅ User profile loaded successfully
          <br />
          <small>User ID: {user?.id}</small>
          <br />
          <small>Primary Currency: {profile.primaryCurrency}</small>
          <br />
          <small>Theme: {profile.preferences.theme}</small>
        </div>
      )}
      
      {error && (
        <div className="text-red-600">
          ❌ User profile error
          <br />
          <small>{error}</small>
        </div>
      )}
    </div>
  );
}
