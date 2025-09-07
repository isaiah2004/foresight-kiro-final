# Investment Management Interface

## Overview

The Investment Management Interface provides a comprehensive dashboard for managing investment portfolios with intelligent caching, multi-currency support, and detailed performance analytics.

## Components

### InvestmentOverview

**Purpose**: Main overview component for the investments page that provides a comprehensive portfolio summary with category navigation.

**Props**:
- `investments: Investment[]` - Array of user's investments
- `primaryCurrency: string` - User's primary currency for display
- `isLoading?: boolean` - Loading state indicator
- `onAddInvestment: (data: any) => Promise<void>` - Handler for adding new investments
- `onUpdatePrices: () => Promise<void>` - Handler for updating investment prices
- `lastPriceUpdate?: Date` - Timestamp of last price update

**Features**:
- Portfolio summary cards (total value, return, today's change, diversification)
- Investment categories grid with navigation to specific asset types
- Asset allocation visualization with progress bars
- Top performers list with performance badges
- Recent activity timeline
- Price update functionality with cache integration
- Diversification score and recommendations

**Usage**:
```tsx
import { InvestmentOverview } from '@/components/shared/investments/investment-overview'

<InvestmentOverview
  investments={investments}
  primaryCurrency="USD"
  onAddInvestment={handleAddInvestment}
  onUpdatePrices={handleUpdatePrices}
  lastPriceUpdate={lastUpdate}
/>
```

### StocksDashboard

**Purpose**: Specialized dashboard component for stock investments with sector analysis and performance tracking.

**Props**:
- `investments: Investment[]` - Array of stock investments (filtered)
- `primaryCurrency: string` - User's primary currency for display
- `isLoading?: boolean` - Loading state indicator
- `onAddInvestment: (data: any) => Promise<void>` - Handler for adding new stock investments
- `onUpdatePrices: () => Promise<void>` - Handler for updating stock prices
- `lastPriceUpdate?: Date` - Timestamp of last price update

**Features**:
- Stock-specific portfolio summary (value, return, average performance)
- Sector allocation analysis with progress visualization
- Performance leaders with winners/losers tabs
- Detailed stock holdings with comprehensive metrics
- Stock-focused price update functionality
- Specialized stock addition form

**Usage**:
```tsx
import { StocksDashboard } from '@/components/shared/investments/stocks-dashboard'

<StocksDashboard
  investments={stockInvestments}
  primaryCurrency="USD"
  onAddInvestment={handleAddStock}
  onUpdatePrices={handleUpdatePrices}
  lastPriceUpdate={lastUpdate}
/>
```

### InvestmentPortfolioDashboard

**Purpose**: General portfolio dashboard component that can display any filtered set of investments with detailed analytics.

**Props**:
- `investments: Investment[]` - Array of user's investments
- `primaryCurrency: string` - User's primary currency for display
- `isLoading?: boolean` - Loading state indicator
- `onAddInvestment: (data: any) => Promise<void>` - Handler for adding new investments
- `onUpdatePrices: () => Promise<void>` - Handler for updating investment prices
- `lastPriceUpdate?: Date` - Timestamp of last price update

**Features**:
- Portfolio summary cards (total value, return, today's change, diversification)
- Asset allocation visualization with progress bars
- Top performers list with performance badges
- Detailed holdings with tabbed view by investment type
- Price update functionality with cache integration
- Diversification score and recommendations

**Usage**:
```tsx
import { InvestmentPortfolioDashboard } from '@/components/shared/investments/investment-portfolio-dashboard'

<InvestmentPortfolioDashboard
  investments={investments}
  primaryCurrency="USD"
  onAddInvestment={handleAddInvestment}
  onUpdatePrices={handleUpdatePrices}
  lastPriceUpdate={lastUpdate}
/>
```

### InvestmentForm

**Purpose**: Modal form component for adding new investments with validation and currency support.

**Props**:
- `onSubmit: (data: InvestmentFormData) => Promise<void>` - Form submission handler
- `onCancel?: () => void` - Optional cancel handler
- `initialData?: Partial<Investment>` - Pre-populate form data
- `isLoading?: boolean` - Loading state for form submission

**Features**:
- Investment type selection with descriptions and examples
- Symbol/ticker input with uppercase formatting
- Quantity and purchase price inputs with decimal support
- Currency selector integration
- Date picker for purchase date
- Real-time investment summary calculation
- Form validation with error messages
- Responsive modal design

**Usage**:
```tsx
import { InvestmentForm } from '@/components/shared/investments/investment-form'

<InvestmentForm
  onSubmit={handleAddInvestment}
  isLoading={isSubmitting}
/>
```

## Hooks

### useInvestments

**Purpose**: Custom hook for managing investment data with intelligent caching and local storage persistence.

**Returns**:
- `investments: Investment[]` - Current user's investments
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message if any
- `addInvestment: (data) => Promise<void>` - Add new investment
- `updateInvestment: (id, updates) => Promise<void>` - Update existing investment
- `deleteInvestment: (id) => Promise<void>` - Delete investment
- `updatePrices: () => Promise<void>` - Update prices using cache service
- `lastPriceUpdate: Date | null` - Last price update timestamp
- `cacheStats: object | null` - Cache performance statistics

**Features**:
- Automatic mock data generation for new users
- Local storage persistence for development
- Integration with Firebase cache service
- Real-time cache statistics
- Error handling and loading states

**Usage**:
```tsx
import { useInvestments } from '@/hooks/use-investments'

const {
  investments,
  isLoading,
  addInvestment,
  updatePrices
} = useInvestments()
```

## Utilities

### Investment Calculations (`src/lib/financial/investments.ts`)

**Functions**:

#### `calculatePortfolioSummary(investments, primaryCurrency)`
- Calculates total portfolio value, return, and performance metrics
- Handles currency conversion to primary currency
- Returns comprehensive portfolio summary object

#### `calculateAssetAllocation(investments, primaryCurrency)`
- Analyzes investment distribution across asset types
- Calculates percentages and values for each asset class
- Returns sorted allocation array by value

#### `calculateInvestmentPerformance(investments)`
- Computes individual investment performance metrics
- Calculates current value, return amount, and percentage
- Returns performance data for each investment

#### `getTopPerformers(investments, limit)`
- Identifies best performing investments by percentage return
- Filters positive returns and sorts by performance
- Returns top N performers

#### `calculateDiversificationScore(investments)`
- Analyzes portfolio diversification across asset types
- Provides score (0-100) and level (poor/fair/good/excellent)
- Returns recommendations for improving diversification

#### `formatInvestmentValue(amount, currency, showCurrency)`
- Formats monetary values for display
- Supports currency symbols and locale formatting
- Handles decimal precision consistently

#### `formatPercentageChange(percentage)`
- Formats percentage changes with appropriate colors
- Returns formatted string, color class, and sign
- Handles positive, negative, and zero values

#### `validateInvestmentData(data)`
- Validates investment form data
- Checks required fields and data types
- Returns validation result with error messages

#### `getInvestmentCategories()`
- Returns available investment categories with descriptions
- Provides examples for each category type
- Used for form dropdowns and UI displays

## Data Flow

1. **Loading**: `useInvestments` hook loads data from localStorage (mock) or Firebase
2. **Display**: `InvestmentPortfolioDashboard` renders portfolio overview and holdings
3. **Adding**: `InvestmentForm` collects new investment data and submits via hook
4. **Updating**: Price updates trigger cache service and refresh investment values
5. **Persistence**: All changes are saved to localStorage and eventually Firebase

## Performance Features

- **Intelligent Caching**: Uses Firebase cache service for price data
- **Lazy Loading**: Components use Suspense and skeleton loaders
- **Optimized Calculations**: Memoized calculations prevent unnecessary re-renders
- **Efficient Updates**: Only updates changed investments during price refresh

## Multi-Currency Support

- All investments store original purchase currency
- Display values converted to user's primary currency
- Exchange rates handled by currency service
- Consistent formatting across all monetary displays

## Error Handling

- Form validation with user-friendly error messages
- Network error handling for price updates
- Graceful fallbacks for missing data
- Loading states during async operations

## Accessibility

- Keyboard navigation support
- Screen reader compatible labels
- High contrast color schemes for performance indicators
- Responsive design for mobile devices

## Testing

The investment management interface includes:
- Unit tests for calculation utilities
- Integration tests for hooks and components
- Mock data for development and testing
- Error scenario testing

## Future Enhancements

- Real-time price updates via WebSocket
- Advanced charting and analytics
- Portfolio rebalancing recommendations
- Tax optimization suggestions
- Integration with external brokers