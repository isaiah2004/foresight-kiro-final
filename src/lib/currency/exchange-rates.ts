// Exchange rate fetching and caching service

import { 
  ExchangeRate, 
  CurrencyCache, 
  CurrencyConversion,
  CurrencyConversionError 
} from '@/types/currency';
import { 
  getFallbackExchangeRate, 
  convertCurrencyFallback, 
  createCurrencyError,
  roundToCurrencyDecimals 
} from './utils';

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

// In-memory cache for exchange rates
let exchangeRateCache: CurrencyCache | null = null;

/**
 * Fetch exchange rates from external API
 * Using exchangerate-api.com as it provides free tier
 */
async function fetchExchangeRatesFromAPI(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
  const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
  
  // If no API key, return empty object to use fallback rates
  if (!API_KEY) {
    console.warn('No exchange rate API key provided, using fallback rates');
    return {};
  }
  
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(`API error: ${data['error-type']}`);
    }
    
    return data.conversion_rates || {};
  } catch (error) {
    console.error('Error fetching exchange rates from API:', error);
    return {};
  }
}

/**
 * Get cached exchange rates or fetch new ones
 */
async function getExchangeRates(baseCurrency: string = 'USD'): Promise<CurrencyCache> {
  const now = new Date();
  
  // Check if cache is valid
  if (exchangeRateCache && 
      exchangeRateCache.baseCurrency === baseCurrency &&
      exchangeRateCache.expiresAt > now) {
    return exchangeRateCache;
  }
  
  // Fetch new rates
  const apiRates = await fetchExchangeRatesFromAPI(baseCurrency);
  const rates: Record<string, ExchangeRate> = {};
  
  // Convert API rates to our format
  Object.entries(apiRates).forEach(([currency, rate]) => {
    rates[currency] = {
      fromCurrency: baseCurrency,
      toCurrency: currency,
      rate: rate as number,
      timestamp: now,
      source: 'api',
    };
  });
  
  // Create new cache
  exchangeRateCache = {
    baseCurrency,
    rates,
    lastUpdated: now,
    expiresAt: new Date(now.getTime() + CACHE_DURATION),
  };
  
  return exchangeRateCache;
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: string, 
  toCurrency: string
): Promise<ExchangeRate> {
  if (fromCurrency === toCurrency) {
    return {
      fromCurrency,
      toCurrency,
      rate: 1,
      timestamp: new Date(),
      source: 'api',
    };
  }
  
  try {
    // Try to get rates with fromCurrency as base
    let cache = await getExchangeRates(fromCurrency);
    
    if (cache.rates[toCurrency]) {
      return cache.rates[toCurrency];
    }
    
    // Try with USD as base and calculate cross rate
    cache = await getExchangeRates('USD');
    
    const fromRate = cache.rates[fromCurrency];
    const toRate = cache.rates[toCurrency];
    
    if (fromRate && toRate) {
      const crossRate = toRate.rate / fromRate.rate;
      return {
        fromCurrency,
        toCurrency,
        rate: crossRate,
        timestamp: new Date(),
        source: 'api',
      };
    }
    
    // Fallback to hardcoded rates
    const fallbackRate = getFallbackExchangeRate(fromCurrency, toCurrency);
    return {
      fromCurrency,
      toCurrency,
      rate: fallbackRate,
      timestamp: new Date(),
      source: 'fallback',
    };
    
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    
    // Use fallback rate
    const fallbackRate = getFallbackExchangeRate(fromCurrency, toCurrency);
    return {
      fromCurrency,
      toCurrency,
      rate: fallbackRate,
      timestamp: new Date(),
      source: 'fallback',
    };
  }
}

/**
 * Convert amount between currencies
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<CurrencyConversion | CurrencyConversionError> {
  try {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        targetCurrency: toCurrency,
        exchangeRate: 1,
        timestamp: new Date(),
      };
    }
    
    const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = roundToCurrencyDecimals(
      amount * exchangeRate.rate, 
      toCurrency
    );
    
    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      targetCurrency: toCurrency,
      exchangeRate: exchangeRate.rate,
      timestamp: new Date(),
    };
    
  } catch (error) {
    console.error('Error converting currency:', error);
    
    // Return fallback conversion
    const fallbackConversion = convertCurrencyFallback(amount, fromCurrency, toCurrency);
    
    return createCurrencyError(
      fromCurrency,
      toCurrency,
      amount,
      'api-error',
      `Failed to convert ${fromCurrency} to ${toCurrency}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fallbackConversion.exchangeRate
    );
  }
}

/**
 * Convert multiple amounts to a target currency
 */
export async function convertMultipleCurrencies(
  amounts: Array<{ amount: number; currency: string }>,
  targetCurrency: string
): Promise<Array<CurrencyConversion | CurrencyConversionError>> {
  const conversions = await Promise.all(
    amounts.map(({ amount, currency }) => 
      convertCurrency(amount, currency, targetCurrency)
    )
  );
  
  return conversions;
}

/**
 * Get all available exchange rates for a base currency
 */
export async function getAllExchangeRates(baseCurrency: string = 'USD'): Promise<CurrencyCache> {
  return getExchangeRates(baseCurrency);
}

/**
 * Clear exchange rate cache (useful for testing or manual refresh)
 */
export function clearExchangeRateCache(): void {
  exchangeRateCache = null;
}

/**
 * Check if exchange rate cache is valid
 */
export function isCacheValid(): boolean {
  if (!exchangeRateCache) return false;
  return exchangeRateCache.expiresAt > new Date();
}

/**
 * Get cache status information
 */
export function getCacheStatus(): {
  hasCache: boolean;
  isValid: boolean;
  baseCurrency?: string;
  lastUpdated?: Date;
  expiresAt?: Date;
} {
  if (!exchangeRateCache) {
    return { hasCache: false, isValid: false };
  }
  
  return {
    hasCache: true,
    isValid: isCacheValid(),
    baseCurrency: exchangeRateCache.baseCurrency,
    lastUpdated: exchangeRateCache.lastUpdated,
    expiresAt: exchangeRateCache.expiresAt,
  };
}