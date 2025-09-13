"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { useInvestments } from "@/hooks/use-investments"
import { useCurrency } from "@/hooks/use-currency"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, TrendingUp, DollarSign, Star, Plus, Briefcase, Gem, Palette, AlertCircle } from "lucide-react"
import { useMemo } from "react"
import { formatInvestmentValue, formatPercentageChange } from "@/lib/financial/investments"

export default function OtherInvestmentsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Other" }
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

  // Filter only other investments
  const otherInvestments = useMemo(() => 
    investments.filter(inv => inv.type === 'other'), 
    [investments]
  )

  const handleAddInvestment = async (data: any) => {
    await addInvestment({
      symbol: data.symbol,
      type: data.type || 'other',
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseCurrency: data.purchaseCurrency,
      purchaseDate: data.purchaseDate,
      metadata: {
        investmentName: data.investmentName,
        category: data.category,
        riskLevel: data.riskLevel,
        liquidity: data.liquidity,
        description: data.description,
        notes: data.notes
      }
    })
  }

  // Calculate totals from actual other investments
  const totalValue = otherInvestments.reduce((sum, investment) => {
    const currentPrice = investment.lastSyncedPrice || investment.purchasePrice
    return sum + (investment.quantity * currentPrice)
  }, 0)
  
  const totalInvested = otherInvestments.reduce((sum, investment) => {
    return sum + (investment.quantity * investment.purchasePrice)
  }, 0)
  
  const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0

  const otherInvestmentsData = {
    totalValue,
    totalInvested,
    totalReturn,
    categories: new Set(otherInvestments.map(inv => inv.metadata?.category)).size,
    topPerformer: otherInvestments.length > 0 ? 'Alternative Investments' : 'N/A'
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Collectibles':
        return <Palette className="h-4 w-4" />
      case 'Alternative':
        return <Briefcase className="h-4 w-4" />
      case 'Commodities':
        return <Gem className="h-4 w-4" />
      case 'Private Equity':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'High':
        return 'bg-red-100 text-red-800'
      case 'Very Low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLiquidityColor = (liquidity: string) => {
    switch (liquidity) {
      case 'High':
        return 'bg-blue-100 text-blue-800'
      case 'Medium':
        return 'bg-purple-100 text-purple-800'
      case 'Low':
        return 'bg-orange-100 text-orange-800'
      case 'Very Low':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Other Investments">
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
        {/* Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatInvestmentValue(otherInvestmentsData.totalValue, primaryCurrency)}</div>
              <p className="text-xs text-muted-foreground">
                Alternative investments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatInvestmentValue(otherInvestmentsData.totalInvested, primaryCurrency)}</div>
              <p className="text-xs text-muted-foreground">
                Capital deployed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatPercentageChange(otherInvestmentsData.totalReturn).formatted}</div>
              <p className="text-xs text-muted-foreground">
                Portfolio performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{otherInvestmentsData.categories}</div>
              <p className="text-xs text-muted-foreground">
                Investment types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{otherInvestments.length}</div>
              <p className="text-xs text-muted-foreground">
                Total investments
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investment Portfolio */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Investment Portfolio</CardTitle>
                  <CardDescription>
                    {otherInvestments.length > 0 
                      ? `Your alternative investment holdings (${otherInvestments.length} investments)`
                      : "No alternative investments found"
                    }
                  </CardDescription>
                </div>
                <Button onClick={() => handleAddInvestment({})}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading alternative investments...</div>
                </div>
              ) : otherInvestments.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Alternative Investments</h3>
                  <p className="text-muted-foreground mb-4">
                    Start diversifying your portfolio by adding alternative investments like collectibles, commodities, or other assets.
                  </p>
                  <Button onClick={() => handleAddInvestment({})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Investment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {otherInvestments.map((investment, index) => {
                    const currentValue = investment.quantity * (investment.lastSyncedPrice || investment.purchasePrice)
                    const investedValue = investment.quantity * investment.purchasePrice
                    const returnValue = currentValue - investedValue
                    const returnPercentage = investedValue > 0 ? (returnValue / investedValue) * 100 : 0

                    return (
                      <motion.div
                        key={investment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="grid gap-4 lg:grid-cols-6">
                          <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-2">
                              {getCategoryIcon(investment.metadata?.category)}
                              <div>
                                <h3 className="font-semibold">{investment.metadata?.investmentName || investment.symbol}</h3>
                                <p className="text-sm text-muted-foreground">{investment.metadata?.description || 'Alternative investment'}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">{investment.metadata?.category || 'Other'}</Badge>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Invested</div>
                            <div className="font-semibold">{formatInvestmentValue(investedValue, primaryCurrency)}</div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Current Value</div>
                            <div className="font-semibold">{formatInvestmentValue(currentValue, primaryCurrency)}</div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Return</div>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {formatPercentageChange(returnPercentage).formatted}
                            </Badge>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Risk/Liquidity</div>
                            <div className="space-y-1">
                              {investment.metadata?.riskLevel && (
                                <Badge variant="secondary" className={getRiskColor(investment.metadata.riskLevel)}>
                                  {investment.metadata.riskLevel} Risk
                                </Badge>
                              )}
                              {investment.metadata?.liquidity && (
                                <Badge variant="secondary" className={getLiquidityColor(investment.metadata.liquidity)}>
                                  {investment.metadata.liquidity} Liquidity
                                </Badge>
                              )}
                            </div>
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
        {otherInvestments.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Price Updates</CardTitle>
                <CardDescription>Keep your alternative investment valuations current</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={updatePrices} disabled={isLoading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Investment Values
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
