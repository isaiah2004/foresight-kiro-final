// Financial data types for the Foresight application

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  convertedAmount?: number; // In primary currency
  exchangeRate?: number;
  category: string;
  subcategory?: string;
  description: string;
  date: Date;
  type: 'income' | 'expense' | 'transfer' | 'investment';
  metadata?: Record<string, any>;
}

export interface Investment {
  id: string;
  userId: string;
  symbol: string;
  type: 'stock' | 'bond' | 'mutual-fund' | 'real-estate' | 'crypto' | 'other';
  quantity: number;
  purchasePrice: number;
  purchaseCurrency: string;
  purchaseDate: Date;
  lastSyncedPrice: number;
  lastSyncedPriceCurrency: string;
  lastSyncTimestamp: Date;
  currentValue?: number; // Calculated field in user's primary currency
  currentValueCurrency?: string;
}

export interface BudgetAllocation {
  userId: string;
  totalIncome: number;
  currency: string;
  categories: {
    essentials: { percentage: 50; amount: number };
    lifestyle: { percentage: 20; amount: number };
    savingsFuture: { percentage: 20; amount: number };
    sinkingFund: { percentage: 10; amount: number };
    unallocated: { amount: number };
    misc: { amount: number };
  };
  lastUpdated: Date;
}
export interface Bucket {
  id: string;
  userId: string;
  name: string;
  category: 'essentials' | 'lifestyle' | 'savingsFuture' | 'sinkingFund';
  targetAmount: number;
  currentAmount: number;
  currency: string;
  renewalRate: 'daily' | 'every2days' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'yearly' | 'biyearly' | 'quarterly';
  nextRenewal: Date;
  isActive: boolean;
}

export interface Loan {
  id: string;
  userId: string;
  type: 'home' | 'car' | 'personal' | 'other';
  principal: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  currency: string;
  region: 'india' | 'us' | 'eu';
  rateType: 'fixed' | 'floating';

  // Regional specific fields
  rbiCompliance?: {
    isRLLR: boolean;
    benchmarkRate: number;
    spread: number;
    creditRiskPremium: number;
  };

  usCompliance?: {
    apr: number;
    isARM: boolean;
    armDetails?: {
      initialRate: number;
      margin: number;
      adjustmentCaps: {
        initial: number;
        periodic: number;
        lifetime: number;
      };
    };
  };

  euCompliance?: {
    aprc: number;
    hasWithdrawalPeriod: boolean;
    prepaymentCompensation?: number;
  };
}

export interface Pot {
  id: string;
  userId: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  linkedCategories: Array<'essentials' | 'lifestyle' | 'savingsFuture' | 'sinkingFund' | 'unallocated'>;
  sourceAllocations: Array<{
    categoryId: string;
    amount: number;
    date: Date;
  }>;
  goalType: 'vacation' | 'house-downpayment' | 'laptop' | 'other';
  targetDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
}

export interface IncomeSource {
  id: string;
  userId: string;
  type: 'salary' | 'rental' | 'other';
  name: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  metadata?: Record<string, any>;
}

export interface Expense {
  id: string;
  userId: string;
  category: 'rent' | 'groceries' | 'utilities' | 'entertainment' | 'other';
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  bucketId?: string; // Link to budget bucket
  metadata?: Record<string, any>;
}