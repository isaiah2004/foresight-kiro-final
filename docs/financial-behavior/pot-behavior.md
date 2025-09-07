# Pot Management Behavior

## Purpose
This document defines the behavior and business logic for Pots in the Foresight Funds management system. Pots are designed for specific, short-term saving goals.

## What are Pots?

Pots are savings containers for **specific and crisp goals** such as:
- Major vacation
- House down payment
- Laptop budget
- Emergency car repair fund
- Wedding expenses
- Holiday gifts

## Core Characteristics

### Goal Specificity
- Each Pot must have a **clear, specific objective**
- Goals should be **measurable** (target amount)
- Goals should be **time-bound** (target date, optional)
- Avoid vague goals like "general savings" (use Saving Funds instead)

### Category Linking
Pots are linked to the six main budget categories:
1. **Essentials** - Emergency repairs, medical expenses
2. **Lifestyle** - Vacation, entertainment equipment
3. **Savings & Future** - House down payment, investment opportunities
4. **Sinking Fund** - Planned purchases, annual expenses
5. **Unallocated** - Flexible funding source
6. **Misc** - Small, hard-to-categorize goals

## Funding Mechanism

### Source Categories
Users can add money to Pots from:
- **Respective linked categories** - Primary funding source
- **Unallocated category** - Flexible funding for any Pot
- **Manual transfers** - Between categories (with validation)

### Funding Rules
```typescript
interface PotFunding {
  potId: string;
  sourceCategory: 'essentials' | 'lifestyle' | 'savingsFuture' | 'sinkingFund' | 'unallocated';
  amount: number;
  availableBalance: number; // In source category
  timestamp: Date;
}
```

### Validation Logic
- Cannot exceed available balance in source category
- Must maintain minimum balance in essential categories
- Warn user if funding affects other budget allocations

## Pot Data Structure

```typescript
interface Pot {
  id: string;
  userId: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  linkedCategories: Array<'essentials' | 'lifestyle' | 'savingsFuture' | 'sinkingFund' | 'unallocated'>;
  sourceAllocations: Array<{
    categoryId: string;
    amount: number;
    date: Date;
  }>;
  goalType: 'vacation' | 'house-downpayment' | 'laptop' | 'emergency' | 'other';
  targetDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## User Interface Behavior

### Pot Creation Flow
1. **Goal Definition**
   - Name the specific goal
   - Set target amount
   - Optional target date
   - Select goal type

2. **Category Linking**
   - Choose primary linked category
   - Option to link multiple categories
   - Display available balance in each category

3. **Initial Funding**
   - Optional initial contribution
   - Select funding source
   - Validate against available balance

### Funding Interface
- **Visual Balance Display** - Show available balance in each category
- **Funding Slider/Input** - Easy amount selection
- **Impact Preview** - Show effect on category balance
- **Confirmation** - Review funding allocation before confirming

### Progress Tracking
- **Progress Bar** - Visual representation of goal completion
- **Percentage Complete** - Numerical progress indicator
- **Remaining Amount** - How much more is needed
- **Timeline** - Days remaining to target date (if set)

## Business Logic

### Completion Handling
When a Pot reaches its target amount:
1. **Notification** - Alert user of goal completion
2. **Options Presentation**:
   - Mark as completed and archive
   - Increase target amount
   - Create new related Pot
   - Transfer excess to another Pot/category

### Overfunding
If contributions exceed target amount:
- **Warning** - Alert user before overfunding
- **Options**:
  - Increase target amount
  - Return excess to source category
  - Transfer excess to another Pot

### Underfunding Protection
- **Category Balance Checks** - Prevent overdrawing essential categories
- **Minimum Balance Warnings** - Alert when essential categories get too low
- **Funding Suggestions** - Recommend optimal funding sources

## Integration with Budget System

### Category Balance Updates
```typescript
const updateCategoryBalance = (
  categoryId: string,
  amount: number,
  operation: 'add' | 'subtract'
) => {
  // Update category balance
  // Validate minimum balance requirements
  // Update Pot balance
  // Log transaction
};
```

### Budget Recalculation
When Pots are funded:
- Update source category available balance
- Recalculate category utilization percentages
- Update budget overview displays
- Maintain audit trail of transfers

## Performance Considerations

- Pot calculations should complete within 1 second
- Real-time balance updates across all related displays
- Efficient querying for user's active Pots
- Optimized rendering for Pot progress visualizations

## Testing Requirements

- Unit tests for funding validation logic
- Integration tests for category balance updates
- End-to-end tests for Pot creation and funding flows
- Performance tests for users with many active Pots
- Validation tests for edge cases (overfunding, insufficient balance)