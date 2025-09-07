# API Reference

This guide covers the API endpoints, Firebase integration, and external service integrations used in the Foresight Financial Planning App.

## Table of Contents

- [Firebase Integration](#firebase-integration)
- [External APIs](#external-apis)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

## Firebase Integration

### Firestore Collections

#### Users Collection (`users`)
Stores user profile and preferences.

```typescript
interface UserProfile {
  id: string;
  clerkId: string;
  primaryCurrency: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Usage
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Get user profile
const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as UserProfile : null;
};

// Update user profile
const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, { ...updates, updatedAt: new Date() }, { merge: true });
};
```

#### Transactions Collection (`transactions`)
Stores all financial transactions with multi-currency support.

```typescript
interface Transaction {
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

// Usage
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

// Add transaction
const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const docRef = await addDoc(collection(db, 'transactions'), transaction);
  return docRef.id;
};

// Get user transactions
const getUserTransactions = async (userId: string, limit = 50) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limit)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

#### Investments Collection (`investments`)
Stores investment portfolio data with caching support.

```typescript
interface Investment {
  id: string;
  userId: string;
  symbol: string;
  type: 'stock' | 'bond' | 'mutual-fund' | 'real-estate' | 'crypto' | 'other';
  quantity: number;
  purchasePrice: number;
  purchaseCurrency: string;
  purchaseDate: Date;
  lastSyncedPrice: number;
  lastSyncTimestamp: Date;
  currentValue?: number; // Calculated field
}

// Usage
const addInvestment = async (investment: Omit<Investment, 'id'>) => {
  const docRef = await addDoc(collection(db, 'investments'), investment);
  return docRef.id;
};

const getUserInvestments = async (userId: string) => {
  const q = query(
    collection(db, 'investments'),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

#### Price Cache Collections (`stockCache`, `cryptoCache`)
Intelligent caching system for investment prices.

```typescript
interface PriceCache {
  symbol: string;
  type: 'stock' | 'crypto';
  price: number;
  currency: string;
  lastUpdated: Date;
  source: 'finnhub' | 'alphavantage';
}

// Usage
const updatePriceCache = async (symbol: string, type: 'stock' | 'crypto', priceData: Partial<PriceCache>) => {
  const collectionName = type === 'stock' ? 'stockCache' : 'cryptoCache';
  const docRef = doc(db, collectionName, symbol);
  await setDoc(docRef, { ...priceData, lastUpdated: new Date() }, { merge: true });
};

const getCachedPrice = async (symbol: string, type: 'stock' | 'crypto') => {
  const collectionName = type === 'stock' ? 'stockCache' : 'cryptoCache';
  const docRef = doc(db, collectionName, symbol);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as PriceCache : null;
};
```

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Transactions are user-specific
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Investments are user-specific
    match /investments/{investmentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Price cache is read-only for authenticated users
    match /stockCache/{symbol} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can update cache
    }
    
    match /cryptoCache/{symbol} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can update cache
    }
  }
}
```

## External APIs

### FinnHub.io Integration

Real-time stock market data integration.

```typescript
// lib/external-apis/finnhub.ts
interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
}

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export const getStockQuote = async (symbol: string): Promise<FinnhubQuote> => {
  const response = await fetch(
    `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`FinnHub API error: ${response.statusText}`);
  }
  
  return response.json();
};

export const getBatchStockQuotes = async (symbols: string[]): Promise<Record<string, FinnhubQuote>> => {
  const promises = symbols.map(symbol => 
    getStockQuote(symbol).then(quote => ({ symbol, quote }))
  );
  
  const results = await Promise.allSettled(promises);
  const quotes: Record<string, FinnhubQuote> = {};
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      quotes[result.value.symbol] = result.value.quote;
    } else {
      console.error(`Failed to fetch quote for ${symbols[index]}:`, result.reason);
    }
  });
  
  return quotes;
};
```

### Alpha Vantage Integration

Historical financial data and additional market information.

```typescript
// lib/external-apis/alphavantage.ts
interface AlphaVantageQuote {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

export const getStockQuoteAlpha = async (symbol: string): Promise<AlphaVantageQuote> => {
  const response = await fetch(
    `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.statusText}`);
  }
  
  return response.json();
};

export const getHistoricalData = async (symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  const functionMap = {
    daily: 'TIME_SERIES_DAILY',
    weekly: 'TIME_SERIES_WEEKLY',
    monthly: 'TIME_SERIES_MONTHLY'
  };
  
  const response = await fetch(
    `${ALPHA_VANTAGE_BASE_URL}?function=${functionMap[interval]}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.statusText}`);
  }
  
  return response.json();
};
```

### Exchange Rate API

Currency conversion rates.

```typescript
// lib/external-apis/exchange-rates.ts
interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const EXCHANGE_RATE_BASE_URL = 'https://api.exchangeratesapi.io/v1';

export const getExchangeRates = async (baseCurrency = 'USD'): Promise<ExchangeRateResponse> => {
  const response = await fetch(
    `${EXCHANGE_RATE_BASE_URL}/latest?access_key=${EXCHANGE_RATE_API_KEY}&base=${baseCurrency}`
  );
  
  if (!response.ok) {
    throw new Error(`Exchange Rate API error: ${response.statusText}`);
  }
  
  return response.json();
};

export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<{ convertedAmount: number; exchangeRate: number }> => {
  const response = await fetch(
    `${EXCHANGE_RATE_BASE_URL}/convert?access_key=${EXCHANGE_RATE_API_KEY}&from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
  );
  
  if (!response.ok) {
    throw new Error(`Currency conversion error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    convertedAmount: data.result,
    exchangeRate: data.info.rate
  };
};
```

## Authentication

### Clerk Integration

User authentication and management using Clerk.

```typescript
// lib/auth.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Get current user server-side
export const getCurrentUser = async () => {
  const user = await currentUser();
  return user;
};

// Protect server actions
export const requireAuth = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  return userId;
};

// Client-side user hook
import { useUser } from '@clerk/nextjs';

export function useCurrentUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  
  return {
    user,
    isLoaded,
    isSignedIn,
    userId: user?.id
  };
}
```

### Protected Routes

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/user(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## Data Models

### Complete Type Definitions

```typescript
// types/financial.ts
export interface UserProfile {
  id: string;
  clerkId: string;
  primaryCurrency: string;
  monthlyIncome?: number;
  taxRate?: number;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
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
  lastSyncTimestamp: Date;
  currentValue?: number;
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
```

## Error Handling

### API Error Types

```typescript
// types/api.ts
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  retryable: boolean;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}
```

### Error Handling Utilities

```typescript
// lib/error-handling.ts
export class FinancialApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'FinancialApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof FinancialApiError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      retryable: error.retryable
    };
  }
  
  // Firebase errors
  if (error.code?.startsWith('firestore/')) {
    return {
      code: error.code,
      message: 'Database operation failed',
      statusCode: 500,
      retryable: true
    };
  }
  
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      statusCode: 503,
      retryable: true
    };
  }
  
  // Default error
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred',
    statusCode: 500,
    retryable: false
  };
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const apiError = handleApiError(error);
      
      if (!apiError.retryable || i === maxRetries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError;
};
```

## Best Practices

1. **Always handle errors gracefully** - Implement proper error boundaries and fallbacks
2. **Use TypeScript** - Type all API responses and data models
3. **Implement caching** - Cache expensive API calls and database queries
4. **Rate limiting** - Respect external API rate limits
5. **Security** - Validate all inputs and implement proper authentication
6. **Monitoring** - Log API calls and errors for debugging
7. **Fallback mechanisms** - Provide fallbacks when external services fail
8. **Data validation** - Validate all data before storing in database