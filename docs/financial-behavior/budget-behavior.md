# Budget Management Behavior

## Purpose
This document defines the behavior and business logic for the budget management system in Foresight, including income distribution, bucket management, and renewal rate calculations.

## Income Distribution System

### Six-Category Budget Allocation
The user can set their income distribution ratio across six categories:

1. **Essentials (usually 50%)** - Housing, groceries, transportation, insurance, debt repayment, medical
2. **Lifestyle (usually 20%)** - Dining out, subscriptions, travel, personal fun money
3. **Savings & Future (usually 20%)** - Emergency fund, retirement/investments, general savings
4. **Sinking Fund (usually 10%)** - Electronics, clothing, home & furniture, gifts, annual expenses
5. **Unallocated income increases** - Default behavior treats them as savings (can be moved later)
6. **Misc** - Hard-to-track cash expenses to avoid discrepancies

### Budget Calculation Behavior

> **Important**: Budget calculation is done **after** income tax deduction. Tax estimates are done **after** budget distribution due to investment and donation tax cuts.

### Income Increase Handling
When there is an increase in income mid-month:
- Excess amounts are added to **unallocated funds** by default
- In statistics, unallocated funds are treated as **savings**
- Original bucket amounts remain constant (doesn't increase with income)
- This behavior encourages savings rather than lifestyle inflation

## Bucket System

### Bucket Categories and Examples

#### Essentials (50%)
- Housing (rent/home loan, utilities, maintenance)
- Groceries & household supplies
- Transportation (car payment, fuel, maintenance, public transit)
- Insurance (health, life, car, home/renters)
- Debt repayment
- Medical & healthcare (doctor visits, meds, emergencies)

#### Lifestyle (20%)
- Dining out, coffee, entertainment
- Subscriptions (Netflix, Spotify, gym, apps)
- Travel & vacations
- Personal fun money (small splurges, hobbies)

#### Savings & Future (20%)
- Emergency fund
- Retirement / investments (PF, mutual funds, 401k, etc.)
- General savings (flexible pool for medium-term goals)

#### Sinking Fund (10%)
- Electronics & gadgets (phones, laptops, repairs)
- Clothing & accessories
- Home & furniture
- Gifts & celebrations (birthdays, weddings, festivals)
- Annual expenses (insurance renewals, memberships, taxes)

### Renewal Rate Configuration

All buckets support configurable renewal rates:

1. **Daily** - Renews every day
2. **Every 2 days** - Renews every 48 hours
3. **Weekly** - Renews every 7 days
4. **Bi-weekly** - Renews every 14 days
5. **Monthly** - Renews every month
6. **Bi-monthly** - Renews every 2 months
7. **Yearly** - Renews annually
8. **Bi-yearly** - Renews every 2 years
9. **Quarter yearly** - Renews every 3 months

### Implementation Flow

When a user creates a bucket, the system must:

1. **Category Assignment**: Link the bucket to one of the six main categories
2. **Amount Allocation**: Set the bucket amount within the category's allocated budget
3. **Renewal Configuration**: Set the renewal rate and calculate next renewal date
4. **Balance Tracking**: Track current balance and spending against the bucket
5. **Renewal Processing**: Automatically refill the bucket based on the renewal schedule

## Usage Examples

### Example Budget Distribution (₹100,000 monthly income after tax)
- Essentials: ₹50,000 (50%)
- Lifestyle: ₹20,000 (20%)
- Savings & Future: ₹20,000 (20%)
- Sinking Fund: ₹10,000 (10%)
- Unallocated: ₹0 (initially)
- Misc: As needed for cash expenses

### Example Bucket Setup
**Housing Bucket (Essentials)**
- Amount: ₹25,000
- Renewal: Monthly
- Next Renewal: 1st of each month

**Dining Out Bucket (Lifestyle)**
- Amount: ₹5,000
- Renewal: Weekly
- Next Renewal: Every Sunday

## Performance Considerations

- Bucket calculations should complete within 2 seconds for typical datasets
- Renewal processing should be automated and run efficiently
- Budget recalculations should update in real-time when income changes

## Testing Requirements

- Unit tests for budget allocation calculations
- Integration tests for bucket renewal logic
- End-to-end tests for income increase scenarios
- Validation tests for category constraints