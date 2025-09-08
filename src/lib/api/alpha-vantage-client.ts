/**
 * Alpha Vantage API Client
 * 
 * This module provides a client for interacting with the Alpha Vantage API
 * for historical stock data and as a backup source for real-time data.
 */

interface AlphaVantageQuote {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface AlphaVantageTimeSeriesDaily {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

interface AlphaVantageCrypto {
  'Realtime Currency Exchange Rate': {
    '1. From_Currency Code': string;
    '2. From_Currency Name': string;
    '3. To_Currency Code': string;
    '4. To_Currency Name': string;
    '5. Exchange Rate': string;
    '6. Last Refreshed': string;
    '7. Time Zone': string;
    '8. Bid Price': string;
    '9. Ask Price': string;
  };
}

interface AlphaVantageError {
  'Error Message'?: string;
  'Note'?: string;
  'Information'?: string;
}

export interface AlphaVantageStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  currency: string;
  timestamp: number;
  lastTradingDay: string;
}

export interface AlphaVantageCryptoData {
  symbol: string;
  price: number;
  currency: string;
  timestamp: number;
  bidPrice?: number;
  askPrice?: number;
}

export interface AlphaVantageHistoricalData {
  symbol: string;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  lastRefreshed: string;
}

class AlphaVantageClient {
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';
  private rateLimitDelay = 12000; // 12 seconds between requests (5 per minute)
  private lastRequestTime = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Rate limiting helper - Alpha Vantage has stricter limits
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
  private async makeRequest<T>(params: Record<string, string>): Promise<T> {
    await this.waitForRateLimit();

    const url = new URL(this.baseUrl);
    url.searchParams.append('apikey', this.apiKey);
    
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check for API-level errors
      const errorData = data as AlphaVantageError;
      if (errorData['Error Message']) {
        throw new Error(errorData['Error Message']);
      }
      if (errorData['Note']) {
        throw new Error(`API limit reached: ${errorData['Note']}`);
      }
      if (errorData['Information']) {
        throw new Error(`API information: ${errorData['Information']}`);
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
  async getStockQuote(symbol: string): Promise<AlphaVantageStockData> {
    try {
      const response = await this.makeRequest<AlphaVantageQuote>({
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase()
      });

      const quote = response['Global Quote'];
      if (!quote || !quote['05. price']) {
        throw new Error(`No data available for symbol: ${symbol}`);
      }

      const price = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const changePercentStr = quote['10. change percent'].replace('%', '');
      const changePercent = parseFloat(changePercentStr);

      return {
        symbol: quote['01. symbol'],
        price,
        change,
        changePercent,
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        volume: parseInt(quote['06. volume']),
        currency: 'USD',
        timestamp: new Date(quote['07. latest trading day']).getTime(),
        lastTradingDay: quote['07. latest trading day']
      };
    } catch (error) {
      throw new Error(`Failed to fetch stock data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get multiple stock quotes (with rate limiting)
   */
  async getMultipleStockQuotes(symbols: string[]): Promise<Map<string, AlphaVantageStockData>> {
    const results = new Map<string, AlphaVantageStockData>();
    const errors: string[] = [];

    // Process symbols sequentially due to strict rate limits
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
   * Get crypto exchange rate (as backup for crypto data)
   */
  async getCryptoData(symbol: string, toCurrency: string = 'USD'): Promise<AlphaVantageCryptoData> {
    try {
      const response = await this.makeRequest<AlphaVantageCrypto>({
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: symbol.toUpperCase(),
        to_currency: toCurrency.toUpperCase()
      });

      const exchangeRate = response['Realtime Currency Exchange Rate'];
      if (!exchangeRate || !exchangeRate['5. Exchange Rate']) {
        throw new Error(`No crypto data available for symbol: ${symbol}`);
      }

      const price = parseFloat(exchangeRate['5. Exchange Rate']);
      const bidPrice = exchangeRate['8. Bid Price'] ? parseFloat(exchangeRate['8. Bid Price']) : undefined;
      const askPrice = exchangeRate['9. Ask Price'] ? parseFloat(exchangeRate['9. Ask Price']) : undefined;

      return {
        symbol: exchangeRate['1. From_Currency Code'],
        price,
        currency: exchangeRate['3. To_Currency Code'],
        timestamp: new Date(exchangeRate['6. Last Refreshed']).getTime(),
        bidPrice,
        askPrice
      };
    } catch (error) {
      throw new Error(`Failed to fetch crypto data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get historical daily data
   */
  async getHistoricalData(symbol: string, outputSize: 'compact' | 'full' = 'compact'): Promise<AlphaVantageHistoricalData> {
    try {
      const response = await this.makeRequest<AlphaVantageTimeSeriesDaily>({
        function: 'TIME_SERIES_DAILY',
        symbol: symbol.toUpperCase(),
        outputsize: outputSize
      });

      const metaData = response['Meta Data'];
      const timeSeries = response['Time Series (Daily)'];

      if (!metaData || !timeSeries) {
        throw new Error(`No historical data available for symbol: ${symbol}`);
      }

      const data = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        symbol: metaData['2. Symbol'],
        data,
        lastRefreshed: metaData['3. Last Refreshed']
      };
    } catch (error) {
      throw new Error(`Failed to fetch historical data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get multiple crypto quotes (with rate limiting)
   */
  async getMultipleCryptoQuotes(symbols: string[]): Promise<Map<string, AlphaVantageCryptoData>> {
    const results = new Map<string, AlphaVantageCryptoData>();
    const errors: string[] = [];

    // Process symbols sequentially due to strict rate limits
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
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test with a well-known stock symbol
      await this.getStockQuote('AAPL');
      return {
        success: true,
        message: 'Alpha Vantage API connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: `Alpha Vantage API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Create and export singleton instance
let alphaVantageClient: AlphaVantageClient | null = null;

export function getAlphaVantageClient(): AlphaVantageClient {
  if (!alphaVantageClient) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY environment variable is not set');
    }
    alphaVantageClient = new AlphaVantageClient(apiKey);
  }
  return alphaVantageClient;
}

export { AlphaVantageClient };