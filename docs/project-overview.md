# Project Overview

## Foresight Financial Planning App

Foresight is a comprehensive financial planning application that empowers users to make informed financial decisions through visualization, planning, and tracking of their financial health.

## Core Philosophy

"Spending money should be as beneficial as earning it" - The app helps users understand the consequences of their financial actions to improve their quality of life through better decision-making. Money equals freedom and autonomy in the modern world.

## Key Features

### Phase 1 (Current Focus)
- **Authentication**: Clerk-based login and user management with billing integration
- **Multi-Currency Support**: All transactions store amount + currency, with user-configurable primary currency
- **Dashboard**: Financial health visualization, cashflow charts, Fin Bot integration
- **Investment Portfolio**: Stocks, bonds, mutual funds, real estate, crypto, other investments with intelligent caching
- **Budget Management**: Income splitting (50% Essentials, 20% Lifestyle, 20% Savings, 10% Sinking Fund), bucket system with renewal rates
- **Income Tracking**: Salary, rental properties, other sources
- **Expense Management**: Categorized expense tracking (rent, groceries, utilities, entertainment)
- **Loan Management**: Regional compliance (India/US/EU), amortization schedules, prepayment options
- **Funds Management**: Pots (specific goals), Saving funds (401K, education), Other goals (vacation, items)
- **Insights**: Risk profiling, taxation analysis, financial recommendations
- **Settings & Feedback**: User preferences, currency settings, feedback system

### Phase 2 (Future)
- **LLM Integration**: AI assistant with access to user financial data using Vercel AI SDK
- **Advanced Analytics**: Custom graph generation, performance tracking
- **Data Modification**: AI-powered goal creation and modification

## Technology Stack

### Frontend Framework
- **Next.js 14+** with App Router (not Pages Router)
- **TypeScript** throughout the entire codebase
- **React 18+** with Server Components as default

### UI & Styling
- **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for styling with clsx/tailwind-merge for conditional classes
- **Framer Motion** for professional, trust-building animations

### Authentication & Database
- **Clerk** for authentication, user management, and billing
- **Firebase Firestore** for database with real-time capabilities

### External APIs
- **FinnHub.io** for real-time financial data
- **Alpha Vantage** for historical financial data
- Intelligent caching system for investment data (4-minute TTL)

### State Management
- **Zustand** for global state management
- **React hooks** (useState, useReducer) for local component state
- **Avoid useEffect with fetch** - use Server Components instead

### Deployment & Hosting
- **Vercel** for hosting and deployment
- Optimized builds with Next.js performance features

## Performance Requirements

- **Loading**: Skeleton loaders with Suspense for all async content
- **Animations**: Smooth fade-ins with Framer Motion, professional feel
- **Images**: ALWAYS use next/image for optimization
- **Fonts**: Use next/font for optimization and layout shift prevention
- **Bundle**: Use next/dynamic for lazy loading of large components
- **Core Web Vitals**: Maintain excellent LCP, FID, and CLS scores

## Design Principles

### Single Responsibility Principle (SRP)
- Each component should have one reason to change and one responsibility
- Each function should do one thing well
- Each module should handle one specific domain or feature
- Each hook should encapsulate one specific piece of logic
- Utility functions should be pure and handle one specific transformation

### Component Patterns
- **Server Components**: Default choice, only use "use client" when needed
- **File Naming**: kebab-case for files, PascalCase for components
- **Co-location**: Keep related files close (components, hooks, types)
- **Barrel Exports**: Use index.ts files for clean imports

## Target Users
Individuals seeking to improve their financial literacy and make data-driven financial decisions with long-term planning focus.