'use client';

import { Suspense } from 'react';
import { DashboardLayout } from '@/components/shared/layouts/dashboard-layout';
import { TabNavigation } from '@/components/shared/navigation/tab-navigation';
import { BudgetAllocationInterface } from '@/components/shared/budgets/budget-allocation-interface';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { tabNavigationConfig } from '@/lib/navigation-config';
import { useIncome } from '@/hooks/use-income';
import { useCurrency } from '@/hooks/use-currency';
import { AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';

function BudgetAllocationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function IncomeOverview({
  totalMonthlyIncome,
  totalAnnualIncome,
  activeSourcesCount,
  isLoading,
  formatAmount,
}: {
  totalMonthlyIncome: number;
  totalAnnualIncome: number;
  activeSourcesCount: number;
  isLoading: boolean;
  formatAmount: (amount: number) => string;
}) {
  if (isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-3">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <div>
          <span className="text-sm text-muted-foreground">
            {activeSourcesCount} income source
            {activeSourcesCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="text-sm text-muted-foreground">Monthly: </span>
          <span className="font-semibold text-green-600">
            {formatAmount(totalMonthlyIncome)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm text-muted-foreground">Annual: </span>
          <span className="font-semibold text-blue-600">
            {formatAmount(totalAnnualIncome)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function IncomeSplittingPage() {
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Budgets', href: '/dashboard/budgets' },
    { title: 'Income Splitting' },
  ];

  const {
    totalMonthlyIncome,
    totalAnnualIncome,
    convertedIncomeSources,
    isLoading,
    error,
    incomeState,
  } = useIncome();
  const { formatAmount } = useCurrency();

  const activeSourcesCount = convertedIncomeSources.filter(
    (source) => source.isActive
  ).length;

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Income Splitting">
      <TabNavigation tabs={tabNavigationConfig.budgets} />
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-lg font-semibold mb-2">
            4-Category Budget System
          </h2>
          <p className="text-muted-foreground">
            Allocate your income across four categories: Essentials, Lifestyle,
            Savings & Future, and Sinking Fund. This simplified system helps you
            maintain a balanced approach to spending and saving.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* No Income Data State */}
        {!isLoading && incomeState.isEmpty && !error && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              No income sources found. Please add your income sources first to
              create a budget allocation. Go to the Income tab to get started.
            </AlertDescription>
          </Alert>
        )}

        {/* Income Overview */}
        {(!incomeState.isEmpty || isLoading) && (
          <IncomeOverview
            totalMonthlyIncome={totalMonthlyIncome}
            totalAnnualIncome={totalAnnualIncome}
            activeSourcesCount={activeSourcesCount}
            isLoading={isLoading}
            formatAmount={formatAmount}
          />
        )}

        {/* Budget Allocation Interface */}
        <Suspense fallback={<BudgetAllocationSkeleton />}>
          <BudgetAllocationInterface initialIncome={totalMonthlyIncome} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
