'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Target,
  ArrowRight,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InvestmentForm } from './investment-form';
import { ApiStatusCard } from './api-status-card';
import {
  calculatePortfolioSummary,
  calculateAssetAllocation,
  getTopPerformers,
  calculateDiversificationScore,
  formatInvestmentValue,
  formatPercentageChange,
  getInvestmentCategories,
} from '@/lib/financial/investments';
import { Investment } from '@/types/financial';

interface InvestmentOverviewProps {
  investments: Investment[];
  primaryCurrency: string;
  isLoading?: boolean;
  onAddInvestment: (data: any) => Promise<void>;
  onUpdatePrices: () => Promise<void>;
  lastPriceUpdate?: Date;
}

export function InvestmentOverview({
  investments,
  primaryCurrency,
  isLoading = false,
  onAddInvestment,
  onUpdatePrices,
  lastPriceUpdate,
}: InvestmentOverviewProps) {
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const router = useRouter();

  // Calculate portfolio metrics
  const portfolioSummary = useMemo(
    () => calculatePortfolioSummary(investments, primaryCurrency),
    [investments, primaryCurrency]
  );

  const assetAllocation = useMemo(
    () => calculateAssetAllocation(investments, primaryCurrency),
    [investments, primaryCurrency]
  );

  const topPerformers = useMemo(
    () => getTopPerformers(investments, 4),
    [investments]
  );

  const diversificationScore = useMemo(
    () => calculateDiversificationScore(investments),
    [investments]
  );

  const categories = getInvestmentCategories();


  const handleUpdatePrices = async () => {
    setIsUpdatingPrices(true);
    try {
      await onUpdatePrices();
    } finally {
      setIsUpdatingPrices(false);
    }
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

  const totalReturnColor =
    portfolioSummary.totalReturn >= 0 ? 'text-green-600' : 'text-red-600';
  const todayChangeColor =
    portfolioSummary.todayChange >= 0 ? 'text-green-600' : 'text-red-600';

  // Calculate category statistics
  const categoryStats = categories
    .map((category) => {
      const categoryInvestments = investments.filter(
        (inv) => inv.type === category.type
      );
      const totalValue = categoryInvestments.reduce(
        (sum, inv) =>
          sum + (inv.currentValue || inv.quantity * inv.lastSyncedPrice),
        0
      );

      return {
        ...category,
        count: categoryInvestments.length,
        value: totalValue,
        href: `/dashboard/investments/${category.type === 'mutual-fund' ? 'mutual-funds' : category.type === 'stock' ? 'stocks' : category.type === 'bond' ? 'bonds' : category.type}`,
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <motion.div
      className="flex flex-1 flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Portfolio Overview Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatInvestmentValue(
                portfolioSummary.totalValue,
                primaryCurrency
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatInvestmentValue(
                portfolioSummary.totalReturn,
                primaryCurrency,
                false
              )}{' '}
              total gain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            {portfolioSummary.totalReturn >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReturnColor}`}>
              {
                formatPercentageChange(portfolioSummary.totalReturnPercentage)
                  .formatted
              }
            </div>
            <p className="text-xs text-muted-foreground">Since inception</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Change
            </CardTitle>
            {portfolioSummary.todayChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayChangeColor}`}>
              {formatInvestmentValue(
                portfolioSummary.todayChange,
                primaryCurrency,
                false
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                formatPercentageChange(portfolioSummary.todayChangePercentage)
                  .formatted
              }{' '}
              today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Diversification
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {diversificationScore.score}/100
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {diversificationScore.level} diversification
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Price Update and Add Investment */}
      <motion.div className="grid gap-4 md:grid-cols-2" variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Portfolio Management</CardTitle>
                <CardDescription>
                  {lastPriceUpdate
                    ? `Last updated: ${lastPriceUpdate.toLocaleString()}`
                    : 'Prices have not been updated yet'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdatePrices}
                  disabled={isUpdatingPrices}
                  variant="outline"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isUpdatingPrices ? 'animate-spin' : ''}`}
                  />
                  {isUpdatingPrices ? 'Updating...' : 'Update Prices'}
                </Button>
                <InvestmentForm
                  onSubmit={onAddInvestment}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <ApiStatusCard
          symbols={{
            stocks: investments.filter(inv => inv.type === 'stock').map(inv => inv.symbol),
            crypto: investments.filter(inv => inv.type === 'crypto').map(inv => inv.symbol)
          }}
          onPricesUpdated={onUpdatePrices}
        />
      </motion.div>

      {/* Diversification Recommendations */}
      {diversificationScore.recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Diversification Tips:</strong>{' '}
              {diversificationScore.recommendations.join('. ')}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Investment Categories Grid */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Investment Categories</CardTitle>
            <CardDescription>
              Overview of your investment portfolio by asset class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryStats.map((category, index) => (
                <motion.div
                  key={category.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => router.push(category.href)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {category.label}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {category.count} holdings
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        {formatInvestmentValue(category.value, primaryCurrency)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {(
                          (category.value / portfolioSummary.totalValue) *
                          100
                        ).toFixed(1)}
                        %
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Asset Allocation and Top Performers */}
      <motion.div className="grid gap-4 md:grid-cols-2" variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>
              Portfolio distribution by asset type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assetAllocation.length > 0 ? (
              assetAllocation.map((asset, index) => (
                <motion.div
                  key={asset.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 capitalize">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      {asset.type.replace('-', ' ')} ({asset.count})
                    </span>
                    <span className="font-medium">
                      {formatInvestmentValue(
                        asset.value,
                        primaryCurrency,
                        false
                      )}{' '}
                      ({asset.percentage}%)
                    </span>
                  </div>
                  <Progress value={asset.percentage} className="h-2" />
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No investments yet. Add your first investment to see allocation.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Your best performing investments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.length > 0 ? (
                topPerformers.map((performer, index) => (
                  <motion.div
                    key={performer.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{performer.symbol}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {performer.type.replace('-', ' ')} •{' '}
                        {formatInvestmentValue(
                          performer.currentValue,
                          primaryCurrency
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      +{performer.returnPercentage.toFixed(1)}%
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No profitable investments yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest investment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {investments.slice(0, 4).map((investment, index) => (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="default">Added</Badge>
                    <div>
                      <div className="font-medium">{investment.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(investment.purchaseDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {investment.quantity} shares
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatInvestmentValue(
                        investment.purchasePrice,
                        investment.purchaseCurrency
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {investments.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No investment activity yet. Add your first investment to get
                  started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
