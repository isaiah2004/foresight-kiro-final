# Technology Stack & Build System

## Core Technologies

### Frontend Framework

- **Next.js 14+** with App Router (not Pages Router)
- **TypeScript** throughout the entire codebase
- **React 18+** with Server Components as default

### UI & Styling

- **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for styling with clsx/tailwind-merge for conditional classes
- **Framer Motion** for professional, trust-building animations (avoid toy-like animations)

### Authentication & Database

- **Clerk** for authentication, user management, and billing
- **Firebase Firestore** for database with real-time capabilities
- **Vercel AI SDK** for LLM integration (Phase 2)

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

## Development Commands

### Setup & Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

### Building

```bash
npm run build
# or
yarn build
```

### Testing

```bash
npm run test
# or
yarn test
```

### Linting & Formatting

```bash
npm run lint
npm run format
# or
yarn lint
yarn format
```

## Performance Requirements

- **Loading**: Skeleton loaders with Suspense for all async content
- **Animations**: Smooth fade-ins with Framer Motion, professional feel
- **Images**: ALWAYS use next/image for optimization
- **Fonts**: Use next/font for optimization and layout shift prevention
- **Bundle**: Use next/dynamic for lazy loading of large components
- **Core Web Vitals**: Maintain excellent LCP, FID, and CLS scores

## Design Principles

### Single Responsibility Principle (SRP)

- **Components**: Each component should have one reason to change and one responsibility
- **Functions**: Each function should do one thing well
- **Modules**: Each file/module should handle one specific domain or feature
- **Hooks**: Custom hooks should encapsulate one specific piece of logic
- **Utilities**: Utility functions should be pure and handle one specific transformation

Examples:

```typescript
// Good - Single responsibility
const calculateLoanEMI = (principal: number, rate: number, term: number) => { ... }
const formatCurrency = (amount: number, currency: string) => { ... }
const validateLoanInput = (loanData: LoanInput) => { ... }

// Bad - Multiple responsibilities
const processLoan = (data: any) => {
  // validates, calculates, formats, and saves - too many responsibilities
}
```

## API Integration Patterns

- **Client Components**: Only use "use client" for interactivity (event listeners, state, browser APIs)
- **Server Components**: Default choice for data fetching and static content
- **Error Handling**: Implement retry logic and graceful fallbacks for external APIs
- **Caching**: Intelligent cache management for financial data with timestamp-based updates
