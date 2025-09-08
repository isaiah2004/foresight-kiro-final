// Currency module exports

// Types
export type {
  Currency,
  ExchangeRate,
  CurrencyConversion,
  CurrencyCache,
  CurrencyConversionError,
} from '@/types/currency';

export {
  FALLBACK_EXCHANGE_RATES,
} from '@/types/currency';

// Data functions
export {
  getAllCurrencies,
  getCurrencyByCode,
  isSupportedCurrency,
  getCurrencySymbol,
  getCurrencyDisplayName,
  getAllCurrencyCodes,
  getCurrencyOptions,
} from './data';

// Utilities
export {
  formatCurrency,
  parseCurrencyAmount,
  getFallbackExchangeRate,
  convertCurrencyFallback,
  isValidCurrencyCode,
  roundToCurrencyDecimals,
  createCurrencyError,
} from './utils';

// Exchange rates
export {
  getExchangeRate,
  convertCurrency,
  convertMultipleCurrencies,
  getAllExchangeRates,
  clearExchangeRateCache,
  isCacheValid,
  getCacheStatus,
} from './exchange-rates';

// Transaction utilities
export {
  convertTransactionToPrimaryCurrency,
  convertTransactionsToPrimaryCurrency,
  calculateTransactionTotal,
  groupTransactionsByCurrency,
  createTransaction,
  recalculateTransactionAmounts,
  validateTransactionCurrency,
  formatTransactionAmount,
} from './transaction-utils';

// Components
export { CurrencySelector } from '@/components/shared/currency/currency-selector';
export { CurrencyDisplay, CurrencyInputDisplay } from '@/components/shared/currency/currency-display';
export { CurrencyInput, SimpleCurrencyInput } from '@/components/shared/currency/currency-input';
export { CurrencyManager } from '@/components/shared/currency/currency-manager';

// Hooks
export { useCurrency } from '@/hooks/use-currency';