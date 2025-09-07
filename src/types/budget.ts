export interface BudgetCategory {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  description: string;
  color: string;
}

export interface BudgetAllocation {
  id: string;
  userId: string;
  grossIncome: number;
  netIncome: number;
  taxRate: number;
  currency: string;
  categories: {
    essentials: BudgetCategory;
    lifestyle: BudgetCategory;
    savingsFuture: BudgetCategory;
    sinkingFund: BudgetCategory;
    unallocated: BudgetCategory;
    misc: BudgetCategory;
  };
  lastUpdated: Date;
  createdAt: Date;
}

export interface BudgetCalculationInput {
  grossIncome: number;
  taxRate: number;
  currency: string;
  customPercentages?: {
    essentials?: number;
    lifestyle?: number;
    savingsFuture?: number;
    sinkingFund?: number;
  };
}

export interface BudgetCalculationResult {
  grossIncome: number;
  netIncome: number;
  taxAmount: number;
  categories: {
    essentials: { amount: number; percentage: number };
    lifestyle: { amount: number; percentage: number };
    savingsFuture: { amount: number; percentage: number };
    sinkingFund: { amount: number; percentage: number };
    unallocated: { amount: number; percentage: number };
    misc: { amount: number; percentage: number };
  };
}

export interface Bucket {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: 'essentials' | 'lifestyle' | 'savingsFuture' | 'sinkingFund';
  targetAmount: number;
  currentAmount: number;
  currency: string;
  renewalRate: 'daily' | 'every2days' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'yearly' | 'biyearly' | 'quarterly';
  nextRenewal: Date;
  lastRenewal?: Date;
  isActive: boolean;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BucketExample {
  name: string;
  description: string;
  category: 'essentials' | 'lifestyle' | 'savingsFuture' | 'sinkingFund';
  suggestedAmount?: number;
  renewalRate: Bucket['renewalRate'];
}

export const BUCKET_EXAMPLES: Record<string, BucketExample[]> = {
  essentials: [
    { name: 'Housing', description: 'Rent, mortgage, property taxes', category: 'essentials', renewalRate: 'monthly' },
    { name: 'Groceries', description: 'Food and household essentials', category: 'essentials', renewalRate: 'weekly' },
    { name: 'Transportation', description: 'Gas, public transport, car maintenance', category: 'essentials', renewalRate: 'monthly' },
    { name: 'Insurance', description: 'Health, auto, home insurance', category: 'essentials', renewalRate: 'monthly' },
    { name: 'Debt Repayment', description: 'Minimum debt payments', category: 'essentials', renewalRate: 'monthly' },
    { name: 'Medical', description: 'Healthcare and medical expenses', category: 'essentials', renewalRate: 'monthly' },
  ],
  lifestyle: [
    { name: 'Dining Out', description: 'Restaurants and takeout', category: 'lifestyle', renewalRate: 'weekly' },
    { name: 'Subscriptions', description: 'Netflix, Spotify, gym memberships', category: 'lifestyle', renewalRate: 'monthly' },
    { name: 'Travel', description: 'Vacations and weekend trips', category: 'lifestyle', renewalRate: 'monthly' },
    { name: 'Personal Fun Money', description: 'Hobbies and entertainment', category: 'lifestyle', renewalRate: 'weekly' },
    { name: 'Shopping', description: 'Non-essential purchases', category: 'lifestyle', renewalRate: 'monthly' },
  ],
  savingsFuture: [
    { name: 'Emergency Fund', description: '3-6 months of expenses', category: 'savingsFuture', renewalRate: 'monthly' },
    { name: 'Retirement/Investments', description: '401k, IRA, investment accounts', category: 'savingsFuture', renewalRate: 'monthly' },
    { name: 'General Savings', description: 'Long-term savings goals', category: 'savingsFuture', renewalRate: 'monthly' },
    { name: 'Education Fund', description: 'College or skill development', category: 'savingsFuture', renewalRate: 'monthly' },
  ],
  sinkingFund: [
    { name: 'Electronics', description: 'Phone, laptop, gadgets', category: 'sinkingFund', renewalRate: 'monthly' },
    { name: 'Clothing', description: 'Seasonal clothing purchases', category: 'sinkingFund', renewalRate: 'quarterly' },
    { name: 'Home & Furniture', description: 'Home improvements and furniture', category: 'sinkingFund', renewalRate: 'monthly' },
    { name: 'Gifts', description: 'Birthday and holiday gifts', category: 'sinkingFund', renewalRate: 'monthly' },
    { name: 'Annual Expenses', description: 'Car registration, annual fees', category: 'sinkingFund', renewalRate: 'yearly' },
    { name: 'Car Maintenance', description: 'Oil changes, repairs, tires', category: 'sinkingFund', renewalRate: 'monthly' },
  ],
};

export const RENEWAL_RATE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'every2days', label: 'Every 2 Days' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'bimonthly', label: 'Bi-monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'biyearly', label: 'Bi-yearly' },
  { value: 'yearly', label: 'Yearly' },
] as const;