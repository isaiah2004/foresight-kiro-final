# Project Structure & Organization

## Directory Structure

Follow Next.js App Router best practices with feature-based organization:

```
src/
├── app/                    # App Router pages and layouts
│   ├── (auth)/            # Authentication routes (grouped)
│   ├── dashboard/         # Main dashboard
│   │   ├── investments/       # Investment portfolio management
│   │   │   ├── stocks/        # Stock investments
│   │   │   ├── bonds/         # Bond investments
│   │   │   ├── crypto/        # Cryptocurrency
│   │   │   └── real-estate/   # Real estate investments
│   │   ├── budgets/          # Budget management
│   │   │   ├── income-splitting/
│   │   │   ├── buckets/
│   │   │   └── manage/
│   │   ├── income/           # Income source management
│   │   │   ├── salary/
│   │   │   ├── rental-properties/
│   │   │   └── others/
│   │   ├── expenses/         # Expense tracking
│   │   ├── loans/            # Loan management with regional compliance
│   │   ├── funds/            # Goals, Pots, Saving funds
│   │   │   ├── pots/         # Specific saving goals
│   │   │   ├── saving-funds/ # 401K, education funds
│   │   │   └── other/        # Vacation, item savings
│   │   ├── insights/         # Analytics and insights
│   │   ├── settings/         # User settings
│   │   └── layout.tsx       # Dashboard layout with SidebarProvider
│   ├── page.tsx           # Landing page
│   └── layout.tsx        # Root layout with theme and clerk provider
├── components/
│   ├── ui/               # Atomic shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx   # shadcn sidebar-08 component
│   │   └── ...
│   └── shared/           # Complex reusable components
│       ├── navigation/   # Navigation components
│       ├── charts/       # Financial charts
│       ├── forms/        # Form components
│       └── layouts/      # Layout components
├── lib/                  # Utilities and configurations
│   ├── utils.ts          # General utilities
│   ├── firebase.ts       # Firebase configuration
│   ├── clerk.ts          # Clerk configuration
│   ├── financial/        # Financial calculation utilities
│   │   ├── loans.ts      # Loan calculations
│   │   ├── investments.ts # Investment calculations
│   │   └── currency.ts   # Currency conversion
│   └── validations/      # Zod schemas
├── providers/            # Context providers
│   ├── auth-provider.tsx
│   └── theme-provider.tsx
├── types/               # TypeScript definitions
│   ├── financial.ts     # Financial data types
│   ├── user.ts          # User-related types
│   └── api.ts           # API response types
└── hooks/               # Custom React hooks
    ├── use-currency.ts
    ├── use-investments.ts
    └── use-loans.ts

```
## Navigation Architecture

### Sidebar Configuration

- **Component**: Use shadcn sidebar-08 component
- **State Management**: Cookie-based persistence with `sidebar_state` cookie
- **Implementation**: SidebarProvider in app/layout.tsx with defaultOpen from cookies
- **Dual Navigation**: Both collapsible sidebar AND tab-based navigation for detailed sections

### Navigation Config Pattern

```typescript
// lib/navigation-config.ts
export const navigationConfig = {
  main: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    {
      label: 'Investments',
      href: '/investments',
      icon: 'trending-up',
      subItems: [
        'stocks',
        'bonds',
        'mutual-funds',
        'real-estate',
        'crypto',
        'other',
      ],
    },
    // ... other sections
  ],
};
```

## Code Organization Principles

### Single Responsibility Principle (SRP)

- **One Purpose Per File**: Each file should handle one specific concern or feature
- **Component Responsibility**: Components should have one clear purpose (display, form, layout, etc.)
- **Function Separation**: Separate data fetching, business logic, and presentation
- **Module Boundaries**: Clear separation between authentication, financial calculations, UI components

Examples:

```typescript
// Good - Separated responsibilities
// components/shared/loans/loan-calculator.tsx - Only handles loan calculations UI
// lib/financial/loans.ts - Only handles loan calculation logic
// lib/data/loans.ts - Only handles loan data operations
// types/financial.ts - Only contains financial type definitions

// Bad - Mixed responsibilities
// components/loan-page.tsx - Handles UI, calculations, data fetching, and validation
```

### Component Patterns

- **Server Components**: Default choice, only use "use client" when needed
- **File Naming**: kebab-case for files, PascalCase for components
- **Co-location**: Keep related files close (components, hooks, types)
- **Barrel Exports**: Use index.ts files for clean imports

### Data Layer Organization

```
lib/
├── data/
│   ├── investments.ts    # Investment data operations
│   ├── budgets.ts        # Budget data operations
│   ├── loans.ts          # Loan data operations
│   └── cache/            # Caching utilities
│       ├── investment-cache.ts
│       └── currency-cache.ts
```

### Feature-Based Modules

Each major feature should be self-contained with clear SRP boundaries:

```
components/shared/investments/
├── investment-card.tsx          # Only displays investment data
├── investment-form.tsx          # Only handles investment input
├── investment-chart.tsx         # Only renders investment charts
├── hooks/
│   ├── use-investment-data.ts   # Only manages investment state
│   └── use-investment-cache.ts  # Only handles caching logic
├── utils/
│   └── investment-calculations.ts # Only performs calculations
└── types/
    └── investment.types.ts      # Only contains type definitions
```

### SRP in Financial Modules

```
lib/financial/
├── loans/
│   ├── calculations.ts          # Pure calculation functions
│   ├── amortization.ts         # Amortization schedule logic
│   ├── regional-compliance.ts  # Regional rule validation
│   └── validators.ts           # Input validation only
├── investments/
│   ├── portfolio-calculations.ts # Portfolio math only
│   ├── price-fetching.ts       # External API calls only
│   └── cache-management.ts     # Cache operations only
└── currency/
    ├── conversion.ts           # Currency conversion logic
    ├── formatting.ts          # Display formatting only
    └── validation.ts          # Currency validation only
```

## File Naming Conventions

### Components

- **UI Components**: `button.tsx`, `input.tsx`, `sidebar.tsx`
- **Feature Components**: `investment-portfolio.tsx`, `budget-overview.tsx`
- **Layout Components**: `dashboard-layout.tsx`, `auth-layout.tsx`

### Pages (App Router)

- **Route Files**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Route Groups**: `(auth)`, `(dashboard)` for organization without URL impact

### Utilities & Hooks

- **Utilities**: `currency-utils.ts`, `loan-calculations.ts`
- **Hooks**: `use-currency.ts`, `use-investments.ts`
- **Types**: `financial.types.ts`, `user.types.ts`

## Import Organization

### Import Order

1. React and Next.js imports
2. Third-party libraries
3. Internal components and utilities
4. Types and interfaces
5. Relative imports

```typescript
import React from 'react';
import { NextPage } from 'next';
import { Button } from '@/components/ui/button';
import { calculateLoanEMI } from '@/lib/financial/loans';
import { Investment } from '@/types/financial';
import './component.css';
```

## Multi-Currency Architecture

### Data Storage Pattern

Every financial transaction must include:

```typescript
interface Transaction {
  amount: number; // Original amount
  currency: string; // Original currency (ISO 4217)
  convertedAmount?: number; // Amount in user's primary currency
  exchangeRate?: number; // Rate used for conversion
}
```

### Regional Compliance Structure

```
lib/financial/regional/
├── india/
│   ├── loan-regulations.ts    # RBI compliance
│   └── tax-calculations.ts
├── us/
│   ├── loan-regulations.ts    # TILA compliance
│   └── tax-calculations.ts
└── eu/
    ├── loan-regulations.ts    # EU directives
    └── tax-calculations.ts
```

This structure ensures maintainability, scalability, and follows Next.js App Router best practices while supporting the complex financial features required by Foresight.
