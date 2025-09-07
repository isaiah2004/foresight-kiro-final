'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserProfileContext } from '@/providers/user-profile-provider';
import { 
  convertCurrency, 
  getExchangeRate, 
  getAllExchangeRates,
  clearExchangeRateCache,
  getCacheStatus 
} from '@/lib/currency/exchange-rates';
import { 
  formatCurrency, 
  getCurrencyByCode
} from '@/lib/currency/utils';
import { SUPPORTED_CURRENCIES } from '@/types/currency';
import { 
  CurrencyConversion, 
  CurrencyConversionError, 
  ExchangeRate, 
  Currency 
} from '@/types/currency';

interface UseCurrencyReturn {
  // Current user's primary currency
  primaryCurrency: string;
  
  // Currency utilities
  formatAmount: (amount: number, currency?: string, options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    locale?: string;
  }) => string;
  
  // Currency conversion
  convertAmount: (
    amount: number, 
    fromCurrency: string, 
    toCurrency?: string
  ) => Promise<CurrencyConversion | CurrencyConversionError>;
  
  // Exchange rates
  getRate: (fromCurrency: string, toCurrency?: string) => Promise<ExchangeRate>;
  
  // Currency management
  updatePrimaryCurrency: (currency: string) => Promise<boolean>;
  
  // Available currencies
  supportedCurrencies: Currency[];
  getCurrency: (code: string) => Currency | undefined;
  
  // Cache management
  refreshRates: () => void;
  cacheStatus: {
    hasCache: boolean;
    isValid: boolean;
    baseCurrency?: string;
    lastUpdated?: Date;
    expiresAt?: Date;
  };
  
  // Loading states
  isConverting: boolean;
  isUpdatingCurrency: boolean;
  
  // Errors
  conversionError: string | null;
  updateError: string | null;
}

export function useCurrency(): UseCurrencyReturn {
  const { profile, updatePrimaryCurrency: updateProfileCurrency } = useUserProfileContext();
  const [isConverting, setIsConverting] = useState(false);
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState(getCacheStatus());

  // Update cache status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStatus(getCacheStatus());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const primaryCurrency = profile?.primaryCurrency || 'USD';

  const formatAmount = useCallback((
    amount: number, 
    currency?: string, 
    options?: {
      showSymbol?: boolean;
      showCode?: boolean;
      locale?: string;
    }
  ) => {
    const currencyCode = currency || primaryCurrency;
    return formatCurrency(amount, currencyCode, options);
  }, [primaryCurrency]);

  const convertAmount = useCallback(async (
    amount: number, 
    fromCurrency: string, 
    toCurrency?: string
  ): Promise<CurrencyConversion | CurrencyConversionError> => {
    const targetCurrency = toCurrency || primaryCurrency;
    
    setIsConverting(true);
    setConversionError(null);
    
    try {
      const result = await convertCurrency(amount, fromCurrency, targetCurrency);
      
      // Check if it's an error
      if ('errorType' in result) {
        setConversionError(result.message);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown conversion error';
      setConversionError(errorMessage);
      
      // Return error object
      return {
        fromCurrency,
        toCurrency: targetCurrency,
        amount,
        errorType: 'api-error' as const,
        message: errorMessage,
      };
    } finally {
      setIsConverting(false);
    }
  }, [primaryCurrency]);

  const getRate = useCallback(async (
    fromCurrency: string, 
    toCurrency?: string
  ): Promise<ExchangeRate> => {
    const targetCurrency = toCurrency || primaryCurrency;
    return getExchangeRate(fromCurrency, targetCurrency);
  }, [primaryCurrency]);

  const updatePrimaryCurrency = useCallback(async (currency: string): Promise<boolean> => {
    setIsUpdatingCurrency(true);
    setUpdateError(null);
    
    try {
      const success = await updateProfileCurrency(currency);
      
      if (!success) {
        setUpdateError('Failed to update primary currency');
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown update error';
      setUpdateError(errorMessage);
      return false;
    } finally {
      setIsUpdatingCurrency(false);
    }
  }, [updateProfileCurrency]);

  const getCurrency = useCallback((code: string) => {
    return getCurrencyByCode(code);
  }, []);

  const refreshRates = useCallback(() => {
    clearExchangeRateCache();
    setCacheStatus(getCacheStatus());
  }, []);

  return {
    primaryCurrency,
    formatAmount,
    convertAmount,
    getRate,
    updatePrimaryCurrency,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    getCurrency,
    refreshRates,
    cacheStatus,
    isConverting,
    isUpdatingCurrency,
    conversionError,
    updateError,
  };
}