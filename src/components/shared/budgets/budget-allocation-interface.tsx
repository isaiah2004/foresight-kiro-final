"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  calculateBudgetAllocation, 
  validateBudgetPercentages, 
  formatBudgetAmount,
  getCategoryColor,
  DEFAULT_BUDGET_PERCENTAGES 
} from '@/lib/financial/budgets';
import { BudgetCalculationInput, BudgetCalculationResult } from '@/types/budget';
import { useCurrency } from '@/hooks/use-currency';
import { Calculator, DollarSign, PieChart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetAllocationInterfaceProps {
  initialIncome?: number;
  initialTaxRate?: number;
  onAllocationChange?: (allocation: BudgetCalculationResult) => void;
}

export function BudgetAllocationInterface({ 
  initialIncome = 0, 
  initialTaxRate = 25,
  onAllocationChange 
}: BudgetAllocationInterfaceProps) {
  const { primaryCurrency } = useCurrency();
  const [grossIncome, setGrossIncome] = useState(initialIncome);
  const [taxRate, setTaxRate] = useState(initialTaxRate);
  const [percentages, setPercentages] = useState(DEFAULT_BUDGET_PERCENTAGES);
  const [allocation, setAllocation] = useState<BudgetCalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate allocation whenever inputs change
  useEffect(() => {
    if (grossIncome > 0) {
      const validation = validateBudgetPercentages(percentages);
      setErrors(validation.errors);

      if (validation.isValid) {
        const input: BudgetCalculationInput = {
          grossIncome,
          taxRate,
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
  }, [grossIncome, taxRate, percentages, primaryCurrency, onAllocationChange]);

  const handlePercentageChange = (category: keyof typeof percentages, value: number) => {
    setPercentages(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const resetToDefaults = () => {
    setPercentages(DEFAULT_BUDGET_PERCENTAGES);
  };

  const totalAllocated = percentages.essentials + percentages.lifestyle + percentages.savingsFuture + percentages.sinkingFund;
  const remainingPercentage = 100 - totalAllocated;

  return (
    <div className="space-y-6">
      {/* Income Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Income & Tax Information
          </CardTitle>
          <CardDescription>
            Enter your gross monthly income and tax rate to calculate your budget allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gross-income">Gross Monthly Income</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="gross-income"
                  type="number"
                  placeholder="5000"
                  value={grossIncome || ''}
                  onChange={(e) => setGrossIncome(Number(e.target.value))}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                placeholder="25"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                min="0"
                max="50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
          {/* Allocation Controls */}
          <div className="space-y-4">
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
                <Badge variant="outline">{percentages.essentials}%</Badge>
              </div>
              <Slider
                value={[percentages.essentials]}
                onValueChange={([value]) => handlePercentageChange('essentials', value)}
                max={80}
                min={20}
                step={5}
                className="w-full"
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
                <Badge variant="outline">{percentages.lifestyle}%</Badge>
              </div>
              <Slider
                value={[percentages.lifestyle]}
                onValueChange={([value]) => handlePercentageChange('lifestyle', value)}
                max={40}
                min={5}
                step={5}
                className="w-full"
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
                <Badge variant="outline">{percentages.savingsFuture}%</Badge>
              </div>
              <Slider
                value={[percentages.savingsFuture]}
                onValueChange={([value]) => handlePercentageChange('savingsFuture', value)}
                max={50}
                min={10}
                step={5}
                className="w-full"
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
                <Badge variant="outline">{percentages.sinkingFund}%</Badge>
              </div>
              <Slider
                value={[percentages.sinkingFund]}
                onValueChange={([value]) => handlePercentageChange('sinkingFund', value)}
                max={30}
                min={5}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Electronics, clothing, home & furniture, gifts, annual expenses
              </p>
            </div>
          </div>

          <Separator />

          {/* Allocation Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Total Allocated:</span>
              <span className={totalAllocated > 100 ? 'text-red-500' : 'text-green-600'}>
                {totalAllocated}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Remaining:</span>
              <span className={remainingPercentage < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                {remainingPercentage}%
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={resetToDefaults} variant="outline" size="sm">
              Reset to Defaults
            </Button>
          </div>
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
              Your monthly budget allocation based on {formatBudgetAmount(allocation.grossIncome, primaryCurrency)} gross income
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Income Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Gross Income</p>
                <p className="text-lg font-semibold">{formatBudgetAmount(allocation.grossIncome, primaryCurrency)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tax Amount</p>
                <p className="text-lg font-semibold text-red-600">-{formatBudgetAmount(allocation.taxAmount, primaryCurrency)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className="text-lg font-semibold text-green-600">{formatBudgetAmount(allocation.netIncome, primaryCurrency)}</p>
              </div>
            </div>

            <Separator />

            {/* Category Breakdown */}
            <div className="space-y-3">
              {Object.entries(allocation.categories).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <div>
                      <p className="font-medium capitalize">
                        {category === 'savingsFuture' ? 'Savings & Future' : 
                         category === 'sinkingFund' ? 'Sinking Fund' : category}
                      </p>
                      <p className="text-sm text-muted-foreground">{data.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatBudgetAmount(data.amount, primaryCurrency)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Unallocated Notice */}
            {allocation.categories.unallocated.amount > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You have {formatBudgetAmount(allocation.categories.unallocated.amount, primaryCurrency)} unallocated. 
                  This amount will be treated as savings to encourage good financial habits.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}