// Transaction-specific currency utilities

import { Transaction } from '@/types/financial';
import { convertCurrency } from './exchange-rates';
import { CurrencyConversion, CurrencyConversionError } from '@/types/currency';

/**
 * Convert a transaction to the user's primary currency
 */
export async function convertTransactionToPrimaryCurrency(
  transaction: Transaction,
  primaryCurrency: string
): Promise<Transaction> {
  // If already in primary currency, return as-is
  if (transaction.currency === primaryCurrency) {
    return {
      ...transaction,
      convertedAmount: transaction.amount,
      exchangeRate: 1,
    };
  }

  try {
    const conversion = await convertCurrency(
      transaction.amount,
      transaction.currency,
      primaryCurrency
    );

    if ('errorType' in conversion) {
      // Handle conversion error - use fallback rate if available
      const convertedAmount = conversion.fallbackRate 
        ? transaction.amount * conversion.fallbackRate
        : transaction.amount; // Fallback to original amount

      return {
        ...transaction,
        convertedAmount,
        exchangeRate: conversion.fallbackRate || 1,
      };
    }

    return {
      ...transaction,
      convertedAmount: conversion.convertedAmount,
      exchangeRate: conversion.exchangeRate,
    };
  } catch (error) {
    console.error('Error converting transaction currency:', error);
    
    // Return transaction with original amount as fallback
    return {
      ...transaction,
      convertedAmount: transaction.amount,
      exchangeRate: 1,
    };
  }
}

/**
 * Convert multiple transactions to primary currency
 */
export async function convertTransactionsToPrimaryCurrency(
  transactions: Transaction[],
  primaryCurrency: string
): Promise<Transaction[]> {
  const conversions = await Promise.all(
    transactions.map(transaction => 
      convertTransactionToPrimaryCurrency(transaction, primaryCurrency)
    )
  );

  return conversions;
}

/**
 * Calculate total amount from transactions in primary currency
 */
export async function calculateTransactionTotal(
  transactions: Transaction[],
  primaryCurrency: string,
  filterType?: Transaction['type']
): Promise<{
  total: number;
  currency: string;
  transactionCount: number;
  conversionErrors: number;
}> {
  let filteredTransactions = transactions;
  
  if (filterType) {
    filteredTransactions = transactions.filter(t => t.type === filterType);
  }

  const convertedTransactions = await convertTransactionsToPrimaryCurrency(
    filteredTransactions,
    primaryCurrency
  );

  const total = convertedTransactions.reduce((sum, transaction) => {
    return sum + (transaction.convertedAmount || transaction.amount);
  }, 0);

  const conversionErrors = convertedTransactions.filter(
    t => !t.convertedAmount || t.exchangeRate === 1
  ).length;

  return {
    total,
    currency: primaryCurrency,
    transactionCount: convertedTransactions.length,
    conversionErrors,
  };
}

/**
 * Group transactions by currency and calculate totals
 */
export function groupTransactionsByCurrency(
  transactions: Transaction[]
): Record<string, {
  transactions: Transaction[];
  total: number;
  count: number;
}> {
  const groups: Record<string, {
    transactions: Transaction[];
    total: number;
    count: number;
  }> = {};

  transactions.forEach(transaction => {
    const currency = transaction.currency;
    
    if (!groups[currency]) {
      groups[currency] = {
        transactions: [],
        total: 0,
        count: 0,
      };
    }

    groups[currency].transactions.push(transaction);
    groups[currency].total += transaction.amount;
    groups[currency].count += 1;
  });

  return groups;
}

/**
 * Create a new transaction with currency information
 */
export function createTransaction(
  data: Omit<Transaction, 'id' | 'convertedAmount' | 'exchangeRate'>
): Omit<Transaction, 'id'> {
  return {
    ...data,
    convertedAmount: undefined,
    exchangeRate: undefined,
  };
}

/**
 * Update transaction amounts when primary currency changes
 */
export async function recalculateTransactionAmounts(
  transactions: Transaction[],
  newPrimaryCurrency: string
): Promise<Transaction[]> {
  return convertTransactionsToPrimaryCurrency(transactions, newPrimaryCurrency);
}

/**
 * Validate transaction currency data
 */
export function validateTransactionCurrency(transaction: Partial<Transaction>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!transaction.amount || transaction.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!transaction.currency || transaction.currency.length !== 3) {
    errors.push('Currency must be a valid 3-letter code');
  }

  if (transaction.convertedAmount && transaction.convertedAmount < 0) {
    errors.push('Converted amount cannot be negative');
  }

  if (transaction.exchangeRate && transaction.exchangeRate <= 0) {
    errors.push('Exchange rate must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format transaction amount with currency conversion info
 */
export function formatTransactionAmount(
  transaction: Transaction,
  primaryCurrency: string,
  options: {
    showOriginal?: boolean;
    showConversionRate?: boolean;
  } = {}
): {
  primary: string;
  original?: string;
  conversionInfo?: string;
} {
  const { showOriginal = false, showConversionRate = false } = options;

  // This would use the currency formatting utilities
  // For now, returning a basic structure
  const result: {
    primary: string;
    original?: string;
    conversionInfo?: string;
  } = {
    primary: `${transaction.convertedAmount || transaction.amount} ${primaryCurrency}`,
  };

  if (showOriginal && transaction.currency !== primaryCurrency) {
    result.original = `${transaction.amount} ${transaction.currency}`;
  }

  if (showConversionRate && transaction.exchangeRate && transaction.exchangeRate !== 1) {
    result.conversionInfo = `1 ${transaction.currency} = ${transaction.exchangeRate} ${primaryCurrency}`;
  }

  return result;
}