# Implementation Plan

- [x] 1. Project Setup and Core Infrastructure
  - Initialize Next.js project with TypeScript and src directory structure
  - Configure Tailwind CSS, shadcn/ui, and essential development tools
  - Set up Firebase project and Firestore database with security rules
  - Configure Clerk authentication with user management
  - Implement basic project structure following Next.js App Router patterns
  - _Requirements: 1.1, 1.2, 1.3, 14.1, 14.2, 14.3_

- [x] 2. Authentication and User Management Foundation
  - Implement Clerk authentication integration in app/layout.tsx
  - Create protected route middleware for financial data access
  - Build user profile management with primary currency settings
  - Implement Clerk user button components and settings integration
  - Set up user session management and redirect logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Multi-Currency System Implementation
  - Create currency selection and management components
  - Implement exchange rate fetching and caching mechanism
  - Build currency conversion utilities with fallback handling
  - Create transaction model with currency storage and conversion
  - Implement primary currency application across all displays
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Navigation System and UI Foundation
  - Install and configure shadcn sidebar-08 component via `npx shadcn@latest add sidebar-08`
  - Implement collapsible sidebar with persistent cookie state
  - Create shared navigation configuration file for maintainability
  - Build dual navigation pattern (sidebar + tabs) for detailed sections
  - Implement SidebarProvider with Next.js cookies integration
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 5. Dashboard Core Components
  - Implement state preservation based on the Dashboard.md file in the steering docs.
  - Implement the Tabs + sidebar layout for the dashboard.
  - Create main dashboard layout with financial health visualization placeholder
  - Implement cashflow visualization component structure
  - Build Fin Bot integration placeholder for future LLM features
  - Add Suspense-based loading with skeleton components
  - Implement Framer Motion animations for smooth transitions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Budget Management System
  - Implement a Docs folder for the project that explains what everything does and how to use those file. for example the utils and hooks all need to be documented and components and usage instructions need to be provided.
  - Move all the folders into dashbaord so the inbuild layout functions of nextjs kick in.
  - also make sure the sidebar only starts in the dasboards route (i have updated tructure.md to guide you better.). Why because it would not make sense to have a dashbaord on the landing page.
  - examine the folder structure and make the other pages all come inside dasboard and the ones inside dashboard page go into an overview page. this way we can have the application entirely inside of dashboard route.

- [x] 6.1 Implement income splitting with 6-category system
  - Create budget allocation interface with Essentials (50%), Lifestyle (20%), Savings & Future (20%), Sinking Fund (10%), Unallocated, and Misc categories
  - Build percentage-based allocation calculator with tax deduction logic
  - Implement unallocated income handling for mid-month increases
  - _Requirements: 5.1, 5.4, 5.5, 5.6_

- [x] 6.2 Create bucket management system
  - Build bucket creation interface with specific category examples (Housing, Groceries, Transportation for Essentials, etc.)
  - Implement renewal rate configuration (daily, weekly, monthly, bi-yearly, etc.)
  - Create bucket tracking and management dashboard
  - _Requirements: 5.2, 5.3_

- [-] 7. Investment Portfolio with Intelligent Caching
  - move all the docs scattered in the codebase into docs so they are easier to find and update and maintain.
  - upate the docs to keep to the new `docs.md`

- [x] 7.1 Implement Firebase caching system
  - Create separate cache collections for stocks and crypto in Firestore
  - Build cache update mechanism triggered by user price update requests
  - Implement timestamp-based cache freshness checking
  - _Requirements: 4.4, 4.5, 4.7, 4.8_

- [x] 7.2 Build investment management interface
  - Create investment portfolio dashboard with stocks, bonds, mutual funds, real estate, crypto, and other categories
  - Implement investment addition form with currency and purchase details
  - Build portfolio value calculation in primary currency
  - _Requirements: 4.1, 4.2, 4.6_

- [x] 7.3 Integrate external financial APIs
  - Set up FinnHub.io integration for real-time stock data
  - Implement Alpha Vantage integration for historical data
  - Build graceful fallback to cached data when APIs are unavailable
  - _Requirements: 4.3, 4.7_

- [x] 7.4. Finish Investment form
  - In the add investment page. allow the use to search for stock via a cached api.
  - The cached api has a valididty of 24hour that can be overidden when the user presses the refresh prices button. Use Finnhub for stocks and crypto.
  - Make sure the form is different for everytype of investment otherwise what is the point.
  - Allow user to edit there investment via an edit buttom that opens an overlay form that can be used to edit THAT TYPE of investment and save the changes.
  - _Requirements: 7.1, 7.2,7.3_

- [x] 8.1 Create income source management
  - Build income management interface with Salary, Rental Properties, and Others categories
  - Implement dual navigation (sidebar + tabs) pattern
  - Create income frequency normalization to monthly equivalents
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 8.2 Implement expense tracking system
  - Create expense management with Rent, Groceries, Utilities, Entertainment, and Other categories
  - Build expense entry form with currency, category, and description fields
  - Implement spending analysis against budget allocations with visual indicators
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_-

- [ ] 9. Loan Management with Regional Compliance
- [ ] 9.1 Implement core amortization engine
  - Build reducing-balance method calculator with Payment = P × i × (1+i)^n / ((1+i)^n - 1) formula
  - Create amortization schedule generator with all required columns (Payment Number, Opening Balance, etc.)
  - Implement lump-sum prepayment logic with tenure vs EMI reduction options
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 9.2 Add regional compliance features
  - Implement India RBI compliance: RLLR-based calculations, zero prepayment penalties on floating-rate loans
  - Build US TILA compliance: APR calculations, ARM loan support with adjustment caps
  - Create EU CCD compliance: 14-day withdrawal period, standardized SECCI information
  - _Requirements: 8.5, 8.6, 8.7_

- [ ] 9.3 Build loan management interface
  - Create loan management dashboard with Home, Car, Personal, and Other loan categories
  - Implement loan addition form with region-specific fields
  - Build amortization schedule display with prepayment scenario modeling
  - _Requirements: 8.1, 8.8_

- [ ] 10. Funds Management (Pots and Saving Goals)
- [ ] 10.1 Implement Pots functionality
  - Create Pots interface for specific goals (vacation, house down payment, laptop budget)
  - Build category linking system (Essentials, Lifestyle, Savings & Future, Sinking Fund, Unallocated)
  - Implement fund transfer mechanism from budget categories to Pots
  - _Requirements: 9.5, 9.6, 9.7, 9.8, 9.10_

- [ ] 10.2 Build Saving funds system
  - Create structured long-term goals interface (401K, education funds, retirement planning)
  - Implement contribution schedule management and progress tracking
  - Build goal completion notifications and recommendations
  - _Requirements: 9.7, 9.9, 9.11_

- [ ] 10.3 Create unified Funds navigation
  - Implement three-category structure: Pots, Saving funds, Other goals
  - Build dual navigation pattern (sidebar + tabs) for Funds section
  - Create progress visualization and timeline components
  - _Requirements: 9.1, 9.2, 9.9_

- [ ] 11. Financial Insights and Analytics
- [ ] 11.1 Build analytics engine
  - Create risk profile analysis based on user financial data
  - Implement debt-to-income ratio calculations and savings rate analysis
  - Build taxation implication analysis and optimization recommendations
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 11.2 Create insights dashboard
  - Build financial health metrics visualization
  - Implement actionable recommendation system
  - Create dynamic insights updates when user data changes significantly
  - _Requirements: 10.4, 10.5_- [ ] 12. S
    ettings and Feedback System
- [ ] 12.1 Implement user settings
  - Create settings interface with currency preferences and display options
  - Build Clerk integration for user profile management
  - Implement real-time settings application across the application
  - _Requirements: 12.1, 12.3, 12.4, 12.5_

- [ ] 12.2 Build feedback system
  - Create feedback submission interface
  - Implement feedback storage and review system in Firebase
  - Build feedback management for administrative review
  - _Requirements: 12.2_

- [ ] 13. Performance Optimization and User Experience
- [ ] 13.1 Implement loading and animation system
  - Create skeleton loaders that match final content structure using Suspense
  - Build professional Framer Motion animations for smooth transitions
  - Implement 2-second performance target for typical financial calculations
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 13.2 Add "Bring Your Own API" functionality
  - Create external API integration framework for client-side operations
  - Build API key management interface for user-provided services
  - Implement fallback mechanisms for external service failures
  - _Requirements: 13.5_

- [ ] 14. Code Quality and Architecture Finalization
- [ ] 14.1 Implement state management
  - Set up Zustand for global state management
  - Implement local state with useState/useReducer patterns
  - Avoid useEffect with fetch, use proper data fetching libraries
  - _Requirements: 14.4_

- [ ] 14.2 Optimize images and fonts
  - Implement next/image for all image assets with proper optimization
  - Set up next/font for font optimization and layout shift prevention
  - Add next/dynamic for lazy loading of large components
  - _Requirements: 14.6, 14.7, 14.8_

- [ ] 14.3 Finalize styling and responsive design
  - Complete Tailwind CSS implementation with clsx/tailwind-merge
  - Ensure responsive design across all components
  - Implement professional animations that build user trust
  - _Requirements: 14.5_

- [ ] 15. Testing and Quality Assurance
- [ ] 15.1 Implement comprehensive testing
  - Write unit tests for all financial calculation functions
  - Create integration tests for Firebase operations and external API integrations
  - Build end-to-end tests for critical user journeys (budget creation, loan management)
  - _Requirements: All requirements validation_

- [ ] 15.2 Performance and accessibility testing
  - Test loading performance and Core Web Vitals optimization
  - Implement accessibility testing for keyboard navigation and screen readers
  - Validate cross-browser compatibility and mobile responsiveness
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 16. Deployment and Production Setup
- [ ] 16.1 Configure production environment
  - Set up Vercel deployment with optimized build configuration
  - Configure production Firebase environment with proper security rules
  - Set up environment variables and API key management
  - _Requirements: All requirements in production environment_

- [ ] 16.2 Final integration and testing
  - Perform end-to-end testing in production environment
  - Validate all external API integrations (FinnHub.io, Alpha Vantage)
  - Test multi-currency functionality with real exchange rates
  - Verify Clerk authentication and billing integration
  - _Requirements: Complete system validation_
