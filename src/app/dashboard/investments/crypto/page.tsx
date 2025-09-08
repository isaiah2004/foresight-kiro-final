"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { CryptoInvestmentForm } from "@/components/shared/investments/crypto-investment-form"
import { useInvestments } from "@/hooks/use-investments"
import { useCurrency } from "@/hooks/use-currency"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bitcoin, TrendingUp, TrendingDown, DollarSign, Zap, Plus, Shield, AlertTriangle, AlertCircle } from "lucide-react"
import { useMemo } from "react"

export default function CryptoPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Crypto" }
  ]

  const { 
    investments, 
    isLoading, 
    error, 
    addInvestment, 
    updatePrices, 
    lastPriceUpdate 
  } = useInvestments()
  
  const { primaryCurrency } = useCurrency()

  // Filter only crypto investments
  const cryptoInvestments = useMemo(() => 
    investments.filter(inv => inv.type === 'crypto'), 
    [investments]
  )

  const handleAddInvestment = async (data: any) => {
    await addInvestment({
      symbol: data.symbol,
      type: data.type || 'crypto',
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseCurrency: data.purchaseCurrency,
      purchaseDate: data.purchaseDate,
      metadata: {
        cryptoName: data.cryptoName,
        exchange: data.exchange,
        walletType: data.walletType,
        walletAddress: data.walletAddress,
        stakingReward: data.stakingReward,
        notes: data.notes
      }
    })
  }

  // Calculate totals from actual crypto investments
  const totalValue = cryptoInvestments.reduce((sum, crypto) => {
    const currentPrice = crypto.lastSyncedPrice || crypto.purchasePrice
    return sum + (crypto.quantity * currentPrice)
  }, 0)
  
  const totalInvested = cryptoInvestments.reduce((sum, crypto) => {
    return sum + (crypto.quantity * crypto.purchasePrice)
  }, 0)
  
  const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0

  const cryptoData = {
    totalValue,
    totalInvested,
    totalReturn,
    todayChange: 0, // This would need to be calculated from price changes
    portfolioCount: cryptoInvestments.length
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

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Cryptocurrency Investments">
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
        {/* Crypto Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Bitcoin className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cryptoData.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Current portfolio value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cryptoData.totalInvested.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total capital invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{cryptoData.totalReturn}%</div>
              <p className="text-xs text-muted-foreground">
                All-time performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Change</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cryptoData.todayChange}%</div>
              <p className="text-xs text-muted-foreground">
                Today&apos;s performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cryptoData.portfolioCount}</div>
              <p className="text-xs text-muted-foreground">
                Different assets
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Allocation */}
        <motion.div 
          className="grid gap-4 lg:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
              <CardDescription>Distribution by market cap</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cryptoInvestments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No crypto investments to display allocation</p>
                </div>
              ) : (
                cryptoInvestments.map((crypto, index) => {
                  const currentValue = crypto.quantity * (crypto.lastSyncedPrice || crypto.purchasePrice)
                  const allocation = totalValue > 0 ? (currentValue / totalValue) * 100 : 0
                  
                  return (
                    <motion.div 
                      key={crypto.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          {crypto.symbol} - {crypto.metadata?.cryptoName || crypto.symbol}
                        </span>
                        <span className="font-medium">
                          {allocation.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={allocation} className="h-2" />
                    </motion.div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Information</CardTitle>
              <CardDescription>General cryptocurrency market data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Market data integration coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Holdings Detail */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Holdings Detail</CardTitle>
                  <CardDescription>
                    {cryptoInvestments.length > 0 
                      ? `Your cryptocurrency positions (${cryptoInvestments.length} holdings)`
                      : "No cryptocurrency investments found"
                    }
                  </CardDescription>
                </div>
                <CryptoInvestmentForm 
                  onSubmit={handleAddInvestment} 
                  isLoading={isLoading}
                  triggerText="Add Crypto"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading crypto investments...</div>
                </div>
              ) : cryptoInvestments.length === 0 ? (
                <div className="text-center py-8">
                  <Bitcoin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Crypto Investments</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your cryptocurrency portfolio by adding your first investment.
                  </p>
                  <CryptoInvestmentForm 
                    onSubmit={handleAddInvestment} 
                    isLoading={isLoading}
                    triggerText="Add Your First Crypto"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {cryptoInvestments.map((crypto, index) => {
                    const currentValue = crypto.quantity * (crypto.lastSyncedPrice || crypto.purchasePrice)
                    const investedValue = crypto.quantity * crypto.purchasePrice
                    const returnValue = currentValue - investedValue
                    const returnPercentage = investedValue > 0 ? (returnValue / investedValue) * 100 : 0

                    return (
                      <motion.div
                        key={crypto.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="grid gap-4 md:grid-cols-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {crypto.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold">{crypto.symbol}</div>
                              <div className="text-sm text-muted-foreground">{crypto.metadata?.cryptoName || 'Cryptocurrency'}</div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Holdings</div>
                            <div className="font-semibold">{crypto.quantity.toLocaleString()}</div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Current Price</div>
                            <div className="font-semibold">${(crypto.lastSyncedPrice || crypto.purchasePrice).toLocaleString()}</div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Value</div>
                            <div className="font-semibold">${currentValue.toLocaleString()}</div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Return</div>
                            <Badge variant={returnPercentage >= 0 ? 'default' : 'destructive'}>
                              {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Update Prices Button */}
        {cryptoInvestments.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Price Updates</CardTitle>
                <CardDescription>Keep your crypto valuations current</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={updatePrices} disabled={isLoading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Crypto Prices
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
  )
}
