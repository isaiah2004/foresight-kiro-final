/**
 * Investment Cache Service
 * 
 * This is the main service class that provides a high-level interface
 * for the intelligent investment data caching system.
 */

import {
  getCachedPrices,
  updateCachePrices,
  PriceCache,
  validateCacheData
} from './cache-collections';
import {
  getUserSyncTimestamp,
  updateUserSyncTimestamp,
  requestCacheUpdate,
  getPortfolioDataWithCache,
  CacheUpdateResult
} from './cache-manager';
import {
  analyzeCacheFreshness,
  determineUpdateStrategy,
  generateFreshnessReport,
  calculateCacheEfficiency,
  CACHE_CONFIG
} from './cache-freshness';

// Service interfaces
export interface PortfolioData {
  stocks: Map<string, PriceCache>;
  crypto: Map<string, PriceCache>;
  metadata: {
    lastUpdated: Date;
    cacheHitRate: number;
    totalSymbols: number;
    freshSymbols: number;
    staleSymbols: number;
  };
}

export interface CacheServiceOptions {
  ttlMinutes?: number;
  maxStaleHours?: number;
  enableAutoUpdate?: boolean;
  batchSize?: number;
}

/**
 * Investment Cache Service Class
 * 
 * Provides a unified interface for managing investment data caching
 * with intelligent freshness checking and user-specific sync management.
 */
export class InvestmentCacheService {
  private options: Required<CacheServiceOptions>;

  constructor(options: CacheServiceOptions = {}) {
    this.options = {
      ttlMinutes: options.ttlMinutes ?? CACHE_CONFIG.DEFAULT_TTL_MINUTES,
      maxStaleHours: options.maxStaleHours ?? CACHE_CONFIG.MAX_STALE_HOURS,
      enableAutoUpdate: options.enableAutoUpdate ?? false,
      batchSize: options.batchSize ?? CACHE_CONFIG.BATCH_SIZE
    };
  }

  /**
   * Get portfolio data with intelligent caching
   */
  async getPortfolioData(
    userId: string,
    portfolioSymbols: { stocks: string[]; crypto: string[] }
  ): Promise<PortfolioData> {
    try {
      // Get cached data with intelligence
      const cacheResult = await getPortfolioDataWithCache(userId, portfolioSymbols);
      
      // Generate freshness report
      const freshnessReport = generateFreshnessReport(
        portfolioSymbols,
        cacheResult.stocks,
        cacheResult.crypto
      );

      // Calculate metadata
      const totalSymbols = portfolioSymbols.stocks.length + portfolioSymbols.crypto.length;
      const cachedSymbols = cacheResult.stocks.size + cacheResult.crypto.size;
      const cacheHitRate = totalSymbols > 0 ? (cachedSymbols / totalSymbols) * 100 : 0;

      return {
        stocks: cacheResult.stocks,
        crypto: cacheResult.crypto,
        metadata: {
          lastUpdated: new Date(),
          cacheHitRate,
          totalSymbols,
          freshSymbols: freshnessReport.overall.freshSymbols,
          staleSymbols: freshnessReport.overall.staleSymbols
        }
      };
    } catch (error) {
      console.error('Error getting portfolio data:', error);
      throw new Error('Failed to retrieve portfolio data');
    }
  }

  /**
   * Update cache for user's portfolio
   */
  async updatePortfolioCache(
    userId: string,
    portfolioSymbols: { stocks: string[]; crypto: string[] }
  ): Promise<CacheUpdateResult> {
    try {
      return await requestCacheUpdate(userId, portfolioSymbols);
    } catch (error) {
      console.error('Error updating portfolio cache:', error);
      throw new Error('Failed to update portfolio cache');
    }
  }

  /**
   * Check if cache update is recommended
   */
  async shouldUpdateCache(
    userId: string,
    portfolioSymbols: { stocks: string[]; crypto: string[] }
  ): Promise<{
    shouldUpdate: boolean;
    reason: string;
    staleness: {
      stocks: number;
      crypto: number;
      overall: number;
    };
  }> {
    try {
      // Get current cache data
      const [stockCache, cryptoCache] = await Promise.all([
        getCachedPrices(portfolioSymbols.stocks, 'stock'),
        getCachedPrices(portfolioSymbols.crypto, 'crypto')
      ]);

      // Analyze freshness
      const stockFreshness = analyzeCacheFreshness(
        portfolioSymbols.stocks,
        'stock',
        stockCache,
        this.options.ttlMinutes
      );
      
      const cryptoFreshness = analyzeCacheFreshness(
        portfolioSymbols.crypto,
        'crypto',
        cryptoCache,
        this.options.ttlMinutes
      );

      const overallFreshness = (stockFreshness.freshPercentage + cryptoFreshness.freshPercentage) / 2;
      const shouldUpdate = overallFreshness < 75; // Update if less than 75% fresh

      let reason = '';
      if (shouldUpdate) {
        if (overallFreshness < 25) {
          reason = 'Most cache data is stale or missing';
        } else if (overallFreshness < 50) {
          reason = 'Significant portion of cache data is stale';
        } else {
          reason = 'Some cache data needs refreshing';
        }
      } else {
        reason = 'Cache data is sufficiently fresh';
      }

      return {
        shouldUpdate,
        reason,
        staleness: {
          stocks: 100 - stockFreshness.freshPercentage,
          crypto: 100 - cryptoFreshness.freshPercentage,
          overall: 100 - overallFreshness
        }
      };
    } catch (error) {
      console.error('Error checking cache update recommendation:', error);
      return {
        shouldUpdate: true,
        reason: 'Error checking cache status, update recommended',
        staleness: { stocks: 100, crypto: 100, overall: 100 }
      };
    }
  }

  /**
   * Get cache statistics for user
   */
  async getCacheStats(
    userId: string,
    portfolioSymbols: { stocks: string[]; crypto: string[] }
  ): Promise<{
    totalSymbols: number;
    cachedSymbols: number;
    freshSymbols: number;
    staleSymbols: number;
    missingSymbols: number;
    cacheHitRate: number;
    averageAge: number;
    lastSync?: Date;
  }> {
    try {
      // Get user sync info
      const userSync = await getUserSyncTimestamp(userId);
      
      // Get cache data
      const [stockCache, cryptoCache] = await Promise.all([
        getCachedPrices(portfolioSymbols.stocks, 'stock'),
        getCachedPrices(portfolioSymbols.crypto, 'crypto')
      ]);

      // Generate freshness report
      const report = generateFreshnessReport(
        portfolioSymbols,
        stockCache,
        cryptoCache,
        userSync?.lastSyncTimestamp.toDate()
      );

      // Calculate average age
      const allCacheEntries: PriceCache[] = [];
      stockCache.forEach(entry => allCacheEntries.push(entry));
      cryptoCache.forEach(entry => allCacheEntries.push(entry));
      
      const totalAge = allCacheEntries.reduce((sum, entry) => {
        const age = (Date.now() - entry.lastUpdated.toDate().getTime()) / (1000 * 60);
        return sum + age;
      }, 0);
      const averageAge = allCacheEntries.length > 0 ? totalAge / allCacheEntries.length : 0;

      const totalSymbols = report.overall.totalSymbols;
      const cachedSymbols = stockCache.size + cryptoCache.size;
      const cacheHitRate = totalSymbols > 0 ? (cachedSymbols / totalSymbols) * 100 : 0;

      return {
        totalSymbols,
        cachedSymbols,
        freshSymbols: report.overall.freshSymbols,
        staleSymbols: report.overall.staleSymbols,
        missingSymbols: report.overall.missingSymbols,
        cacheHitRate,
        averageAge,
        lastSync: userSync?.lastSyncTimestamp.toDate()
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      throw new Error('Failed to get cache statistics');
    }
  }

  /**
   * Validate cache data integrity
   */
  async validateCacheIntegrity(
    portfolioSymbols: { stocks: string[]; crypto: string[] }
  ): Promise<{
    isValid: boolean;
    issues: Array<{
      symbol: string;
      type: 'stock' | 'crypto';
      issue: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    recommendations: string[];
  }> {
    try {
      const issues: Array<{
        symbol: string;
        type: 'stock' | 'crypto';
        issue: string;
        severity: 'low' | 'medium' | 'high';
      }> = [];

      // Get cache data
      const [stockCache, cryptoCache] = await Promise.all([
        getCachedPrices(portfolioSymbols.stocks, 'stock'),
        getCachedPrices(portfolioSymbols.crypto, 'crypto')
      ]);

      // Validate stock cache entries
      stockCache.forEach((cache, symbol) => {
        if (!validateCacheData(cache)) {
          issues.push({
            symbol,
            type: 'stock',
            issue: 'Invalid cache data structure',
            severity: 'high'
          });
        }

        if (cache.price <= 0) {
          issues.push({
            symbol,
            type: 'stock',
            issue: 'Invalid price value',
            severity: 'high'
          });
        }

        const ageMinutes = (Date.now() - cache.lastUpdated.toDate().getTime()) / (1000 * 60);
        if (ageMinutes > this.options.maxStaleHours * 60) {
          issues.push({
            symbol,
            type: 'stock',
            issue: 'Cache entry is too old',
            severity: 'medium'
          });
        }
      });

      // Validate crypto cache entries
      cryptoCache.forEach((cache, symbol) => {
        if (!validateCacheData(cache)) {
          issues.push({
            symbol,
            type: 'crypto',
            issue: 'Invalid cache data structure',
            severity: 'high'
          });
        }

        if (cache.price <= 0) {
          issues.push({
            symbol,
            type: 'crypto',
            issue: 'Invalid price value',
            severity: 'high'
          });
        }

        const ageMinutes = (Date.now() - cache.lastUpdated.toDate().getTime()) / (1000 * 60);
        if (ageMinutes > this.options.maxStaleHours * 60) {
          issues.push({
            symbol,
            type: 'crypto',
            issue: 'Cache entry is too old',
            severity: 'medium'
          });
        }
      });

      // Generate recommendations
      const recommendations: string[] = [];
      const highSeverityIssues = issues.filter(issue => issue.severity === 'high');
      const mediumSeverityIssues = issues.filter(issue => issue.severity === 'medium');

      if (highSeverityIssues.length > 0) {
        recommendations.push('Immediate cache cleanup required for invalid entries');
      }

      if (mediumSeverityIssues.length > 0) {
        recommendations.push('Consider updating stale cache entries');
      }

      if (issues.length === 0) {
        recommendations.push('Cache integrity is good, no issues detected');
      }

      return {
        isValid: highSeverityIssues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      console.error('Error validating cache integrity:', error);
      return {
        isValid: false,
        issues: [{
          symbol: 'system',
          type: 'stock',
          issue: 'Failed to validate cache integrity',
          severity: 'high'
        }],
        recommendations: ['Check system connectivity and permissions']
      };
    }
  }

  /**
   * Get cache performance metrics
   */
  async getPerformanceMetrics(
    timeWindowHours: number = 24
  ): Promise<{
    efficiency: 'excellent' | 'good' | 'fair' | 'poor';
    hitRate: number;
    missRate: number;
    averageResponseTime: number;
    recommendations: string[];
  }> {
    try {
      // This would typically query performance logs
      // For now, return mock metrics
      const mockMetrics = calculateCacheEfficiency(100, 85, 15, 'day');
      
      return {
        efficiency: mockMetrics.efficiency,
        hitRate: mockMetrics.hitRate,
        missRate: mockMetrics.missRate,
        averageResponseTime: 150, // Mock response time in ms
        recommendations: mockMetrics.recommendations
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error('Failed to get performance metrics');
    }
  }
}

// Export singleton instance
export const investmentCacheService = new InvestmentCacheService();