# Project Structure

## Directory Overview

The Foresight application follows Next.js App Router best practices with feature-based organization and Single Responsibility Principle (SRP).

```
src/
├── app/                    # App Router pages and layouts
│   ├── (auth)/            # Authentication routes (grouped)
│   ├── dashboard/         # Main dashboard with all features
│   │   ├── overview/      # Dashboard overview (financial health, cashflow, fin-bot)
│   │   ├── investments/   # Investment portfolio management
│   │   ├── budgets/       # Budget management
│   │   ├── income/        # Income source management
│   │   ├── expenses/      # Expense tracking
│   │   ├── loans/         # Loan management
│   │   ├── funds/         # Goals, Pots, Saving funds
│   │   ├── insights/      # Analytics and insights
│   │   ├── settings/      # User settings
│   │   └── layout.tsx     # Dashboard layout with SidebarProvider
│   ├── page.tsx           # Landing page (no sidebar)
│   └── layout.tsx         # Root layout with theme and clerk provider
├── components/
│   ├── ui/                # Atomic shadcn/ui components
│   └── shared/            # Complex reusable components
├── lib/                   # Utilities and configurations
├── providers/             # Context providers
├── types/                 # TypeScript definitions
├── hooks/                 # Custom React hooks
└── docs/                  # Project documentation
```

## App Router Structure

### Authentication Routes
- `(auth)/sign-in/` - User sign-in page
- `(auth)/sign-up/` - User registration page
- `(auth)/layout.tsx` - Authentication layout

### Dashboard Routes
All main application features are nested under `/dashboard` to ensure consistent layout and sidebar navigation:

- `dashboard/overview/` - Dashboard overview with financial health, cashflow, and fin-bot
- `dashboard/investments/` - Investment portfolio with sub-routes for different asset types
- `dashboard/budgets/` - Budget management with income splitting and buckets
- `dashboard/income/` - Income source management
- `dashboard/expenses/` - Expense tracking and categorization
- `dashboard/loans/` - Loan management with regional compliance
- `dashboard/funds/` - Funds management (pots, saving funds, other goals)
- `dashboard/insights/` - Financial analytics and insights
- `dashboard/settings/` - User preferences and settings

### Landing Page
- `page.tsx` - Public landing page (no sidebar, no authentication required)

## Component Organization

### UI Components (`components/ui/`)
Atomic components from shadcn/ui library:
- `button.tsx` - Button component with variants
- `input.tsx` - Input field component
- `sidebar.tsx` - Sidebar component (shadcn sidebar-08)
- `card.tsx` - Card container component
- `dialog.tsx` - Modal dialog component
- And more...

### Shared Components (`components/shared/`)
Complex reusable components organized by feature:

```
shared/
├── currency/              # Currency-related components
├── dashboard/             # Dashboard-specific components
├── layouts/               # Layout components
├── navigation/            # Navigation components
├── skeletons/             # Loading skeleton components
└── forms/                 # Form components
```

## Library Organization (`lib/`)

### Utilities
- `utils.ts` - General utility functions
- `firebase.ts` - Firebase configuration and helpers
- `navigation-config.ts` - Navigation menu configuration

### Feature-Specific Utilities
```
lib/
├── currency/              # Currency conversion and formatting
├── financial/             # Financial calculations
│   ├── loans.ts          # Loan calculations and amortization
│   ├── investments.ts    # Investment calculations
│   └── budgets.ts        # Budget allocation calculations
└── validations/          # Zod schemas for data validation
```

## Hooks Organization (`hooks/`)

Custom React hooks for specific functionality:
- `use-currency.ts` - Currency conversion and formatting
- `use-user-profile.ts` - User profile management
- `use-sidebar-state.ts` - Sidebar state management
- `use-mobile.tsx` - Mobile device detection

## Types Organization (`types/`)

TypeScript type definitions organized by domain:
- `financial.ts` - Financial data types (transactions, investments, loans)
- `user.ts` - User-related types
- `currency.ts` - Currency-related types
- `api.ts` - API response types

## Navigation Architecture

### Sidebar Navigation
- **Component**: shadcn sidebar-08 component
- **State Management**: Cookie-based persistence with `sidebar_state` cookie
- **Scope**: Only appears in dashboard routes
- **Configuration**: Centralized in `lib/navigation-config.ts`

### Dual Navigation Pattern
For detailed sections, the app provides both:
1. **Sidebar Navigation**: Collapsible sidebar with main sections
2. **Tab Navigation**: Horizontal tabs for sub-sections within each feature

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

## Single Responsibility Principle (SRP)

Each file and component follows SRP:

### Good Examples
```typescript
// components/shared/loans/loan-calculator.tsx - Only handles loan calculations UI
// lib/financial/loans.ts - Only handles loan calculation logic
// lib/data/loans.ts - Only handles loan data operations
// types/financial.ts - Only contains financial type definitions
```

### Feature-Based Modules
Each major feature is self-contained:

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

This structure ensures maintainability, scalability, and follows Next.js App Router best practices while supporting the complex financial features required by Foresight.