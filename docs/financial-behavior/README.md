# Financial Behavior Documentation

This section contains detailed documentation about the financial business logic and behavior implemented in the Foresight application.

## Overview

The financial behavior documentation defines the core business rules, calculations, and user interactions that drive the financial planning features of the application. These documents serve as the authoritative source for understanding how financial operations should work.

## Documentation Structure

### [Budget Management Behavior](./budget-behavior.md)
Defines the income distribution system, bucket management, and renewal rate calculations.

**Key Topics:**
- Six-category budget allocation (Essentials, Lifestyle, Savings & Future, Sinking Fund, Unallocated, Misc)
- Income increase handling and lifestyle inflation prevention
- Bucket creation, renewal rates, and category linking
- Tax calculation timing and budget distribution logic

### [Investment Caching System](./investment-caching.md)
Explains the intelligent caching system for stocks and cryptocurrency data designed for long-term investment tracking.

**Key Topics:**
- Dual cache system (stocks and crypto)
- User-triggered cache updates and sharing logic
- Cache freshness validation and TTL management
- External API integration (FinnHub.io, Alpha Vantage)
- Fallback strategies and error handling

### [Pot Management Behavior](./pot-behavior.md)
Details the behavior for Pots in the Funds management system for specific, short-term saving goals.

**Key Topics:**
- Pot creation for specific goals (vacation, house down payment, etc.)
- Category linking and funding mechanisms
- Progress tracking and completion handling
- Integration with budget system and balance updates

### [Loan Calculations & Regional Compliance](./loan-calculations.md)
Comprehensive guide for loan amortization calculations with regional compliance for India, USA, and European Union.

**Key Topics:**
- Core amortization formulas (reducing-balance and flat-rate methods)
- Amortization schedule generation algorithms
- Prepayment handling (tenure vs EMI reduction)
- Regional compliance requirements (RBI, TILA/CFPB, CCD/MCD)
- Loan-specific features by jurisdiction

## Implementation Guidelines

### Business Logic Separation
All financial behavior should be implemented with clear separation between:
- **Business Logic**: Pure calculation functions in `/lib/financial/`
- **Data Operations**: Database interactions in `/lib/data/`
- **UI Components**: Display and interaction logic in `/components/`
- **API Integration**: External service calls in `/lib/api/`

### Performance Requirements
- Financial calculations should complete within 2 seconds for typical datasets
- Cache operations should respond within 500ms
- Real-time updates should propagate across all related UI components
- Batch operations should be optimized for large portfolios

### Error Handling
- Graceful degradation when external APIs are unavailable
- Clear error messages for invalid financial configurations
- Fallback to cached or historical data when appropriate
- Comprehensive logging for audit and debugging purposes

### Testing Requirements
- Unit tests for all calculation formulas and business logic
- Integration tests for cache sharing and data consistency
- End-to-end tests for complete user workflows
- Performance tests for large datasets and concurrent users
- Validation tests for regional compliance requirements

## Regional Considerations

### India (RBI Compliance)
- RLLR-based interest rate calculations
- Zero prepayment penalties on floating-rate loans
- Mandatory choice between tenure and EMI reduction
- Student loan moratorium and capitalization logic

### United States (TILA/CFPB)
- APR calculations including all fees and costs
- ARM loan support with rate caps and adjustment logic
- Qualified Mortgage (QM) prepayment penalty restrictions
- Truth in Lending Act disclosure requirements

### European Union (CCD/MCD)
- 14-day withdrawal period for consumer credit
- Standardized SECCI and ESIS information sheets
- Early repayment compensation calculations
- Cross-border lending compliance

## Data Structures

All financial behavior implementations should use consistent TypeScript interfaces:

```typescript
// Core financial data types
interface Transaction {
  amount: number;
  currency: string;
  convertedAmount?: number;
  exchangeRate?: number;
}

interface Investment {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  lastSyncedPrice: number;
  lastSyncTimestamp: Date;
}

interface Loan {
  principal: number;
  interestRate: number;
  termMonths: number;
  region: 'india' | 'us' | 'eu';
  rateType: 'fixed' | 'floating';
}
```

## Validation and Compliance

### Input Validation
- All financial inputs must be validated for positive amounts and valid ranges
- Currency codes must conform to ISO 4217 standards
- Interest rates must be within reasonable bounds for the loan type and region
- Dates must be validated for logical consistency (start dates before end dates)

### Regulatory Compliance
- Implement jurisdiction-specific validation rules
- Ensure calculations match regulatory requirements
- Maintain audit trails for compliance reporting
- Support multiple regulatory frameworks simultaneously

### Data Integrity
- Ensure consistency between related financial data
- Validate cross-references between budgets, goals, and transactions
- Implement referential integrity checks
- Provide data migration and cleanup utilities

This financial behavior documentation ensures that all financial features in the Foresight application are implemented consistently, comply with regional regulations, and provide accurate calculations for users' financial planning needs.