# Development Guide

This guide covers development setup, coding standards, testing practices, and contribution guidelines for the Foresight Financial Planning App.

## Table of Contents

- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Git Workflow](#git-workflow)
- [Performance Guidelines](#performance-guidelines)
- [Deployment Process](#deployment-process)

## Development Setup

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**
- **Firebase CLI** (for local development)
- **Vercel CLI** (for deployment)

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd foresight-financial-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment variables**
Create `.env.local` file based on `.env.local.example`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# External APIs
FINNHUB_API_KEY=...
ALPHA_VANTAGE_API_KEY=...
EXCHANGE_RATE_API_KEY=...

# Development
NODE_ENV=development
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

### Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check

# Analyze bundle
npm run analyze
```

## Coding Standards

### TypeScript Guidelines

1. **Always use TypeScript** - No JavaScript files in the codebase
2. **Strict mode** - Enable strict TypeScript configuration
3. **Type everything** - Avoid `any` type, use proper interfaces and types
4. **Use proper imports** - Use absolute imports with `@/` prefix

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const updateProfile = (profile: UserProfile): Promise<void> => {
  // Implementation
};

// Bad
const updateProfile = (profile: any) => {
  // Implementation
};
```

### Component Guidelines

1. **Server Components by default** - Only use "use client" when necessary
2. **Single Responsibility Principle** - Each component should have one clear purpose
3. **Proper naming** - Use PascalCase for components, kebab-case for files
4. **Props interface** - Always define props interface

```typescript
// Good - Server Component
interface InvestmentCardProps {
  investment: Investment;
  showActions?: boolean;
}

export function InvestmentCard({ investment, showActions = true }: InvestmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{investment.symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Value: ${investment.currentValue}</p>
      </CardContent>
    </Card>
  );
}

// Good - Client Component (when interactivity needed)
"use client"

interface InteractiveFormProps {
  onSubmit: (data: FormData) => void;
}

export function InteractiveForm({ onSubmit }: InteractiveFormProps) {
  const [formData, setFormData] = useState<FormData>({});
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      {/* Form content */}
    </form>
  );
}
```

### File Organization

1. **Feature-based structure** - Group related files together
2. **Barrel exports** - Use index.ts files for clean imports
3. **Consistent naming** - Follow established naming conventions

```
src/
├── components/
│   ├── ui/                    # Atomic components
│   └── shared/                # Feature components
│       └── investments/
│           ├── investment-card.tsx
│           ├── investment-form.tsx
│           ├── investment-chart.tsx
│           └── index.ts       # Barrel export
├── lib/
│   ├── financial/
│   │   ├── loans.ts
│   │   ├── investments.ts
│   │   └── index.ts
│   └── utils.ts
└── types/
    ├── financial.ts
    ├── user.ts
    └── index.ts
```

### Styling Guidelines

1. **Tailwind CSS** - Use Tailwind for all styling
2. **Component variants** - Use cva for component variants
3. **Responsive design** - Mobile-first approach
4. **Consistent spacing** - Use Tailwind spacing scale

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

## Testing Guidelines

### Testing Strategy

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test component interactions and API integrations
3. **E2E Tests** - Test complete user workflows
4. **Performance Tests** - Test loading times and Core Web Vitals

### Unit Testing

Use Vitest and React Testing Library for unit tests:

```typescript
// __tests__/components/investment-card.test.tsx
import { render, screen } from '@testing-library/react';
import { InvestmentCard } from '@/components/shared/investments/investment-card';
import { Investment } from '@/types/financial';

const mockInvestment: Investment = {
  id: '1',
  userId: 'user1',
  symbol: 'AAPL',
  type: 'stock',
  quantity: 10,
  purchasePrice: 150,
  purchaseCurrency: 'USD',
  purchaseDate: new Date('2024-01-01'),
  lastSyncedPrice: 180,
  lastSyncTimestamp: new Date(),
  currentValue: 1800
};

describe('InvestmentCard', () => {
  it('renders investment information correctly', () => {
    render(<InvestmentCard investment={mockInvestment} />);
    
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('$1,800')).toBeInTheDocument();
  });
  
  it('shows profit/loss correctly', () => {
    render(<InvestmentCard investment={mockInvestment} />);
    
    const profitElement = screen.getByText('+$300');
    expect(profitElement).toBeInTheDocument();
    expect(profitElement).toHaveClass('text-green-600');
  });
});
```

### Financial Calculations Testing

```typescript
// __tests__/lib/financial/loans.test.ts
import { calculateEMI, generateAmortizationSchedule } from '@/lib/financial/loans';

describe('Loan Calculations', () => {
  describe('calculateEMI', () => {
    it('calculates EMI correctly for standard loan', () => {
      const emi = calculateEMI({
        principal: 1000000,
        interestRate: 8.5,
        termMonths: 240
      });
      
      expect(emi).toBeCloseTo(8678.83, 2);
    });
    
    it('handles zero interest rate', () => {
      const emi = calculateEMI({
        principal: 120000,
        interestRate: 0,
        termMonths: 12
      });
      
      expect(emi).toBe(10000);
    });
  });
  
  describe('generateAmortizationSchedule', () => {
    it('generates correct schedule length', () => {
      const schedule = generateAmortizationSchedule({
        principal: 100000,
        interestRate: 10,
        termMonths: 12
      });
      
      expect(schedule).toHaveLength(12);
    });
    
    it('final balance should be zero', () => {
      const schedule = generateAmortizationSchedule({
        principal: 100000,
        interestRate: 10,
        termMonths: 12
      });
      
      const finalPayment = schedule[schedule.length - 1];
      expect(finalPayment.closingBalance).toBeCloseTo(0, 2);
    });
  });
});
```

### Integration Testing

```typescript
// __tests__/integration/investment-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InvestmentForm } from '@/components/shared/investments/investment-form';
import { addInvestment } from '@/lib/data/investments';

// Mock the API call
jest.mock('@/lib/data/investments');
const mockAddInvestment = addInvestment as jest.MockedFunction<typeof addInvestment>;

describe('Investment Flow', () => {
  it('adds investment successfully', async () => {
    mockAddInvestment.mockResolvedValue('investment-id');
    
    render(<InvestmentForm />);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Stock Symbol'), {
      target: { value: 'AAPL' }
    });
    fireEvent.change(screen.getByPlaceholderText('Quantity'), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByPlaceholderText('Price per share'), {
      target: { value: '150' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Add Investment'));
    
    // Verify API call
    await waitFor(() => {
      expect(mockAddInvestment).toHaveBeenCalledWith({
        symbol: 'AAPL',
        quantity: 10,
        purchasePrice: 150,
        type: 'stock'
      });
    });
  });
});
```

### E2E Testing

Use Playwright for end-to-end testing:

```typescript
// e2e/investment-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Investment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to investments
    await page.goto('/sign-in');
    await page.fill('[name="identifier"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.click('text=Investments');
  });
  
  test('should add new investment', async ({ page }) => {
    await page.click('text=Add Investment');
    
    await page.fill('[placeholder="Stock Symbol"]', 'AAPL');
    await page.fill('[placeholder="Quantity"]', '10');
    await page.fill('[placeholder="Price per share"]', '150');
    
    await page.click('button:has-text("Add Investment")');
    
    await expect(page.locator('text=AAPL')).toBeVisible();
    await expect(page.locator('text=$1,500')).toBeVisible();
  });
  
  test('should display portfolio value', async ({ page }) => {
    await expect(page.locator('[data-testid="portfolio-value"]')).toBeVisible();
    await expect(page.locator('text=Total Portfolio Value')).toBeVisible();
  });
});
```

## Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `refactor/component-name` - Code refactoring
- `docs/section-name` - Documentation updates

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(investments): add portfolio value calculation

fix(auth): resolve login redirect issue

docs(api): update investment endpoints documentation

refactor(components): extract reusable form components
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Implement changes** following coding standards
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Create pull request** with descriptive title and description
6. **Code review** by team members
7. **Address feedback** and update PR
8. **Merge** after approval and passing CI/CD

### Code Review Checklist

- [ ] Code follows TypeScript and React best practices
- [ ] Components follow Single Responsibility Principle
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Performance considerations are addressed
- [ ] Security best practices are followed
- [ ] Accessibility requirements are met
- [ ] Mobile responsiveness is maintained

## Performance Guidelines

### Core Web Vitals

Maintain excellent scores for:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Techniques

1. **Image Optimization**
```typescript
import Image from 'next/image';

// Always use next/image
<Image
  src="/chart.png"
  alt="Financial Chart"
  width={800}
  height={400}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

2. **Font Optimization**
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

3. **Code Splitting**
```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

// Conditional loading
const AdminPanel = dynamic(() => import('@/components/admin-panel'), {
  ssr: false
});

function Dashboard() {
  const { user } = useUser();
  
  return (
    <div>
      <DashboardContent />
      {user?.role === 'admin' && <AdminPanel />}
    </div>
  );
}
```

4. **Database Optimization**
```typescript
// Use proper indexing
const getUserTransactions = async (userId: string) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId), // Indexed field
    orderBy('date', 'desc'),       // Indexed field
    limit(50)                      // Limit results
  );
  
  return getDocs(q);
};

// Batch operations
const batchUpdate = async (updates: Array<{ id: string; data: any }>) => {
  const batch = writeBatch(db);
  
  updates.forEach(({ id, data }) => {
    const docRef = doc(db, 'transactions', id);
    batch.update(docRef, data);
  });
  
  await batch.commit();
};
```

### Monitoring

Use Vercel Analytics and Web Vitals:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Deployment Process

### Vercel Deployment

1. **Environment Variables**
Set up production environment variables in Vercel dashboard

2. **Build Configuration**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

3. **Deployment Steps**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### CI/CD Pipeline

GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Best Practices Summary

1. **Code Quality**
   - Use TypeScript strictly
   - Follow Single Responsibility Principle
   - Write comprehensive tests
   - Maintain consistent code style

2. **Performance**
   - Optimize images and fonts
   - Use proper code splitting
   - Implement efficient database queries
   - Monitor Core Web Vitals

3. **Security**
   - Validate all inputs
   - Use proper authentication
   - Implement CSRF protection
   - Follow security best practices

4. **Maintainability**
   - Write clear documentation
   - Use meaningful variable names
   - Keep functions small and focused
   - Implement proper error handling

5. **User Experience**
   - Implement loading states
   - Provide error feedback
   - Ensure accessibility
   - Maintain responsive design