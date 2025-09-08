/**
 * FinnHub API Client
 * 
 * This module provides a client for interacting with the FinnHub.io API
 * for real-time stock and crypto data with rate limiting and error handling.
 */

interface FinnHubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnHubProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

interface FinnHubCryptoCandle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string; // Status
  t: number[]; // Timestamps
  v: number[]; // Volumes
}

export interface FinnHubStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume?: number;
  currency: string;
  timestamp: number;
}

export interface FinnHubCryptoData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  currency: string;
  timestamp: number;
}

export interface FinnHubError {
  error: string;
  code?: number;
}

class FinnHubClient {
  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';
  private rateLimitDelay = 1000; // 1 second between requests (60 per minute)
  private lastRequestTime = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Rate limiting helper
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Make API request with error handling
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    await this.waitForRateLimit();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('token', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden - check API key permissions');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check for API-level errors
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Get real-time stock quote
   */
  async getStockQuote(symbol: string): Promise<FinnHubStockData> {
    try {
      const quote = await this.makeRequest<FinnHubQuote>('/quote', { symbol: symbol.toUpperCase() });
      
      // Validate response
      if (quote.c === 0 && quote.d === 0 && quote.dp === 0) {
        throw new Error(`No data available for symbol: ${symbol}`);
      }

      return {
        symbol: symbol.toUpperCase(),
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        high: quote.h,
        low: quote.l,
        open: quote.o,
        previousClose: quote.pc,
        currency: 'USD', // FinnHub returns USD by default
        timestamp: quote.t * 1000 // Convert to milliseconds
      };
    } catch (error) {
      throw new Error(`Failed to fetch stock data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get multiple stock quotes in batch
   */
  async getMultipleStockQuotes(symbols: string[]): Promise<Map<string, FinnHubStockData>> {
    const results = new Map<string, FinnHubStockData>();
    const errors: string[] = [];

    // Process symbols sequentially to respect rate limits
    for (const symbol of symbols) {
      try {
        const data = await this.getStockQuote(symbol);
        results.set(symbol.toUpperCase(), data);
      } catch (error) {
        errors.push(`${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.warn(`Failed to fetch data for ${symbol}:`, error);
      }
    }

    if (errors.length > 0 && results.size === 0) {
      throw new Error(`Failed to fetch any stock data. Errors: ${errors.join(', ')}`);
    }

    return results;
  }

  /**
   * Get crypto data (using candle data for current price)
   */
  async getCryptoData(symbol: string): Promise<FinnHubCryptoData> {
    try {
      // Use 1-minute candle data to get current price
      const resolution = '1';
      const to = Math.floor(Date.now() / 1000);
      const from = to - 300; // 5 minutes ago

      const candles = await this.makeRequest<FinnHubCryptoCandle>('/crypto/candle', {
        symbol: `BINANCE:${symbol.toUpperCase()}USDT`,
        resolution,
        from: from.toString(),
        to: to.toString()
      });

      if (candles.s !== 'ok' || !candles.c || candles.c.length === 0) {
        throw new Error(`No crypto data available for symbol: ${symbol}`);
      }

      // Get the latest data point
      const latestIndex = candles.c.length - 1;
      const currentPrice = candles.c[latestIndex];
      const previousPrice = latestIndex > 0 ? candles.c[latestIndex - 1] : candles.o[latestIndex];
      
      const change = currentPrice - previousPrice;
      const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

      return {
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        change,
        changePercent,
        volume: candles.v ? candles.v[latestIndex] : undefined,
        currency: 'USD',
        timestamp: candles.t[latestIndex] * 1000
      };
    } catch (error) {
      throw new Error(`Failed to fetch crypto data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get multiple crypto quotes in batch
   */
  async getMultipleCryptoQuotes(symbols: string[]): Promise<Map<string, FinnHubCryptoData>> {
    const results = new Map<string, FinnHubCryptoData>();
    const errors: string[] = [];

    // Process symbols sequentially to respect rate limits
    for (const symbol of symbols) {
      try {
        const data = await this.getCryptoData(symbol);
        results.set(symbol.toUpperCase(), data);
      } catch (error) {
        errors.push(`${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.warn(`Failed to fetch crypto data for ${symbol}:`, error);
      }
    }

    if (errors.length > 0 && results.size === 0) {
      throw new Error(`Failed to fetch any crypto data. Errors: ${errors.join(', ')}`);
    }

    return results;
  }

  /**
   * Get company profile (for additional stock information)
   */
  async getCompanyProfile(symbol: string): Promise<FinnHubProfile | null> {
    try {
      const profile = await this.makeRequest<FinnHubProfile>('/stock/profile2', { 
        symbol: symbol.toUpperCase() 
      });
      
      if (!profile.name) {
        return null;
      }
      
      return profile;
    } catch (error) {
      console.warn(`Failed to fetch company profile for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test with a well-known stock symbol
      await this.getStockQuote('AAPL');
      return {
        success: true,
        message: 'FinnHub API connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: `FinnHub API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Create and export singleton instance
let finnHubClient: FinnHubClient | null = null;

export function getFinnHubClient(): FinnHubClient {
  if (!finnHubClient) {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY environment variable is not set');
    }
    finnHubClient = new FinnHubClient(apiKey);
  }
  return finnHubClient;
}

export { FinnHubClient };