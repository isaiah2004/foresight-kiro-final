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
import { Home, MapPin, TrendingUp, DollarSign, Calendar, Plus, Building, AlertCircle } from "lucide-react"
import { useMemo } from "react"
import { formatInvestmentValue, formatPercentageChange } from "@/lib/financial/investments"

export default function RealEstatePage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Real Estate" }
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

  // Filter only real estate investments
  const realEstateInvestments = useMemo(() => 
    investments.filter(inv => inv.type === 'real-estate'), 
    [investments]
  )

  const handleAddInvestment = async (data: any) => {
    await addInvestment({
      symbol: data.symbol,
      type: data.type || 'real-estate',
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseCurrency: data.purchaseCurrency,
      purchaseDate: data.purchaseDate,
      metadata: {
        propertyName: data.propertyName,
        propertyType: data.propertyType,
        location: data.location,
        rentalIncome: data.rentalIncome,
        tenant: data.tenant,
        leaseEnd: data.leaseEnd,
        notes: data.notes
      }
    })
  }

  // Calculate totals from actual real estate investments
  const totalValue = realEstateInvestments.reduce((sum, property) => {
    const currentPrice = property.lastSyncedPrice || property.purchasePrice
    return sum + (property.quantity * currentPrice)
  }, 0)
  
  const totalInvested = realEstateInvestments.reduce((sum, property) => {
    return sum + (property.quantity * property.purchasePrice)
  }, 0)
  
  const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
  
  const monthlyIncome = realEstateInvestments.reduce((sum, property) => {
    return sum + (property.metadata?.rentalIncome || 0)
  }, 0)

  const realEstateData = {
    totalValue,
    totalInvested,
    totalReturn,
    monthlyIncome,
    occupancyRate: realEstateInvestments.length > 0 ? 
      (realEstateInvestments.filter(p => p.metadata?.tenant).length / realEstateInvestments.length) * 100 : 0
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
    <DashboardLayout breadcrumbs={breadcrumbs} title="Real Estate Investments">
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
        {/* Real Estate Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatInvestmentValue(realEstateData.totalValue, primaryCurrency)}</div>
              <p className="text-xs text-muted-foreground">
                Current market value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatInvestmentValue(realEstateData.totalInvested, primaryCurrency)}</div>
              <p className="text-xs text-muted-foreground">
                Purchase price + improvements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatPercentageChange(realEstateData.totalReturn).formatted}</div>
              <p className="text-xs text-muted-foreground">
                Appreciation + rental income
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatInvestmentValue(realEstateData.monthlyIncome, primaryCurrency)}</div>
              <p className="text-xs text-muted-foreground">
                Rental income
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realEstateData.occupancyRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                Currently occupied
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Property Portfolio */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Portfolio</CardTitle>
                  <CardDescription>
                    {realEstateInvestments.length > 0 
                      ? `Your real estate investments (${realEstateInvestments.length} properties)`
                      : "No real estate investments found"
                    }
                  </CardDescription>
                </div>
                <Button onClick={() => handleAddInvestment({})}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading real estate investments...</div>
                </div>
              ) : realEstateInvestments.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Real Estate Investments</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your real estate portfolio by adding your first property investment.
                  </p>
                  <Button onClick={() => handleAddInvestment({})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {realEstateInvestments.map((property, index) => {
                    const currentValue = property.quantity * (property.lastSyncedPrice || property.purchasePrice)
                    const investedValue = property.quantity * property.purchasePrice
                    const returnValue = currentValue - investedValue
                    const returnPercentage = investedValue > 0 ? (returnValue / investedValue) * 100 : 0

                    return (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="grid gap-4 md:grid-cols-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Home className="h-4 w-4 text-primary" />
                              <h3 className="font-semibold">{property.metadata?.propertyName || property.symbol}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.metadata?.location || 'Location not specified'}
                            </p>
                            <Badge variant="secondary" className="mt-1">
                              {property.metadata?.propertyType || 'Real Estate'}
                            </Badge>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Purchase Price</div>
                            <div className="font-semibold">{formatInvestmentValue(property.purchasePrice, property.purchaseCurrency)}</div>
                            <div className="text-sm text-muted-foreground mt-1">Current Value</div>
                            <div className="font-semibold text-green-600">{formatInvestmentValue(currentValue, primaryCurrency)}</div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Monthly Rent</div>
                            <div className="font-semibold">{formatInvestmentValue(property.metadata?.rentalIncome || 0, primaryCurrency)}</div>
                            <div className="text-sm text-muted-foreground mt-1">ROI</div>
                            <div className="font-semibold text-green-600">{formatPercentageChange(returnPercentage).formatted}</div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Status</div>
                            <Badge variant={property.metadata?.tenant ? 'default' : 'destructive'}>
                              {property.metadata?.tenant ? 'Occupied' : 'Vacant'}
                            </Badge>
                            {property.metadata?.tenant && (
                              <>
                                <div className="text-sm text-muted-foreground mt-1">Tenant</div>
                                <div className="text-sm font-medium">{property.metadata.tenant}</div>
                                {property.metadata?.leaseEnd && (
                                  <div className="text-xs text-muted-foreground">Lease ends: {property.metadata.leaseEnd}</div>
                                )}
                              </>
                            )}
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
        {realEstateInvestments.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Property Valuations</CardTitle>
                <CardDescription>Keep your property valuations current</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={updatePrices} disabled={isLoading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Property Values
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
