/**
 * Cache Freshness Utilities
 * 
 * This module provides utilities for checking and managing cache freshness
 * based on timestamps and user-specific sync requirements.
 */

import { Timestamp } from 'firebase/firestore';
import { PriceCache } from './cache-collections';

// Cache freshness configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL_MINUTES: 4,
  MAX_STALE_HOURS: 24,
  BATCH_SIZE: 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000
} as const;

// Cache freshness status
export interface CacheFreshnessStatus {
  symbol: string;
  type: 'stock' | 'crypto';
  status: 'fresh' | 'stale' | 'missing';
  lastUpdated?: Date;
  ageMinutes?: number;
  shouldUpdate: boolean;
}

// Cache freshness result
export interface CacheFreshnessResult {
  fresh: string[];
  stale: string[];
  missing: string[];
  totalSymbols: number;
  freshPercentage: number;
}

/**
 * Calculate age of cache entry in minutes
 */
export const calculateCacheAge = (lastUpdated: Date): number => {
  const now = new Date();
  return Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60));
};

/**
 * Check if a single cache entry is fresh
 */
export const isCacheEntryFresh = (
  lastUpdated: Date,
  ttlMinutes: number = CACHE_CONFIG.DEFAULT_TTL_MINUTES
): boolean => {
  const ageMinutes = calculateCacheAge(lastUpdated);
  return ageMinutes <= ttlMinutes;
};

/**
 * Check if cache entry is stale but still usable
 */
export const isCacheEntryUsable = (
  lastUpdated: Date,
  maxStaleHours: number = CACHE_CONFIG.MAX_STALE_HOURS
): boolean => {
  const ageMinutes = calculateCacheAge(lastUpdated);
  return ageMinutes <= (maxStaleHours * 60);
};

/**
 * Determine cache freshness status for a symbol
 */
export const getCacheFreshnessStatus = (
  symbol: string,
  type: 'stock' | 'crypto',
  cacheEntry?: PriceCache,
  ttlMinutes: number = CACHE_CONFIG.DEFAULT_TTL_MINUTES
): CacheFreshnessStatus => {
  if (!cacheEntry) {
    return {
      symbol,
      type,
      status: 'missing',
      shouldUpdate: true
    };
  }

  const lastUpdated = cacheEntry.lastUpdated.toDate();
  const ageMinutes = calculateCacheAge(lastUpdated);
  const isFresh = isCacheEntryFresh(lastUpdated, ttlMinutes);

  return {
    symbol,
    type,
    status: isFresh ? 'fresh' : 'stale',
    lastUpdated,
    ageMinutes,
    shouldUpdate: !isFresh
  };
};

/**
 * Analyze cache freshness for multiple symbols
 */
export const analyzeCacheFreshness = (
  symbols: string[],
  type: 'stock' | 'crypto',
  cacheData: Map<string, PriceCache>,
  ttlMinutes: number = CACHE_CONFIG.DEFAULT_TTL_MINUTES
): CacheFreshnessResult => {
  const fresh: string[] = [];
  const stale: string[] = [];
  const missing: string[] = [];

  symbols.forEach(symbol => {
    const cacheEntry = cacheData.get(symbol);
    const status = getCacheFreshnessStatus(symbol, type, cacheEntry, ttlMinutes);

    switch (status.status) {
      case 'fresh':
        fresh.push(symbol);
        break;
      case 'stale':
        stale.push(symbol);
        break;
      case 'missing':
        missing.push(symbol);
        break;
    }
  });

  const totalSymbols = symbols.length;
  const freshPercentage = totalSymbols > 0 ? (fresh.length / totalSymbols) * 100 : 0;

  return {
    fresh,
    stale,
    missing,
    totalSymbols,
    freshPercentage
  };
};

/**
 * Compare user sync timestamp with cache timestamps
 */
export const compareUserSyncWithCache = (
  userLastSync: Date,
  cacheTimestamps: Map<string, Date>
): {
  userDataNewer: string[];
  cacheDataNewer: string[];
  equal: string[];
} => {
  const userDataNewer: string[] = [];
  const cacheDataNewer: string[] = [];
  const equal: string[] = [];

  cacheTimestamps.forEach((cacheTime, symbol) => {
    const userSyncTime = userLastSync.getTime();
    const cacheTimeMs = cacheTime.getTime();

    if (userSyncTime > cacheTimeMs) {
      userDataNewer.push(symbol);
    } else if (cacheTimeMs > userSyncTime) {
      cacheDataNewer.push(symbol);
    } else {
      equal.push(symbol);
    }
  });

  return {
    userDataNewer,
    cacheDataNewer,
    equal
  };
};

/**
 * Determine optimal cache update strategy
 */
export const determineUpdateStrategy = (
  symbols: string[],
  type: 'stock' | 'crypto',
  cacheData: Map<string, PriceCache>,
  userLastSync?: Date,
  ttlMinutes: number = CACHE_CONFIG.DEFAULT_TTL_MINUTES
): {
  updateRequired: string[];
  useCache: string[];
  strategy: 'full_update' | 'partial_update' | 'use_cache' | 'mixed';
  reasoning: string;
} => {
  const freshness = analyzeCacheFreshness(symbols, type, cacheData, ttlMinutes);
  
  // Symbols that need updating
  const updateRequired = [...freshness.stale, ...freshness.missing];
  const useCache = freshness.fresh;

  // Determine strategy based on freshness analysis
  let strategy: 'full_update' | 'partial_update' | 'use_cache' | 'mixed';
  let reasoning: string;

  if (freshness.freshPercentage === 0) {
    strategy = 'full_update';
    reasoning = 'No fresh cache data available, full update required';
  } else if (freshness.freshPercentage === 100) {
    strategy = 'use_cache';
    reasoning = 'All cache data is fresh, no update needed';
  } else if (freshness.freshPercentage >= 50) {
    strategy = 'partial_update';
    reasoning = `${freshness.freshPercentage.toFixed(1)}% of cache is fresh, partial update recommended`;
  } else {
    strategy = 'mixed';
    reasoning = `${freshness.freshPercentage.toFixed(1)}% of cache is fresh, mixed strategy recommended`;
  }

  // Consider user sync timestamp if available
  if (userLastSync && cacheData.size > 0) {
    const cacheTimestamps = new Map<string, Date>();
    cacheData.forEach((cache, symbol) => {
      cacheTimestamps.set(symbol, cache.lastUpdated.toDate());
    });

    const syncComparison = compareUserSyncWithCache(userLastSync, cacheTimestamps);
    
    if (syncComparison.userDataNewer.length > 0) {
      reasoning += `. User has newer data for ${syncComparison.userDataNewer.length} symbols`;
    }
  }

  return {
    updateRequired,
    useCache,
    strategy,
    reasoning
  };
};

/**
 * Calculate cache efficiency metrics
 */
export const calculateCacheEfficiency = (
  totalRequests: number,
  cacheHits: number,
  cacheMisses: number,
  timeWindow: 'hour' | 'day' | 'week' = 'day'
): {
  hitRate: number;
  missRate: number;
  efficiency: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
} => {
  const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
  const missRate = totalRequests > 0 ? (cacheMisses / totalRequests) * 100 : 0;

  let efficiency: 'excellent' | 'good' | 'fair' | 'poor';
  const recommendations: string[] = [];

  if (hitRate >= 90) {
    efficiency = 'excellent';
    recommendations.push('Cache performance is excellent, maintain current TTL settings');
  } else if (hitRate >= 75) {
    efficiency = 'good';
    recommendations.push('Cache performance is good, consider minor TTL adjustments');
  } else if (hitRate >= 50) {
    efficiency = 'fair';
    recommendations.push('Cache performance is fair, review TTL settings and update frequency');
  } else {
    efficiency = 'poor';
    recommendations.push('Cache performance is poor, consider increasing TTL or update frequency');
    recommendations.push('Review cache invalidation strategy');
  }

  if (missRate > 25) {
    recommendations.push('High cache miss rate detected, consider preloading popular symbols');
  }

  return {
    hitRate,
    missRate,
    efficiency,
    recommendations
  };
};

/**
 * Generate cache freshness report
 */
export const generateFreshnessReport = (
  portfolioSymbols: { stocks: string[]; crypto: string[] },
  stockCache: Map<string, PriceCache>,
  cryptoCache: Map<string, PriceCache>,
  userLastSync?: Date
): {
  stocks: CacheFreshnessResult;
  crypto: CacheFreshnessResult;
  overall: {
    totalSymbols: number;
    freshSymbols: number;
    staleSymbols: number;
    missingSymbols: number;
    overallFreshness: number;
  };
  recommendations: string[];
} => {
  const stockFreshness = analyzeCacheFreshness(portfolioSymbols.stocks, 'stock', stockCache);
  const cryptoFreshness = analyzeCacheFreshness(portfolioSymbols.crypto, 'crypto', cryptoCache);

  const totalSymbols = stockFreshness.totalSymbols + cryptoFreshness.totalSymbols;
  const freshSymbols = stockFreshness.fresh.length + cryptoFreshness.fresh.length;
  const staleSymbols = stockFreshness.stale.length + cryptoFreshness.stale.length;
  const missingSymbols = stockFreshness.missing.length + cryptoFreshness.missing.length;
  const overallFreshness = totalSymbols > 0 ? (freshSymbols / totalSymbols) * 100 : 0;

  const recommendations: string[] = [];

  if (overallFreshness < 50) {
    recommendations.push('Consider requesting a cache update to improve data freshness');
  }

  if (missingSymbols > 0) {
    recommendations.push(`${missingSymbols} symbols are missing from cache and need to be fetched`);
  }

  if (staleSymbols > freshSymbols) {
    recommendations.push('More symbols are stale than fresh, consider reducing TTL or increasing update frequency');
  }

  return {
    stocks: stockFreshness,
    crypto: cryptoFreshness,
    overall: {
      totalSymbols,
      freshSymbols,
      staleSymbols,
      missingSymbols,
      overallFreshness
    },
    recommendations
  };
};