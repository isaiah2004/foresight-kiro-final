"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  RefreshCw,
  AlertCircle,
  Target,
  Activity
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InvestmentForm } from './investment-form'
import { 
  calculatePortfolioSummary,
  calculateAssetAllocation,
  calculateInvestmentPerformance,
  getTopPerformers,
  calculateDiversificationScore,
  formatInvestmentValue,
  formatPercentageChange
} from '@/lib/financial/investments'
import { Investment } from '@/types/financial'

interface InvestmentPortfolioDashboardProps {
  investments: Investment[]
  primaryCurrency: string
  isLoading?: boolean
  onAddInvestment: (data: any) => Promise<void>
  onUpdatePrices: () => Promise<void>
  lastPriceUpdate?: Date
}

export function InvestmentPortfolioDashboard({
  investments,
  primaryCurrency,
  isLoading = false,
  onAddInvestment,
  onUpdatePrices,
  lastPriceUpdate
}: InvestmentPortfolioDashboardProps) {
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false)

  // Calculate portfolio metrics
  const portfolioSummary = useMemo(() => 
    calculatePortfolioSummary(investments, primaryCurrency), 
    [investments, primaryCurrency]
  )

  const assetAllocation = useMemo(() => 
    calculateAssetAllocation(investments, primaryCurrency), 
    [investments, primaryCurrency]
  )

  const investmentPerformances = useMemo(() => 
    calculateInvestmentPerformance(investments), 
    [investments]
  )

  const topPerformers = useMemo(() => 
    getTopPerformers(investments, 4), 
    [investments]
  )

  const diversificationScore = useMemo(() => 
    calculateDiversificationScore(investments), 
    [investments]
  )

  const handleUpdatePrices = async () => {
    setIsUpdatingPrices(true)
    try {
      await onUpdatePrices()
    } finally {
      setIsUpdatingPrices(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const totalReturnColor = portfolioSummary.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
  const todayChangeColor = portfolioSummary.todayChange >= 0 ? 'text-green-600' : 'text-red-600'

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
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatInvestmentValue(portfolioSummary.totalValue, primaryCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatInvestmentValue(portfolioSummary.totalReturn, primaryCurrency, false)} total gain
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
              {formatPercentageChange(portfolioSummary.totalReturnPercentage).formatted}
            </div>
            <p className="text-xs text-muted-foreground">
              Since inception
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Change</CardTitle>
            {portfolioSummary.todayChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayChangeColor}`}>
              {formatInvestmentValue(portfolioSummary.todayChange, primaryCurrency, false)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentageChange(portfolioSummary.todayChangePercentage).formatted} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversification</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diversificationScore.score}/100</div>
            <p className="text-xs text-muted-foreground capitalize">
              {diversificationScore.level} diversification
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Price Update Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Price Updates</CardTitle>
                <CardDescription>
                  {lastPriceUpdate 
                    ? `Last updated: ${lastPriceUpdate.toLocaleString()}`
                    : 'Prices have not been updated yet'
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdatePrices}
                  disabled={isUpdatingPrices}
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
                  {isUpdatingPrices ? 'Updating...' : 'Update Prices'}
                </Button>
                <InvestmentForm onSubmit={onAddInvestment} isLoading={isLoading} />
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Diversification Recommendations */}
      {diversificationScore.recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Diversification Tips:</strong> {diversificationScore.recommendations.join('. ')}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Asset Allocation and Top Performers */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2"
        variants={itemVariants}
      >
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Distribution across asset classes</CardDescription>
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
                      {formatInvestmentValue(asset.value, primaryCurrency, false)} ({asset.percentage}%)
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
            <CardDescription>Best performing investments</CardDescription>
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
                        {performer.type.replace('-', ' ')} • {formatInvestmentValue(performer.currentValue, primaryCurrency)}
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
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

      {/* Detailed Holdings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Investment Holdings</CardTitle>
            <CardDescription>Detailed view of all your investments</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="stock">Stocks</TabsTrigger>
                <TabsTrigger value="bond">Bonds</TabsTrigger>
                <TabsTrigger value="mutual-fund">Funds</TabsTrigger>
                <TabsTrigger value="real-estate">Real Estate</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
              
              {['all', 'stock', 'bond', 'mutual-fund', 'real-estate', 'crypto', 'other'].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                  {investmentPerformances
                    .filter(investment => tabValue === 'all' || investment.type === tabValue)
                    .map((investment, index) => (
                      <motion.div
                        key={`${investment.symbol}-${investment.type}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <h3 className="font-semibold">{investment.symbol}</h3>
                              <p className="text-sm text-muted-foreground capitalize">
                                {investment.type.replace('-', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-medium">{investment.quantity.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Price</p>
                              <p className="font-medium">{formatInvestmentValue(investment.currentPrice, primaryCurrency)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Current Value</p>
                              <p className="font-medium">{formatInvestmentValue(investment.currentValue, primaryCurrency)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Invested</p>
                              <p className="font-medium">{formatInvestmentValue(investment.invested, primaryCurrency)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${
                            investment.return >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentageChange(investment.returnPercentage).formatted}
                          </div>
                          <p className={`text-sm ${
                            investment.return >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatInvestmentValue(investment.return, primaryCurrency, false)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  
                  {investmentPerformances.filter(investment => 
                    tabValue === 'all' || investment.type === tabValue
                  ).length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      {tabValue === 'all' 
                        ? 'No investments yet. Add your first investment to get started.'
                        : `No ${tabValue.replace('-', ' ')} investments yet.`
                      }
                    </p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}