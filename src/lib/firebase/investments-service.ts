/**
 * Firebase Investments Service
 * 
 * This service provides CRUD operations for investment data in Firebase Firestore
 * following the user-specific collection structure.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './config';
import { Investment } from '@/types/financial';

/**
 * Get investments collection reference for a user
 */
const getInvestmentsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'investments');
};

/**
 * Ensure Firebase auth is available (sign in anonymously if needed)
 */
const ensureFirebaseAuth = async (): Promise<void> => {
  try {
    if (!auth.currentUser) {
      console.log('No Firebase user found, signing in anonymously...');
      await signInAnonymously(auth);
      console.log('Successfully signed in anonymously to Firebase');
    }
  } catch (error) {
    console.warn('Firebase anonymous auth failed, continuing without auth:', error);
    // Continue without auth - the rules should still allow some operations
  }
};

/**
 * Convert Firestore investment data to Investment type
 */
const convertFirestoreToInvestment = (data: any, id: string): Investment => {
  return {
    ...data,
    id,
    purchaseDate: data.purchaseDate.toDate(),
    lastSyncTimestamp: data.lastSyncTimestamp.toDate(),
  };
};

/**
 * Convert Investment type to Firestore data
 */
const convertInvestmentToFirestore = (investment: Omit<Investment, 'id'>): any => {
  return {
    ...investment,
    purchaseDate: Timestamp.fromDate(investment.purchaseDate),
    lastSyncTimestamp: Timestamp.fromDate(investment.lastSyncTimestamp),
  };
};

/**
 * Load all investments for a user
 */
export const loadUserInvestments = async (userId: string): Promise<Investment[]> => {
  try {
    // Ensure Firebase auth is available
    await ensureFirebaseAuth();
    
    const investmentsRef = getInvestmentsCollection(userId);
    const q = query(investmentsRef, orderBy('purchaseDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => 
      convertFirestoreToInvestment(doc.data(), doc.id)
    );
  } catch (error) {
    console.error('Error loading user investments:', error);
    throw new Error('Failed to load investments');
  }
};

/**
 * Add a new investment
 */
export const addInvestment = async (
  userId: string, 
  investmentData: Omit<Investment, 'id' | 'userId'>
): Promise<string> => {
  try {
    // Ensure Firebase auth is available
    await ensureFirebaseAuth();
    
    const investmentsRef = getInvestmentsCollection(userId);
    const firestoreData = convertInvestmentToFirestore({
      ...investmentData,
      userId
    });
    
    const docRef = await addDoc(investmentsRef, firestoreData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding investment:', error);
    throw new Error('Failed to add investment');
  }
};

/**
 * Update an existing investment
 */
export const updateInvestment = async (
  userId: string,
  investmentId: string,
  updates: Partial<Omit<Investment, 'id' | 'userId'>>
): Promise<void> => {
  try {
    // Ensure Firebase auth is available
    await ensureFirebaseAuth();
    
    const investmentRef = doc(getInvestmentsCollection(userId), investmentId);
    
    // Convert dates to Timestamps for any date fields in updates
    const firestoreUpdates: any = { ...updates };
    if (updates.purchaseDate) {
      firestoreUpdates.purchaseDate = Timestamp.fromDate(updates.purchaseDate);
    }
    if (updates.lastSyncTimestamp) {
      firestoreUpdates.lastSyncTimestamp = Timestamp.fromDate(updates.lastSyncTimestamp);
    }
    
    await updateDoc(investmentRef, firestoreUpdates);
  } catch (error) {
    console.error('Error updating investment:', error);
    throw new Error('Failed to update investment');
  }
};

/**
 * Delete an investment
 */
export const deleteInvestment = async (
  userId: string,
  investmentId: string
): Promise<void> => {
  try {
    // Ensure Firebase auth is available
    await ensureFirebaseAuth();
    
    const investmentRef = doc(getInvestmentsCollection(userId), investmentId);
    await deleteDoc(investmentRef);
  } catch (error) {
    console.error('Error deleting investment:', error);
    throw new Error('Failed to delete investment');
  }
};

/**
 * Get a single investment by ID
 */
export const getInvestment = async (
  userId: string,
  investmentId: string
): Promise<Investment | null> => {
  try {
    // Ensure Firebase auth is available
    await ensureFirebaseAuth();
    
    const investmentRef = doc(getInvestmentsCollection(userId), investmentId);
    const docSnap = await getDoc(investmentRef);
    
    if (docSnap.exists()) {
      return convertFirestoreToInvestment(docSnap.data(), docSnap.id);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting investment:', error);
    throw new Error('Failed to get investment');
  }
};

/**
 * Update multiple investments (useful for price updates)
 */
export const updateMultipleInvestments = async (
  userId: string,
  updates: Array<{ id: string; data: Partial<Omit<Investment, 'id' | 'userId'>> }>
): Promise<void> => {
  try {
    const promises = updates.map(({ id, data }) => 
      updateInvestment(userId, id, data)
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error updating multiple investments:', error);
    throw new Error('Failed to update investments');
  }
};

/**
 * Get investments by type
 */
export const getInvestmentsByType = async (
  userId: string,
  type: Investment['type']
): Promise<Investment[]> => {
  try {
    // Ensure Firebase auth is available
    await ensureFirebaseAuth();
    
    const investmentsRef = getInvestmentsCollection(userId);
    const q = query(
      investmentsRef, 
      where('type', '==', type),
      orderBy('purchaseDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => 
      convertFirestoreToInvestment(doc.data(), doc.id)
    );
  } catch (error) {
    console.error('Error getting investments by type:', error);
    throw new Error('Failed to get investments by type');
  }
};

/**
 * Migrate localStorage data to Firebase (helper for existing users)
 */
export const migrateLocalStorageToFirebase = async (
  userId: string,
  localStorageKey: string
): Promise<{ success: boolean; migratedCount: number; errors: string[] }> => {
  const result = {
    success: false,
    migratedCount: 0,
    errors: [] as string[]
  };

  try {
    // Ensure Firebase auth is available
    await ensureFirebaseAuth();
    // Check if there's data in localStorage
    const stored = localStorage.getItem(localStorageKey);
    if (!stored) {
      result.success = true;
      return result;
    }

    const localInvestments = JSON.parse(stored);
    if (!Array.isArray(localInvestments) || localInvestments.length === 0) {
      result.success = true;
      return result;
    }

    // Check if user already has data in Firebase
    const existingInvestments = await loadUserInvestments(userId);
    if (existingInvestments.length > 0) {
      result.errors.push('User already has investments in Firebase, skipping migration');
      result.success = true;
      return result;
    }

    // Migrate each investment
    for (const localInvestment of localInvestments) {
      try {
        // Convert localStorage format to proper Investment format
        const investmentData: Omit<Investment, 'id' | 'userId'> = {
          symbol: localInvestment.symbol,
          type: localInvestment.type,
          quantity: localInvestment.quantity,
          purchasePrice: localInvestment.purchasePrice,
          purchaseCurrency: localInvestment.purchaseCurrency,
          purchaseDate: new Date(localInvestment.purchaseDate),
          lastSyncedPrice: localInvestment.lastSyncedPrice,
          lastSyncedPriceCurrency: localInvestment.lastSyncedPriceCurrency,
          lastSyncTimestamp: new Date(localInvestment.lastSyncTimestamp),
          currentValue: localInvestment.currentValue
        };

        await addInvestment(userId, investmentData);
        result.migratedCount++;
      } catch (error) {
        result.errors.push(`Failed to migrate investment ${localInvestment.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Clear localStorage after successful migration
    if (result.migratedCount > 0 && result.errors.length === 0) {
      localStorage.removeItem(localStorageKey);
    }

    result.success = true;
    console.log(`Successfully migrated ${result.migratedCount} investments to Firebase`);
    
  } catch (error) {
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Error migrating localStorage to Firebase:', error);
  }

  return result;
};
