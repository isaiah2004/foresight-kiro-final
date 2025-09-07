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
  SUPPORTED_CURRENCIES,
  FALLBACK_EXCHANGE_RATES,
} from '@/types/currency';

// Utilities
export {
  getCurrencyByCode,
  isSupportedCurrency,
  formatCurrency,
  parseCurrencyAmount,
  getFallbackExchangeRate,
  convertCurrencyFallback,
  isValidCurrencyCode,
  getCurrencyDisplayName,
  getCurrencySymbol,
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