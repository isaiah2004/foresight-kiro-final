"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, Calendar, Building, Plus, Briefcase, Laptop, Gift, Star } from "lucide-react"

export default function OthersIncomePage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Income", href: "/dashboard/income" },
    { title: "Others" }
  ]

  const otherIncomeData = {
    totalMonthly: 890,
    totalAnnual: 10680,
    ytdReceived: 7845,
    activeStreams: 5
  }

  const incomeStreams = [
    {
      id: 1,
      source: "Freelance Web Development",
      type: "Freelance",
      amount: 450,
      frequency: "Monthly",
      lastReceived: "2024-11-28",
      nextPayment: "2024-12-30",
      status: "Active",
      annual: 5400,
      icon: Laptop,
      client: "TechStart Inc."
    },
    {
      id: 2,
      source: "Stock Dividends",
      type: "Investment",
      amount: 185,
      frequency: "Quarterly",
      lastReceived: "2024-09-15",
      nextPayment: "2024-12-15",
      status: "Active",
      annual: 740,
      icon: TrendingUp,
      client: "Various"
    },
    {
      id: 3,
      source: "Online Course Sales",
      type: "Passive",
      amount: 125,
      frequency: "Monthly",
      lastReceived: "2024-12-01",
      nextPayment: "2025-01-01",
      status: "Active",
      annual: 1500,
      icon: Star,
      client: "Udemy"
    },
    {
      id: 4,
      source: "Consulting - Financial Planning",
      type: "Consulting",
      amount: 800,
      frequency: "Project-based",
      lastReceived: "2024-10-15",
      nextPayment: "TBD",
      status: "Completed",
      annual: 2400,
      icon: Briefcase,
      client: "FinanceCorps LLC"
    },
    {
      id: 5,
      source: "Cashback & Rewards",
      type: "Rewards",
      amount: 45,
      frequency: "Monthly",
      lastReceived: "2024-12-01",
      nextPayment: "2025-01-01",
      status: "Active",
      annual: 540,
      icon: Gift,
      client: "Credit Cards"
    },
    {
      id: 6,
      source: "Affiliate Marketing",
      type: "Passive",
      amount: 95,
      frequency: "Monthly",
      lastReceived: "2024-11-30",
      nextPayment: "2024-12-31",
      status: "Active",
      annual: 1140,
      icon: Building,
      client: "Amazon Associates"
    }
  ]

  const incomeByType = [
    { type: "Freelance", amount: 5400, percentage: 50.6 },
    { type: "Passive", amount: 2640, percentage: 24.7 },
    { type: "Consulting", amount: 2400, percentage: 22.5 },
    { type: "Investment", amount: 740, percentage: 6.9 },
    { type: "Rewards", amount: 540, percentage: 5.1 }
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
    <DashboardLayout breadcrumbs={breadcrumbs} title="Other Income Sources">
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
              <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${otherIncomeData.totalMonthly.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From other sources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${otherIncomeData.totalAnnual.toLocaleString()}</div>
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
              <div className="text-2xl font-bold text-green-600">${otherIncomeData.ytdReceived.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((otherIncomeData.ytdReceived / otherIncomeData.totalAnnual) * 100).toFixed(1)}% of annual goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{otherIncomeData.activeStreams}</div>
              <p className="text-xs text-muted-foreground">
                Income sources
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
                  <CardTitle>Other Income Streams</CardTitle>
                  <CardDescription>Freelance, consulting, and additional income sources</CardDescription>
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
                            <p className="text-muted-foreground">Client/Source</p>
                            <p className="font-medium">{stream.client}</p>
                          </div>
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
              <CardTitle>Income by Type</CardTitle>
              <CardDescription>Distribution of other income sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomeByType.map((type, index) => (
                <motion.div 
                  key={type.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span>{type.type}</span>
                    <span className="font-medium">
                      ${type.amount.toLocaleString()} ({type.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={type.percentage} className="h-2" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>Upcoming payments and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incomeStreams
                  .filter(stream => stream.status === 'Active' && stream.nextPayment !== 'TBD')
                  .sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime())
                  .map((stream, index) => (
                    <motion.div
                      key={stream.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <stream.icon className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium text-sm">{stream.source}</div>
                          <div className="text-xs text-muted-foreground">{stream.client}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{stream.nextPayment}</div>
                        <div className="text-xs text-green-600">${stream.amount.toLocaleString()}</div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income Opportunities */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Income Opportunities</CardTitle>
              <CardDescription>Potential new income streams to explore</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { 
                    name: "Content Creation", 
                    description: "YouTube, blog monetization, or podcast sponsorships", 
                    potential: "$300-800/month",
                    difficulty: "Medium"
                  },
                  { 
                    name: "Digital Products", 
                    description: "Create and sell templates, courses, or ebooks", 
                    potential: "$200-1000/month",
                    difficulty: "Medium"
                  },
                  { 
                    name: "Skill Tutoring", 
                    description: "Teach programming, design, or financial planning", 
                    potential: "$400-600/month",
                    difficulty: "Low"
                  }
                ].map((opportunity, index) => (
                  <motion.div
                    key={opportunity.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="font-semibold mb-2">{opportunity.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-600">{opportunity.potential}</span>
                      <Badge variant={opportunity.difficulty === 'Low' ? 'default' : 'secondary'}>
                        {opportunity.difficulty}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tax Considerations */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Tax Considerations</CardTitle>
              <CardDescription>Important tax information for other income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold">1099 Income (Estimated)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Freelance Income</span>
                      <span className="font-medium">${incomeByType.find(t => t.type === 'Freelance')?.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consulting Income</span>
                      <span className="font-medium">${incomeByType.find(t => t.type === 'Consulting')?.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total 1099</span>
                      <span className="font-medium">${(
                        (incomeByType.find(t => t.type === 'Freelance')?.amount || 0) +
                        (incomeByType.find(t => t.type === 'Consulting')?.amount || 0)
                      ).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Tax Planning</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Estimated Tax Liability (25%)</span>
                      <span className="font-medium text-red-600">
                        ${Math.round(((incomeByType.find(t => t.type === 'Freelance')?.amount || 0) +
                        (incomeByType.find(t => t.type === 'Consulting')?.amount || 0)) * 0.25).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quarterly Payment</span>
                      <span className="font-medium">
                        ${Math.round(((incomeByType.find(t => t.type === 'Freelance')?.amount || 0) +
                        (incomeByType.find(t => t.type === 'Consulting')?.amount || 0)) * 0.25 / 4).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">
                        Next payment due: Jan 15, 2025
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
