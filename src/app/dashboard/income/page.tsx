"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, Calendar, Building, Home, Plus, Briefcase } from "lucide-react"

export default function IncomePage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Income" }
  ]

  const incomeData = {
    totalMonthly: 8450,
    totalAnnual: 101400,
    ytdReceived: 75940,
    nextPayment: "Dec 15, 2024"
  }

  const incomeStreams = [
    {
      id: 1,
      source: "Primary Salary",
      type: "Salary",
      amount: 6250,
      frequency: "Bi-weekly",
      lastReceived: "2024-12-01",
      nextPayment: "2024-12-15",
      status: "Active",
      annual: 75000,
      icon: Briefcase
    },
    {
      id: 2,
      source: "Rental Property - Downtown Apt",
      type: "Rental",
      amount: 1800,
      frequency: "Monthly",
      lastReceived: "2024-12-01",
      nextPayment: "2025-01-01",
      status: "Active",
      annual: 21600,
      icon: Home
    },
    {
      id: 3,
      source: "Consulting Work",
      type: "Contract",
      amount: 400,
      frequency: "Variable",
      lastReceived: "2024-11-28",
      nextPayment: "TBD",
      status: "Irregular",
      annual: 4800,
      icon: Building
    }
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
    <DashboardLayout breadcrumbs={breadcrumbs} title="Income Management">
      <TabNavigation tabs={tabNavigationConfig.income} />
      
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Income Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${incomeData.totalMonthly.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Average monthly
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${incomeData.totalAnnual.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Projected 2024
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Received</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${incomeData.ytdReceived.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((incomeData.ytdReceived / incomeData.totalAnnual) * 100).toFixed(1)}% of annual goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Dec 15</div>
              <p className="text-xs text-muted-foreground">
                Primary salary
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income Streams */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Income Streams</CardTitle>
                  <CardDescription>All your income sources and payment schedules</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Income Source
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incomeStreams.map((stream, index) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <stream.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{stream.source}</h3>
                          <Badge variant={stream.status === 'Active' ? 'default' : 'secondary'}>
                            {stream.status}
                          </Badge>
                          <Badge variant="outline">{stream.type}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-medium">${stream.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Frequency</p>
                            <p className="font-medium">{stream.frequency}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Payment</p>
                            <p className="font-medium">{stream.lastReceived}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Payment</p>
                            <p className="font-medium">{stream.nextPayment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">${stream.annual.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">Annual</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income Analysis */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Income Distribution</CardTitle>
              <CardDescription>Breakdown by source type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Salary Income</span>
                  <span>${incomeStreams.find(s => s.type === 'Salary')?.annual.toLocaleString()} (74.0%)</span>
                </div>
                <Progress value={74} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Rental Income</span>
                  <span>${incomeStreams.find(s => s.type === 'Rental')?.annual.toLocaleString()} (21.3%)</span>
                </div>
                <Progress value={21.3} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Contract Work</span>
                  <span>${incomeStreams.find(s => s.type === 'Contract')?.annual.toLocaleString()} (4.7%)</span>
                </div>
                <Progress value={4.7} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Income over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { month: "July", amount: 8200, change: 2.1 },
                  { month: "August", amount: 8450, change: 3.0 },
                  { month: "September", amount: 8100, change: -4.1 },
                  { month: "October", amount: 8650, change: 6.8 },
                  { month: "November", amount: 8450, change: -2.3 },
                  { month: "December", amount: 8750, change: 3.5 }
                ].map((month, index) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">{month.month}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">${month.amount.toLocaleString()}</span>
                      <Badge variant={month.change >= 0 ? "default" : "destructive"} className="text-xs">
                        {month.change >= 0 ? '+' : ''}{month.change}%
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income Categories */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Income Categories</CardTitle>
              <CardDescription>Manage different types of income sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { 
                    name: "Salary", 
                    count: 1, 
                    value: "$75,000", 
                    icon: Briefcase, 
                    href: "/dashboard/income/salary",
                    description: "Primary employment income"
                  },
                  { 
                    name: "Rental Properties", 
                    count: 1, 
                    value: "$21,600", 
                    icon: Home, 
                    href: "/dashboard/income/rental-properties",
                    description: "Real estate rental income"
                  },
                  { 
                    name: "Others", 
                    count: 1, 
                    value: "$4,800", 
                    icon: Building, 
                    href: "/dashboard/income/others",
                    description: "Freelance, consulting, and other income"
                  }
                ].map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = category.href}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <category.icon className="h-6 w-6 text-primary" />
                      <Badge variant="secondary">{category.count} source{category.count !== 1 ? 's' : ''}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <p className="text-xl font-bold text-primary">{category.value}</p>
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