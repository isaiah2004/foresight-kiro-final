'use client';

import { useUser } from '@clerk/nextjs';
import { useFirebaseAuth } from '@/lib/firebase-client';
import { useEffect, useState, useCallback } from 'react';

export function FirebaseConnectionTest() {
  const { isSignedIn } = useUser();
  const { signInToFirebase, firebaseAuth } = useFirebaseAuth();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToFirebase = useCallback(async () => {
    if (!isSignedIn) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const user = await signInToFirebase();
      setFirebaseUser(user);
      console.log('✅ Successfully connected to Firebase:', user?.uid);
    } catch (error: any) {
      console.error('❌ Firebase connection failed:', error);
      setConnectionError(error.message || 'Failed to connect to Firebase');
    } finally {
      setIsConnecting(false);
    }
  }, [isSignedIn, signInToFirebase]);

  useEffect(() => {
    if (isSignedIn && !firebaseUser && !isConnecting) {
      connectToFirebase();
    }
  }, [isSignedIn, firebaseUser, isConnecting, connectToFirebase]);

  if (!isSignedIn) {
    return <div className="p-4 bg-yellow-100 rounded">Please sign in to test Firebase connection</div>;
  }

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <h3 className="font-semibold">Firebase Connection Status</h3>
      
      {isConnecting && (
        <div className="text-blue-600">🔄 Connecting to Firebase...</div>
      )}
      
      {firebaseUser && (
        <div className="text-green-600">
          ✅ Connected to Firebase
          <br />
          <small>Firebase UID: {firebaseUser.uid}</small>
        </div>
      )}
      
      {connectionError && (
        <div className="text-red-600">
          ❌ Firebase connection failed
          <br />
          <small>{connectionError}</small>
        </div>
      )}
      
      {!isConnecting && !firebaseUser && !connectionError && (
        <button 
          onClick={connectToFirebase}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Firebase Connection
        </button>
      )}
    </div>
  );
}
