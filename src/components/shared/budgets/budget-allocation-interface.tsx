'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  calculateBudgetAllocation,
  validateBudgetPercentages,
  formatBudgetAmount,
  getCategoryColor,
  DEFAULT_BUDGET_PERCENTAGES,
} from '@/lib/financial/budgets';
import {
  BudgetCalculationInput,
  BudgetCalculationResult,
} from '@/types/budget';
import { useCurrency } from '@/hooks/use-currency';
import {
  Calculator,
  DollarSign,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
} from 'lucide-react';

interface BudgetAllocationInterfaceProps {
  initialIncome?: number;
  initialTaxRate?: number;
  onAllocationChange?: (allocation: BudgetCalculationResult) => void;
}

export function BudgetAllocationInterface({
  initialIncome = 0,
  initialTaxRate = 0,
  onAllocationChange,
}: BudgetAllocationInterfaceProps) {
  const { primaryCurrency } = useCurrency();
  const [netIncome, setNetIncome] = useState(initialIncome);
  const [percentages, setPercentages] = useState(DEFAULT_BUDGET_PERCENTAGES);
  const [tempPercentages, setTempPercentages] = useState(DEFAULT_BUDGET_PERCENTAGES);
  const [allocation, setAllocation] = useState<BudgetCalculationResult | null>(
    null
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // Update netIncome when initialIncome changes (from real data)
  useEffect(() => {
    if (initialIncome > 0) {
      setNetIncome(initialIncome);
    }
  }, [initialIncome]);

  // Initialize tempPercentages from percentages
  useEffect(() => {
    setTempPercentages(percentages);
  }, [percentages]);

  // Calculate allocation whenever inputs change
  useEffect(() => {
    if (netIncome > 0) {
      const validation = validateBudgetPercentages(percentages);
      setErrors(validation.errors);

      if (validation.isValid) {
        const input: BudgetCalculationInput = {
          grossIncome: netIncome, // Using net income as the base since tax is already applied
          taxRate: 0, // No additional tax calculation needed
          currency: primaryCurrency,
          customPercentages: percentages,
        };

        const result = calculateBudgetAllocation(input);
        setAllocation(result);
        onAllocationChange?.(result);
      } else {
        setAllocation(null);
      }
    }
  }, [netIncome, percentages, primaryCurrency, onAllocationChange]);

  const handlePercentageChange = (
    category: keyof typeof percentages,
    value: number
  ) => {
    setTempPercentages((prev) => ({
      ...prev,
      [category]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const saveChanges = useCallback(() => {
    setPercentages(tempPercentages);
    setHasUnsavedChanges(false);
  }, [tempPercentages]);

  const resetToDefaults = () => {
    setTempPercentages(DEFAULT_BUDGET_PERCENTAGES);
    setHasUnsavedChanges(true);
  };

  const discardChanges = () => {
    setTempPercentages(percentages);
    setHasUnsavedChanges(false);
  };

  const totalAllocated =
    tempPercentages.essentials +
    tempPercentages.lifestyle +
    tempPercentages.savingsFuture +
    tempPercentages.sinkingFund;
  const remainingPercentage = 100 - totalAllocated;

  return (
    <div className="space-y-6">

      {/* Budget Allocation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Budget Allocation
          </CardTitle>
          <CardDescription>
            Adjust the percentage allocation for each budget category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Budget Allocation */}
          <div className="space-y-6">
            {/* Visual Allocation Bar */}
            <div className="space-y-4">
              <h4 className="font-medium">Visual Budget Allocation</h4>
              <div className="h-16 flex rounded-lg overflow-hidden border">
                <div
                  className="flex items-center justify-center text-white text-xs font-medium transition-all"
                  style={{
                    backgroundColor: getCategoryColor('essentials'),
                    width: `${tempPercentages.essentials}%`,
                  }}
                >
                  <span className="opacity-90">
                    {tempPercentages.essentials > 10 ? `${tempPercentages.essentials}%` : ''}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center text-white text-xs font-medium transition-all"
                  style={{
                    backgroundColor: getCategoryColor('lifestyle'),
                    width: `${tempPercentages.lifestyle}%`,
                  }}
                >
                  <span className="opacity-90">
                    {tempPercentages.lifestyle > 8 ? `${tempPercentages.lifestyle}%` : ''}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center text-white text-xs font-medium transition-all"
                  style={{
                    backgroundColor: getCategoryColor('savingsFuture'),
                    width: `${tempPercentages.savingsFuture}%`,
                  }}
                >
                  <span className="opacity-90">
                    {tempPercentages.savingsFuture > 8 ? `${tempPercentages.savingsFuture}%` : ''}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center text-white text-xs font-medium transition-all"
                  style={{
                    backgroundColor: getCategoryColor('sinkingFund'),
                    width: `${tempPercentages.sinkingFund}%`,
                  }}
                >
                  <span className="opacity-90">
                    {tempPercentages.sinkingFund > 8 ? `${tempPercentages.sinkingFund}%` : ''}
                  </span>
                </div>
                {remainingPercentage > 0 && (
                  <div
                    className="flex items-center justify-center bg-muted text-muted-foreground text-xs font-medium"
                    style={{ width: `${remainingPercentage}%` }}
                  >
                    <span className="opacity-70">
                      {remainingPercentage > 5 ? `${remainingPercentage}%` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Essentials */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor('essentials') }}
                    />
                    Essentials
                  </Label>
                  <Badge variant="outline">{tempPercentages.essentials}%</Badge>
                </div>
                <Input
                  type="number"
                  min="20"
                  max="80"
                  step="5"
                  value={tempPercentages.essentials}
                  onChange={(e) => handlePercentageChange('essentials', Number(e.target.value))}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground">
                  Housing, groceries, transportation, insurance, debt repayment, medical
                </p>
              </div>

              {/* Lifestyle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor('lifestyle') }}
                    />
                    Lifestyle
                  </Label>
                  <Badge variant="outline">{tempPercentages.lifestyle}%</Badge>
                </div>
                <Input
                  type="number"
                  min="5"
                  max="40"
                  step="5"
                  value={tempPercentages.lifestyle}
                  onChange={(e) => handlePercentageChange('lifestyle', Number(e.target.value))}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground">
                  Dining out, subscriptions, travel, personal fun money
                </p>
              </div>

              {/* Savings & Future */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor('savingsFuture') }}
                    />
                    Savings & Future
                  </Label>
                  <Badge variant="outline">{tempPercentages.savingsFuture}%</Badge>
                </div>
                <Input
                  type="number"
                  min="10"
                  max="50"
                  step="5"
                  value={tempPercentages.savingsFuture}
                  onChange={(e) => handlePercentageChange('savingsFuture', Number(e.target.value))}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground">
                  Emergency fund, retirement/investments, general savings
                </p>
              </div>

              {/* Sinking Fund */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor('sinkingFund') }}
                    />
                    Sinking Fund
                  </Label>
                  <Badge variant="outline">{tempPercentages.sinkingFund}%</Badge>
                </div>
                <Input
                  type="number"
                  min="5"
                  max="30"
                  step="5"
                  value={tempPercentages.sinkingFund}
                  onChange={(e) => handlePercentageChange('sinkingFund', Number(e.target.value))}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground">
                  Electronics, clothing, home & furniture, gifts, annual expenses
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Allocation Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Total Allocated:</span>
              <span
                className={
                  totalAllocated > 100 ? 'text-red-500' : 'text-green-600'
                }
              >
                {totalAllocated}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Remaining:</span>
              <span
                className={
                  remainingPercentage < 0
                    ? 'text-red-500'
                    : 'text-muted-foreground'
                }
              >
                {remainingPercentage}%
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={saveChanges} 
              disabled={!hasUnsavedChanges || totalAllocated > 100}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Budget
            </Button>
            <Button 
              onClick={discardChanges} 
              variant="outline" 
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Discard Changes
            </Button>
            <Button onClick={resetToDefaults} variant="outline" size="sm">
              Reset to Defaults
            </Button>
          </div>
          
          {hasUnsavedChanges && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have unsaved changes. Click &quot;Save Budget&quot; to apply your changes or &quot;Discard Changes&quot; to revert.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Allocation Results */}
      {allocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Budget Breakdown
            </CardTitle>
            <CardDescription>
              Your monthly budget allocation based on{' '}
              {formatBudgetAmount(allocation.netIncome, primaryCurrency)}{' '}
              net income
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Income Summary */}
            <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Available for Allocation</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatBudgetAmount(allocation.netIncome, primaryCurrency)}
                </p>
                <p className="text-xs text-muted-foreground">Net income (tax already applied)</p>
              </div>
            </div>

            <Separator />

            {/* Category Breakdown */}
            <div className="space-y-3">
              {Object.entries(allocation.categories).map(([category, data]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <div>
                      <p className="font-medium capitalize">
                        {category === 'savingsFuture'
                          ? 'Savings & Future'
                          : category === 'sinkingFund'
                            ? 'Sinking Fund'
                            : category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatBudgetAmount(data.amount, primaryCurrency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Unallocated Notice */}
            {allocation.categories.unallocated.amount > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You have{' '}
                  {formatBudgetAmount(
                    allocation.categories.unallocated.amount,
                    primaryCurrency
                  )}{' '}
                  unallocated. This amount will be treated as savings to
                  encourage good financial habits.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
