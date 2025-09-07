# Investment Portfolio Caching Behavior

## Purpose
This document defines the intelligent caching system for stocks and cryptocurrency data in Foresight. The system is designed for long-term investment tracking, not high-frequency trading.

## Core Philosophy
We do not support high-frequency trading. We treat stocks like long-term investments, which allows us to implement an efficient caching system that reduces API costs while providing accurate data for portfolio tracking.

## Cache Architecture

### Dual Cache System
The system maintains two separate caches in Firebase:
1. **Stock Cache** - For equity investments
2. **Crypto Cache** - For cryptocurrency investments

### Cache Update Mechanism

#### User-Triggered Updates
Cache updates are triggered only when a user explicitly requests price updates for their portfolio:

```
User A requests prices to be updated
↓
System updates all stocks/crypto in cache that correspond to User A's portfolio
↓
Cache timestamps are updated for all affected symbols
```

#### Cache Sharing Logic
The cache is shared across all users to optimize API usage:

```
4 minutes later...
User B requests portfolio data (not price update)
↓
System checks: Is User B's last sync < cache timestamp?
↓
If YES: Fetch latest prices from cache for User B's portfolio
If NO: Use User B's last synced prices
```

#### Subsequent Updates
```
2 minutes later...
User B requests prices to be updated
↓
System updates cache for symbols in User B's portfolio
↓
Data is seamlessly updated on User B's dashboard
↓
Cache is now fresh for other users with overlapping portfolios
```

## Implementation Details

### Cache Data Structure
```typescript
interface PriceCache {
  symbol: string;
  type: 'stock' | 'crypto';
  price: number;
  currency: string;
  lastUpdated: Date;
  source: 'finnhub' | 'alphavantage';
}
```

### Investment Data Structure
```typescript
interface Investment {
  id: string;
  userId: string;
  symbol: string;
  type: 'stock' | 'bond' | 'mutual-fund' | 'real-estate' | 'crypto' | 'other';
  quantity: number;
  purchasePrice: number;
  purchaseCurrency: string;
  purchaseDate: Date;
  lastSyncedPrice: number;
  lastSyncTimestamp: Date;
  currentValue?: number; // Calculated field
}
```

### Cache Freshness Logic

#### Timestamp Comparison
```typescript
const isCacheFresh = (userLastSync: Date, cacheLastUpdate: Date): boolean => {
  return cacheLastUpdate > userLastSync;
};
```

#### Cache TTL (Time To Live)
- **Effective TTL**: 4 minutes since last user-triggered update
- **Stale Data Handling**: Use cached data if available, fallback to last synced prices
- **API Rate Limiting**: Prevent excessive API calls through intelligent caching

### Update Flow Algorithm

1. **User Requests Update**
   - Identify all symbols in user's portfolio
   - Fetch latest prices from external APIs (FinnHub.io, Alpha Vantage)
   - Update cache for all symbols
   - Update user's lastSyncTimestamp
   - Return updated portfolio data

2. **User Views Portfolio**
   - Check user's lastSyncTimestamp vs cache timestamps
   - If cache is fresher: use cached prices
   - If user data is fresher or equal: use user's last synced prices
   - Calculate portfolio value in user's primary currency

3. **Cache Maintenance**
   - No automatic expiration (user-driven updates only)
   - Graceful fallback to stale data if APIs are unavailable
   - Error handling for API failures

## External API Integration

### Primary APIs
- **FinnHub.io**: Real-time stock data
- **Alpha Vantage**: Historical data and backup source

### Fallback Strategy
1. Try primary API (FinnHub.io)
2. If failed, try secondary API (Alpha Vantage)
3. If both failed, use cached data with warning
4. If no cached data, use last synced prices with warning

### Rate Limiting Protection
- Batch API calls for multiple symbols
- Implement exponential backoff for failed requests
- Respect API rate limits (FinnHub: 60 calls/minute, Alpha Vantage: 5 calls/minute)

## Performance Considerations

- Cache queries should complete within 500ms
- Portfolio calculations should complete within 2 seconds
- Batch updates for multiple symbols to reduce API calls
- Use Firebase real-time listeners for cache updates

## Error Handling

### API Failures
```typescript
interface CacheError {
  type: 'api_failure' | 'cache_miss' | 'stale_data';
  message: string;
  fallbackUsed: boolean;
  lastSuccessfulUpdate?: Date;
}
```

### Graceful Degradation
- Display warnings when using stale data
- Show last update timestamp to users
- Provide manual refresh option
- Maintain service availability even during API outages

## Testing Requirements

- Unit tests for cache freshness logic
- Integration tests for API fallback scenarios
- Performance tests for large portfolios
- End-to-end tests for multi-user cache sharing
- Load tests for concurrent user updates