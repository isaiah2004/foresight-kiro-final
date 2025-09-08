// Currency data loader and utilities

import currenciesData from '@/data/currencies.json';
import { Currency } from '@/types/currency';

// Interface for the JSON currency data structure
interface CurrencyJsonData {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

/**
 * Transform JSON currency data to our Currency interface
 */
function transformCurrencyData(jsonCurrency: CurrencyJsonData): Currency {
  return {
    code: jsonCurrency.code,
    name: jsonCurrency.name,
    symbol: jsonCurrency.symbol_native || jsonCurrency.symbol,
    decimals: jsonCurrency.decimal_digits,
  };
}

/**
 * Get all supported currencies from JSON data
 */
export function getAllCurrencies(): Currency[] {
  return (currenciesData as CurrencyJsonData[]).map(transformCurrencyData);
}

/**
 * Get currency by code from JSON data
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  const currencyData = (currenciesData as CurrencyJsonData[]).find(
    currency => currency.code === code
  );
  
  if (!currencyData) {
    return undefined;
  }
  
  return transformCurrencyData(currencyData);
}

/**
 * Check if a currency code is supported
 */
export function isSupportedCurrency(code: string): boolean {
  return (currenciesData as CurrencyJsonData[]).some(
    currency => currency.code === code
  );
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(code: string): string {
  const currency = getCurrencyByCode(code);
  return currency ? currency.symbol : code;
}

/**
 * Get currency display name
 */
export function getCurrencyDisplayName(code: string): string {
  const currency = getCurrencyByCode(code);
  return currency ? `${currency.name} (${currency.code})` : code;
}

/**
 * Get all currency codes
 */
export function getAllCurrencyCodes(): string[] {
  return (currenciesData as CurrencyJsonData[]).map(currency => currency.code);
}

/**
 * Get currencies for dropdown/selection
 */
export function getCurrencyOptions(): Array<{ value: string; label: string; symbol: string }> {
  return (currenciesData as CurrencyJsonData[]).map(currency => ({
    value: currency.code,
    label: `${currency.name} (${currency.code})`,
    symbol: currency.symbol_native || currency.symbol,
  }));
}
