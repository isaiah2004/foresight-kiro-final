# Components Guide

This guide covers all the components used in the Foresight Financial Planning App, including UI components, shared components, and their usage patterns.

## Table of Contents

- [UI Components](#ui-components)
- [Shared Components](#shared-components)
- [Component Patterns](#component-patterns)
- [Usage Examples](#usage-examples)

## UI Components

The UI components are based on shadcn/ui library with Radix UI primitives. They are located in `src/components/ui/`.

### Button Component

**File**: `src/components/ui/button.tsx`

A versatile button component with multiple variants and sizes.

```typescript
import { Button } from '@/components/ui/button';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost Button</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// As link
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

**Props**:
- `variant`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- `size`: "default" | "sm" | "lg" | "icon"
- `asChild`: boolean - Renders as child component

### Input Component

**File**: `src/components/ui/input.tsx`

Form input component with consistent styling.

```typescript
import { Input } from '@/components/ui/input';

// Basic usage
<Input placeholder="Enter amount" />

// With type
<Input type="number" placeholder="0.00" />
<Input type="email" placeholder="email@example.com" />

// Controlled input
const [value, setValue] = useState('');
<Input 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
  placeholder="Controlled input"
/>
```

### Card Component

**File**: `src/components/ui/card.tsx`

Container component for grouping related content.

```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Investment Portfolio</CardTitle>
    <CardDescription>Your current investments overview</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Portfolio content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

### Sidebar Component

**File**: `src/components/ui/sidebar.tsx`

The main navigation sidebar component (shadcn sidebar-08).

```typescript
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';

<Sidebar>
  <SidebarHeader>
    <h2>Foresight</h2>
  </SidebarHeader>
  <SidebarContent>
    {/* Navigation items */}
  </SidebarContent>
  <SidebarFooter>
    {/* User menu */}
  </SidebarFooter>
</Sidebar>
```

### Dialog Component

**File**: `src/components/ui/dialog.tsx`

Modal dialog component for overlays and forms.

```typescript
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Investment</DialogTitle>
      <DialogDescription>
        Enter your investment details below.
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

## Shared Components

Complex reusable components located in `src/components/shared/`.

### Currency Components

**Location**: `src/components/shared/currency/`

Components for handling multi-currency functionality.

#### Currency Selector
```typescript
import { CurrencySelector } from '@/components/shared/currency/currency-selector';

<CurrencySelector 
  value={selectedCurrency}
  onChange={setCurrency}
  placeholder="Select currency"
/>
```

#### Currency Display
```typescript
import { CurrencyDisplay } from '@/components/shared/currency/currency-display';

<CurrencyDisplay 
  amount={1000}
  currency="USD"
  showSymbol={true}
/>
```

### Dashboard Components

**Location**: `src/components/shared/dashboard/`

Dashboard-specific components for financial visualization.

#### Financial Health Visualization
```typescript
import { FinancialHealthVisualization } from '@/components/shared/dashboard/financial-health-visualization';

<FinancialHealthVisualization 
  userId={user.id}
  className="h-96"
/>
```

#### Cashflow Visualization
```typescript
import { CashflowVisualization } from '@/components/shared/dashboard/cashflow-visualization';

<CashflowVisualization 
  userId={user.id}
  timeRange="6months"
/>
```

#### Fin Bot Integration
```typescript
import { FinBotIntegration } from '@/components/shared/dashboard/fin-bot-integration';

<FinBotIntegration 
  userId={user.id}
  onMessageSent={handleMessage}
/>
```

### Navigation Components

**Location**: `src/components/shared/navigation/`

Navigation-related components.

#### Tab Navigation
```typescript
import { TabNavigation } from '@/components/shared/navigation/tab-navigation';

<TabNavigation 
  items={[
    { title: "Overview", url: "/dashboard/overview" },
    { title: "Investments", url: "/dashboard/investments" },
  ]}
  currentPath="/dashboard/overview"
/>
```

### Skeleton Components

**Location**: `src/components/shared/skeletons/`

Loading skeleton components that match final content structure.

#### Dashboard Skeleton
```typescript
import { DashboardSkeleton } from '@/components/shared/skeletons/dashboard-skeleton';

// Use with Suspense
<Suspense fallback={<DashboardSkeleton />}>
  <DashboardContent />
</Suspense>
```

## Component Patterns

### Server Components (Default)

Most components should be Server Components by default:

```typescript
// This is a Server Component (default)
export default function InvestmentList() {
  // Can fetch data directly
  const investments = await getInvestments();
  
  return (
    <div>
      {investments.map(investment => (
        <InvestmentCard key={investment.id} investment={investment} />
      ))}
    </div>
  );
}
```

### Client Components

Only use "use client" when you need interactivity:

```typescript
"use client"

import { useState } from 'react';

export function InteractiveForm() {
  const [value, setValue] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Compound Components

For complex UI patterns:

```typescript
// Card compound component
export function InvestmentCard({ children }: { children: React.ReactNode }) {
  return <div className="investment-card">{children}</div>;
}

InvestmentCard.Header = function Header({ title }: { title: string }) {
  return <div className="card-header">{title}</div>;
};

InvestmentCard.Content = function Content({ children }: { children: React.ReactNode }) {
  return <div className="card-content">{children}</div>;
};

// Usage
<InvestmentCard>
  <InvestmentCard.Header title="Stock Portfolio" />
  <InvestmentCard.Content>
    <p>Portfolio details...</p>
  </InvestmentCard.Content>
</InvestmentCard>
```

### Polymorphic Components

Components that can render as different elements:

```typescript
interface ButtonProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function Button({ asChild, children, ...props }: ButtonProps) {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, props);
  }
  
  return <button {...props}>{children}</button>;
}

// Usage
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

## Usage Examples

### Form with Validation

```typescript
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InvestmentForm() {
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    price: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Investment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Stock Symbol (e.g., AAPL)"
            value={formData.symbol}
            onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Price per share"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          />
          <Button type="submit" className="w-full">
            Add Investment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Data Display with Loading

```typescript
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

async function PortfolioValue() {
  const portfolio = await getPortfolioValue();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Value</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">
          {portfolio.change > 0 ? '+' : ''}{portfolio.change}% today
        </p>
      </CardContent>
    </Card>
  );
}

function PortfolioSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Value</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}

export function PortfolioDisplay() {
  return (
    <Suspense fallback={<PortfolioSkeleton />}>
      <PortfolioValue />
    </Suspense>
  );
}
```

## Best Practices

1. **Use Server Components by default** - Only add "use client" when you need interactivity
2. **Follow SRP** - Each component should have one clear responsibility
3. **Use TypeScript** - Always type your props and state
4. **Implement proper loading states** - Use Suspense with matching skeletons
5. **Handle errors gracefully** - Implement error boundaries where needed
6. **Optimize performance** - Use React.memo for expensive components
7. **Keep components small** - Break down complex components into smaller ones
8. **Use compound patterns** - For complex UI patterns that need to work together