import { BudgetCalculationInput, BudgetCalculationResult, BudgetAllocation, Bucket } from '@/types/budget';

/**
 * Default budget allocation percentages based on the 6-category system
 */
export const DEFAULT_BUDGET_PERCENTAGES = {
  essentials: 50,    // 50% - Housing, groceries, transportation, insurance, debt repayment, medical
  lifestyle: 20,     // 20% - Dining out, subscriptions, travel, personal fun money
  savingsFuture: 20, // 20% - Emergency fund, retirement/investments, general savings
  sinkingFund: 10,   // 10% - Electronics, clothing, home & furniture, gifts, annual expenses
  unallocated: 0,    // Variable - Mid-month income increases
  misc: 0,           // Variable - Hard-to-track cash expenses
} as const;

/**
 * Calculate budget allocation based on income and tax rate
 */
export function calculateBudgetAllocation(input: BudgetCalculationInput): BudgetCalculationResult {
  const { grossIncome, taxRate, customPercentages = {} } = input;
  
  // Calculate net income after taxes
  const taxAmount = grossIncome * (taxRate / 100);
  const netIncome = grossIncome - taxAmount;
  
  // Use custom percentages or defaults
  const percentages = {
    essentials: customPercentages.essentials ?? DEFAULT_BUDGET_PERCENTAGES.essentials,
    lifestyle: customPercentages.lifestyle ?? DEFAULT_BUDGET_PERCENTAGES.lifestyle,
    savingsFuture: customPercentages.savingsFuture ?? DEFAULT_BUDGET_PERCENTAGES.savingsFuture,
    sinkingFund: customPercentages.sinkingFund ?? DEFAULT_BUDGET_PERCENTAGES.sinkingFund,
  };
  
  // Calculate amounts for each category
  const essentialsAmount = netIncome * (percentages.essentials / 100);
  const lifestyleAmount = netIncome * (percentages.lifestyle / 100);
  const savingsFutureAmount = netIncome * (percentages.savingsFuture / 100);
  const sinkingFundAmount = netIncome * (percentages.sinkingFund / 100);
  
  // Calculate allocated total and unallocated amount
  const allocatedTotal = essentialsAmount + lifestyleAmount + savingsFutureAmount + sinkingFundAmount;
  const unallocatedAmount = netIncome - allocatedTotal;
  
  return {
    grossIncome,
    netIncome,
    taxAmount,
    categories: {
      essentials: {
        amount: Math.round(essentialsAmount * 100) / 100,
        percentage: percentages.essentials,
      },
      lifestyle: {
        amount: Math.round(lifestyleAmount * 100) / 100,
        percentage: percentages.lifestyle,
      },
      savingsFuture: {
        amount: Math.round(savingsFutureAmount * 100) / 100,
        percentage: percentages.savingsFuture,
      },
      sinkingFund: {
        amount: Math.round(sinkingFundAmount * 100) / 100,
        percentage: percentages.sinkingFund,
      },
      unallocated: {
        amount: Math.round(unallocatedAmount * 100) / 100,
        percentage: Math.round((unallocatedAmount / netIncome) * 100 * 100) / 100,
      },
      misc: {
        amount: 0, // Initially zero, can be adjusted by user
        percentage: 0,
      },
    },
  };
}

/**
 * Handle mid-month income increases by adding to unallocated funds
 */
export function handleIncomeIncrease(
  currentAllocation: BudgetAllocation,
  additionalIncome: number
): BudgetCalculationResult {
  const newGrossIncome = currentAllocation.grossIncome + additionalIncome;
  const taxAmount = additionalIncome * (currentAllocation.taxRate / 100);
  const additionalNetIncome = additionalIncome - taxAmount;
  
  // Add additional net income to unallocated category to encourage saving
  const newNetIncome = currentAllocation.netIncome + additionalNetIncome;
  const newUnallocatedAmount = currentAllocation.categories.unallocated.amount + additionalNetIncome;
  
  return {
    grossIncome: newGrossIncome,
    netIncome: newNetIncome,
    taxAmount: currentAllocation.grossIncome * (currentAllocation.taxRate / 100) + taxAmount,
    categories: {
      essentials: {
        amount: currentAllocation.categories.essentials.amount,
        percentage: (currentAllocation.categories.essentials.amount / newNetIncome) * 100,
      },
      lifestyle: {
        amount: currentAllocation.categories.lifestyle.amount,
        percentage: (currentAllocation.categories.lifestyle.amount / newNetIncome) * 100,
      },
      savingsFuture: {
        amount: currentAllocation.categories.savingsFuture.amount,
        percentage: (currentAllocation.categories.savingsFuture.amount / newNetIncome) * 100,
      },
      sinkingFund: {
        amount: currentAllocation.categories.sinkingFund.amount,
        percentage: (currentAllocation.categories.sinkingFund.amount / newNetIncome) * 100,
      },
      unallocated: {
        amount: Math.round(newUnallocatedAmount * 100) / 100,
        percentage: Math.round((newUnallocatedAmount / newNetIncome) * 100 * 100) / 100,
      },
      misc: {
        amount: currentAllocation.categories.misc.amount,
        percentage: (currentAllocation.categories.misc.amount / newNetIncome) * 100,
      },
    },
  };
}

/**
 * Calculate next renewal date based on renewal rate
 */
export function calculateNextRenewal(renewalRate: Bucket['renewalRate'], lastRenewal?: Date): Date {
  const baseDate = lastRenewal || new Date();
  const nextRenewal = new Date(baseDate);
  
  switch (renewalRate) {
    case 'daily':
      nextRenewal.setDate(nextRenewal.getDate() + 1);
      break;
    case 'every2days':
      nextRenewal.setDate(nextRenewal.getDate() + 2);
      break;
    case 'weekly':
      nextRenewal.setDate(nextRenewal.getDate() + 7);
      break;
    case 'biweekly':
      nextRenewal.setDate(nextRenewal.getDate() + 14);
      break;
    case 'monthly':
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
      break;
    case 'bimonthly':
      nextRenewal.setMonth(nextRenewal.getMonth() + 2);
      break;
    case 'quarterly':
      nextRenewal.setMonth(nextRenewal.getMonth() + 3);
      break;
    case 'biyearly':
      nextRenewal.setMonth(nextRenewal.getMonth() + 6);
      break;
    case 'yearly':
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
      break;
    default:
      throw new Error(`Invalid renewal rate: ${renewalRate}`);
  }
  
  return nextRenewal;
}

/**
 * Check if a bucket should be renewed
 */
export function shouldRenewBucket(bucket: Bucket): boolean {
  if (!bucket.isActive || !bucket.autoRenew) {
    return false;
  }
  
  const now = new Date();
  return now >= bucket.nextRenewal;
}

/**
 * Calculate bucket renewal amount based on category allocation
 */
export function calculateBucketRenewal(
  bucket: Bucket,
  categoryAllocation: number
): { shouldRenew: boolean; renewalAmount: number; nextRenewal: Date } {
  const shouldRenew = shouldRenewBucket(bucket);
  
  if (!shouldRenew) {
    return {
      shouldRenew: false,
      renewalAmount: 0,
      nextRenewal: bucket.nextRenewal,
    };
  }
  
  // Calculate renewal amount based on bucket's target and category allocation
  const renewalAmount = Math.min(bucket.targetAmount - bucket.currentAmount, categoryAllocation);
  const nextRenewal = calculateNextRenewal(bucket.renewalRate, new Date());
  
  return {
    shouldRenew: true,
    renewalAmount: Math.max(0, renewalAmount),
    nextRenewal,
  };
}

/**
 * Validate budget allocation percentages
 */
export function validateBudgetPercentages(percentages: {
  essentials: number;
  lifestyle: number;
  savingsFuture: number;
  sinkingFund: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const total = percentages.essentials + percentages.lifestyle + percentages.savingsFuture + percentages.sinkingFund;
  
  // Check individual percentages
  Object.entries(percentages).forEach(([category, percentage]) => {
    if (percentage < 0) {
      errors.push(`${category} percentage cannot be negative`);
    }
    if (percentage > 100) {
      errors.push(`${category} percentage cannot exceed 100%`);
    }
  });
  
  // Check total doesn't exceed 100%
  if (total > 100) {
    errors.push(`Total allocation (${total}%) cannot exceed 100%`);
  }
  
  // Warn if essentials is too low (less than 30%)
  if (percentages.essentials < 30) {
    errors.push('Essentials allocation below 30% may not cover basic needs');
  }
  
  // Warn if savings is too low (less than 10%)
  if (percentages.savingsFuture < 10) {
    errors.push('Savings allocation below 10% may not provide adequate financial security');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get category color for UI display
 */
export function getCategoryColor(category: string): string {
  const colors = {
    essentials: '#ef4444',    // red-500
    lifestyle: '#f59e0b',     // amber-500
    savingsFuture: '#10b981', // emerald-500
    sinkingFund: '#3b82f6',   // blue-500
    unallocated: '#6b7280',   // gray-500
    misc: '#8b5cf6',          // violet-500
  };
  
  return colors[category as keyof typeof colors] || '#6b7280';
}

/**
 * Format currency amount for display
 */
export function formatBudgetAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}