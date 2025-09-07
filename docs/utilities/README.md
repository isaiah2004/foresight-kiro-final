# Utilities & Hooks Guide

This guide covers all the utility functions and custom hooks used in the Foresight Financial Planning App, including their usage patterns and examples.

## Table of Contents

- [Utility Functions](#utility-functions)
- [Custom Hooks](#custom-hooks)
- [Financial Calculations](#financial-calculations)
- [Currency Utilities](#currency-utilities)
- [Usage Examples](#usage-examples)

## Utility Functions

### General Utilities (`lib/utils.ts`)

#### `cn` - Class Name Utility
Combines class names using clsx and tailwind-merge for conditional styling.

```typescript
import { cn } from '@/lib/utils';

// Basic usage
const className = cn('base-class', 'additional-class');

// Conditional classes
const className = cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
);

// With Tailwind CSS conflicts resolution
const className = cn(
  'px-4 py-2',
  'px-6', // This will override px-4
  'text-red-500',
  isSuccess && 'text-green-500' // This will override text-red-500 when isSuccess is true
);
```

#### `formatCurrency` - Currency Formatting
Formats numbers as currency with proper locale support.

```typescript
import { formatCurrency } from '@/lib/utils';

// Basic usage
formatCurrency(1234.56, 'USD'); // "$1,234.56"
formatCurrency(1234.56, 'EUR'); // "€1,234.56"
formatCurrency(1234.56, 'INR'); // "₹1,234.56"

// With custom locale
formatCurrency(1234.56, 'USD', 'de-DE'); // "1.234,56 $"
```

#### `debounce` - Function Debouncing
Delays function execution until after a specified delay.

```typescript
import { debounce } from '@/lib/utils';

const debouncedSearch = debounce((query: string) => {
  // Perform search
  console.log('Searching for:', query);
}, 300);

// Usage in component
const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  debouncedSearch(e.target.value);
};
```

### Firebase Utilities (`lib/firebase.ts`)

#### Database Operations
```typescript
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Get document
export async function getDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// Create/Update document
export async function setDocument(collectionName: string, docId: string, data: any) {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data, { merge: true });
}

// Update document
export async function updateDocument(collectionName: string, docId: string, updates: any) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, updates);
}

// Delete document
export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}
```

## Custom Hooks

### Currency Hook (`hooks/use-currency.ts`)

Manages currency conversion and formatting throughout the app.

```typescript
import { useCurrency } from '@/hooks/use-currency';

function InvestmentCard({ investment }: { investment: Investment }) {
  const { convertAmount, formatAmount, primaryCurrency } = useCurrency();
  
  const convertedValue = convertAmount(
    investment.value, 
    investment.currency, 
    primaryCurrency
  );
  
  return (
    <div>
      <p>Value: {formatAmount(convertedValue, primaryCurrency)}</p>
      <p>Original: {formatAmount(investment.value, investment.currency)}</p>
    </div>
  );
}
```

**Available Methods**:
- `convertAmount(amount, fromCurrency, toCurrency)` - Convert between currencies
- `formatAmount(amount, currency)` - Format amount with currency symbol
- `getExchangeRate(fromCurrency, toCurrency)` - Get current exchange rate
- `primaryCurrency` - User's primary currency setting

### User Profile Hook (`hooks/use-user-profile.ts`)

Manages user profile data and preferences.

```typescript
import { useUserProfile } from '@/hooks/use-user-profile';

function UserSettings() {
  const { 
    profile, 
    updateProfile, 
    isLoading, 
    error 
  } = useUserProfile();
  
  const handleCurrencyChange = async (currency: string) => {
    await updateProfile({ primaryCurrency: currency });
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <p>Primary Currency: {profile?.primaryCurrency}</p>
      <button onClick={() => handleCurrencyChange('EUR')}>
        Switch to EUR
      </button>
    </div>
  );
}
```

**Available Properties**:
- `profile` - Current user profile data
- `updateProfile(updates)` - Update profile function
- `isLoading` - Loading state
- `error` - Error state if any

### Sidebar State Hook (`hooks/use-sidebar-state.ts`)

Manages sidebar collapse/expand state with cookie persistence.

```typescript
import { useSidebarState } from '@/hooks/use-sidebar-state';

function SidebarToggle() {
  const { isOpen, toggle, setOpen } = useSidebarState();
  
  return (
    <button onClick={toggle}>
      {isOpen ? 'Collapse' : 'Expand'} Sidebar
    </button>
  );
}
```

**Available Methods**:
- `isOpen` - Current sidebar state
- `toggle()` - Toggle sidebar state
- `setOpen(boolean)` - Set specific state

### Mobile Detection Hook (`hooks/use-mobile.tsx`)

Detects mobile devices for responsive behavior.

```typescript
import { useMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const isMobile = useMobile();
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {isMobile ? <MobileNavigation /> : <DesktopNavigation />}
    </div>
  );
}
```

## Financial Calculations

### Loan Calculations (`lib/financial/loans.ts`)

#### EMI Calculation
```typescript
import { calculateEMI } from '@/lib/financial/loans';

const emi = calculateEMI({
  principal: 1000000, // ₹10,00,000
  interestRate: 8.5,  // 8.5% annual
  termMonths: 240     // 20 years
});

console.log(`Monthly EMI: ₹${emi.toFixed(2)}`);
```

#### Amortization Schedule
```typescript
import { generateAmortizationSchedule } from '@/lib/financial/loans';

const schedule = generateAmortizationSchedule({
  principal: 1000000,
  interestRate: 8.5,
  termMonths: 240
});

schedule.forEach((payment, index) => {
  console.log(`Payment ${index + 1}:`, {
    emi: payment.totalPayment,
    principal: payment.principalComponent,
    interest: payment.interestComponent,
    balance: payment.closingBalance
  });
});
```

#### Prepayment Analysis
```typescript
import { calculatePrepaymentImpact } from '@/lib/financial/loans';

const impact = calculatePrepaymentImpact({
  currentBalance: 800000,
  remainingMonths: 180,
  interestRate: 8.5,
  prepaymentAmount: 100000,
  option: 'reduce-tenure' // or 'reduce-emi'
});

console.log('Prepayment Impact:', {
  savedInterest: impact.interestSaved,
  newTenure: impact.newTenureMonths,
  newEMI: impact.newEMI
});
```

### Investment Calculations (`lib/financial/investments.ts`)

#### Portfolio Value
```typescript
import { calculatePortfolioValue } from '@/lib/financial/investments';

const portfolioValue = await calculatePortfolioValue(userId, primaryCurrency);

console.log('Portfolio Summary:', {
  totalValue: portfolioValue.total,
  dayChange: portfolioValue.dayChange,
  dayChangePercent: portfolioValue.dayChangePercent,
  breakdown: portfolioValue.byAssetType
});
```

#### Investment Returns
```typescript
import { calculateReturns } from '@/lib/financial/investments';

const returns = calculateReturns({
  purchasePrice: 100,
  currentPrice: 120,
  quantity: 50,
  dividends: 25 // Total dividends received
});

console.log('Investment Returns:', {
  totalReturn: returns.totalReturn,
  totalReturnPercent: returns.totalReturnPercent,
  capitalGain: returns.capitalGain,
  dividendYield: returns.dividendYield
});
```

### Budget Calculations (`lib/financial/budgets.ts`)

#### Income Allocation
```typescript
import { calculateBudgetAllocation } from '@/lib/financial/budgets';

const allocation = calculateBudgetAllocation({
  grossIncome: 100000,
  taxRate: 30,
  categories: {
    essentials: 50,    // 50%
    lifestyle: 20,     // 20%
    savingsFuture: 20, // 20%
    sinkingFund: 10    // 10%
  }
});

console.log('Budget Allocation:', {
  netIncome: allocation.netIncome,
  essentials: allocation.essentials,
  lifestyle: allocation.lifestyle,
  savingsFuture: allocation.savingsFuture,
  sinkingFund: allocation.sinkingFund
});
```

#### Bucket Management
```typescript
import { calculateBucketRenewal } from '@/lib/financial/budgets';

const renewal = calculateBucketRenewal({
  bucketId: 'groceries-bucket',
  renewalRate: 'weekly',
  amount: 500,
  lastRenewal: new Date('2024-01-01')
});

console.log('Bucket Renewal:', {
  nextRenewal: renewal.nextRenewalDate,
  daysUntilRenewal: renewal.daysUntilRenewal,
  shouldRenew: renewal.shouldRenew
});
```

## Currency Utilities

### Exchange Rate Management (`lib/currency/exchange-rates.ts`)

#### Fetch Current Rates
```typescript
import { getCurrentExchangeRate } from '@/lib/currency/exchange-rates';

const rate = await getCurrentExchangeRate('USD', 'EUR');
console.log(`1 USD = ${rate} EUR`);
```

#### Batch Rate Fetching
```typescript
import { getBatchExchangeRates } from '@/lib/currency/exchange-rates';

const rates = await getBatchExchangeRates('USD', ['EUR', 'GBP', 'JPY', 'INR']);
console.log('Exchange Rates:', rates);
// Output: { EUR: 0.85, GBP: 0.73, JPY: 110.25, INR: 74.50 }
```

### Currency Conversion (`lib/currency/utils.ts`)

#### Convert Amounts
```typescript
import { convertCurrency } from '@/lib/currency/utils';

const converted = await convertCurrency({
  amount: 1000,
  fromCurrency: 'USD',
  toCurrency: 'EUR'
});

console.log(`$1000 USD = €${converted.convertedAmount} EUR`);
console.log(`Exchange rate: ${converted.exchangeRate}`);
```

#### Format Currency Display
```typescript
import { formatCurrencyDisplay } from '@/lib/currency/utils';

const formatted = formatCurrencyDisplay(1234.56, 'USD', 'en-US');
console.log(formatted); // "$1,234.56"

const formattedEUR = formatCurrencyDisplay(1234.56, 'EUR', 'de-DE');
console.log(formattedEUR); // "1.234,56 €"
```

## Usage Examples

### Complete Investment Form with Validation

```typescript
"use client"

import { useState } from 'react';
import { useCurrency } from '@/hooks/use-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function InvestmentForm() {
  const { primaryCurrency, convertAmount } = useCurrency();
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    price: '',
    currency: 'USD'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const investment = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      totalValue: parseFloat(formData.quantity) * parseFloat(formData.price),
      convertedValue: await convertAmount(
        parseFloat(formData.quantity) * parseFloat(formData.price),
        formData.currency,
        primaryCurrency
      )
    };
    
    // Save investment
    console.log('Investment:', investment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Stock Symbol (e.g., AAPL)"
        value={formData.symbol}
        onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
        required
      />
      
      <Input
        type="number"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
        required
      />
      
      <div className="flex gap-2">
        <Input
          type="number"
          step="0.01"
          placeholder="Price per share"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          required
        />
        
        <Select 
          value={formData.currency} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
            <SelectItem value="INR">INR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" className="w-full">
        Add Investment
      </Button>
    </form>
  );
}
```

### Budget Dashboard with Real-time Calculations

```typescript
import { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { calculateBudgetAllocation } from '@/lib/financial/budgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BudgetDashboard() {
  const { profile } = useUserProfile();
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    if (profile?.monthlyIncome) {
      const allocation = calculateBudgetAllocation({
        grossIncome: profile.monthlyIncome,
        taxRate: profile.taxRate || 30,
        categories: {
          essentials: 50,
          lifestyle: 20,
          savingsFuture: 20,
          sinkingFund: 10
        }
      });
      setBudget(allocation);
    }
  }, [profile]);

  if (!budget) return <div>Loading budget...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Essentials (50%)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${budget.essentials.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Housing, Groceries, Transport</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lifestyle (20%)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${budget.lifestyle.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Dining, Entertainment, Hobbies</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Savings & Future (20%)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${budget.savingsFuture.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Emergency, Retirement, Investments</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sinking Fund (10%)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${budget.sinkingFund.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Electronics, Clothing, Gifts</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Best Practices

1. **Use TypeScript** - Always type your utility functions and hooks
2. **Handle errors gracefully** - Implement proper error handling in async utilities
3. **Cache expensive calculations** - Use React.useMemo for heavy computations
4. **Debounce user inputs** - Prevent excessive API calls with debouncing
5. **Validate inputs** - Always validate data before processing
6. **Use proper loading states** - Show loading indicators for async operations
7. **Follow SRP** - Each utility should have one clear responsibility
8. **Document complex logic** - Add comments for financial calculations and business logic