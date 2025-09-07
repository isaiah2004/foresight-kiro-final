/**
 * Investment calculation utilities
 * 
 * This module provides utilities for investment portfolio calculations,
 * currency conversion, and performance analysis.
 */

import { Investment } from '@/types/financial';

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  todayChange: number;
  todayChangePercentage: number;
  currency: string;
}

export interface AssetAllocation {
  type: Investment['type'];
  value: number;
  percentage: number;
  count: number;
}

export interface InvestmentPerformance {
  symbol: string;
  type: Investment['type'];
  currentValue: number;
  invested: number;
  return: number;
  returnPercentage: number;
  quantity: number;
  currentPrice: number;
}

/**
 * Calculate portfolio summary from investments
 */
export function calculatePortfolioSummary(
  investments: Investment[],
  primaryCurrency: string = 'USD'
): PortfolioSummary {
  if (investments.length === 0) {
    return {
      totalValue: 0,
      totalInvested: 0,
      totalReturn: 0,
      totalReturnPercentage: 0,
      todayChange: 0,
      todayChangePercentage: 0,
      currency: primaryCurrency
    };
  }

  let totalValue = 0;
  let totalInvested = 0;

  investments.forEach(investment => {
    // Use current value if available, otherwise calculate from last synced price
    const currentValue = investment.currentValue ?? 
      (investment.quantity * investment.lastSyncedPrice);
    
    const investedValue = investment.quantity * investment.purchasePrice;
    
    totalValue += currentValue;
    totalInvested += investedValue;
  });

  const totalReturn = totalValue - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Mock today's change for now (would be calculated from real-time data)
  const todayChange = totalValue * (Math.random() * 0.04 - 0.02); // -2% to +2%
  const todayChangePercentage = totalValue > 0 ? (todayChange / totalValue) * 100 : 0;

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercentage: Math.round(totalReturnPercentage * 100) / 100,
    todayChange: Math.round(todayChange * 100) / 100,
    todayChangePercentage: Math.round(todayChangePercentage * 100) / 100,
    currency: primaryCurrency
  };
}

/**
 * Calculate asset allocation breakdown
 */
export function calculateAssetAllocation(
  investments: Investment[],
  primaryCurrency: string = 'USD'
): AssetAllocation[] {
  if (investments.length === 0) {
    return [];
  }

  const allocationMap = new Map<Investment['type'], {
    value: number;
    count: number;
  }>();

  let totalValue = 0;

  investments.forEach(investment => {
    const currentValue = investment.currentValue ?? 
      (investment.quantity * investment.lastSyncedPrice);
    
    totalValue += currentValue;

    const existing = allocationMap.get(investment.type) || { value: 0, count: 0 };
    allocationMap.set(investment.type, {
      value: existing.value + currentValue,
      count: existing.count + 1
    });
  });

  return Array.from(allocationMap.entries()).map(([type, data]) => ({
    type,
    value: Math.round(data.value * 100) / 100,
    percentage: Math.round((data.value / totalValue) * 100 * 100) / 100,
    count: data.count
  })).sort((a, b) => b.value - a.value);
}

/**
 * Calculate individual investment performance
 */
export function calculateInvestmentPerformance(
  investments: Investment[]
): InvestmentPerformance[] {
  return investments.map(investment => {
    const currentValue = investment.currentValue ?? 
      (investment.quantity * investment.lastSyncedPrice);
    
    const invested = investment.quantity * investment.purchasePrice;
    const returnAmount = currentValue - invested;
    const returnPercentage = invested > 0 ? (returnAmount / invested) * 100 : 0;
    const currentPrice = investment.quantity > 0 ? currentValue / investment.quantity : 0;

    return {
      symbol: investment.symbol,
      type: investment.type,
      currentValue: Math.round(currentValue * 100) / 100,
      invested: Math.round(invested * 100) / 100,
      return: Math.round(returnAmount * 100) / 100,
      returnPercentage: Math.round(returnPercentage * 100) / 100,
      quantity: investment.quantity,
      currentPrice: Math.round(currentPrice * 100) / 100
    };
  }).sort((a, b) => b.currentValue - a.currentValue);
}

/**
 * Get top performing investments
 */
export function getTopPerformers(
  investments: Investment[],
  limit: number = 5
): InvestmentPerformance[] {
  const performances = calculateInvestmentPerformance(investments);
  return performances
    .filter(p => p.returnPercentage > 0)
    .sort((a, b) => b.returnPercentage - a.returnPercentage)
    .slice(0, limit);
}

/**
 * Get worst performing investments
 */
export function getWorstPerformers(
  investments: Investment[],
  limit: number = 5
): InvestmentPerformance[] {
  const performances = calculateInvestmentPerformance(investments);
  return performances
    .filter(p => p.returnPercentage < 0)
    .sort((a, b) => a.returnPercentage - b.returnPercentage)
    .slice(0, limit);
}

/**
 * Calculate portfolio diversification score
 */
export function calculateDiversificationScore(investments: Investment[]): {
  score: number;
  level: 'poor' | 'fair' | 'good' | 'excellent';
  recommendations: string[];
} {
  if (investments.length === 0) {
    return {
      score: 0,
      level: 'poor',
      recommendations: ['Start building your investment portfolio']
    };
  }

  const allocation = calculateAssetAllocation(investments);
  const recommendations: string[] = [];
  
  // Calculate diversification based on asset type distribution
  let score = 0;
  
  // Points for having multiple asset types
  const assetTypes = allocation.length;
  score += Math.min(assetTypes * 15, 60); // Max 60 points for 4+ asset types
  
  // Points for balanced allocation (no single asset > 70%)
  const maxAllocation = Math.max(...allocation.map(a => a.percentage));
  if (maxAllocation <= 40) {
    score += 25;
  } else if (maxAllocation <= 60) {
    score += 15;
  } else if (maxAllocation <= 80) {
    score += 5;
  } else {
    recommendations.push('Consider reducing concentration in your largest asset class');
  }
  
  // Points for having defensive assets (bonds)
  const hasBonds = allocation.some(a => a.type === 'bond');
  if (hasBonds) {
    score += 15;
  } else {
    recommendations.push('Consider adding bonds for stability');
  }
  
  // Determine level
  let level: 'poor' | 'fair' | 'good' | 'excellent';
  if (score >= 85) {
    level = 'excellent';
  } else if (score >= 70) {
    level = 'good';
  } else if (score >= 50) {
    level = 'fair';
    recommendations.push('Consider diversifying across more asset classes');
  } else {
    level = 'poor';
    recommendations.push('Your portfolio needs better diversification');
  }

  return {
    score: Math.min(score, 100),
    level,
    recommendations
  };
}

/**
 * Convert investment value to primary currency
 */
export function convertToPrimaryCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate?: number
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Use provided exchange rate or default to 1 (would be replaced with real rates)
  const rate = exchangeRate ?? 1;
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Format investment value for display
 */
export function formatInvestmentValue(
  amount: number,
  currency: string = 'USD',
  showCurrency: boolean = true
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: showCurrency ? 'currency' : 'decimal',
    currency: showCurrency ? currency : undefined,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Format percentage change for display
 */
export function formatPercentageChange(percentage: number): {
  formatted: string;
  color: 'green' | 'red' | 'gray';
  sign: '+' | '-' | '';
} {
  const sign = percentage > 0 ? '+' : percentage < 0 ? '-' : '';
  const color = percentage > 0 ? 'green' : percentage < 0 ? 'red' : 'gray';
  const formatted = `${sign}${Math.abs(percentage).toFixed(2)}%`;
  
  return { formatted, color, sign };
}

/**
 * Validate investment data
 */
export function validateInvestmentData(data: Partial<Investment>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!data.symbol || data.symbol.trim().length === 0) {
    errors.push('Symbol is required');
  }
  
  if (!data.type) {
    errors.push('Investment type is required');
  }
  
  if (!data.quantity || data.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (!data.purchasePrice || data.purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0');
  }
  
  if (!data.purchaseCurrency || data.purchaseCurrency.length !== 3) {
    errors.push('Valid currency code is required');
  }
  
  if (!data.purchaseDate) {
    errors.push('Purchase date is required');
  } else if (data.purchaseDate > new Date()) {
    errors.push('Purchase date cannot be in the future');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate investment categories with examples
 */
export function getInvestmentCategories(): Array<{
  type: Investment['type'];
  label: string;
  description: string;
  examples: string[];
}> {
  return [
    {
      type: 'stock',
      label: 'Stocks',
      description: 'Individual company shares',
      examples: ['AAPL', 'MSFT', 'GOOGL', 'TSLA']
    },
    {
      type: 'bond',
      label: 'Bonds',
      description: 'Government and corporate bonds',
      examples: ['US Treasury', 'Corporate Bonds', 'Municipal Bonds']
    },
    {
      type: 'mutual-fund',
      label: 'Mutual Funds',
      description: 'Professionally managed investment funds',
      examples: ['VFIAX', 'FXNAX', 'VTSMX']
    },
    {
      type: 'real-estate',
      label: 'Real Estate',
      description: 'Property investments and REITs',
      examples: ['REITs', 'Rental Properties', 'Real Estate Funds']
    },
    {
      type: 'crypto',
      label: 'Cryptocurrency',
      description: 'Digital currencies and tokens',
      examples: ['BTC', 'ETH', 'ADA', 'DOT']
    },
    {
      type: 'other',
      label: 'Other',
      description: 'Commodities, derivatives, and alternative investments',
      examples: ['Gold', 'Oil', 'Options', 'Futures']
    }
  ];
}