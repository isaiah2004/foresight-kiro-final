# Configuration Management Guide

## Purpose
This guide explains how to handle configurations and dictionaries in the Foresight application to maintain clean, maintainable code with shared configuration files.

## Configuration Philosophy

### Centralized Configuration
To avoid code duplication and make refactoring easier, use centralized configuration files that can be imported by multiple components. This is especially important for components that share the same data structure, such as breadcrumbs and sidebar navigation.

### Example Problem
Consider a breadcrumb component and sidebar component that both need the same navigation structure. Without centralized configuration, you would duplicate the navigation data in both components, making maintenance difficult.

## Navigation Configuration

### Shared Navigation Config
Create a centralized navigation configuration that both sidebar and breadcrumb components can import:

```typescript
// lib/navigation-config.ts
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  subItems?: NavigationItem[];
  description?: string;
}

export const navigationConfig: Record<string, NavigationItem> = {
  dashboard: {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    description: 'Financial overview and health metrics'
  },
  
  investments: {
    label: 'Investments',
    href: '/dashboard/investments',
    icon: 'trending-up',
    description: 'Portfolio management and tracking',
    subItems: [
      {
        label: 'Stocks',
        href: '/dashboard/investments/stocks',
        icon: 'line-chart'
      },
      {
        label: 'Bonds',
        href: '/dashboard/investments/bonds',
        icon: 'shield'
      },
      {
        label: 'Mutual Funds',
        href: '/dashboard/investments/mutual-funds',
        icon: 'pie-chart'
      },
      {
        label: 'Real Estate',
        href: '/dashboard/investments/real-estate',
        icon: 'home'
      },
      {
        label: 'Crypto',
        href: '/dashboard/investments/crypto',
        icon: 'bitcoin'
      },
      {
        label: 'Other',
        href: '/dashboard/investments/other',
        icon: 'more-horizontal'
      }
    ]
  },
  
  budgets: {
    label: 'Budgets',
    href: '/dashboard/budgets',
    icon: 'calculator',
    description: 'Income splitting and bucket management',
    subItems: [
      {
        label: 'Income Splitting',
        href: '/dashboard/budgets/income-splitting'
      },
      {
        label: 'Buckets',
        href: '/dashboard/budgets/buckets'
      },
      {
        label: 'Manage',
        href: '/dashboard/budgets/manage'
      }
    ]
  },
  
  income: {
    label: 'Income',
    href: '/dashboard/income',
    icon: 'dollar-sign',
    description: 'Income source management',
    subItems: [
      {
        label: 'Salary',
        href: '/dashboard/income/salary'
      },
      {
        label: 'Rental Properties',
        href: '/dashboard/income/rental-properties'
      },
      {
        label: 'Others',
        href: '/dashboard/income/others'
      }
    ]
  },
  
  expenses: {
    label: 'Expenses',
    href: '/dashboard/expenses',
    icon: 'credit-card',
    description: 'Expense tracking and categorization',
    subItems: [
      {
        label: 'Rent',
        href: '/dashboard/expenses/rent'
      },
      {
        label: 'Groceries',
        href: '/dashboard/expenses/groceries'
      },
      {
        label: 'Utilities',
        href: '/dashboard/expenses/utilities'
      },
      {
        label: 'Entertainment',
        href: '/dashboard/expenses/entertainment'
      },
      {
        label: 'Other',
        href: '/dashboard/expenses/other'
      }
    ]
  },
  
  loans: {
    label: 'Loans',
    href: '/dashboard/loans',
    icon: 'file-text',
    description: 'Loan management with regional compliance',
    subItems: [
      {
        label: 'Home Loan',
        href: '/dashboard/loans/home'
      },
      {
        label: 'Car Loan',
        href: '/dashboard/loans/car'
      },
      {
        label: 'Personal Loan',
        href: '/dashboard/loans/personal'
      },
      {
        label: 'Other',
        href: '/dashboard/loans/other'
      }
    ]
  },
  
  funds: {
    label: 'Funds',
    href: '/dashboard/funds',
    icon: 'target',
    description: 'Goals, pots, and saving funds management',
    subItems: [
      {
        label: 'Pots',
        href: '/dashboard/funds/pots'
      },
      {
        label: 'Saving Funds',
        href: '/dashboard/funds/saving-funds'
      },
      {
        label: 'Other',
        href: '/dashboard/funds/other'
      }
    ]
  },
  
  insights: {
    label: 'Insights',
    href: '/dashboard/insights',
    icon: 'bar-chart-3',
    description: 'Financial analytics and recommendations',
    subItems: [
      {
        label: 'Risk Profile',
        href: '/dashboard/insights/risk-profile'
      },
      {
        label: 'Taxation',
        href: '/dashboard/insights/taxation'
      },
      {
        label: 'Other',
        href: '/dashboard/insights/other'
      }
    ]
  },
  
  settings: {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: 'settings',
    description: 'User preferences and account management'
  },
  
  feedback: {
    label: 'Feedback',
    href: '/dashboard/feedback',
    icon: 'message-circle',
    description: 'Submit feedback and suggestions'
  }
};

// Helper functions for navigation
export const getNavigationItem = (key: string): NavigationItem | undefined => {
  return navigationConfig[key];
};

export const getAllNavigationItems = (): NavigationItem[] => {
  return Object.values(navigationConfig);
};

export const getNavigationItemsByParent = (parentKey: string): NavigationItem[] => {
  const parent = navigationConfig[parentKey];
  return parent?.subItems || [];
};

export const findNavigationItemByHref = (href: string): NavigationItem | undefined => {
  for (const item of Object.values(navigationConfig)) {
    if (item.href === href) return item;
    
    if (item.subItems) {
      const found = item.subItems.find(subItem => subItem.href === href);
      if (found) return found;
    }
  }
  return undefined;
};
```

### Using Shared Configuration

#### Sidebar Component
```typescript
// components/shared/navigation/app-sidebar.tsx
import { navigationConfig } from '@/lib/navigation-config';
import { Sidebar, SidebarContent, SidebarMenu } from '@/components/ui/sidebar';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarMenu>
          {Object.entries(navigationConfig).map(([key, item]) => (
            <SidebarMenuItem key={key} item={item} />
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
```

#### Breadcrumb Component
```typescript
// components/shared/navigation/breadcrumb.tsx
import { navigationConfig, findNavigationItemByHref } from '@/lib/navigation-config';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';

interface BreadcrumbNavProps {
  currentPath: string;
}

export function BreadcrumbNav({ currentPath }: BreadcrumbNavProps) {
  const currentItem = findNavigationItemByHref(currentPath);
  const breadcrumbItems = generateBreadcrumbItems(currentPath);
  
  return (
    <Breadcrumb>
      {breadcrumbItems.map((item, index) => (
        <BreadcrumbItem key={index} item={item} />
      ))}
    </Breadcrumb>
  );
}
```

## Financial Configuration

### Currency Configuration
```typescript
// lib/config/currency-config.ts
export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  locale: string;
}

export const currencyConfig: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    locale: 'en-US'
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimals: 2,
    locale: 'en-EU'
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    decimals: 2,
    locale: 'en-IN'
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimals: 2,
    locale: 'en-GB'
  }
};

export const getSupportedCurrencies = (): CurrencyConfig[] => {
  return Object.values(currencyConfig);
};

export const getCurrencyConfig = (code: string): CurrencyConfig | undefined => {
  return currencyConfig[code];
};
```

### Investment Categories Configuration
```typescript
// lib/config/investment-config.ts
export interface InvestmentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  riskLevel: 'low' | 'medium' | 'high';
  examples: string[];
}

export const investmentCategories: Record<string, InvestmentCategory> = {
  stocks: {
    id: 'stocks',
    name: 'Stocks',
    description: 'Individual company shares and equity investments',
    icon: 'trending-up',
    riskLevel: 'high',
    examples: ['AAPL', 'GOOGL', 'MSFT', 'TSLA']
  },
  bonds: {
    id: 'bonds',
    name: 'Bonds',
    description: 'Government and corporate debt securities',
    icon: 'shield',
    riskLevel: 'low',
    examples: ['Treasury Bonds', 'Corporate Bonds', 'Municipal Bonds']
  },
  mutualFunds: {
    id: 'mutual-funds',
    name: 'Mutual Funds',
    description: 'Professionally managed investment portfolios',
    icon: 'pie-chart',
    riskLevel: 'medium',
    examples: ['Index Funds', 'Sector Funds', 'Balanced Funds']
  },
  realEstate: {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Property investments and REITs',
    icon: 'home',
    riskLevel: 'medium',
    examples: ['Rental Properties', 'REITs', 'Real Estate Funds']
  },
  crypto: {
    id: 'crypto',
    name: 'Cryptocurrency',
    description: 'Digital assets and cryptocurrencies',
    icon: 'bitcoin',
    riskLevel: 'high',
    examples: ['Bitcoin', 'Ethereum', 'Altcoins']
  },
  other: {
    id: 'other',
    name: 'Other',
    description: 'Alternative investments and commodities',
    icon: 'more-horizontal',
    riskLevel: 'medium',
    examples: ['Gold', 'Commodities', 'Private Equity']
  }
};
```

### Budget Categories Configuration
```typescript
// lib/config/budget-config.ts
export interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  defaultPercentage: number;
  color: string;
  examples: string[];
}

export const budgetCategories: Record<string, BudgetCategory> = {
  essentials: {
    id: 'essentials',
    name: 'Essentials',
    description: 'Basic living expenses and necessities',
    defaultPercentage: 50,
    color: '#ef4444',
    examples: [
      'Housing (rent/mortgage)',
      'Groceries & household supplies',
      'Transportation',
      'Insurance',
      'Debt repayment',
      'Medical & healthcare'
    ]
  },
  lifestyle: {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'Discretionary spending and entertainment',
    defaultPercentage: 20,
    color: '#f59e0b',
    examples: [
      'Dining out',
      'Subscriptions',
      'Travel & vacations',
      'Personal fun money',
      'Hobbies'
    ]
  },
  savingsFuture: {
    id: 'savings-future',
    name: 'Savings & Future',
    description: 'Long-term savings and investments',
    defaultPercentage: 20,
    color: '#10b981',
    examples: [
      'Emergency fund',
      'Retirement investments',
      'General savings',
      'Investment contributions'
    ]
  },
  sinkingFund: {
    id: 'sinking-fund',
    name: 'Sinking Fund',
    description: 'Planned future purchases and expenses',
    defaultPercentage: 10,
    color: '#3b82f6',
    examples: [
      'Electronics & gadgets',
      'Clothing & accessories',
      'Home & furniture',
      'Gifts & celebrations',
      'Annual expenses'
    ]
  }
};
```

## Configuration Usage Patterns

### Type-Safe Configuration Access
```typescript
// lib/config/config-helpers.ts
export const getConfigValue = <T>(
  config: Record<string, T>,
  key: string,
  fallback?: T
): T | undefined => {
  return config[key] || fallback;
};

export const validateConfigKey = <T>(
  config: Record<string, T>,
  key: string
): boolean => {
  return key in config;
};

export const getConfigKeys = <T>(config: Record<string, T>): string[] => {
  return Object.keys(config);
};
```

### Configuration Validation
```typescript
// lib/config/validation.ts
import { z } from 'zod';

export const NavigationItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
  subItems: z.array(z.lazy(() => NavigationItemSchema)).optional()
});

export const validateNavigationConfig = (config: unknown) => {
  const schema = z.record(z.string(), NavigationItemSchema);
  return schema.parse(config);
};
```

## Benefits of Centralized Configuration

### Maintainability
- Single source of truth for shared data
- Easy to update navigation structure
- Consistent data across components
- Reduced code duplication

### Type Safety
- TypeScript interfaces ensure consistency
- Compile-time validation of configuration
- Better IDE support and autocomplete
- Reduced runtime errors

### Scalability
- Easy to add new navigation items
- Simple to extend configuration structure
- Supports complex nested configurations
- Facilitates automated testing

### Performance
- Configuration loaded once and reused
- No duplicate data in bundle
- Efficient tree-shaking of unused config
- Better caching opportunities

This configuration management approach ensures that the Foresight application remains maintainable and scalable as it grows in complexity.