"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Home, MapPin, DollarSign, Calendar, Settings, Plus, TrendingUp, Users } from "lucide-react"

export default function RentalPropertiesPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Income", href: "/dashboard/income" },
    { title: "Rental Properties" }
  ]

  const rentalData = {
    totalMonthlyRent: 3200,
    totalAnnualRent: 38400,
    occupancyRate: 95,
    totalProperties: 2
  }

  const properties = [
    {
      id: 1,
      name: "Downtown Apartment",
      address: "123 Main St, Apt 4B",
      monthlyRent: 1800,
      tenant: "John Smith",
      leaseStart: "2024-01-15",
      leaseEnd: "2024-12-15",
      status: "Occupied",
      lastPayment: "2024-12-01",
      nextPayment: "2025-01-01",
      occupancyRate: 100
    },
    {
      id: 2,
      name: "Suburban House",
      address: "456 Oak Avenue",
      monthlyRent: 2200,
      tenant: "Sarah Johnson",
      leaseStart: "2024-03-01",
      leaseEnd: "2025-02-28",
      status: "Occupied", 
      lastPayment: "2024-12-01",
      nextPayment: "2025-01-01",
      occupancyRate: 100
    },
    {
      id: 3,
      name: "City Condo",
      address: "789 Pine Street, Unit 12",
      monthlyRent: 1400,
      tenant: null,
      leaseStart: null,
      leaseEnd: null,
      status: "Vacant",
      lastPayment: null,
      nextPayment: null,
      occupancyRate: 85
    }
  ]

  const monthlyExpenses = [
    { category: "Property Management", amount: 320, percentage: 10 },
    { category: "Maintenance & Repairs", amount: 250, percentage: 7.8 },
    { category: "Property Taxes", amount: 180, percentage: 5.6 },
    { category: "Insurance", amount: 150, percentage: 4.7 },
    { category: "Utilities (Vacant)", amount: 85, percentage: 2.7 }
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

  const totalExpenses = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netIncome = rentalData.totalMonthlyRent - totalExpenses

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Rental Properties">
      <TabNavigation tabs={tabNavigationConfig.income} />
      
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Rental Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${rentalData.totalMonthlyRent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Gross rental income
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${netIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                After expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rentalData.occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">
                Properties occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
              <p className="text-xs text-muted-foreground">
                Total properties
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Property List */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Portfolio</CardTitle>
                  <CardDescription>Manage your rental properties and tenants</CardDescription>
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{property.name}</h3>
                          <Badge variant={property.status === 'Occupied' ? 'default' : 'destructive'}>
                            {property.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{property.address}</span>
                        </div>
                        {property.status === 'Occupied' ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Tenant</p>
                              <p className="font-medium">{property.tenant}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Lease Ends</p>
                              <p className="font-medium">{property.leaseEnd}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Payment</p>
                              <p className="font-medium">{property.lastPayment}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Next Payment</p>
                              <p className="font-medium">{property.nextPayment}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <p className="text-muted-foreground">Property is currently vacant</p>
                            <p className="text-sm text-orange-600">Historical occupancy: {property.occupancyRate}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">${property.monthlyRent.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">Monthly rent</p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rental Analysis */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>Operating costs breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthlyExpenses.map((expense, index) => (
                <motion.div 
                  key={expense.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span>{expense.category}</span>
                    <span className="font-medium">
                      ${expense.amount.toLocaleString()} ({expense.percentage}%)
                    </span>
                  </div>
                  <Progress value={expense.percentage} className="h-2" />
                </motion.div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total Expenses</span>
                  <span className="text-red-600">${totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-green-600 mt-1">
                  <span>Net Income</span>
                  <span>${netIncome.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key rental performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Cap Rate</div>
                    <div className="text-sm text-muted-foreground">Annual return on investment</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">8.2%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Cash Flow</div>
                    <div className="text-sm text-muted-foreground">Monthly net income</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">${netIncome.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Expense Ratio</div>
                    <div className="text-sm text-muted-foreground">Expenses vs gross income</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{((totalExpenses / rentalData.totalMonthlyRent) * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Avg Rent/Unit</div>
                    <div className="text-sm text-muted-foreground">Average monthly rent</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">${Math.round(rentalData.totalMonthlyRent / properties.length).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rental Calendar */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Important dates and reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: "Lease Renewal", property: "Downtown Apartment", date: "2024-12-15", status: "Due Soon" },
                  { type: "Rent Payment", property: "Suburban House", date: "2025-01-01", status: "Scheduled" },
                  { type: "Property Inspection", property: "City Condo", date: "2024-12-20", status: "Upcoming" },
                  { type: "Lease Renewal", property: "Suburban House", date: "2025-02-28", status: "Future" }
                ].map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium">{event.type}</div>
                        <div className="text-sm text-muted-foreground">{event.property}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{event.date}</div>
                      <Badge variant={event.status === 'Due Soon' ? 'destructive' : 'secondary'} className="text-xs">
                        {event.status}
                      </Badge>
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
