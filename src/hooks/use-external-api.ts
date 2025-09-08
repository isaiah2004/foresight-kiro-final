/**
 * External API Hook
 * 
 * This hook provides a React interface for interacting with external financial APIs
 * and managing price updates with loading states and error handling.
 */

import { useState, useCallback } from 'react';
import { UpdatePricesRequest, UpdatePricesResponse } from '@/app/api/investments/update-prices/route';

export interface ApiConnectionStatus {
  finnhub: { success: boolean; message: string };
  alphavantage: { success: boolean; message: string };
  overall: { success: boolean; message: string };
}

export interface ApiUsageStats {
  finnhubCallsToday: number;
  alphaVantageCallsToday: number;
  cacheHitRate: number;
  lastResetTime: Date;
}

export interface UseExternalApiReturn {
  // State
  isUpdating: boolean;
  isTesting: boolean;
  lastUpdateResult: UpdatePricesResponse | null;
  lastConnectionTest: ApiConnectionStatus | null;
  error: string | null;

  // Actions
  updatePrices: (symbols: { stocks: string[]; crypto: string[] }, forceUpdate?: boolean) => Promise<UpdatePricesResponse>;
  testConnections: () => Promise<ApiConnectionStatus>;
  clearError: () => void;
  clearResults: () => void;
}

export function useExternalApi(): UseExternalApiReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [lastUpdateResult, setLastUpdateResult] = useState<UpdatePricesResponse | null>(null);
  const [lastConnectionTest, setLastConnectionTest] = useState<ApiConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update investment prices using external APIs
   */
  const updatePrices = useCallback(async (
    symbols: { stocks: string[]; crypto: string[] },
    forceUpdate: boolean = false
  ): Promise<UpdatePricesResponse> => {
    setIsUpdating(true);
    setError(null);

    try {
      const requestBody: UpdatePricesRequest = {
        symbols,
        forceUpdate
      };

      const response = await fetch('/api/investments/update-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: UpdatePricesResponse = await response.json();
      setLastUpdateResult(result);

      if (!result.success) {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prices';
      setError(errorMessage);
      
      const errorResult: UpdatePricesResponse = {
        success: false,
        message: errorMessage,
        data: {
          updatedSymbols: [],
          failedSymbols: [...symbols.stocks, ...symbols.crypto],
          cacheHits: [],
          apiCalls: 0,
          source: 'cache',
          errors: [errorMessage]
        }
      };
      
      setLastUpdateResult(errorResult);
      return errorResult;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Test external API connections
   */
  const testConnections = useCallback(async (): Promise<ApiConnectionStatus> => {
    setIsTesting(true);
    setError(null);

    try {
      const response = await fetch('/api/investments/update-prices', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const connectionStatus: ApiConnectionStatus = result.data.connections;
      
      setLastConnectionTest(connectionStatus);

      if (!connectionStatus.overall.success) {
        setError('All external APIs are unavailable');
      }

      return connectionStatus;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test connections';
      setError(errorMessage);
      
      const errorStatus: ApiConnectionStatus = {
        finnhub: { success: false, message: 'Connection test failed' },
        alphavantage: { success: false, message: 'Connection test failed' },
        overall: { success: false, message: errorMessage }
      };
      
      setLastConnectionTest(errorStatus);
      return errorStatus;
    } finally {
      setIsTesting(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear all results
   */
  const clearResults = useCallback(() => {
    setLastUpdateResult(null);
    setLastConnectionTest(null);
    setError(null);
  }, []);

  return {
    // State
    isUpdating,
    isTesting,
    lastUpdateResult,
    lastConnectionTest,
    error,

    // Actions
    updatePrices,
    testConnections,
    clearError,
    clearResults,
  };
}

/**
 * Hook for getting API usage statistics
 */
export function useApiUsageStats() {
  const [stats, setStats] = useState<ApiUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/investments/update-prices');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setStats(result.data.usage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch usage stats';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
}

/**
 * Utility function to format API errors for display
 */
export function formatApiErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  
  return `Multiple errors occurred:\n${errors.map((error, index) => `${index + 1}. ${error}`).join('\n')}`;
}

/**
 * Utility function to get success rate from update result
 */
export function getUpdateSuccessRate(result: UpdatePricesResponse): number {
  const total = result.data.updatedSymbols.length + result.data.failedSymbols.length;
  if (total === 0) return 0;
  return (result.data.updatedSymbols.length / total) * 100;
}

/**
 * Utility function to determine if update was successful enough
 */
export function isUpdateAcceptable(result: UpdatePricesResponse, threshold: number = 50): boolean {
  return getUpdateSuccessRate(result) >= threshold;
}