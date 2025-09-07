# Next.js React Best Practices Guide

## Purpose
This document outlines the best practices and standard operating procedures for developing high-quality, scalable, and maintainable applications using Next.js with the App Router.

## Core Philosophy

### Fundamental Principles
- **App Router First**: Exclusively use the App Router for all new projects and features
- **Server Components by Default**: Embrace React Server Components (RSC) paradigm
- **Convention over Configuration**: Leverage Next.js file-based routing and conventions
- **TypeScript is Mandatory**: All projects must use TypeScript for type safety
- **Optimize for Speed**: Everything should load blazing fast with snappy animations
- **Professional Animations**: Use Framer Motion for trust-building, crispy animations (avoid toy-like effects)
- **Bring Your Own APIs**: Support client-side operations for external API integration

## Component Patterns

### Server vs. Client Components

#### Default to Server Components
Server Components are more performant as they render on the server and send minimal JavaScript to the client. Use them for:
- Fetching data and displaying non-interactive content
- Static layouts and content
- SEO-critical content

#### Opt-in to Client Components
Only use the `"use client"` directive when you need:
- Event listeners (`onClick`, `onChange`, etc.)
- State and lifecycle hooks (`useState`, `useEffect`, `useReducer`)
- Browser-only APIs (`window`, `localStorage`)
- Custom hooks that depend on state or effects

### Component Nesting Pattern
**Push client components to the leaves** - Keep top-level components as Server Components and import smaller, interactive Client Components where needed.

#### Good Example (Server Component Parent)
```typescript
// app/dashboard/page.tsx (Server Component)
import { InteractiveChart } from './_components/interactive-chart'; // Client Component
import { api } from '@/lib/api';

export default async function DashboardPage() {
  const data = await api.getAnalyticsData();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Here is your latest data:</p>
      <InteractiveChart initialData={data} />
    </div>
  );
}
```

#### Bad Example (Unnecessary Client Component)
```typescript
// Avoid this pattern
"use client"; // This prevents server-side benefits

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData);
  }, []);

  // ... rest of component
}
```

## Data Fetching Patterns

### Server Components
Use `async/await` with `fetch` directly within Server Components:

```typescript
// Recommended approach
export default async function InvestmentPage() {
  const investments = await fetch('/api/investments').then(res => res.json());
  
  return (
    <div>
      <InvestmentList investments={investments} />
    </div>
  );
}
```

### Client Components
For client-side data fetching, use libraries like **SWR** or **React Query**. **Do not use `useEffect` with `fetch`**:

```typescript
// Good - Using SWR
import useSWR from 'swr';

export function InvestmentChart() {
  const { data, error } = useSWR('/api/investments', fetcher);
  
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  
  return <Chart data={data} />;
}
```

## State Management

### Local State
For component-level state, use React hooks:
- `useState` for simple state
- `useReducer` for complex state logic

### Global State
For cross-component state, prefer **Zustand** for its simplicity:

```typescript
// stores/investment-store.ts
import { create } from 'zustand';

interface InvestmentStore {
  portfolio: Investment[];
  totalValue: number;
  updatePortfolio: (investments: Investment[]) => void;
}

export const useInvestmentStore = create<InvestmentStore>((set) => ({
  portfolio: [],
  totalValue: 0,
  updatePortfolio: (investments) => set({ 
    portfolio: investments,
    totalValue: calculateTotal(investments)
  }),
}));
```

Use React Context only for simple, low-frequency update state (like theme).

## Styling Guidelines

### Tailwind CSS
Use Tailwind CSS as the primary styling solution:

```typescript
// Good - Utility-first approach
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Investment Portfolio</h2>
  <Button className="bg-blue-600 hover:bg-blue-700">Add Investment</Button>
</div>
```

### Conditional Classes
Use `clsx` and `tailwind-merge` for conditional styling:

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// Usage
<div className={cn(
  "base-styles",
  isActive && "active-styles",
  variant === "primary" && "primary-styles"
)}>
```

### Global Styles
Keep `globals.css` minimal - only base resets and CSS variables:

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
}
```

## Performance Optimization

### Image Optimization
**ALWAYS** use `next/image` for all images:

```typescript
import Image from 'next/image';

<Image
  src="/financial-chart.png"
  alt="Financial Chart"
  width={800}
  height={400}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Font Optimization
Use `next/font` for font loading optimization:

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Dynamic Imports
Use `next/dynamic` for lazy loading large components:

```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('../components/heavy-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Disable SSR if component uses browser APIs
});
```

## Loading and Animation Patterns

### Suspense with Skeletons
Use Suspense with skeleton loaders that match final content structure:

```typescript
import { Suspense } from 'react';

export default function InvestmentPage() {
  return (
    <div>
      <h1>Investment Portfolio</h1>
      <Suspense fallback={<InvestmentSkeleton />}>
        <InvestmentList />
      </Suspense>
    </div>
  );
}
```

### Framer Motion Animations
Use professional, crispy animations that build trust:

```typescript
import { motion } from 'framer-motion';

export function InvestmentCard({ investment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="investment-card"
    >
      {/* Card content */}
    </motion.div>
  );
}
```

## API Routes and External Integration

### tRPC for Type Safety
Use tRPC for full-stack type safety:

```typescript
// server/api/routers/investment.ts
export const investmentRouter = createTRPCRouter({
  getPortfolio: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await db.investment.findMany({
        where: { userId: input.userId }
      });
    }),
});

// Client usage
const { data: portfolio } = api.investment.getPortfolio.useQuery({ 
  userId: user.id 
});
```

### Standard Route Handlers
For simple cases or public APIs:

```typescript
// app/api/investments/route.ts
export async function GET(request: Request) {
  try {
    const investments = await getInvestments();
    return Response.json(investments);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch investments' }, { 
      status: 500 
    });
  }
}
```

## Environment Variables

### Configuration
- Use `.env.local` for secrets and environment-specific configurations
- Prefix with `NEXT_PUBLIC_` only for browser-exposed variables
- All other variables are server-side only by default

```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="https://api.example.com"
CLERK_SECRET_KEY="sk_..."
```

## Error Handling

### Error Boundaries
Implement error boundaries for graceful error handling:

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

## Testing Patterns

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { InvestmentCard } from './investment-card';

test('displays investment information correctly', () => {
  const investment = {
    symbol: 'AAPL',
    quantity: 10,
    currentPrice: 150,
  };

  render(<InvestmentCard investment={investment} />);
  
  expect(screen.getByText('AAPL')).toBeInTheDocument();
  expect(screen.getByText('10 shares')).toBeInTheDocument();
});
```

### API Testing
```typescript
import { GET } from './route';

test('returns investment data', async () => {
  const request = new Request('http://localhost/api/investments');
  const response = await GET(request);
  const data = await response.json();
  
  expect(response.status).toBe(200);
  expect(data).toHaveProperty('investments');
});
```

## File Organization

### Import Order
1. React and Next.js imports
2. Third-party libraries
3. Internal components and utilities
4. Types and interfaces
5. Relative imports

```typescript
import React from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { calculatePortfolioValue } from '@/lib/financial/calculations';
import { Investment } from '@/types/financial';
import './investment-page.css';
```

This comprehensive guide ensures consistent, maintainable, and performant React applications using Next.js App Router best practices.