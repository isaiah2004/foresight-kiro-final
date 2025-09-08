'use client';

import { DashboardLayout } from '@/components/shared/layouts/dashboard-layout';
import { TabNavigation } from '@/components/shared/navigation/tab-navigation';
import { tabNavigationConfig } from '@/lib/navigation-config';
import { useInvestments } from '@/hooks/use-investments';
import { useCurrency } from '@/hooks/use-currency';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from 'lucide-react';
import { useMemo } from 'react';

export default function MutualFundsPage() {
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Investments', href: '/dashboard/investments' },
    { title: 'Mutual Funds' },
  ];

  const {
    investments,
    isLoading,
    error,
    addInvestment,
    updatePrices,
    lastPriceUpdate,
  } = useInvestments();

  const { primaryCurrency } = useCurrency();

  // Filter only mutual fund investments
  const mutualFundInvestments = useMemo(
    () => investments.filter((inv) => inv.type === 'mutual-fund'),
    [investments]
  );

  const handleAddInvestment = async (data: any) => {
    await addInvestment({
      symbol: data.symbol,
      type: data.type || 'mutual-fund',
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseCurrency: data.purchaseCurrency,
      purchaseDate: data.purchaseDate,
      metadata: {
        fundName: data.fundName,
        fundFamily: data.fundFamily,
        category: data.category,
        expenseRatio: data.expenseRatio,
        morningstarRating: data.morningstarRating,
        notes: data.notes,
      },
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Calculate totals from actual mutual fund investments
  const totalValue = mutualFundInvestments.reduce((sum, fund) => {
    const currentPrice = fund.lastSyncedPrice || fund.purchasePrice;
    return sum + fund.quantity * currentPrice;
  }, 0);

  const totalInvested = mutualFundInvestments.reduce((sum, fund) => {
    return sum + fund.quantity * fund.purchasePrice;
  }, 0);

  const totalReturn =
    totalInvested > 0
      ? ((totalValue - totalInvested) / totalInvested) * 100
      : 0;

  const weightedExpenseRatio =
    mutualFundInvestments.length > 0
      ? mutualFundInvestments.reduce((sum, fund) => {
          const fundValue =
            fund.quantity * (fund.lastSyncedPrice || fund.purchasePrice);
          const ratio = fund.metadata?.expenseRatio || 0;
          return sum + ratio * (fundValue / totalValue);
        }, 0)
      : 0;

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Mutual Funds">
      <TabNavigation tabs={tabNavigationConfig.investments} />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <motion.div
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Portfolio Summary */}
        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalValue > totalInvested ? '+' : ''}$
                {(totalValue - totalInvested).toLocaleString()} from invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Return
              </CardTitle>
              {totalReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {totalReturn >= 0 ? '+' : ''}
                {totalReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Since inception</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Expense Ratio
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weightedExpenseRatio.toFixed(3)}%
              </div>
              <p className="text-xs text-muted-foreground">Weighted average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funds Count</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mutualFundInvestments.length}
              </div>
              <p className="text-xs text-muted-foreground">Active holdings</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fund Holdings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mutual Fund Holdings</CardTitle>
                  <CardDescription>
                    {mutualFundInvestments.length > 0
                      ? `Your current fund portfolio (${mutualFundInvestments.length} holdings)`
                      : 'No mutual fund investments found'}
                  </CardDescription>
                </div>
                <Button onClick={() => handleAddInvestment({})}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fund
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    Loading mutual fund investments...
                  </div>
                </div>
              ) : mutualFundInvestments.length === 0 ? (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Mutual Fund Investments
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your mutual fund portfolio by adding your
                    first investment.
                  </p>
                  <Button onClick={() => handleAddInvestment({})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Fund
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mutualFundInvestments.map((fund, index) => {
                    const currentValue =
                      fund.quantity *
                      (fund.lastSyncedPrice || fund.purchasePrice);
                    const investedValue = fund.quantity * fund.purchasePrice;
                    const returnValue = currentValue - investedValue;
                    const returnPercentage =
                      investedValue > 0
                        ? (returnValue / investedValue) * 100
                        : 0;

                    return (
                      <motion.div
                        key={fund.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <h3 className="font-semibold">
                                {fund.metadata?.fundName || fund.symbol}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {fund.symbol}
                              </p>
                            </div>
                            {fund.metadata?.category && (
                              <Badge variant="outline">
                                {fund.metadata.category}
                              </Badge>
                            )}
                            {fund.metadata?.morningstarRating && (
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${i < (fund.metadata?.morningstarRating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">
                                Current Value
                              </p>
                              <p className="font-medium">
                                ${currentValue.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Shares</p>
                              <p className="font-medium">
                                {fund.quantity.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Expense Ratio
                              </p>
                              <p className="font-medium">
                                {fund.metadata?.expenseRatio?.toFixed(2) ||
                                  'N/A'}
                                %
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Allocation
                              </p>
                              <p className="font-medium">
                                {totalValue > 0
                                  ? ((currentValue / totalValue) * 100).toFixed(
                                      1
                                    )
                                  : '0'}
                                %
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Return</p>
                              <div
                                className={`flex items-center font-medium ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {returnPercentage >= 0 ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {returnPercentage >= 0 ? '+' : ''}
                                {returnPercentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-semibold ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            ${returnValue >= 0 ? '+' : ''}
                            {returnValue.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">P&L</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Update Prices Button */}
        {mutualFundInvestments.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Price Updates</CardTitle>
                <CardDescription>
                  Keep your mutual fund valuations current
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={updatePrices} disabled={isLoading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Fund Prices
                </Button>
                {lastPriceUpdate && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Last updated: {new Date(lastPriceUpdate).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
