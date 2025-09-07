"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RefreshCw,
  Plus,
  Activity,
  BarChart3,
  Target
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InvestmentForm } from './investment-form'
import { 
  calculatePortfolioSummary,
  calculateInvestmentPerformance,
  getTopPerformers,
  getWorstPerformers,
  formatInvestmentValue,
  formatPercentageChange
} from '@/lib/financial/investments'
import { Investment } from '@/types/financial'

interface StocksDashboardProps {
  investments: Investment[]
  primaryCurrency: string
  isLoading?: boolean
  onAddInvestment: (data: any) => Promise<void>
  onUpdatePrices: () => Promise<void>
  lastPriceUpdate?: Date
}

export function StocksDashboard({
  investments,
  primaryCurrency,
  isLoading = false,
  onAddInvestment,
  onUpdatePrices,
  lastPriceUpdate
}: StocksDashboardProps) {
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false)

  // Calculate stock-specific metrics
  const portfolioSummary = useMemo(() => 
    calculatePortfolioSummary(investments, primaryCurrency), 
    [investments, primaryCurrency]
  )

  const stockPerformances = useMemo(() => 
    calculateInvestmentPerformance(investments), 
    [investments]
  )

  const topPerformers = useMemo(() => 
    getTopPerformers(investments, 5), 
    [investments]
  )

  const worstPerformers = useMemo(() => 
    getWorstPerformers(investments, 3), 
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

  const handleAddStock = async (data: any) => {
    await onAddInvestment({
      ...data,
      type: 'stock' // Force stock type
    })
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

  // Calculate sector allocation (mock data for now)
  const sectorAllocation = [
    { name: 'Technology', percentage: 45, value: portfolioSummary.totalValue * 0.45 },
    { name: 'Healthcare', percentage: 20, value: portfolioSummary.totalValue * 0.20 },
    { name: 'Financial', percentage: 15, value: portfolioSummary.totalValue * 0.15 },
    { name: 'Consumer', percentage: 12, value: portfolioSummary.totalValue * 0.12 },
    { name: 'Energy', percentage: 8, value: portfolioSummary.totalValue * 0.08 }
  ]

  return (
    <motion.div 
      className="flex flex-1 flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stock Portfolio Overview Cards */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatInvestmentValue(portfolioSummary.totalValue, primaryCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {investments.length} stock{investments.length !== 1 ? 's' : ''} held
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
              {formatInvestmentValue(portfolioSummary.totalReturn, primaryCurrency, false)} gain/loss
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
            <CardTitle className="text-sm font-medium">Average Return</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {investments.length > 0 
                ? (stockPerformances.reduce((sum, stock) => sum + stock.returnPercentage, 0) / stockPerformances.length).toFixed(1)
                : '0.0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all holdings
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stock Management Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Stock Portfolio Management</CardTitle>
                <CardDescription>
                  {lastPriceUpdate 
                    ? `Stock prices last updated: ${lastPriceUpdate.toLocaleString()}`
                    : 'Stock prices have not been updated yet'
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
                  {isUpdatingPrices ? 'Updating...' : 'Update Stock Prices'}
                </Button>
                <InvestmentForm onSubmit={handleAddStock} isLoading={isLoading} />
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Performance Analysis */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2"
        variants={itemVariants}
      >
        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
            <CardDescription>Stock distribution by sector</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectorAllocation.map((sector, index) => (
              <motion.div 
                key={sector.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {sector.name}
                  </span>
                  <span className="font-medium">
                    {formatInvestmentValue(sector.value, primaryCurrency, false)} ({sector.percentage}%)
                  </span>
                </div>
                <Progress value={sector.percentage} className="h-2" />
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Leaders</CardTitle>
            <CardDescription>Best and worst performing stocks</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="winners" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="winners">Top Performers</TabsTrigger>
                <TabsTrigger value="losers">Underperformers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="winners" className="space-y-3 mt-4">
                {topPerformers.length > 0 ? (
                  topPerformers.map((stock, index) => (
                    <motion.div
                      key={stock.symbol}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatInvestmentValue(stock.currentValue, primaryCurrency)}
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        +{stock.returnPercentage.toFixed(1)}%
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No profitable stocks yet.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="losers" className="space-y-3 mt-4">
                {worstPerformers.length > 0 ? (
                  worstPerformers.map((stock, index) => (
                    <motion.div
                      key={stock.symbol}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatInvestmentValue(stock.currentValue, primaryCurrency)}
                        </div>
                      </div>
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        {stock.returnPercentage.toFixed(1)}%
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No underperforming stocks.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Stock Holdings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Stock Holdings</CardTitle>
            <CardDescription>Detailed view of all your stock investments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockPerformances.map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold">{stock.symbol}</h3>
                        <p className="text-sm text-muted-foreground">Stock</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Shares</p>
                        <p className="font-medium">{stock.quantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Price</p>
                        <p className="font-medium">{formatInvestmentValue(stock.currentPrice, primaryCurrency)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Market Value</p>
                        <p className="font-medium">{formatInvestmentValue(stock.currentValue, primaryCurrency)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cost Basis</p>
                        <p className="font-medium">{formatInvestmentValue(stock.invested, primaryCurrency)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      stock.return >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentageChange(stock.returnPercentage).formatted}
                    </div>
                    <p className={`text-sm ${
                      stock.return >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatInvestmentValue(stock.return, primaryCurrency, false)}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {stockPerformances.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No stock investments yet. Add your first stock to get started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}