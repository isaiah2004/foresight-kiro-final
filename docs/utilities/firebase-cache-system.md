# Firebase Cache System

## Purpose
The Firebase Cache System provides intelligent caching for investment data (stocks and cryptocurrency) with user-triggered updates and timestamp-based freshness checking. It's designed for long-term investment tracking, not high-frequency trading.

## Architecture Overview

The caching system consists of several interconnected modules:

1. **Cache Collections** - Firebase collection management and data structures
2. **Cache Manager** - User sync timestamps and cache update orchestration  
3. **Cache Freshness** - Timestamp-based freshness checking and analysis
4. **Investment Cache Service** - High-level service interface

## Core Components

### Cache Collections (`cache-collections.ts`)

Manages Firebase Firestore collections for caching investment data.

#### Collections Structure
```typescript
COLLECTIONS = {
  STOCK_CACHE: 'stock_cache',           // Stock price cache
  CRYPTO_CACHE: 'crypto_cache',         // Crypto price cache  
  CACHE_REQUESTS: 'cache_requests',     // Update request logs
  USER_SYNC_TIMESTAMPS: 'user_sync_timestamps' // User sync tracking
}
```

#### Data Interfaces
```typescript
interface PriceCache {
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
  };
}
```

#### Key Functions
- `getCachedPrices(symbols, type)` - Retrieve cached prices for multiple symbols
- `updateCachePrice(symbol, type, price, currency, source)` - Update single cache entry
- `updateCachePrices(updates)` - Batch update multiple cache entries
- `getCacheFreshness(symbols, type)` - Get cache timestamps for freshness checking

### Cache Manager (`cache-manager.ts`)

Handles user-specific sync timestamps and cache update orchestration.

#### User Sync Management
```typescript
interface UserSyncTimestamp {
  userId: string;
  lastSyncTimestamp: Timestamp;
  portfolioSymbols: {
    stocks: string[];
    crypto: string[];
  };
  updatedAt: Timestamp;
}
```

#### Key Functions
- `getUserSyncTimestamp(userId)` - Get user's last sync timestamp
- `updateUserSyncTimestamp(userId, portfolioSymbols)` - Update user sync after cache update
- `shouldUseCachedData(userId, symbols, type)` - Determine if cache data is fresh for user
- `getPortfolioDataWithCache(userId, portfolioSymbols)` - Get portfolio data with intelligent caching
- `requestCacheUpdate(userId, portfolioSymbols)` - Trigger cache update for user's portfolio

### Cache Freshness (`cache-freshness.ts`)

Provides timestamp-based freshness checking and cache analysis utilities.

#### Configuration
```typescript
CACHE_CONFIG = {
  DEFAULT_TTL_MINUTES: 4,    // Cache TTL in minutes
  MAX_STALE_HOURS: 24,       // Maximum age before cleanup
  BATCH_SIZE: 10,            // Firestore query batch size
  RETRY_ATTEMPTS: 3,         // API retry attempts
  RETRY_DELAY_MS: 1000       // Retry delay
}
```

#### Key Functions
- `isCacheEntryFresh(lastUpdated, ttlMinutes)` - Check if single entry is fresh
- `analyzeCacheFreshness(symbols, type, cacheData)` - Analyze freshness for multiple symbols
- `determineUpdateStrategy(symbols, type, cacheData)` - Recommend update strategy
- `generateFreshnessReport(portfolioSymbols, stockCache, cryptoCache)` - Generate comprehensive freshness report

### Investment Cache Service (`investment-cache-service.ts`)

High-level service class providing a unified interface for cache operations.

#### Service Options
```typescript
interface CacheServiceOptions {
  ttlMinutes?: number;        // Cache TTL (default: 4)
  maxStaleHours?: number;     // Max stale age (default: 24)
  enableAutoUpdate?: boolean; // Auto-update stale cache (default: false)
  batchSize?: number;         // Batch size (default: 10)
}
```

#### Key Methods
- `getPortfolioData(userId, portfolioSymbols)` - Get portfolio data with caching
- `updatePortfolioCache(userId, portfolioSymbols)` - Update cache for user's portfolio
- `shouldUpdateCache(userId, portfolioSymbols)` - Check if update is recommended
- `getCacheStats(userId, portfolioSymbols)` - Get cache statistics for user
- `validateCacheIntegrity(portfolioSymbols)` - Validate cache data integrity

## Usage Examples

### Basic Cache Operations

```typescript
import { investmentCacheService } from '@/lib/firebase/investment-cache-service';

// Get portfolio data with intelligent caching
const portfolioData = await investmentCacheService.getPortfolioData(
  'user123',
  {
    stocks: ['AAPL', 'GOOGL', 'MSFT'],
    crypto: ['BTC', 'ETH']
  }
);

// Check if cache update is recommended
const updateRecommendation = await investmentCacheService.shouldUpdateCache(
  'user123',
  {
    stocks: ['AAPL', 'GOOGL'],
    crypto: ['BTC', 'ETH']
  }
);

if (updateRecommendation.shouldUpdate) {
  // Trigger cache update
  const updateResult = await investmentCacheService.updatePortfolioCache(
    'user123',
    {
      stocks: ['AAPL', 'GOOGL'],
      crypto: ['BTC', 'ETH']
    }
  );
}
```

### Cache Statistics and Monitoring

```typescript
// Get cache statistics
const stats = await investmentCacheService.getCacheStats(
  'user123',
  {
    stocks: ['AAPL', 'GOOGL'],
    crypto: ['BTC', 'ETH']
  }
);

console.log(`Cache hit rate: ${stats.cacheHitRate}%`);
console.log(`Fresh symbols: ${stats.freshSymbols}`);
console.log(`Stale symbols: ${stats.staleSymbols}`);

// Validate cache integrity
const integrity = await investmentCacheService.validateCacheIntegrity({
  stocks: ['AAPL', 'GOOGL'],
  crypto: ['BTC', 'ETH']
});

if (!integrity.isValid) {
  console.log('Cache issues detected:', integrity.issues);
  console.log('Recommendations:', integrity.recommendations);
}
```

### Custom Cache Service Instance

```typescript
import { InvestmentCacheService } from '@/lib/firebase/investment-cache-service';

// Create custom instance with different settings
const customCacheService = new InvestmentCacheService({
  ttlMinutes: 2,           // More aggressive caching
  maxStaleHours: 12,       // Shorter stale period
  enableAutoUpdate: true,  // Enable auto-updates
  batchSize: 20           // Larger batch size
});
```

## Cache Behavior Logic

### User-Triggered Updates
1. User A requests price update for their portfolio
2. System updates cache for all symbols in User A's portfolio
3. Cache timestamps are updated for affected symbols
4. User A's sync timestamp is updated

### Cache Sharing Logic
1. User B requests portfolio data (not an update)
2. System checks: Is User B's last sync < cache timestamp?
3. If YES: Use fresh cache data for User B's portfolio
4. If NO: Use User B's last synced prices

### Freshness Determination
```typescript
// Cache is considered fresh if:
const isFresh = (cacheTime > userLastSync) && (cacheAge <= TTL_MINUTES);

// Update strategy is determined by freshness percentage:
if (freshness < 25%) return 'full_update';
if (freshness === 100%) return 'use_cache';  
if (freshness >= 50%) return 'partial_update';
else return 'mixed';
```

## Performance Considerations

### Firestore Optimization
- Batch queries limited to 10 symbols (Firestore 'in' query limit)
- Automatic batching for large symbol lists
- Efficient document ID structure: `{type}_{SYMBOL}`
- Indexed queries on `lastUpdated` for stale entry cleanup

### Memory Management
- Use Maps for O(1) symbol lookups
- Lazy loading of cache data
- Automatic cleanup of stale entries
- Efficient timestamp comparisons

### Network Optimization
- Minimize API calls through intelligent caching
- Batch updates for multiple symbols
- Graceful fallback to cached data
- Retry logic with exponential backoff

## Error Handling

### Firebase Errors
```typescript
try {
  const cacheData = await getCachedPrices(symbols, 'stock');
} catch (error) {
  if (error.code === 'permission-denied') {
    // Handle permission error
  } else if (error.code === 'unavailable') {
    // Handle network error, use fallback
  }
}
```

### Data Validation
- Validate cache data structure before storage
- Check for positive prices and valid currencies
- Ensure timestamp consistency
- Handle malformed symbol names

### Graceful Degradation
- Return empty cache on Firebase errors
- Use stale data when fresh data unavailable
- Provide clear error messages to users
- Log errors for monitoring and debugging

## Testing

### Unit Tests
```typescript
// Test cache freshness logic
describe('Cache Freshness', () => {
  it('should identify fresh cache entries', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    expect(isCacheEntryFresh(twoMinutesAgo, 4)).toBe(true);
  });
});

// Test cache validation
describe('Cache Validation', () => {
  it('should validate correct cache data', () => {
    const validData = {
      symbol: 'AAPL',
      type: 'stock',
      price: 150.25,
      currency: 'USD',
      lastUpdated: Timestamp.now(),
      source: 'finnhub'
    };
    expect(validateCacheData(validData)).toBe(true);
  });
});
```

### Integration Tests
- Test Firebase collection operations
- Verify cache sharing between users
- Test batch update operations
- Validate error handling scenarios

### Performance Tests
- Measure cache lookup performance
- Test with large symbol lists (100+ symbols)
- Verify memory usage with extended operation
- Test concurrent user scenarios

## Security Considerations

### Firestore Security Rules
```javascript
// Allow users to read cache data
match /stock_cache/{document} {
  allow read: if request.auth != null;
}

// Only allow system to write cache data
match /stock_cache/{document} {
  allow write: if false; // Only server-side updates
}

// Users can only access their own sync timestamps
match /user_sync_timestamps/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

### Data Privacy
- Cache data contains no user-specific information
- User sync timestamps are isolated per user
- No cross-user data leakage
- Audit logs for cache update requests

## Monitoring and Maintenance

### Cache Metrics
- Cache hit rate percentage
- Average cache age
- Update frequency per user
- Error rates and types

### Maintenance Tasks
- Cleanup stale cache entries (>24 hours)
- Monitor cache size and performance
- Validate data integrity periodically
- Update cache configuration based on usage patterns

This Firebase Cache System provides a robust, scalable solution for intelligent investment data caching with user-specific sync management and comprehensive freshness checking.