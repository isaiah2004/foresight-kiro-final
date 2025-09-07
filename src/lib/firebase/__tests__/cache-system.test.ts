/**
 * Investment Cache System Tests
 * 
 * Comprehensive test suite for the Firebase caching system
 */

import { describe, it, expect, vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase before importing modules
vi.mock('../config', () => ({
  db: {},
  app: {},
  auth: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn((date: Date) => ({ toDate: () => date }))
  }
}));

// Import modules after mocking
import {
  createCacheDocId,
  parseCacheDocId,
  validateCacheData,
  createCacheDocument,
  PriceCache
} from '../cache-collections';
import {
  calculateCacheAge,
  isCacheEntryFresh,
  analyzeCacheFreshness,
  determineUpdateStrategy,
  CACHE_CONFIG
} from '../cache-freshness';

describe('Cache Collections', () => {
  describe('createCacheDocId', () => {
    it('should create correct document ID for stock', () => {
      const docId = createCacheDocId('AAPL', 'stock');
      expect(docId).toBe('stock_AAPL');
    });

    it('should create correct document ID for crypto', () => {
      const docId = createCacheDocId('btc', 'crypto');
      expect(docId).toBe('crypto_BTC');
    });

    it('should handle lowercase symbols', () => {
      const docId = createCacheDocId('googl', 'stock');
      expect(docId).toBe('stock_GOOGL');
    });
  });

  describe('parseCacheDocId', () => {
    it('should parse valid stock document ID', () => {
      const result = parseCacheDocId('stock_AAPL');
      expect(result).toEqual({ symbol: 'AAPL', type: 'stock' });
    });

    it('should parse valid crypto document ID', () => {
      const result = parseCacheDocId('crypto_BTC');
      expect(result).toEqual({ symbol: 'BTC', type: 'crypto' });
    });

    it('should return null for invalid document ID', () => {
      const result = parseCacheDocId('invalid_format_test');
      expect(result).toBeNull();
    });

    it('should return null for invalid type', () => {
      const result = parseCacheDocId('invalid_AAPL');
      expect(result).toBeNull();
    });
  });

  describe('validateCacheData', () => {
    const validCacheData: PriceCache = {
      symbol: 'AAPL',
      type: 'stock',
      price: 150.25,
      currency: 'USD',
      lastUpdated: Timestamp.now(),
      source: 'finnhub'
    };

    it('should validate correct cache data', () => {
      expect(validateCacheData(validCacheData)).toBe(true);
    });

    it('should reject data with missing symbol', () => {
      const invalidData = { ...validCacheData, symbol: '' };
      expect(validateCacheData(invalidData)).toBe(false);
    });

    it('should reject data with invalid price', () => {
      const invalidData = { ...validCacheData, price: -10 };
      expect(validateCacheData(invalidData)).toBe(false);
    });

    it('should reject data with missing currency', () => {
      const invalidData = { ...validCacheData, currency: '' };
      expect(validateCacheData(invalidData)).toBe(false);
    });
  });

  describe('createCacheDocument', () => {
    it('should create valid cache document', () => {
      const doc = createCacheDocument('aapl', 'stock', 150.25, 'usd', 'finnhub');
      
      expect(doc.symbol).toBe('AAPL');
      expect(doc.type).toBe('stock');
      expect(doc.price).toBe(150.25);
      expect(doc.currency).toBe('USD');
      expect(doc.source).toBe('finnhub');
      expect(doc.lastUpdated).toBeDefined();
    });

    it('should include metadata when provided', () => {
      const metadata = {
        change: 5.25,
        changePercent: 0.035,
        volume: 1000000
      };
      
      const doc = createCacheDocument('AAPL', 'stock', 150.25, 'USD', 'finnhub', metadata);
      expect(doc.metadata).toEqual(metadata);
    });
  });
});

describe('Cache Freshness', () => {
  describe('calculateCacheAge', () => {
    it('should calculate age in minutes correctly', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const age = calculateCacheAge(fiveMinutesAgo);
      expect(age).toBe(5);
    });

    it('should handle recent timestamps', () => {
      const now = new Date();
      const age = calculateCacheAge(now);
      expect(age).toBe(0);
    });
  });

  describe('isCacheEntryFresh', () => {
    it('should return true for fresh cache', () => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      expect(isCacheEntryFresh(twoMinutesAgo, 4)).toBe(true);
    });

    it('should return false for stale cache', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(isCacheEntryFresh(fiveMinutesAgo, 4)).toBe(false);
    });

    it('should use default TTL when not specified', () => {
      const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
      expect(isCacheEntryFresh(threeMinutesAgo)).toBe(true);
    });
  });

  describe('analyzeCacheFreshness', () => {
    const createMockCache = (symbol: string, minutesAgo: number): PriceCache => ({
      symbol,
      type: 'stock',
      price: 100,
      currency: 'USD',
      lastUpdated: Timestamp.fromDate(new Date(Date.now() - minutesAgo * 60 * 1000)),
      source: 'finnhub'
    });

    it('should analyze mixed freshness correctly', () => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
      const cacheData = new Map([
        ['AAPL', createMockCache('AAPL', 2)], // Fresh
        ['GOOGL', createMockCache('GOOGL', 6)], // Stale
        // MSFT missing
        ['TSLA', createMockCache('TSLA', 1)] // Fresh
      ]);

      const result = analyzeCacheFreshness(symbols, 'stock', cacheData, 4);

      expect(result.fresh).toEqual(['AAPL', 'TSLA']);
      expect(result.stale).toEqual(['GOOGL']);
      expect(result.missing).toEqual(['MSFT']);
      expect(result.totalSymbols).toBe(4);
      expect(result.freshPercentage).toBe(50);
    });

    it('should handle empty cache', () => {
      const symbols = ['AAPL', 'GOOGL'];
      const cacheData = new Map();

      const result = analyzeCacheFreshness(symbols, 'stock', cacheData, 4);

      expect(result.fresh).toEqual([]);
      expect(result.stale).toEqual([]);
      expect(result.missing).toEqual(['AAPL', 'GOOGL']);
      expect(result.freshPercentage).toBe(0);
    });
  });

  describe('determineUpdateStrategy', () => {
    const createMockCache = (symbol: string, minutesAgo: number): PriceCache => ({
      symbol,
      type: 'stock',
      price: 100,
      currency: 'USD',
      lastUpdated: Timestamp.fromDate(new Date(Date.now() - minutesAgo * 60 * 1000)),
      source: 'finnhub'
    });

    it('should recommend full update for empty cache', () => {
      const symbols = ['AAPL', 'GOOGL'];
      const cacheData = new Map();

      const result = determineUpdateStrategy(symbols, 'stock', cacheData);

      expect(result.strategy).toBe('full_update');
      expect(result.updateRequired).toEqual(['AAPL', 'GOOGL']);
      expect(result.useCache).toEqual([]);
    });

    it('should recommend use cache for all fresh data', () => {
      const symbols = ['AAPL', 'GOOGL'];
      const cacheData = new Map([
        ['AAPL', createMockCache('AAPL', 2)],
        ['GOOGL', createMockCache('GOOGL', 1)]
      ]);

      const result = determineUpdateStrategy(symbols, 'stock', cacheData);

      expect(result.strategy).toBe('use_cache');
      expect(result.updateRequired).toEqual([]);
      expect(result.useCache).toEqual(['AAPL', 'GOOGL']);
    });

    it('should recommend partial update for mixed freshness', () => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      const cacheData = new Map([
        ['AAPL', createMockCache('AAPL', 2)], // Fresh
        ['GOOGL', createMockCache('GOOGL', 6)] // Stale
        // MSFT missing
      ]);

      const result = determineUpdateStrategy(symbols, 'stock', cacheData);

      expect(result.strategy).toBe('mixed');
      expect(result.updateRequired).toEqual(['GOOGL', 'MSFT']);
      expect(result.useCache).toEqual(['AAPL']);
    });
  });
});

describe('Cache Configuration', () => {
  it('should have correct default configuration', () => {
    expect(CACHE_CONFIG.DEFAULT_TTL_MINUTES).toBe(4);
    expect(CACHE_CONFIG.MAX_STALE_HOURS).toBe(24);
    expect(CACHE_CONFIG.BATCH_SIZE).toBe(10);
    expect(CACHE_CONFIG.RETRY_ATTEMPTS).toBe(3);
  });
});

describe('Error Handling', () => {
  it('should validate input parameters', () => {
    expect(() => createCacheDocId('', 'stock')).not.toThrow();
    expect(() => parseCacheDocId('')).not.toThrow();
    
    const result = parseCacheDocId('');
    expect(result).toBeNull();
  });

  it('should handle invalid cache data gracefully', () => {
    const invalidData = {
      symbol: '',
      type: 'stock' as const,
      price: -10,
      currency: '',
      lastUpdated: Timestamp.now(),
      source: 'finnhub' as const
    };

    expect(validateCacheData(invalidData)).toBe(false);
  });
});