// Currency utility functions

import { 
  Currency, 
  SUPPORTED_CURRENCIES, 
  FALLBACK_EXCHANGE_RATES,
  CurrencyConversion,
  CurrencyConversionError 
} from '@/types/currency';

/**
 * Get currency information by code
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === code);
}

/**
 * Check if a currency code is supported
 */
export function isSupportedCurrency(code: string): boolean {
  return SUPPORTED_CURRENCIES.some(currency => currency.code === code);
}

/**
 * Format amount with currency symbol and proper decimals
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string, 
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    locale?: string;
  } = {}
): string {
  const { showSymbol = true, showCode = false, locale = 'en-US' } = options;
  const currency = getCurrencyByCode(currencyCode);
  
  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }

  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount);

  if (showSymbol && showCode) {
    return `${currency.symbol}${formattedAmount} ${currency.code}`;
  } else if (showSymbol) {
    return `${currency.symbol}${formattedAmount}`;
  } else if (showCode) {
    return `${formattedAmount} ${currency.code}`;
  } else {
    return formattedAmount;
  }
}

/**
 * Parse currency amount from string
 */
export function parseCurrencyAmount(input: string): { amount: number; currency?: string } | null {
  // Remove whitespace and normalize
  const cleaned = input.trim().replace(/,/g, '');
  
  // Try to extract currency code (3 letters at the end)
  const currencyMatch = cleaned.match(/([A-Z]{3})$/);
  const currency = currencyMatch ? currencyMatch[1] : undefined;
  
  // Extract numeric part
  const numericPart = cleaned.replace(/[^0-9.-]/g, '');
  const amount = parseFloat(numericPart);
  
  if (isNaN(amount)) {
    return null;
  }
  
  return { amount, currency };
}

/**
 * Get fallback exchange rate between two currencies
 */
export function getFallbackExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  // Direct rate
  const directKey = `${fromCurrency}/${toCurrency}`;
  if (FALLBACK_EXCHANGE_RATES[directKey]) {
    return FALLBACK_EXCHANGE_RATES[directKey];
  }
  
  // Inverse rate
  const inverseKey = `${toCurrency}/${fromCurrency}`;
  if (FALLBACK_EXCHANGE_RATES[inverseKey]) {
    return 1 / FALLBACK_EXCHANGE_RATES[inverseKey];
  }
  
  // Cross rate via USD
  const fromUsdKey = `${fromCurrency}/USD`;
  const toUsdKey = `${toCurrency}/USD`;
  const usdFromKey = `USD/${fromCurrency}`;
  const usdToKey = `USD/${toCurrency}`;
  
  let fromToUsd = 1;
  let toToUsd = 1;
  
  // Get rate from source currency to USD
  if (fromCurrency === 'USD') {
    fromToUsd = 1;
  } else if (FALLBACK_EXCHANGE_RATES[fromUsdKey]) {
    fromToUsd = FALLBACK_EXCHANGE_RATES[fromUsdKey];
  } else if (FALLBACK_EXCHANGE_RATES[usdFromKey]) {
    fromToUsd = 1 / FALLBACK_EXCHANGE_RATES[usdFromKey];
  }
  
  // Get rate from target currency to USD
  if (toCurrency === 'USD') {
    toToUsd = 1;
  } else if (FALLBACK_EXCHANGE_RATES[toUsdKey]) {
    toToUsd = FALLBACK_EXCHANGE_RATES[toUsdKey];
  } else if (FALLBACK_EXCHANGE_RATES[usdToKey]) {
    toToUsd = 1 / FALLBACK_EXCHANGE_RATES[usdToKey];
  }
  
  // Calculate cross rate
  return fromToUsd / toToUsd;
}

/**
 * Convert amount between currencies using fallback rates
 */
export function convertCurrencyFallback(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): CurrencyConversion {
  const exchangeRate = getFallbackExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = amount * exchangeRate;
  
  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount,
    targetCurrency: toCurrency,
    exchangeRate,
    timestamp: new Date(),
  };
}

/**
 * Validate currency code format
 */
export function isValidCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

/**
 * Get currency display name
 */
export function getCurrencyDisplayName(code: string): string {
  const currency = getCurrencyByCode(code);
  return currency ? `${currency.name} (${currency.code})` : code;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(code: string): string {
  const currency = getCurrencyByCode(code);
  return currency ? currency.symbol : code;
}

/**
 * Round amount to currency's decimal places
 */
export function roundToCurrencyDecimals(amount: number, currencyCode: string): number {
  const currency = getCurrencyByCode(currencyCode);
  const decimals = currency ? currency.decimals : 2;
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Create currency conversion error
 */
export function createCurrencyError(
  fromCurrency: string,
  toCurrency: string,
  amount: number,
  errorType: CurrencyConversionError['errorType'],
  message: string,
  fallbackRate?: number
): CurrencyConversionError {
  return {
    fromCurrency,
    toCurrency,
    amount,
    errorType,
    message,
    fallbackRate,
  };
}