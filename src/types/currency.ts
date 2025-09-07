// Currency-related type definitions

export interface Currency {
  code: string; // ISO 4217 currency code (e.g., 'USD', 'EUR', 'INR')
  name: string;
  symbol: string;
  decimals: number;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
  source: 'api' | 'cache' | 'fallback';
}

export interface CurrencyConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  timestamp: Date;
}

export interface CurrencyCache {
  baseCurrency: string;
  rates: Record<string, ExchangeRate>;
  lastUpdated: Date;
  expiresAt: Date;
}

export interface CurrencyConversionError {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  errorType: 'rate-unavailable' | 'invalid-currency' | 'api-error' | 'network-error';
  fallbackRate?: number;
  message: string;
}

// Supported currencies with their display information
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimals: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2 },
];

// Default fallback exchange rates (approximate, for offline use)
export const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
  'EUR/USD': 1.08,
  'GBP/USD': 1.25,
  'JPY/USD': 0.0067,
  'INR/USD': 0.012,
  'CAD/USD': 0.74,
  'AUD/USD': 0.66,
  'CHF/USD': 1.10,
  'CNY/USD': 0.14,
  'SEK/USD': 0.092,
  'NZD/USD': 0.60,
  'MXN/USD': 0.058,
  'SGD/USD': 0.74,
  'HKD/USD': 0.13,
  'NOK/USD': 0.092,
  'KRW/USD': 0.00075,
  'TRY/USD': 0.031,
  'RUB/USD': 0.011,
  'BRL/USD': 0.20,
  'ZAR/USD': 0.053,
};