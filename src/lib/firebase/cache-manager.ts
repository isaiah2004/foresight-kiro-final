/**
 * Firebase Cache Manager
 * 
 * This module implements the intelligent caching system for investment data.
 * It handles user-triggered cache updates and manages cache freshness.
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import {
  getCachedPrices,
  updateCachePrices,
  getCacheFreshness,
  isCacheFresh,
  getUserSyncTimestampsCollection,
  getCacheRequestsCollection,
  PriceCache
} from './cache-collections';

// User sync timestamp interface
export interface UserSyncTimestamp {
  userId: string;
  lastSyncTimestamp: Timestamp;
  portfolioSymbols: {
    stocks: string[];
    crypto: string[];
  };
  updatedAt: Timestamp;
}

// Cache update result interface
export interface CacheUpdateResult {
  success: boolean;
  updatedSymbols: string[];
  failedSymbols: string[];
  cacheHits: string[];
  apiCalls: number;
  errors: string[];
}

/**
 * Get user's last sync timestamp
 */
export const getUserSyncTimestamp = async (userId: string): Promise<UserSyncTimestamp | null> => {
  try {
    const userSyncDoc = doc(getUserSyncTimestampsCollection(), userId);
    const snapshot = await getDoc(userSyncDoc);
    
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as UserSyncTimestamp;
  } catch (error) {
    console.error('Error getting user sync timestamp:', error);
    return null;
  }
};

/**
 * Update user's sync timestamp
 */
export const updateUserSyncTimestamp = async (
  userId: string,
  portfolioSymbols: { stocks: string[]; crypto: string[] }
): Promise<void> => {
  try {
    const userSyncDoc = doc(getUserSyncTimestampsCollection(), userId);
    const syncData: UserSyncTimestamp = {
      userId,
      lastSyncTimestamp: Timestamp.now(),
      portfolioSymbols,
      updatedAt: Timestamp.now()
    };

    await setDoc(userSyncDoc, syncData);
  } catch (error) {
    console.error('Error updating user sync timestamp:', error);
    throw new Error('Failed to update user sync timestamp');
  }
};

/**
 * Check if user should use cached data
 */
export const shouldUseCachedData = async (
  userId: string,
  symbols: string[],
  type: 'stock' | 'crypto'
): Promise<{ useCache: boolean; freshSymbols: string[]; staleSymbols: string[] }> => {
  try {
    // Get user's last sync timestamp
    const userSync = await getUserSyncTimestamp(userId);
    
    if (!userSync) {
      // New user, no cached data available
      return {
        useCache: false,
        freshSymbols: [],
        staleSymbols: symbols
      };
    }

    // Get cache freshness for requested symbols
    const cacheFreshness = await getCacheFreshness(symbols, type);
    
    const freshSymbols: string[] = [];
    const staleSymbols: string[] = [];

    symbols.forEach(symbol => {
      const cacheTime = cacheFreshness.get(symbol);
      
      if (cacheTime && cacheTime > userSync.lastSyncTimestamp.toDate()) {
        // Cache is newer than user's last sync
        if (isCacheFresh(cacheTime)) {
          freshSymbols.push(symbol);
        } else {
          staleSymbols.push(symbol);
        }
      } else {
        // User's data is newer or equal to cache
        staleSymbols.push(symbol);
      }
    });

    return {
      useCache: freshSymbols.length > 0,
      freshSymbols,
      staleSymbols
    };
  } catch (error) {
    console.error('Error checking cache freshness:', error);
    return {
      useCache: false,
      freshSymbols: [],
      staleSymbols: symbols
    };
  }
};

/**
 * Get portfolio data with intelligent caching
 */
export const getPortfolioDataWithCache = async (
  userId: string,
  portfolioSymbols: { stocks: string[]; crypto: string[] }
): Promise<{
  stocks: Map<string, PriceCache>;
  crypto: Map<string, PriceCache>;
  cacheStats: {
    stockCacheHits: number;
    cryptoCacheHits: number;
    totalSymbols: number;
  };
}> => {
  try {
    // Check cache status for stocks
    const stockCacheStatus = await shouldUseCachedData(userId, portfolioSymbols.stocks, 'stock');
    const cryptoCacheStatus = await shouldUseCachedData(userId, portfolioSymbols.crypto, 'crypto');

    // Get cached data for fresh symbols
    const [stockCache, cryptoCache] = await Promise.all([
      getCachedPrices(stockCacheStatus.freshSymbols, 'stock'),
      getCachedPrices(cryptoCacheStatus.freshSymbols, 'crypto')
    ]);

    // For stale symbols, we would typically fetch from external APIs
    // For now, we'll return empty data for stale symbols
    // This will be implemented in task 7.3

    return {
      stocks: stockCache,
      crypto: cryptoCache,
      cacheStats: {
        stockCacheHits: stockCacheStatus.freshSymbols.length,
        cryptoCacheHits: cryptoCacheStatus.freshSymbols.length,
        totalSymbols: portfolioSymbols.stocks.length + portfolioSymbols.crypto.length
      }
    };
  } catch (error) {
    console.error('Error getting portfolio data with cache:', error);
    throw new Error('Failed to get portfolio data');
  }
};

/**
 * Request cache update for user's portfolio
 */
export const requestCacheUpdate = async (
  userId: string,
  portfolioSymbols: { stocks: string[]; crypto: string[] }
): Promise<CacheUpdateResult> => {
  const result: CacheUpdateResult = {
    success: false,
    updatedSymbols: [],
    failedSymbols: [],
    cacheHits: [],
    apiCalls: 0,
    errors: []
  };

  try {
    // Log the cache update request
    const requestDoc = doc(getCacheRequestsCollection());
    await setDoc(requestDoc, {
      userId,
      symbols: [...portfolioSymbols.stocks, ...portfolioSymbols.crypto],
      requestedAt: serverTimestamp(),
      status: 'processing'
    });

    // Import external API service dynamically to avoid circular dependencies
    const { externalApiService } = await import('@/lib/api/external-api-service');

    // Fetch stock data from external APIs
    if (portfolioSymbols.stocks.length > 0) {
      try {
        const stockResult = await externalApiService.fetchStockData(portfolioSymbols.stocks);
        result.apiCalls += stockResult.apiCallsUsed;
        
        stockResult.data.forEach((_, symbol) => {
          result.updatedSymbols.push(symbol);
        });

        stockResult.errors.forEach((error, symbol) => {
          if (symbol !== 'finnhub' && symbol !== 'alphavantage' && symbol !== 'cache') {
            result.failedSymbols.push(symbol);
            result.errors.push(`${symbol}: ${error}`);
          }
        });
      } catch (error) {
        console.error('Error fetching stock data:', error);
        result.errors.push(`Stock data fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.failedSymbols.push(...portfolioSymbols.stocks);
      }
    }

    // Fetch crypto data from external APIs
    if (portfolioSymbols.crypto.length > 0) {
      try {
        const cryptoResult = await externalApiService.fetchCryptoData(portfolioSymbols.crypto);
        result.apiCalls += cryptoResult.apiCallsUsed;
        
        cryptoResult.data.forEach((_, symbol) => {
          result.updatedSymbols.push(symbol);
        });

        cryptoResult.errors.forEach((error, symbol) => {
          if (symbol !== 'finnhub' && symbol !== 'alphavantage' && symbol !== 'cache') {
            result.failedSymbols.push(symbol);
            result.errors.push(`${symbol}: ${error}`);
          }
        });
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        result.errors.push(`Crypto data fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.failedSymbols.push(...portfolioSymbols.crypto);
      }
    }
    
    // Update user's sync timestamp
    await updateUserSyncTimestamp(userId, portfolioSymbols);

    // Update request status
    const allSymbols = [...portfolioSymbols.stocks, ...portfolioSymbols.crypto];
    await setDoc(requestDoc, {
      userId,
      symbols: allSymbols,
      requestedAt: serverTimestamp(),
      status: 'completed',
      updatedSymbols: result.updatedSymbols,
      failedSymbols: result.failedSymbols,
      apiCalls: result.apiCalls,
      completedAt: serverTimestamp()
    });

    result.success = result.updatedSymbols.length > 0;

    return result;
  } catch (error) {
    console.error('Error requesting cache update:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    result.failedSymbols = [...portfolioSymbols.stocks, ...portfolioSymbols.crypto];
    
    // Update request status to failed
    try {
      const requestDoc = doc(getCacheRequestsCollection());
      await setDoc(requestDoc, {
        userId,
        symbols: [...portfolioSymbols.stocks, ...portfolioSymbols.crypto],
        requestedAt: serverTimestamp(),
        status: 'failed',
        error: result.errors.join(', '),
        completedAt: serverTimestamp()
      });
    } catch (logError) {
      console.error('Failed to log error status:', logError);
    }
    
    return result;
  }
};

/**
 * Get cache statistics
 */
export const getCacheStatistics = async (): Promise<{
  totalStockEntries: number;
  totalCryptoEntries: number;
  averageAge: number;
  freshEntries: number;
  staleEntries: number;
}> => {
  try {
    // This would typically query the cache collections for statistics
    // For now, return mock statistics
    return {
      totalStockEntries: 0,
      totalCryptoEntries: 0,
      averageAge: 0,
      freshEntries: 0,
      staleEntries: 0
    };
  } catch (error) {
    console.error('Error getting cache statistics:', error);
    throw new Error('Failed to get cache statistics');
  }
};

/**
 * Clean up stale cache entries
 */
export const cleanupStaleCache = async (
  maxAgeHours: number = 24
): Promise<{ deletedEntries: number; errors: string[] }> => {
  try {
    // This would typically clean up old cache entries
    // Implementation depends on specific cleanup requirements
    return {
      deletedEntries: 0,
      errors: []
    };
  } catch (error) {
    console.error('Error cleaning up stale cache:', error);
    return {
      deletedEntries: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

/**
 * Validate cache integrity
 */
export const validateCacheIntegrity = async (): Promise<{
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  try {
    // This would typically validate cache data consistency
    // For now, return a basic validation result
    return {
      isValid: true,
      issues: [],
      recommendations: []
    };
  } catch (error) {
    console.error('Error validating cache integrity:', error);
    return {
      isValid: false,
      issues: [error instanceof Error ? error.message : 'Unknown error'],
      recommendations: ['Check Firebase connection and permissions']
    };
  }
};