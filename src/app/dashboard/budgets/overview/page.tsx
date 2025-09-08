"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calculator, DollarSign, Target, TrendingUp, PieChart, Settings, Plus, AlertTriangle } from "lucide-react"

export default function BudgetOverviewPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Budgets", href: "/dashboard/budgets" },
    { title: "Overview" }
  ]

  const budgetData = {
    totalBudget: 7500,
    totalSpent: 6240,
    totalRemaining: 1260,
    monthlyIncome: 8450
  }

  const budgetCategories = [
    {
      id: 1,
      name: "Housing",
      budgeted: 2500,
      spent: 2500,
      remaining: 0,
      percentage: 100,
      color: "bg-red-500",
      status: "At Limit"
    },
    {
      id: 2,
      name: "Transportation", 
      budgeted: 800,
      spent: 650,
      remaining: 150,
      percentage: 81.3,
      color: "bg-yellow-500",
      status: "On Track"
    },
    {
      id: 3,
      name: "Food & Dining",
      budgeted: 1200,
      spent: 980,
      remaining: 220,
      percentage: 81.7,
      color: "bg-green-500",
      status: "Under Budget"
    },
    {
      id: 4,
      name: "Entertainment",
      budgeted: 500,
      spent: 320,
      remaining: 180,
      percentage: 64,
      color: "bg-green-500",
      status: "Under Budget"
    },
    {
      id: 5,
      name: "Utilities",
      budgeted: 400,
      spent: 380,
      remaining: 20,
      percentage: 95,
      color: "bg-yellow-500",
      status: "Near Limit"
    },
    {
      id: 6,
      name: "Healthcare",
      budgeted: 300,
      spent: 150,
      remaining: 150,
      percentage: 50,
      color: "bg-green-500",
      status: "Under Budget"
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

  const spentPercentage = (budgetData.totalSpent / budgetData.totalBudget) * 100

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Budget Overview">
      <TabNavigation tabs={tabNavigationConfig.budgets} />
      
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Budget Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${budgetData.totalBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Monthly allocation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${budgetData.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {spentPercentage.toFixed(1)}% of budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${budgetData.totalRemaining.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Available to spend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget vs Income</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((budgetData.totalBudget / budgetData.monthlyIncome) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Of monthly income
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Progress Overview */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget Progress</CardTitle>
              <CardDescription>Overall spending progress for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: ${budgetData.totalSpent.toLocaleString()}</span>
                  <span>Budget: ${budgetData.totalBudget.toLocaleString()}</span>
                </div>
                <Progress value={spentPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{spentPercentage.toFixed(1)}% used</span>
                  <span>${budgetData.totalRemaining.toLocaleString()} remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Categories */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budget Categories</CardTitle>
                  <CardDescription>Track spending across different budget categories</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge 
                          variant={
                            category.percentage >= 95 ? "destructive" :
                            category.percentage >= 80 ? "default" : "secondary"
                          }
                        >
                          {category.status}
                        </Badge>
                        {category.percentage >= 95 && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Spent: ${category.spent.toLocaleString()}</span>
                          <span>Budget: ${category.budgeted.toLocaleString()}</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{category.percentage.toFixed(1)}% used</span>
                          <span>${category.remaining.toLocaleString()} remaining</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Analysis */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Budget allocation by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetCategories.map((category, index) => (
                <motion.div 
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span>{category.name}</span>
                    <span className="font-medium">
                      ${category.budgeted.toLocaleString()} ({((category.budgeted / budgetData.totalBudget) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={(category.budgeted / budgetData.totalBudget) * 100} className="h-2" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Health</CardTitle>
              <CardDescription>Categories requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetCategories
                  .filter(cat => cat.percentage >= 80)
                  .map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {category.percentage >= 95 && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${category.remaining.toLocaleString()} remaining
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={category.percentage >= 95 ? "destructive" : "default"}
                        className="text-xs"
                      >
                        {category.percentage.toFixed(0)}%
                      </Badge>
                    </motion.div>
                  ))}
                {budgetCategories.filter(cat => cat.percentage >= 80).length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    All categories are within healthy limits
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Tools */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Budget Management Tools</CardTitle>
              <CardDescription>Advanced features for budget planning and optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { 
                    name: "Income Splitting", 
                    description: "Automatically split income across budget categories", 
                    icon: PieChart,
                    href: "/dashboard/budgets/income-splitting"
                  },
                  { 
                    name: "Budget Buckets", 
                    description: "Create savings buckets with specific goals", 
                    icon: Target,
                    href: "/dashboard/budgets/buckets"
                  },
                  { 
                    name: "Manage Budgets", 
                    description: "Edit categories, set limits, and configure rules", 
                    icon: Settings,
                    href: "/dashboard/budgets/manage"
                  }
                ].map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = tool.href}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <tool.icon className="h-6 w-6 text-primary" />
                      <h3 className="font-semibold">{tool.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
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
