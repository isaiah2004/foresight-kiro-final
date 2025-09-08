/**
 * External API Service
 * 
 * This service provides a unified interface for fetching financial data
 * from external APIs with intelligent fallback strategies and caching integration.
 */

import { getFinnHubClient, FinnHubStockData, FinnHubCryptoData } from './finnhub-client';
import { getAlphaVantageClient, AlphaVantageStockData, AlphaVantageCryptoData } from './alpha-vantage-client';
import { 
  updateCachePrices, 
  getCachedPrices, 
  PriceCache 
} from '@/lib/firebase/cache-collections';

export interface UnifiedStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  volume?: number;
  currency: string;
  timestamp: number;
  source: 'finnhub' | 'alphavantage' | 'cache';
}

export interface UnifiedCryptoData {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  currency: string;
  timestamp: number;
  source: 'finnhub' | 'alphavantage' | 'cache';
}

export interface FetchResult<T> {
  success: boolean;
  data: Map<string, T>;
  errors: Map<string, string>;
  source: 'finnhub' | 'alphavantage' | 'cache' | 'mixed';
  cacheUpdated: boolean;
  apiCallsUsed: number;
}

export interface FallbackOptions {
  useFinnHub: boolean;
  useAlphaVantage: boolean;
  useCache: boolean;
  maxRetries: number;
  retryDelay: number;
}

class ExternalApiService {
  private defaultOptions: FallbackOptions = {
    useFinnHub: true,
    useAlphaVantage: true,
    useCache: true,
    maxRetries: 2,
    retryDelay: 1000
  };

  /**
   * Filter out undefined values from an object to prevent Firebase errors
   */
  private filterUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
    const filtered: Partial<T> = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined) {
        filtered[key as keyof T] = value;
      }
    });
    return filtered;
  }

  /**
   * Normalize FinnHub stock data to unified format
   */
  private normalizeFinnHubStock(data: FinnHubStockData): UnifiedStockData {
    return {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      high: data.high,
      low: data.low,
      open: data.open,
      previousClose: data.previousClose,
      volume: data.volume,
      currency: data.currency,
      timestamp: data.timestamp,
      source: 'finnhub'
    };
  }

  /**
   * Normalize Alpha Vantage stock data to unified format
   */
  private normalizeAlphaVantageStock(data: AlphaVantageStockData): UnifiedStockData {
    return {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      high: data.high,
      low: data.low,
      open: data.open,
      previousClose: data.previousClose,
      volume: data.volume,
      currency: data.currency,
      timestamp: data.timestamp,
      source: 'alphavantage'
    };
  }

  /**
   * Normalize FinnHub crypto data to unified format
   */
  private normalizeFinnHubCrypto(data: FinnHubCryptoData): UnifiedCryptoData {
    return {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      volume: data.volume,
      currency: data.currency,
      timestamp: data.timestamp,
      source: 'finnhub'
    };
  }

  /**
   * Normalize Alpha Vantage crypto data to unified format
   */
  private normalizeAlphaVantageCrypto(data: AlphaVantageCryptoData): UnifiedCryptoData {
    return {
      symbol: data.symbol,
      price: data.price,
      currency: data.currency,
      timestamp: data.timestamp,
      source: 'alphavantage'
    };
  }

  /**
   * Convert cached data to unified format
   */
  private normalizeCachedStock(cache: PriceCache): UnifiedStockData {
    return {
      symbol: cache.symbol,
      price: cache.price,
      change: cache.metadata?.change ?? 0,
      changePercent: cache.metadata?.changePercent ?? 0,
      high: cache.metadata?.high,
      low: cache.metadata?.low,
      open: cache.metadata?.open,
      previousClose: cache.metadata?.previousClose,
      volume: cache.metadata?.volume,
      currency: cache.currency,
      timestamp: cache.lastUpdated.toDate().getTime(),
      source: 'cache'
    };
  }

  /**
   * Convert cached data to unified crypto format
   */
  private normalizeCachedCrypto(cache: PriceCache): UnifiedCryptoData {
    return {
      symbol: cache.symbol,
      price: cache.price,
      change: cache.metadata?.change,
      changePercent: cache.metadata?.changePercent,
      volume: cache.metadata?.volume,
      currency: cache.currency,
      timestamp: cache.lastUpdated.toDate().getTime(),
      source: 'cache'
    };
  }

  /**
   * Fetch stock data with fallback strategy
   */
  async fetchStockData(
    symbols: string[],
    options: Partial<FallbackOptions> = {}
  ): Promise<FetchResult<UnifiedStockData>> {
    const opts = { ...this.defaultOptions, ...options };
    const result: FetchResult<UnifiedStockData> = {
      success: false,
      data: new Map(),
      errors: new Map(),
      source: 'cache',
      cacheUpdated: false,
      apiCallsUsed: 0
    };

    if (symbols.length === 0) {
      result.success = true;
      return result;
    }

    let remainingSymbols = [...symbols];
    let primarySource: 'finnhub' | 'alphavantage' | 'cache' = 'cache';

    // Strategy 1: Try FinnHub first (if enabled)
    if (opts.useFinnHub && remainingSymbols.length > 0) {
      try {
        console.log(`Fetching stock data from FinnHub for ${remainingSymbols.length} symbols`);
        const finnHubClient = getFinnHubClient();
        const finnHubData = await finnHubClient.getMultipleStockQuotes(remainingSymbols);
        
        result.apiCallsUsed += remainingSymbols.length;
        primarySource = 'finnhub';

        // Process successful results
        finnHubData.forEach((data, symbol) => {
          result.data.set(symbol, this.normalizeFinnHubStock(data));
          remainingSymbols = remainingSymbols.filter(s => s.toUpperCase() !== symbol);
        });

        console.log(`FinnHub returned data for ${finnHubData.size} symbols`);
      } catch (error) {
        console.warn('FinnHub API failed:', error);
        result.errors.set('finnhub', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Strategy 2: Try Alpha Vantage for remaining symbols (if enabled)
    if (opts.useAlphaVantage && remainingSymbols.length > 0) {
      try {
        console.log(`Fetching stock data from Alpha Vantage for ${remainingSymbols.length} symbols`);
        const alphaVantageClient = getAlphaVantageClient();
        
        // Alpha Vantage has strict rate limits, so we'll only try a few symbols
        const limitedSymbols = remainingSymbols.slice(0, 3);
        const alphaVantageData = await alphaVantageClient.getMultipleStockQuotes(limitedSymbols);
        
        result.apiCallsUsed += limitedSymbols.length;
        if (primarySource === 'cache') primarySource = 'alphavantage';

        // Process successful results
        alphaVantageData.forEach((data, symbol) => {
          result.data.set(symbol, this.normalizeAlphaVantageStock(data));
          remainingSymbols = remainingSymbols.filter(s => s.toUpperCase() !== symbol);
        });

        console.log(`Alpha Vantage returned data for ${alphaVantageData.size} symbols`);
      } catch (error) {
        console.warn('Alpha Vantage API failed:', error);
        result.errors.set('alphavantage', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Strategy 3: Use cached data for remaining symbols (if enabled)
    if (opts.useCache && remainingSymbols.length > 0) {
      try {
        console.log(`Fetching cached stock data for ${remainingSymbols.length} symbols`);
        const cachedData = await getCachedPrices(remainingSymbols, 'stock');
        
        cachedData.forEach((cache, symbol) => {
          result.data.set(symbol, this.normalizeCachedStock(cache));
          remainingSymbols = remainingSymbols.filter(s => s.toUpperCase() !== symbol);
        });

        console.log(`Cache returned data for ${cachedData.size} symbols`);
      } catch (error) {
        console.warn('Cache lookup failed:', error);
        result.errors.set('cache', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Update cache with new data
    if (result.data.size > 0) {
      try {
        const cacheUpdates = Array.from(result.data.values())
          .filter(data => data.source !== 'cache')
          .map(data => ({
            symbol: data.symbol,
            type: 'stock' as const,
            price: data.price,
            currency: data.currency,
            source: data.source as 'finnhub' | 'alphavantage',
            metadata: this.filterUndefinedValues({
              change: data.change,
              changePercent: data.changePercent,
              high: data.high,
              low: data.low,
              open: data.open,
              previousClose: data.previousClose,
              volume: data.volume
            })
          }));

        if (cacheUpdates.length > 0) {
          await updateCachePrices(cacheUpdates);
          result.cacheUpdated = true;
          console.log(`Updated cache for ${cacheUpdates.length} stock symbols`);
        }
      } catch (error) {
        console.warn('Failed to update cache:', error);
      }
    }

    // Set final result status
    result.success = result.data.size > 0;
    result.source = result.data.size > 0 ? 
      (result.data.size === symbols.length ? primarySource : 'mixed') : 'cache';

    // Log remaining failures
    remainingSymbols.forEach(symbol => {
      result.errors.set(symbol, 'No data available from any source');
    });

    console.log(`Stock data fetch completed: ${result.data.size}/${symbols.length} symbols successful`);
    return result;
  }

  /**
   * Fetch crypto data with fallback strategy
   */
  async fetchCryptoData(
    symbols: string[],
    options: Partial<FallbackOptions> = {}
  ): Promise<FetchResult<UnifiedCryptoData>> {
    const opts = { ...this.defaultOptions, ...options };
    const result: FetchResult<UnifiedCryptoData> = {
      success: false,
      data: new Map(),
      errors: new Map(),
      source: 'cache',
      cacheUpdated: false,
      apiCallsUsed: 0
    };

    if (symbols.length === 0) {
      result.success = true;
      return result;
    }

    let remainingSymbols = [...symbols];
    let primarySource: 'finnhub' | 'alphavantage' | 'cache' = 'cache';

    // Strategy 1: Try FinnHub first (if enabled)
    if (opts.useFinnHub && remainingSymbols.length > 0) {
      try {
        console.log(`Fetching crypto data from FinnHub for ${remainingSymbols.length} symbols`);
        const finnHubClient = getFinnHubClient();
        const finnHubData = await finnHubClient.getMultipleCryptoQuotes(remainingSymbols);
        
        result.apiCallsUsed += remainingSymbols.length;
        primarySource = 'finnhub';

        // Process successful results
        finnHubData.forEach((data, symbol) => {
          result.data.set(symbol, this.normalizeFinnHubCrypto(data));
          remainingSymbols = remainingSymbols.filter(s => s.toUpperCase() !== symbol);
        });

        console.log(`FinnHub returned crypto data for ${finnHubData.size} symbols`);
      } catch (error) {
        console.warn('FinnHub crypto API failed:', error);
        result.errors.set('finnhub', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Strategy 2: Try Alpha Vantage for remaining symbols (if enabled)
    if (opts.useAlphaVantage && remainingSymbols.length > 0) {
      try {
        console.log(`Fetching crypto data from Alpha Vantage for ${remainingSymbols.length} symbols`);
        const alphaVantageClient = getAlphaVantageClient();
        
        // Alpha Vantage has strict rate limits, so we'll only try a few symbols
        const limitedSymbols = remainingSymbols.slice(0, 2);
        const alphaVantageData = await alphaVantageClient.getMultipleCryptoQuotes(limitedSymbols);
        
        result.apiCallsUsed += limitedSymbols.length;
        if (primarySource === 'cache') primarySource = 'alphavantage';

        // Process successful results
        alphaVantageData.forEach((data, symbol) => {
          result.data.set(symbol, this.normalizeAlphaVantageCrypto(data));
          remainingSymbols = remainingSymbols.filter(s => s.toUpperCase() !== symbol);
        });

        console.log(`Alpha Vantage returned crypto data for ${alphaVantageData.size} symbols`);
      } catch (error) {
        console.warn('Alpha Vantage crypto API failed:', error);
        result.errors.set('alphavantage', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Strategy 3: Use cached data for remaining symbols (if enabled)
    if (opts.useCache && remainingSymbols.length > 0) {
      try {
        console.log(`Fetching cached crypto data for ${remainingSymbols.length} symbols`);
        const cachedData = await getCachedPrices(remainingSymbols, 'crypto');
        
        cachedData.forEach((cache, symbol) => {
          result.data.set(symbol, this.normalizeCachedCrypto(cache));
          remainingSymbols = remainingSymbols.filter(s => s.toUpperCase() !== symbol);
        });

        console.log(`Cache returned crypto data for ${cachedData.size} symbols`);
      } catch (error) {
        console.warn('Crypto cache lookup failed:', error);
        result.errors.set('cache', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Update cache with new data
    if (result.data.size > 0) {
      try {
        const cacheUpdates = Array.from(result.data.values())
          .filter(data => data.source !== 'cache')
          .map(data => ({
            symbol: data.symbol,
            type: 'crypto' as const,
            price: data.price,
            currency: data.currency,
            source: data.source as 'finnhub' | 'alphavantage',
            metadata: this.filterUndefinedValues({
              change: data.change,
              changePercent: data.changePercent,
              volume: data.volume
            })
          }));

        if (cacheUpdates.length > 0) {
          await updateCachePrices(cacheUpdates);
          result.cacheUpdated = true;
          console.log(`Updated cache for ${cacheUpdates.length} crypto symbols`);
        }
      } catch (error) {
        console.warn('Failed to update crypto cache:', error);
      }
    }

    // Set final result status
    result.success = result.data.size > 0;
    result.source = result.data.size > 0 ? 
      (result.data.size === symbols.length ? primarySource : 'mixed') : 'cache';

    // Log remaining failures
    remainingSymbols.forEach(symbol => {
      result.errors.set(symbol, 'No crypto data available from any source');
    });

    console.log(`Crypto data fetch completed: ${result.data.size}/${symbols.length} symbols successful`);
    return result;
  }

  /**
   * Test all API connections
   */
  async testConnections(): Promise<{
    finnhub: { success: boolean; message: string };
    alphavantage: { success: boolean; message: string };
    overall: { success: boolean; message: string };
  }> {
    const results = {
      finnhub: { success: false, message: 'Not tested' },
      alphavantage: { success: false, message: 'Not tested' },
      overall: { success: false, message: 'No APIs available' }
    };

    // Test FinnHub
    try {
      const finnHubClient = getFinnHubClient();
      results.finnhub = await finnHubClient.testConnection();
    } catch (error) {
      results.finnhub = {
        success: false,
        message: `FinnHub setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Test Alpha Vantage
    try {
      const alphaVantageClient = getAlphaVantageClient();
      results.alphavantage = await alphaVantageClient.testConnection();
    } catch (error) {
      results.alphavantage = {
        success: false,
        message: `Alpha Vantage setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    // Overall status
    const anySuccess = results.finnhub.success || results.alphavantage.success;
    results.overall = {
      success: anySuccess,
      message: anySuccess 
        ? 'At least one API is working'
        : 'All external APIs are unavailable'
    };

    return results;
  }

  /**
   * Get API usage statistics
   */
  getUsageStats(): {
    finnhubCallsToday: number;
    alphaVantageCallsToday: number;
    cacheHitRate: number;
    lastResetTime: Date;
  } {
    // This would typically track actual usage
    // For now, return mock statistics
    return {
      finnhubCallsToday: 0,
      alphaVantageCallsToday: 0,
      cacheHitRate: 85.5,
      lastResetTime: new Date()
    };
  }
}

// Export singleton instance
export const externalApiService = new ExternalApiService();
export { ExternalApiService };