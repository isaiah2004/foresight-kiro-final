/**
 * Firebase Cache Collections
 * 
 * This module defines the Firestore collections and interfaces for the intelligent
 * caching system used for stocks and cryptocurrency data.
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from './config';

// Cache data interfaces
export interface PriceCache {
  symbol: string;
  type: 'stock' | 'crypto';
  price: number;
  currency: string;
  lastUpdated: Timestamp;
  source: 'finnhub' | 'alphavantage';
  metadata?: {
    change?: number;
    changePercent?: number;
    volume?: number;
    marketCap?: number;
    high?: number;
    low?: number;
    open?: number;
    previousClose?: number;
  };
}

export interface CacheUpdateRequest {
  userId: string;
  symbols: string[];
  type: 'stock' | 'crypto';
  requestedAt: Timestamp;
}

// Collection references
export const COLLECTIONS = {
  STOCK_CACHE: 'stock_cache',
  CRYPTO_CACHE: 'crypto_cache',
  CACHE_REQUESTS: 'cache_requests',
  USER_SYNC_TIMESTAMPS: 'user_sync_timestamps'
} as const;

/**
 * Get stock cache collection reference
 */
export const getStockCacheCollection = () => {
  return collection(db, COLLECTIONS.STOCK_CACHE);
};

/**
 * Get crypto cache collection reference
 */
export const getCryptoCacheCollection = () => {
  return collection(db, COLLECTIONS.CRYPTO_CACHE);
};

/**
 * Get cache requests collection reference
 */
export const getCacheRequestsCollection = () => {
  return collection(db, COLLECTIONS.CACHE_REQUESTS);
};

/**
 * Get user sync timestamps collection reference
 */
export const getUserSyncTimestampsCollection = () => {
  return collection(db, COLLECTIONS.USER_SYNC_TIMESTAMPS);
};

/**
 * Get cache collection based on type
 */
export const getCacheCollection = (type: 'stock' | 'crypto') => {
  return type === 'stock' ? getStockCacheCollection() : getCryptoCacheCollection();
};

/**
 * Create cache document ID from symbol and type
 */
export const createCacheDocId = (symbol: string, type: 'stock' | 'crypto'): string => {
  return `${type}_${symbol.toUpperCase()}`;
};

/**
 * Parse cache document ID to extract symbol and type
 */
export const parseCacheDocId = (docId: string): { symbol: string; type: 'stock' | 'crypto' } | null => {
  const parts = docId.split('_');
  if (parts.length !== 2) return null;
  
  const [type, symbol] = parts;
  if (type !== 'stock' && type !== 'crypto') return null;
  
  return { symbol, type: type as 'stock' | 'crypto' };
};

/**
 * Validate cache data before storing
 */
export const validateCacheData = (data: Partial<PriceCache>): data is PriceCache => {
  return !!(
    data.symbol &&
    data.type &&
    typeof data.price === 'number' &&
    data.price > 0 &&
    data.currency &&
    data.lastUpdated &&
    data.source
  );
};

/**
 * Create cache document data
 */
export const createCacheDocument = (
  symbol: string,
  type: 'stock' | 'crypto',
  price: number,
  currency: string,
  source: 'finnhub' | 'alphavantage',
  metadata?: PriceCache['metadata']
): PriceCache => {
  return {
    symbol: symbol.toUpperCase(),
    type,
    price,
    currency: currency.toUpperCase(),
    lastUpdated: Timestamp.now(),
    source,
    metadata
  };
};

/**
 * Get cached prices for multiple symbols
 */
export const getCachedPrices = async (
  symbols: string[],
  type: 'stock' | 'crypto'
): Promise<Map<string, PriceCache>> => {
  if (symbols.length === 0) {
    return new Map();
  }

  const cacheCollection = getCacheCollection(type);
  const docIds = symbols.map(symbol => createCacheDocId(symbol, type));
  
  // Firestore 'in' queries are limited to 10 items, so we need to batch
  const batches: string[][] = [];
  for (let i = 0; i < docIds.length; i += 10) {
    batches.push(docIds.slice(i, i + 10));
  }

  const results = new Map<string, PriceCache>();
  
  for (const batch of batches) {
    const q = query(
      cacheCollection,
      where('__name__', 'in', batch.map(id => doc(cacheCollection, id)))
    );
    
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      const data = doc.data() as PriceCache;
      if (validateCacheData(data)) {
        results.set(data.symbol, data);
      }
    });
  }

  return results;
};

/**
 * Update cache with new price data
 */
export const updateCachePrice = async (
  symbol: string,
  type: 'stock' | 'crypto',
  price: number,
  currency: string,
  source: 'finnhub' | 'alphavantage',
  metadata?: PriceCache['metadata']
): Promise<void> => {
  const cacheCollection = getCacheCollection(type);
  const docId = createCacheDocId(symbol, type);
  const cacheData = createCacheDocument(symbol, type, price, currency, source, metadata);

  if (!validateCacheData(cacheData)) {
    throw new Error(`Invalid cache data for ${symbol}: ${JSON.stringify(cacheData)}`);
  }

  await setDoc(doc(cacheCollection, docId), cacheData);
};

/**
 * Update multiple cache entries in batch
 */
export const updateCachePrices = async (
  updates: Array<{
    symbol: string;
    type: 'stock' | 'crypto';
    price: number;
    currency: string;
    source: 'finnhub' | 'alphavantage';
    metadata?: PriceCache['metadata'];
  }>
): Promise<void> => {
  const promises = updates.map(update => 
    updateCachePrice(
      update.symbol,
      update.type,
      update.price,
      update.currency,
      update.source,
      update.metadata
    )
  );

  await Promise.all(promises);
};

/**
 * Get cache freshness for symbols
 */
export const getCacheFreshness = async (
  symbols: string[],
  type: 'stock' | 'crypto'
): Promise<Map<string, Date>> => {
  const cachedPrices = await getCachedPrices(symbols, type);
  const freshness = new Map<string, Date>();

  cachedPrices.forEach((cache, symbol) => {
    freshness.set(symbol, cache.lastUpdated.toDate());
  });

  return freshness;
};

/**
 * Check if cache is fresh (within 4 minutes)
 */
export const isCacheFresh = (lastUpdated: Date, thresholdMinutes: number = 4): boolean => {
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
  return diffMinutes <= thresholdMinutes;
};

/**
 * Get stale cache entries
 */
export const getStaleCacheEntries = async (
  type: 'stock' | 'crypto',
  thresholdMinutes: number = 4
): Promise<string[]> => {
  const cacheCollection = getCacheCollection(type);
  const thresholdTime = Timestamp.fromDate(
    new Date(Date.now() - thresholdMinutes * 60 * 1000)
  );

  const q = query(
    cacheCollection,
    where('lastUpdated', '<', thresholdTime),
    orderBy('lastUpdated', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data() as PriceCache;
    return data.symbol;
  });
};