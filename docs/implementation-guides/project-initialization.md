# Project Initialization Guide

## Purpose
This guide provides step-by-step instructions for initializing a new Foresight financial planning application project with all required dependencies and configurations.

## Initial Project Setup

### Create Next.js Application
```bash
npx create-next-app@latest foresight-app --typescript --tailwind --eslint --app --src-dir
```

**Required Flags:**
- `--typescript`: Enable TypeScript support
- `--tailwind`: Include Tailwind CSS configuration
- `--eslint`: Set up ESLint for code quality
- `--app`: Use App Router (not Pages Router)
- `--src-dir`: Create src directory for better organization

### Initialize shadcn/ui
```bash
cd foresight-app
npx shadcn@latest init
```

**Configuration Options:**
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config: Yes
- Import alias: `@/*`

## Essential Dependencies

### Core Dependencies
```bash
npm install @clerk/nextjs firebase framer-motion zustand
```

### UI and Styling
```bash
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react @radix-ui/react-icons
```

### Development Dependencies
```bash
npm install -D @types/node @types/react @types/react-dom
npm install -D prettier prettier-plugin-tailwindcss
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Financial APIs (Optional - for production)
```bash
npm install axios swr
```

## Project Structure Setup

### Create Directory Structure
```bash
# Core directories
mkdir -p src/components/ui src/components/shared
mkdir -p src/lib/financial src/lib/validations
mkdir -p src/hooks src/providers src/types
mkdir -p src/app/dashboard src/app/\(auth\)

# Documentation directories
mkdir -p docs/components docs/hooks docs/utilities
mkdir -p docs/api docs/development docs/deployment
mkdir -p docs/financial-behavior docs/implementation-guides
```

### Essential Configuration Files

#### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Prettier Configuration (`.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### ESLint Configuration (`.eslintrc.json`)
```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "warn",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

## Environment Setup

### Environment Variables Template (`.env.local.example`)
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Financial APIs (Optional)
FINNHUB_API_KEY=...
ALPHA_VANTAGE_API_KEY=...

# Development
NODE_ENV=development
```

### Git Configuration (`.gitignore` additions)
```bash
# Environment variables
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Firebase
.firebase/
firebase-debug.log
```

## Initial Component Setup

### Root Layout (`src/app/layout.tsx`)
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/providers/theme-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Foresight - Financial Planning App',
  description: 'Comprehensive financial planning and investment tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### Basic Utility Functions (`src/lib/utils.ts`)
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
```

## Package.json Scripts

### Development Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit"
  }
}
```

## Verification Steps

### 1. Development Server
```bash
npm run dev
```
Verify the application starts on `http://localhost:3000`

### 2. Build Process
```bash
npm run build
```
Ensure the build completes without errors

### 3. Type Checking
```bash
npm run type-check
```
Verify no TypeScript errors

### 4. Linting
```bash
npm run lint
```
Ensure code quality standards are met

### 5. Formatting
```bash
npm run format:check
```
Verify code formatting consistency

## Next Steps

After initialization:

1. **Set up Authentication**: Configure Clerk with your project keys
2. **Configure Firebase**: Set up Firestore database and security rules
3. **Install shadcn Components**: Add required UI components as needed
4. **Create Base Components**: Implement core shared components
5. **Set up Navigation**: Implement sidebar and routing structure
6. **Configure Testing**: Set up test environment and write initial tests

## Troubleshooting

### Common Issues

**Node Version Compatibility:**
- Ensure Node.js version 18.17 or higher
- Use `node --version` to check current version

**Package Installation Errors:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**TypeScript Errors:**
- Restart TypeScript server in your IDE
- Check tsconfig.json paths configuration

**Build Errors:**
- Verify all environment variables are set
- Check for unused imports and variables
- Ensure all dependencies are properly installed

This initialization guide ensures a solid foundation for the Foresight financial planning application with all necessary tools and configurations in place.