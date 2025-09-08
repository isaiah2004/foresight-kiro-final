# External Financial APIs Integration

## Overview

The Foresight application integrates with external financial APIs to provide real-time and historical investment data. This document describes the implementation of FinnHub.io and Alpha Vantage API integrations with intelligent fallback strategies and caching.

## Architecture

### API Clients

#### FinnHub Client (`src/lib/api/finnhub-client.ts`)
- **Purpose**: Primary source for real-time stock and crypto data
- **Rate Limits**: 60 calls per minute
- **Features**:
  - Real-time stock quotes
  - Crypto data via candle endpoints
  - Company profiles
  - Automatic rate limiting
  - Error handling with retry logic

#### Alpha Vantage Client (`src/lib/api/alpha-vantage-client.ts`)
- **Purpose**: Backup source and historical data provider
- **Rate Limits**: 5 calls per minute (stricter limits)
- **Features**:
  - Stock quotes via Global Quote API
  - Crypto data via Currency Exchange Rate API
  - Historical daily data
  - Time series analysis
  - Conservative rate limiting

### External API Service (`src/lib/api/external-api-service.ts`)

The unified service that orchestrates both APIs with intelligent fallback:

```typescript
interface FallbackStrategy {
  1. Primary: FinnHub.io (faster, higher limits)
  2. Secondary: Alpha Vantage (backup)
  3. Tertiary: Cached data (always available)
}
```

## API Endpoints

### Update Prices Endpoint

**POST** `/api/investments/update-prices`

Updates investment prices using external APIs with fallback strategies.

#### Request Body
```typescript
{
  symbols: {
    stocks: string[];    // Stock symbols (e.g., ["AAPL", "MSFT"])
    crypto: string[];    // Crypto symbols (e.g., ["BTC", "ETH"])
  };
  forceUpdate?: boolean; // Optional: bypass cache freshness checks
}
```

#### Response
```typescript
{
  success: boolean;
  message: string;
  data: {
    updatedSymbols: string[];     // Successfully updated symbols
    failedSymbols: string[];      // Failed to update symbols
    cacheHits: string[];          // Symbols served from cache
    apiCalls: number;             // Total API calls made
    source: 'finnhub' | 'alphavantage' | 'cache' | 'mixed';
    errors: string[];             // Error messages
  };
}
```

### Test Connections Endpoint

**GET** `/api/investments/update-prices`

Tests connectivity to external APIs and returns status information.

#### Response
```typescript
{
  success: boolean;
  message: string;
  data: {
    connections: {
      finnhub: { success: boolean; message: string };
      alphavantage: { success: boolean; message: string };
      overall: { success: boolean; message: string };
    };
    usage: {
      finnhubCallsToday: number;
      alphaVantageCallsToday: number;
      cacheHitRate: number;
      lastResetTime: Date;
    };
  };
}
```

## Environment Variables

Required environment variables for API integration:

```bash
# FinnHub API Configuration
FINNHUB_API_KEY=your_finnhub_api_key_here

# Alpha Vantage API Configuration
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
```

## Error Handling

### API-Level Errors
- **Rate Limiting**: Automatic backoff and retry
- **Authentication**: Clear error messages for invalid API keys
- **Network Issues**: Graceful fallback to alternative sources
- **Data Validation**: Verification of API response structure

### Fallback Strategy
1. **Primary Failure**: If FinnHub fails, try Alpha Vantage
2. **Secondary Failure**: If both APIs fail, use cached data
3. **Cache Miss**: Return last known prices with warning
4. **Complete Failure**: Return error with detailed information

## Performance Considerations

### Rate Limiting
- **FinnHub**: 1 second delay between requests (60/minute)
- **Alpha Vantage**: 12 second delay between requests (5/minute)
- **Batch Processing**: Sequential processing to respect limits
- **Smart Queuing**: Prioritize user-requested updates

### Caching Strategy
- **Cache First**: Check cache freshness before API calls
- **Intelligent Updates**: Only fetch stale or missing data
- **Shared Cache**: Multiple users benefit from single API calls
- **TTL Management**: 4-minute freshness window for real-time data

### Error Recovery
- **Exponential Backoff**: Increasing delays for failed requests
- **Circuit Breaker**: Temporary API disabling after repeated failures
- **Graceful Degradation**: Always provide some data, even if stale

## Usage Examples

### Frontend Integration

```typescript
import { useExternalApi } from '@/hooks/use-external-api';

function InvestmentComponent() {
  const { updatePrices, testConnections, isUpdating } = useExternalApi();

  const handleUpdate = async () => {
    const result = await updatePrices({
      stocks: ['AAPL', 'MSFT'],
      crypto: ['BTC', 'ETH']
    });
    
    if (result.success) {
      console.log(`Updated ${result.data.updatedSymbols.length} symbols`);
    }
  };

  return (
    <button onClick={handleUpdate} disabled={isUpdating}>
      {isUpdating ? 'Updating...' : 'Update Prices'}
    </button>
  );
}
```

### Cache Integration

```typescript
import { investmentCacheService } from '@/lib/firebase/investment-cache-service';

// Update portfolio cache
const result = await investmentCacheService.updatePortfolioCache(userId, {
  stocks: ['AAPL', 'MSFT'],
  crypto: ['BTC', 'ETH']
});

// Get cached portfolio data
const portfolioData = await investmentCacheService.getPortfolioData(userId, symbols);
```

## Monitoring and Analytics

### API Usage Tracking
- Daily API call counts per service
- Cache hit/miss ratios
- Error rates and types
- Response time metrics

### Performance Metrics
- Average response times
- Success rates by API
- Cache efficiency scores
- User satisfaction indicators

## Security Considerations

### API Key Management
- Environment variable storage
- No client-side exposure
- Rotation procedures
- Access logging

### Data Validation
- Input sanitization
- Response validation
- Type checking
- Error boundary protection

### Rate Limit Protection
- User-based throttling
- Fair usage policies
- Abuse prevention
- Graceful degradation

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify environment variables are set
   - Check API key validity and permissions
   - Ensure proper key format

2. **Rate Limit Exceeded**
   - Monitor usage patterns
   - Implement user-based throttling
   - Use cache more aggressively

3. **Network Connectivity**
   - Check firewall settings
   - Verify DNS resolution
   - Test with curl/postman

4. **Data Quality Issues**
   - Validate API responses
   - Implement data sanitization
   - Use fallback data sources

### Debugging Tools

```typescript
// Test API connections
const status = await externalApiService.testConnections();
console.log('API Status:', status);

// Check cache statistics
const stats = await investmentCacheService.getCacheStats(userId, symbols);
console.log('Cache Stats:', stats);

// Validate cache integrity
const integrity = await investmentCacheService.validateCacheIntegrity(symbols);
console.log('Cache Integrity:', integrity);
```

## Future Enhancements

### Planned Features
- Additional API providers (Yahoo Finance, IEX Cloud)
- Real-time WebSocket connections
- Advanced caching strategies
- Machine learning for price prediction
- Custom API integration framework

### Performance Optimizations
- Connection pooling
- Request batching
- Intelligent prefetching
- Edge caching
- CDN integration

This integration provides a robust, scalable foundation for real-time financial data with excellent fallback capabilities and performance optimization.