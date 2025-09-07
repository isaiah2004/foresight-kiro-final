# Requirements Document

## Introduction

Foresight is a comprehensive financial planning application designed to empower users to make informed financial decisions through visualization, planning, and tracking of their financial health. The application follows the philosophy that spending money should be as beneficial as earning it, helping users understand the consequences of their financial actions to improve their quality of life through better decision-making.

The application will be built using Next.js with TypeScript, Firebase for data storage, Clerk for authentication, and shadcn/ui for the component library, ensuring a modern, scalable, and user-friendly experience.

## Requirements

### Requirement 1: User Authentication and Management

**User Story:** As a user, I want to securely authenticate and manage my account, so that my financial data remains private and accessible only to me.

#### Acceptance Criteria

1. WHEN a user visits the application THEN the system SHALL present Clerk-based authentication options
2. WHEN a user successfully authenticates THEN the system SHALL redirect them to the main dashboard
3. WHEN a user is authenticated THEN the system SHALL display Clerk user button components for account management
4. WHEN a user accesses settings THEN the system SHALL provide Clerk-based user profile and account management options
5. IF a user is not authenticated THEN the system SHALL restrict access to all financial data and redirect to login

### Requirement 2: Multi-Currency Support System

**User Story:** As a user managing finances in multiple currencies, I want to set a primary currency and track transactions in various currencies, so that I can accurately monitor my global financial position.

#### Acceptance Criteria

1. WHEN a user creates any transaction THEN the system SHALL store both the amount and currency used
2. WHEN a user sets a primary currency THEN the system SHALL consistently apply it across all app displays
3. WHEN displaying financial data THEN the system SHALL convert amounts to the primary currency when needed
4. WHEN a user changes their primary currency THEN the system SHALL update all displays accordingly
5. IF currency conversion is required THEN the system SHALL use current exchange rates for accurate calculations

### Requirement 3: Dashboard with Financial Overview

**User Story:** As a user, I want a comprehensive dashboard that shows my financial health at a glance, so that I can quickly understand my current financial position.

#### Acceptance Criteria

1. WHEN a user accesses the dashboard THEN the system SHALL display financial health visualization
2. WHEN displaying the dashboard THEN the system SHALL show cashflow visualization
3. WHEN on the dashboard THEN the system SHALL provide access to the Fin Bot feature
4. WHEN loading dashboard components THEN the system SHALL use suspense with matching skeleton loaders
5. IF data is loading THEN the system SHALL display smooth fade-in animations using Framer Motion

### Requirement 4: Investment Portfolio Management

**User Story:** As an investor, I want to manage and track all my investments with intelligent caching for long-term investment approach, so that I can monitor my portfolio performance efficiently without supporting high-frequency trading.

#### Acceptance Criteria

1. WHEN a user accesses the investment portfolio THEN the system SHALL provide management for stocks, bonds, mutual funds, real estate, crypto, and other investments with long-term investment focus
2. WHEN adding an investment THEN the system SHALL store the investment type, amount, currency, purchase details, and last synced price with timestamp
3. WHEN viewing investments THEN the system SHALL integrate with FinnHub.io for real-time data and Alpha Vantage for historical data using Firebase cache system
4. WHEN a user requests price updates THEN the system SHALL update all stocks/crypto in cache that correspond to the user's portfolio and update cache timestamps
5. WHEN another user views portfolio data THEN the system SHALL check cache timestamps and fetch latest prices from cache if cache is newer than user's last sync
6. WHEN displaying portfolio data THEN the system SHALL calculate total portfolio value in the user's primary currency using cached prices when appropriate
7. IF real-time data is unavailable THEN the system SHALL gracefully fallback to cached or historical data
8. IF cache data is stale THEN the system SHALL maintain separate caches for stocks and crypto with intelligent update mechanisms

### Requirement 5: Budget Management System

**User Story:** As a user, I want to manage my budget through income splitting and bucket allocation with renewal rates, so that I can systematically allocate my income according to my financial goals with flexible timing.

#### Acceptance Criteria

1. WHEN a user accesses budgets THEN the system SHALL provide income splitting functionality with six categories: Essentials (50%), Lifestyle (20%), Savings & Future (20%), Sinking Fund (10%), Unallocated income increases, and Misc for hard-to-track cash
2. WHEN setting up budgets THEN the system SHALL support bucket creation with specific examples: Housing, Groceries, Transportation, Insurance, Debt repayment, Medical for Essentials; Dining out, Subscriptions, Travel, Personal fun money for Lifestyle; Emergency fund, Retirement/investments, General savings for Savings & Future; Electronics, Clothing, Home & furniture, Gifts, Annual expenses for Sinking Fund
3. WHEN creating buckets THEN the system SHALL allow renewal rate configuration with options: daily, every 2 days, weekly, bi-weekly, monthly, bi-monthly, yearly, bi-yearly, quarter yearly
4. WHEN income increases mid-month THEN the system SHALL add excess to unallocated funds by default and treat them as savings in statistics to encourage saving behavior
5. WHEN budget calculations are performed THEN the system SHALL calculate after income tax deduction, and tax estimates SHALL be done after budget distribution due to investment and donation tax cuts
6. IF amounts are set for buckets THEN the system SHALL keep amounts constant when income increases to encourage savings rather than lifestyle inflation

### Requirement 6: Income Source Management

**User Story:** As a user with multiple income sources, I want to track and manage all my income streams, so that I can have a complete picture of my earning capacity.

#### Acceptance Criteria

1. WHEN a user accesses income management THEN the system SHALL provide categories for Salary, Rental Properties, and Others
2. WHEN adding income sources THEN the system SHALL store amount, frequency, currency, and source details
3. WHEN displaying income THEN the system SHALL show both individual sources and total income in primary currency
4. WHEN calculating budgets THEN the system SHALL use total income after tax deductions
5. IF income frequency varies THEN the system SHALL normalize to monthly equivalents for budget calculations

### Requirement 7: Expense Tracking and Management

**User Story:** As a user, I want to categorize and track all my expenses, so that I can understand my spending patterns and identify areas for optimization.

#### Acceptance Criteria

1. WHEN a user accesses expense management THEN the system SHALL provide categories for Rent, Groceries, Utilities, Entertainment, and Other
2. WHEN adding expenses THEN the system SHALL store amount, category, date, currency, and description
3. WHEN viewing expenses THEN the system SHALL display spending by category and time period
4. WHEN analyzing expenses THEN the system SHALL compare actual spending against budget allocations
5. IF expenses exceed budget THEN the system SHALL provide visual indicators and alerts

### Requirement 8: Loan Management and Amortization

**User Story:** As a borrower, I want to track and manage all my loans with detailed amortization schedules and regional compliance, so that I can understand my debt obligations and plan repayments effectively according to my jurisdiction's regulations.

#### Acceptance Criteria

1. WHEN a user accesses loan management THEN the system SHALL support Home loan, Car loan, Personal loan, and Other categories with region-specific features
2. WHEN adding a loan THEN the system SHALL calculate amortization schedules using the reducing-balance method with Payment = P × i × (1+i)^n / ((1+i)^n - 1) formula
3. WHEN displaying loan details THEN the system SHALL show amortization table with Payment Number, Opening Balance, Total Payment, Interest Component, Principal Component, and Closing Balance
4. WHEN making lump-sum prepayments THEN the system SHALL offer two options: reduce tenure while keeping EMI constant, or reduce EMI while keeping tenure constant
5. IF the user is in India THEN the system SHALL apply RBI regulations: zero prepayment penalties on floating-rate loans, RLLR-based interest calculation, and mandatory choice between tenure/EMI reduction
6. IF the user is in the US THEN the system SHALL calculate APR including all fees, support ARM loans with adjustment caps, and prohibit prepayment penalties on student loans
7. IF the user is in the EU THEN the system SHALL provide 14-day withdrawal period, standardized SECCI information, and country-specific prepayment compensation rules
8. WHEN calculating student loans in India THEN the system SHALL model moratorium period with simple interest accrual, followed by capitalization and EMI calculation on the new principal balance

### Requirement 9: Funds Management with Pots and Saving Goals

**User Story:** As a user planning for the future, I want to manage all my financial goals through a unified Funds section with Pots, Saving funds, and Other goals, so that I can systematically save for both short-term specific purchases and long-term financial objectives.

#### Acceptance Criteria

1. WHEN a user accesses Funds management THEN the system SHALL provide three main categories: Pots, Saving funds (401K etc, education funds etc.), and Other (Saving for Vacation, Saving for an item, etc.)
2. WHEN navigating Funds section THEN the system SHALL provide both collapsible sidebar navigation AND tab-based navigation with options: Pots, Saving funds, Other
3. WHEN a user creates a Pot THEN the system SHALL allow specific and crisp goal definition (major vacation, house down payment, laptop budget)
4. WHEN setting up Pots THEN the system SHALL link them to budget categories (Essentials, Lifestyle, Savings & Future, Sinking Fund, Unallocated)
5. WHEN funding a Pot THEN the system SHALL allow users to add amounts from their respective linked categories and the unallocated category
6. WHEN managing Pots THEN the system SHALL track current balance, target amount, and source category allocations
7. WHEN creating Saving funds THEN the system SHALL support structured long-term goals like 401K, education funds, retirement planning with contribution schedules
8. WHEN setting up Other goals THEN the system SHALL allow flexible goal creation for vacations, item purchases, and miscellaneous savings objectives
9. WHEN tracking any fund progress THEN the system SHALL calculate required contributions, show progress visualization, and timeline to completion
10. IF any goal is not on track THEN the system SHALL provide recommendations for adjustment
11. IF a Pot reaches its target THEN the system SHALL notify the user and provide options for fund utilization or goal completion

### Requirement 10: Financial Insights and Analytics

**User Story:** As a user seeking financial guidance, I want detailed insights about my financial health, so that I can make data-driven decisions about my money.

#### Acceptance Criteria

1. WHEN a user accesses insights THEN the system SHALL provide risk profile analysis based on their financial data
2. WHEN calculating insights THEN the system SHALL analyze taxation implications and optimization opportunities
3. WHEN displaying analytics THEN the system SHALL show debt-to-income ratios, savings rates, and other key metrics
4. WHEN generating reports THEN the system SHALL provide actionable recommendations for financial improvement
5. IF user data changes significantly THEN the system SHALL update insights and recommendations accordingly

### Requirement 11: Responsive Navigation and User Interface

**User Story:** As a user, I want an intuitive navigation system with collapsible sidebar, persistent state, and dual navigation patterns, so that I can efficiently access all features according to my preferences with both sidebar and tab-based navigation.

#### Acceptance Criteria

1. WHEN a user accesses the application THEN the system SHALL provide a collapsible sidebar using shadcn sidebar-08 component with all main navigation options
2. WHEN navigating between sections THEN the system SHALL maintain sidebar state using cookies named "sidebar_state" for persistence across page reloads and SSR
3. WHEN viewing detailed sections like Income THEN the system SHALL provide both collapsible sidebar navigation AND tab-based navigation with identical options (Salary, Rental Properties, Others)
4. WHEN implementing sidebar THEN the system SHALL use SidebarProvider with defaultOpen state from cookies in app/layout.tsx
5. WHEN the sidebar state changes THEN the system SHALL persist the preference across page reloads using Next.js cookies() function
6. WHEN managing navigation config THEN the system SHALL use shared config files imported by both breadcrumb and sidebar components for easy maintenance
7. IF the user has a preferred navigation state THEN the system SHALL restore it on subsequent visits using the persisted cookie value

### Requirement 12: Settings and Feedback Management

**User Story:** As a user, I want to customize application settings and provide feedback, so that I can tailor the experience to my needs and help improve the application.

#### Acceptance Criteria

1. WHEN a user accesses settings THEN the system SHALL provide options for currency preferences, display settings, and account management
2. WHEN submitting feedback THEN the system SHALL capture user input and store it for review
3. WHEN changing settings THEN the system SHALL immediately apply changes across the application
4. WHEN managing preferences THEN the system SHALL integrate with Clerk for user profile management
5. IF settings affect calculations THEN the system SHALL recalculate all relevant financial data

### Requirement 13: Performance and User Experience

**User Story:** As a user, I want the application to load quickly with smooth animations and responsive interactions, so that managing my finances feels efficient and professional.

#### Acceptance Criteria

1. WHEN loading any page THEN the system SHALL display skeleton loaders that match the final content structure using Suspense
2. WHEN content loads THEN the system SHALL use smooth fade-in animations via Framer Motion with professional, crisp animations that build user trust
3. WHEN performing calculations THEN the system SHALL complete operations within 2 seconds for typical datasets
4. WHEN displaying animations THEN the system SHALL ensure animations don't make the app feel like a toy but maintain professional trustworthiness
5. IF the application supports client-side operations THEN the system SHALL provide "bring your own API" functionality for external integrations

### Requirement 14: Technical Architecture and Code Organization

**User Story:** As a developer, I want a well-organized codebase following Next.js App Router best practices, so that the application is maintainable, scalable, and follows modern React patterns.

#### Acceptance Criteria

1. WHEN structuring the project THEN the system SHALL use src directory with App Router, feature-based organization, and TypeScript throughout
2. WHEN creating components THEN the system SHALL default to Server Components and only use "use client" for interactivity (event listeners, state, browser APIs)
3. WHEN organizing code THEN the system SHALL follow the pattern: /src/app for routes, /src/components/ui for atomic components, /src/components/shared for complex components, /src/lib for utilities
4. WHEN managing state THEN the system SHALL use useState/useReducer for local state, Zustand for global state, and avoid useEffect with fetch
5. WHEN styling THEN the system SHALL use Tailwind CSS with clsx/tailwind-merge for conditional classes
6. WHEN handling images THEN the system SHALL ALWAYS use next/image component for optimization
7. WHEN loading fonts THEN the system SHALL use next/font for optimization and layout shift prevention
8. IF components are large THEN the system SHALL use next/dynamic for lazy loading
