// Basic tests for currency utilities

import { describe, it, expect, test } from 'vitest';
import { 
  formatCurrency, 
  parseCurrencyAmount, 
  getFallbackExchangeRate,
  convertCurrencyFallback,
  isValidCurrencyCode,
  getCurrencyByCode 
} from '../currency/utils';

describe('Currency Utils', () => {
  test('formatCurrency should format USD correctly', () => {
    const result = formatCurrency(1234.56, 'USD');
    expect(result).toBe('$1,234.56');
  });

  test('formatCurrency should format EUR correctly', () => {
    const result = formatCurrency(1234.56, 'EUR');
    expect(result).toBe('€1,234.56');
  });

  test('parseCurrencyAmount should parse amount with currency', () => {
    const result = parseCurrencyAmount('1234.56 USD');
    expect(result).toEqual({ amount: 1234.56, currency: 'USD' });
  });

  test('parseCurrencyAmount should parse amount without currency', () => {
    const result = parseCurrencyAmount('1234.56');
    expect(result).toEqual({ amount: 1234.56, currency: undefined });
  });

  test('getFallbackExchangeRate should return 1 for same currency', () => {
    const result = getFallbackExchangeRate('USD', 'USD');
    expect(result).toBe(1);
  });

  test('getFallbackExchangeRate should return fallback rate for EUR/USD', () => {
    const result = getFallbackExchangeRate('EUR', 'USD');
    expect(result).toBeGreaterThan(0);
  });

  test('convertCurrencyFallback should convert correctly', () => {
    const result = convertCurrencyFallback(100, 'USD', 'USD');
    expect(result.convertedAmount).toBe(100);
    expect(result.exchangeRate).toBe(1);
  });

  test('isValidCurrencyCode should validate currency codes', () => {
    expect(isValidCurrencyCode('USD')).toBe(true);
    expect(isValidCurrencyCode('EUR')).toBe(true);
    expect(isValidCurrencyCode('US')).toBe(false);
    expect(isValidCurrencyCode('USDD')).toBe(false);
  });

  test('getCurrencyByCode should return currency info', () => {
    const usd = getCurrencyByCode('USD');
    expect(usd).toBeDefined();
    expect(usd?.code).toBe('USD');
    expect(usd?.symbol).toBe('$');
  });

  test('getCurrencyByCode should return undefined for invalid code', () => {
    const invalid = getCurrencyByCode('INVALID');
    expect(invalid).toBeUndefined();
  });
});

describe('Currency Conversion', () => {
  test('should handle same currency conversion', () => {
    const result = convertCurrencyFallback(100, 'USD', 'USD');
    expect(result.originalAmount).toBe(100);
    expect(result.convertedAmount).toBe(100);
    expect(result.exchangeRate).toBe(1);
  });

  test('should convert using fallback rates', () => {
    const result = convertCurrencyFallback(100, 'EUR', 'USD');
    expect(result.originalAmount).toBe(100);
    expect(result.convertedAmount).toBeGreaterThan(0);
    expect(result.exchangeRate).toBeGreaterThan(0);
  });
});