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
import { TrendingUp, TrendingDown, DollarSign, Calendar, Shield, Plus, AlertCircle } from "lucide-react"
import { useMemo } from "react"

export default function BondsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Bonds" }
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

  // Filter only bond investments
  const bondInvestments = useMemo(() => 
    investments.filter(inv => inv.type === 'bond'), 
    [investments]
  )

  const handleAddInvestment = async (data: any) => {
    await addInvestment({
      symbol: data.symbol,
      type: data.type || 'bond',
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseCurrency: data.purchaseCurrency,
      purchaseDate: data.purchaseDate,
      metadata: {
        bondName: data.bondName,
        issuer: data.issuer,
        maturityDate: data.maturityDate,
        couponRate: data.couponRate,
        rating: data.rating,
        notes: data.notes
      }
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

  // Calculate totals from actual bond investments
  const totalValue = bondInvestments.reduce((sum, bond) => {
    const currentPrice = bond.lastSyncedPrice || bond.purchasePrice
    return sum + (bond.quantity * currentPrice)
  }, 0)
  
  const totalInvested = bondInvestments.reduce((sum, bond) => {
    return sum + (bond.quantity * bond.purchasePrice)
  }, 0)
  
  const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Bond Investments">
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
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {totalValue > totalInvested ? '+' : ''}${(totalValue - totalInvested).toLocaleString()} from invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              {totalReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Since inception
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings Count</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bondInvestments.length}</div>
              <p className="text-xs text-muted-foreground">
                Active positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastPriceUpdate ? new Date(lastPriceUpdate).toLocaleDateString() : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Price update
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bond Holdings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bond Holdings</CardTitle>
                  <CardDescription>
                    {bondInvestments.length > 0 
                      ? `Your current bond portfolio (${bondInvestments.length} holdings)`
                      : "No bond investments found"
                    }
                  </CardDescription>
                </div>
                <Button onClick={() => handleAddInvestment({})}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bond
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading bond investments...</div>
                </div>
              ) : bondInvestments.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Bond Investments</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your bond portfolio by adding your first investment.
                  </p>
                  <Button onClick={() => handleAddInvestment({})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Bond
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bondInvestments.map((bond, index) => {
                    const currentValue = bond.quantity * (bond.lastSyncedPrice || bond.purchasePrice)
                    const investedValue = bond.quantity * bond.purchasePrice
                    const returnValue = currentValue - investedValue
                    const returnPercentage = investedValue > 0 ? (returnValue / investedValue) * 100 : 0

                    return (
                      <motion.div
                        key={bond.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <h3 className="font-semibold">{bond.metadata?.bondName || bond.symbol}</h3>
                              <p className="text-sm text-muted-foreground">{bond.symbol}</p>
                            </div>
                            {bond.metadata?.rating && (
                              <Badge variant={bond.metadata.rating === 'AAA' ? 'default' : 'secondary'}>
                                {bond.metadata.rating}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Value</p>
                              <p className="font-medium">${currentValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-medium">{bond.quantity.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Purchase Price</p>
                              <p className="font-medium">{bond.purchaseCurrency}{bond.purchasePrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Purchase Date</p>
                              <p className="font-medium">{new Date(bond.purchaseDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ${returnValue >= 0 ? '+' : ''}{returnValue.toLocaleString()}
                          </p>
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
        {bondInvestments.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Price Updates</CardTitle>
                <CardDescription>Keep your bond valuations current</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={updatePrices} disabled={isLoading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Bond Prices
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
