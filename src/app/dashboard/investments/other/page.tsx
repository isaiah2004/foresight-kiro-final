"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Package, TrendingUp, DollarSign, Star, Plus, Briefcase, Gem, Palette } from "lucide-react"

export default function OtherInvestmentsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Other" }
  ]

  const otherInvestmentsData = {
    totalValue: 18750,
    totalInvested: 16200,
    totalReturn: 15.7,
    categories: 6,
    topPerformer: "Collectibles"
  }

  const investments = [
    {
      id: 1,
      name: "Vintage Wine Collection",
      category: "Collectibles",
      value: 6200,
      invested: 5000,
      return: 24.0,
      description: "Premium Bordeaux vintages",
      riskLevel: "Medium",
      liquidity: "Low"
    },
    {
      id: 2,
      name: "Art Investment Fund",
      category: "Alternative",
      value: 4500,
      invested: 4000,
      return: 12.5,
      description: "Contemporary art portfolio",
      riskLevel: "High",
      liquidity: "Very Low"
    },
    {
      id: 3,
      name: "Precious Metals",
      category: "Commodities",
      value: 3200,
      invested: 3100,
      return: 3.2,
      description: "Gold and silver bullion",
      riskLevel: "Low",
      liquidity: "High"
    },
    {
      id: 4,
      name: "P2P Lending",
      category: "Alternative",
      value: 2850,
      invested: 2500,
      return: 14.0,
      description: "Peer-to-peer loan portfolio",
      riskLevel: "Medium",
      liquidity: "Medium"
    },
    {
      id: 5,
      name: "Collectible Watches",
      category: "Collectibles", 
      value: 1500,
      invested: 1200,
      return: 25.0,
      description: "Luxury timepiece collection",
      riskLevel: "High",
      liquidity: "Medium"
    },
    {
      id: 6,
      name: "Energy Partnership",
      category: "Private Equity",
      value: 500,
      invested: 400,
      return: 25.0,
      description: "Renewable energy investment",
      riskLevel: "High",
      liquidity: "Very Low"
    }
  ]

  const categoryAllocation = [
    { name: "Collectibles", value: 7700, percentage: 41.1, color: "bg-purple-500" },
    { name: "Alternative", value: 7350, percentage: 39.2, color: "bg-blue-500" },
    { name: "Commodities", value: 3200, percentage: 17.1, color: "bg-yellow-500" },
    { name: "Private Equity", value: 500, percentage: 2.7, color: "bg-green-500" }
  ]

  const performanceMetrics = [
    { label: "Best Performer", value: "Watches +25%", icon: Star },
    { label: "Most Liquid", value: "Precious Metals", icon: TrendingUp },
    { label: "Highest Risk", value: "Art Fund", icon: Package },
    { label: "Lowest Risk", value: "Gold/Silver", icon: Gem }
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
              <div className="text-2xl font-bold">${otherInvestmentsData.totalValue.toLocaleString()}</div>
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
              <div className="text-2xl font-bold">${otherInvestmentsData.totalInvested.toLocaleString()}</div>
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
              <div className="text-2xl font-bold text-green-600">+{otherInvestmentsData.totalReturn}%</div>
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
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{otherInvestmentsData.topPerformer}</div>
              <p className="text-xs text-muted-foreground">
                Best category
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Allocation and Performance Metrics */}
        <motion.div 
          className="grid gap-4 lg:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Category Allocation</CardTitle>
              <CardDescription>Distribution by investment type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryAllocation.map((category, index) => (
                <motion.div 
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      {category.name}
                    </span>
                    <span className="font-medium">
                      ${category.value.toLocaleString()} ({category.percentage}%)
                    </span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key portfolio insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {performanceMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    <div className="text-lg font-bold text-primary">{metric.value}</div>
                  </motion.div>
                ))}
              </div>
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
                  <CardDescription>Your alternative investment holdings</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investments.map((investment, index) => (
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
                          {getCategoryIcon(investment.category)}
                          <div>
                            <h3 className="font-semibold">{investment.name}</h3>
                            <p className="text-sm text-muted-foreground">{investment.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{investment.category}</Badge>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Invested</div>
                        <div className="font-semibold">${investment.invested.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Current Value</div>
                        <div className="font-semibold">${investment.value.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Return</div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          +{investment.return}%
                        </Badge>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Risk/Liquidity</div>
                        <div className="space-y-1">
                          <Badge variant="secondary" className={getRiskColor(investment.riskLevel)}>
                            {investment.riskLevel} Risk
                          </Badge>
                          <Badge variant="secondary" className={getLiquidityColor(investment.liquidity)}>
                            {investment.liquidity} Liquidity
                          </Badge>
                        </div>
                      </div>
                    </div>
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
              <CardDescription>Latest transactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: "Purchase", investment: "Vintage Wine Collection", amount: 1500, date: "2024-11-20", note: "Added 1982 Bordeaux bottles" },
                  { type: "Valuation", investment: "Art Investment Fund", amount: 500, date: "2024-11-15", note: "Quarterly revaluation increase" },
                  { type: "Sale", investment: "Collectible Watches", amount: -800, date: "2024-11-10", note: "Sold Rolex Submariner" },
                  { type: "Distribution", investment: "P2P Lending", amount: 125, date: "2024-11-05", note: "Monthly interest payment" }
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
                        <div className="font-medium">{activity.investment}</div>
                        <div className="text-sm text-muted-foreground">{activity.note}</div>
                        <div className="text-xs text-muted-foreground">{activity.date}</div>
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
