# Deployment Guide

This guide covers the deployment process, environment configuration, and production setup for the Foresight Financial Planning App.

## Table of Contents

- [Production Environment](#production-environment)
- [Vercel Deployment](#vercel-deployment)
- [Firebase Configuration](#firebase-configuration)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)

## Production Environment

### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │   Next.js App    │    │   Firebase      │
│   (Static)      │────│   (Server)       │────│   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                │
                       ┌──────────────────┐
                       │  External APIs   │
                       │  - FinnHub       │
                       │  - Alpha Vantage │
                       │  - Exchange Rate │
                       └──────────────────┘
```

### Technology Stack

- **Hosting**: Vercel (Edge Network)
- **Framework**: Next.js 14+ with App Router
- **Database**: Firebase Firestore
- **Authentication**: Clerk
- **CDN**: Vercel Edge Network
- **Analytics**: Vercel Analytics + Speed Insights
- **Monitoring**: Vercel Functions Monitoring

## Vercel Deployment

### Initial Setup

1. **Connect Repository**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

2. **Project Configuration**
Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

3. **Build Configuration**
Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(new (require('@next/bundle-analyzer'))({
        enabled: true,
      }));
      return config;
    },
  }),
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Deployment Commands

```bash
# Deploy to preview (development)
vercel

# Deploy to production
vercel --prod

# Deploy with specific environment
vercel --prod --env NODE_ENV=production

# Check deployment status
vercel ls

# View deployment logs
vercel logs <deployment-url>
```

## Firebase Configuration

### Production Firebase Setup

1. **Create Production Project**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Select:
# - Firestore
# - Hosting (optional)
# - Functions (if needed)
```

2. **Firestore Security Rules**
Update `firestore.rules`:

```javascript
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
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Investments are user-specific
    match /investments/{investmentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Budgets are user-specific
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Loans are user-specific
    match /loans/{loanId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Price cache is read-only for authenticated users
    match /stockCache/{symbol} {
      allow read: if request.auth != null;
      allow write: if false; // Only server functions can update
    }
    
    match /cryptoCache/{symbol} {
      allow read: if request.auth != null;
      allow write: if false; // Only server functions can update
    }
    
    // Exchange rates cache
    match /exchangeRates/{currency} {
      allow read: if request.auth != null;
      allow write: if false; // Only server functions can update
    }
  }
}
```

3. **Firestore Indexes**
Update `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "investments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "investments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "lastSyncTimestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

4. **Deploy Firebase Configuration**
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy everything
firebase deploy
```

## Environment Variables

### Production Environment Variables

Set these in Vercel Dashboard (Settings > Environment Variables):

#### Authentication (Clerk)
```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=whsec_...
```

#### Firebase Configuration
```bash
# Firebase Production Config
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=foresight-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=foresight-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=foresight-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK (Server-side)
FIREBASE_ADMIN_PROJECT_ID=foresight-prod
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
```

#### External APIs
```bash
# Financial Data APIs
FINNHUB_API_KEY=...
ALPHA_VANTAGE_API_KEY=...
EXCHANGE_RATE_API_KEY=...

# API Rate Limits
FINNHUB_RATE_LIMIT=60
ALPHA_VANTAGE_RATE_LIMIT=5
```

#### Application Configuration
```bash
# Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Security
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://foresight.vercel.app

# Features
ENABLE_ANALYTICS=true
ENABLE_PERFORMANCE_MONITORING=true
```

### Environment Variable Management

Create environment-specific files:

```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# .env.staging
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging

# .env.local (never commit)
# Local development overrides
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
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
        run: npm run test
        env:
          CI: true
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

  deploy-preview:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Update Firebase Rules
        run: |
          npm install -g firebase-tools
          firebase deploy --only firestore:rules,firestore:indexes --token ${{ secrets.FIREBASE_TOKEN }}
```

### Required Secrets

Add these secrets to GitHub repository (Settings > Secrets):

```bash
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
FIREBASE_TOKEN=...
```

## Monitoring & Analytics

### Vercel Analytics Setup

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
```

### Custom Analytics Events

```typescript
// lib/analytics.ts
import { track } from '@vercel/analytics';

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    track(eventName, properties);
  }
};

// Usage in components
export function InvestmentForm() {
  const handleSubmit = async (data: InvestmentData) => {
    try {
      await addInvestment(data);
      trackEvent('investment_added', {
        type: data.type,
        amount: data.amount,
        currency: data.currency
      });
    } catch (error) {
      trackEvent('investment_add_error', {
        error: error.message
      });
    }
  };
}
```

### Error Monitoring

```typescript
// lib/error-monitoring.ts
export const logError = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service (e.g., Sentry)
    console.error('Production Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  } else {
    console.error('Development Error:', error, context);
  }
};

// Error boundary
export class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
  }
}
```

### Performance Monitoring

```typescript
// lib/performance.ts
export const measurePerformance = (name: string, fn: () => Promise<any>) => {
  return async (...args: any[]) => {
    const start = performance.now();
    
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      
      if (process.env.NODE_ENV === 'production') {
        trackEvent('performance_metric', {
          operation: name,
          duration,
          success: true
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      trackEvent('performance_metric', {
        operation: name,
        duration,
        success: false,
        error: error.message
      });
      
      throw error;
    }
  };
};

// Usage
const addInvestmentWithMetrics = measurePerformance('add_investment', addInvestment);
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures

```bash
# Check build logs
vercel logs <deployment-url>

# Local build test
npm run build

# Type checking
npm run type-check

# Clear Next.js cache
rm -rf .next
npm run build
```

#### Environment Variable Issues

```bash
# Check environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME

# Pull environment variables locally
vercel env pull .env.local
```

#### Database Connection Issues

```typescript
// Test Firebase connection
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    console.log('Firebase connection successful');
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
}
```

#### API Rate Limiting

```typescript
// Implement rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export async function withRateLimit(request: Request, handler: () => Promise<Response>) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  return handler();
}
```

### Performance Issues

#### Bundle Size Analysis

```bash
# Analyze bundle size
npm run analyze

# Check for large dependencies
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

#### Database Query Optimization

```typescript
// Optimize Firestore queries
import { query, where, orderBy, limit, startAfter } from 'firebase/firestore';

// Use pagination
export async function getPaginatedTransactions(
  userId: string,
  pageSize = 20,
  lastDoc?: DocumentSnapshot
) {
  let q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(pageSize)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  return getDocs(q);
}
```

### Security Issues

#### CORS Configuration

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://foresight.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};
```

#### Content Security Policy

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev *.vercel-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' *.firebase.googleapis.com *.clerk.accounts.dev *.vercel-analytics.com;"
  );
  
  return response;
}
```

## Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <previous-deployment-url>

# Rollback to specific deployment
vercel alias <deployment-url> foresight.vercel.app
```

### Database Rollback

```bash
# Export current data (backup)
firebase firestore:export gs://foresight-backup/$(date +%Y%m%d)

# Restore from backup if needed
firebase firestore:import gs://foresight-backup/20240101
```

### Emergency Procedures

1. **Immediate Issues**
   - Rollback to previous Vercel deployment
   - Check error monitoring dashboard
   - Verify external API status

2. **Database Issues**
   - Check Firebase console for errors
   - Verify security rules
   - Monitor query performance

3. **Communication**
   - Update status page
   - Notify users if necessary
   - Document incident for post-mortem

This deployment guide ensures a robust, monitored, and maintainable production environment for the Foresight Financial Planning App.