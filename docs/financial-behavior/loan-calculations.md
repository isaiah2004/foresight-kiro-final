# Global Loan Calculation and Amortization Guide

## Purpose
This document provides a comprehensive computational framework for loan amortization and repayment structures, covering India, USA, and European Union regulations and requirements.

## Core Amortization Formulas

### Reducing-Balance Method (Standard)
The reducing-balance method is the global standard for calculating payments for most amortizing loans. Interest is calculated only on the outstanding principal balance.

**Formula:**
```
Payment = P × [i × (1+i)^n] / [(1+i)^n - 1]
```

**Variables:**
- **P (Principal)**: Initial loan amount
- **i (Periodic Interest Rate)**: Annual rate ÷ payment frequency (e.g., annual rate ÷ 12 for monthly)
- **n (Total Payments)**: Loan term × payment frequency

### Flat-Rate Method (Legacy)
Calculates interest on the original principal for the entire loan duration. Less favorable to borrowers but simpler to calculate.

**Calculation:**
1. Total Interest = P × Annual Rate × Term (years)
2. Payment = (P + Total Interest) ÷ n

## Amortization Schedule Generation

### Standard Schedule Structure
| Payment No. | Opening Balance | Total Payment | Interest Paid | Principal Paid | Closing Balance |
|-------------|----------------|---------------|---------------|----------------|-----------------|
| 1           | P              | PMT           | I₁            | PRN₁           | B₁              |
| 2           | B₁             | PMT           | I₂            | PRN₂           | B₂              |
| ...         | ...            | ...           | ...           | ...            | ...             |
| n           | Bₙ₋₁           | PMT_final     | Iₙ            | PRNₙ           | 0.00            |

### Algorithm Steps
1. **Initialize**: Set opening balance to principal amount
2. **Calculate PMT**: Use reducing-balance formula
3. **For each period**:
   - Opening Balance = Previous closing balance
   - Interest = Opening Balance × periodic rate
   - Principal = PMT - Interest
   - Closing Balance = Opening Balance - Principal
4. **Final adjustment**: Ensure closing balance equals exactly 0.00

## Prepayment Handling

### Core Mechanics
- Prepayments apply directly to outstanding principal
- Reduces base for all future interest calculations
- Earlier prepayments provide greater total savings

### Recalculation Options

#### Option 1: Tenure Reduction (Constant EMI)
- Keep same payment amount
- Loan pays off faster
- Maximum interest savings
- **Formula**: n_new = -ln(1 - (PMT × P_new × i)) / ln(1 + i)

#### Option 2: EMI Reduction (Constant Tenure)
- Keep same loan term
- Lower monthly payment
- Better cash flow, less total savings
- **Formula**: PMT_new = P_new × [i × (1+i)^n_remaining] / [(1+i)^n_remaining - 1]

## Regional Compliance

### India (RBI Regulations)

#### Interest Rate Framework
- **RLLR System**: Repo Linked Lending Rate (mandatory since Oct 2019)
- **Rate Calculation**: External Benchmark + Spread + Credit Risk Premium
- **Reset Frequency**: Minimum quarterly for floating rates

#### Prepayment Rules
- **Floating Rate Loans**: Zero prepayment penalties (mandatory)
- **Fixed Rate Loans**: Up to 3% penalty allowed
- **Choice Requirement**: Must offer both tenure and EMI reduction options

#### Loan-Specific Features
**Home Loans:**
- LTV ratios: 90% (up to ₹30L), 75% (above ₹75L)
- Mandatory prepayment choice presentation

**Student Loans:**
- Moratorium period during studies + 6-12 months
- Simple interest accrual during moratorium
- Interest capitalization at repayment start
- Up to 15-year repayment term

### United States (TILA/CFPB)

#### Regulatory Framework
- **Truth in Lending Act (TILA)**: Standardized disclosure requirements
- **APR Calculation**: Must include all fees and costs
- **CFPB Oversight**: Consumer protection and complaint handling

#### Mortgage Types
**Fixed-Rate Mortgages:**
- Constant interest rate for entire term
- Typically 15 or 30 years
- Predictable payments

**Adjustable-Rate Mortgages (ARM):**
- Initial fixed period (5, 7, or 10 years)
- Rate adjusts based on: Index + Margin
- **Rate Caps**: Initial/Periodic/Lifetime (e.g., 2/1/5)

#### Prepayment Rules
- **Qualified Mortgages**: No prepayment penalties
- **Non-QM Loans**: Limited penalties (2% years 1-2, 1% year 3)
- **Student Loans**: Federal loans have no prepayment penalties

### European Union (CCD/MCD)

#### Consumer Credit Directive (CCD)
- **14-day withdrawal period**: Right to cancel without penalty
- **SECCI**: Standardized European Consumer Credit Information
- **APR standardization**: Uniform calculation across EU

#### Mortgage Credit Directive (MCD)
- **Creditworthiness assessment**: Mandatory affordability checks
- **Early repayment rights**: Compensation limited to 1% of amount or 0.5% if <1 year remaining
- **ESIS**: European Standardized Information Sheet

## Implementation Requirements

### Data Structures
```typescript
interface Loan {
  id: string;
  userId: string;
  type: 'home' | 'car' | 'personal' | 'student' | 'other';
  principal: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  currency: string;
  region: 'india' | 'us' | 'eu';
  rateType: 'fixed' | 'floating';
  
  // Regional compliance fields
  rbiCompliance?: RBICompliance;
  usCompliance?: USCompliance;
  euCompliance?: EUCompliance;
}

interface AmortizationSchedule {
  loanId: string;
  payments: PaymentSchedule[];
  totalInterest: number;
  totalPayments: number;
}
```

### Calculation Engine
- **Single Responsibility**: Separate calculation logic from UI
- **Regional Validation**: Apply jurisdiction-specific rules
- **Error Handling**: Graceful handling of edge cases
- **Performance**: Complete calculations within 2 seconds

### Testing Requirements
- Unit tests for all calculation formulas
- Integration tests for regional compliance
- End-to-end tests for prepayment scenarios
- Performance tests for large loan portfolios
- Validation tests for regulatory requirements

## Performance Considerations
- Cache amortization schedules for large loans
- Optimize calculations for real-time updates
- Batch processing for multiple loan calculations
- Efficient memory usage for long-term loans (30+ years)

## Error Handling
- Validate input parameters (positive amounts, valid rates)
- Handle floating-point precision issues
- Graceful degradation for unsupported regions
- Clear error messages for invalid loan configurations