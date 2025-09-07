"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Home, MapPin, TrendingUp, DollarSign, Calendar, Plus, Building } from "lucide-react"

export default function RealEstatePage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Real Estate" }
  ]

  const realEstateData = {
    totalValue: 485000,
    totalInvested: 420000,
    totalReturn: 15.5,
    monthlyIncome: 3200,
    occupancyRate: 95
  }

  const properties = [
    {
      id: 1,
      name: "Downtown Apartment",
      type: "Residential",
      location: "Downtown, NY",
      purchasePrice: 180000,
      currentValue: 220000,
      monthlyRent: 1800,
      occupancyStatus: "Occupied",
      tenant: "John Smith",
      leaseEnd: "2024-08-15",
      roi: 22.2
    },
    {
      id: 2,
      name: "Suburban House",
      type: "Residential",
      location: "Suburbia, CA",
      purchasePrice: 240000,
      currentValue: 265000,
      monthlyRent: 1400,
      occupancyStatus: "Occupied", 
      tenant: "Jane Doe",
      leaseEnd: "2024-12-31",
      roi: 10.4
    }
  ]

  const marketMetrics = [
    { label: "Avg. Property Appreciation", value: "8.2%", trend: "up" },
    { label: "Market Cap Rate", value: "5.8%", trend: "stable" },
    { label: "Rental Yield", value: "7.9%", trend: "up" },
    { label: "Vacancy Rate", value: "4.2%", trend: "down" }
  ]

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
              <div className="text-2xl font-bold">${realEstateData.totalValue.toLocaleString()}</div>
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
              <div className="text-2xl font-bold">${realEstateData.totalInvested.toLocaleString()}</div>
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
              <div className="text-2xl font-bold text-green-600">+{realEstateData.totalReturn}%</div>
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
              <div className="text-2xl font-bold">${realEstateData.monthlyIncome.toLocaleString()}</div>
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
              <div className="text-2xl font-bold">{realEstateData.occupancyRate}%</div>
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
                  <CardDescription>Your real estate investments</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.map((property, index) => (
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
                          <h3 className="font-semibold">{property.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {property.type}
                        </Badge>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Purchase Price</div>
                        <div className="font-semibold">${property.purchasePrice.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground mt-1">Current Value</div>
                        <div className="font-semibold text-green-600">${property.currentValue.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Monthly Rent</div>
                        <div className="font-semibold">${property.monthlyRent.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground mt-1">ROI</div>
                        <div className="font-semibold text-green-600">+{property.roi}%</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <Badge variant={property.occupancyStatus === 'Occupied' ? 'default' : 'destructive'}>
                          {property.occupancyStatus}
                        </Badge>
                        {property.tenant && (
                          <>
                            <div className="text-sm text-muted-foreground mt-1">Tenant</div>
                            <div className="text-sm font-medium">{property.tenant}</div>
                            <div className="text-xs text-muted-foreground">Lease ends: {property.leaseEnd}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Market Metrics */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Market Metrics</CardTitle>
              <CardDescription>Real estate market insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {marketMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 border rounded-lg text-center"
                  >
                    <div className="text-2xl font-bold text-primary">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                    <Badge 
                      variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                      className="mt-2"
                    >
                      {metric.trend === 'up' ? 'Trending Up' : metric.trend === 'down' ? 'Trending Down' : 'Stable'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recent real estate transactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: "Rent Received", property: "Downtown Apartment", amount: 1800, date: "2024-12-01" },
                  { type: "Maintenance", property: "Suburban House", amount: -350, date: "2024-11-28" },
                  { type: "Rent Received", property: "Suburban House", amount: 1400, date: "2024-12-01" },
                  { type: "Property Tax", property: "Downtown Apartment", amount: -1200, date: "2024-11-15" }
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={activity.amount > 0 ? 'default' : 'destructive'}>
                        {activity.type}
                      </Badge>
                      <div>
                        <div className="font-medium">{activity.property}</div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </div>
                    </div>
                    <div className={`font-medium ${activity.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
