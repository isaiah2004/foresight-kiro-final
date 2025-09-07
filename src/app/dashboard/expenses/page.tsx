"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CreditCard, DollarSign, TrendingDown, Calendar, Plus, Filter, Search, ArrowUpRight, ShoppingCart, Car, Home, Utensils } from "lucide-react"

export default function ExpensesPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Expenses" }
  ]

  const expenseData = {
    totalThisMonth: 5420,
    budgetRemaining: 2080,
    totalBudget: 7500,
    avgDaily: 175
  }

  const recentExpenses = [
    {
      id: 1,
      description: "Grocery Shopping - Whole Foods",
      amount: 127.45,
      category: "Food & Dining",
      date: "2024-12-06",
      paymentMethod: "Credit Card",
      icon: ShoppingCart,
      color: "bg-green-500"
    },
    {
      id: 2,
      description: "Gas Station - Shell",
      amount: 65.20,
      category: "Transportation",
      date: "2024-12-05",
      paymentMethod: "Debit Card",
      icon: Car,
      color: "bg-blue-500"
    },
    {
      id: 3,
      description: "Electric Bill - PG&E",
      amount: 180.30,
      category: "Utilities",
      date: "2024-12-04",
      paymentMethod: "Bank Transfer",
      icon: Home,
      color: "bg-yellow-500"
    },
    {
      id: 4,
      description: "Dinner - Italian Restaurant",
      amount: 85.60,
      category: "Food & Dining",
      date: "2024-12-03",
      paymentMethod: "Credit Card",
      icon: Utensils,
      color: "bg-orange-500"
    },
    {
      id: 5,
      description: "Netflix Subscription",
      amount: 15.99,
      category: "Entertainment",
      date: "2024-12-01",
      paymentMethod: "Credit Card",
      icon: CreditCard,
      color: "bg-purple-500"
    }
  ]

  const expenseCategories = [
    { name: "Food & Dining", amount: 1245, budget: 1200, percentage: 103.8, color: "bg-green-500" },
    { name: "Transportation", amount: 850, budget: 800, percentage: 106.3, color: "bg-blue-500" },
    { name: "Housing", amount: 2500, budget: 2500, percentage: 100, color: "bg-red-500" },
    { name: "Utilities", amount: 380, budget: 400, percentage: 95, color: "bg-yellow-500" },
    { name: "Entertainment", amount: 320, budget: 500, percentage: 64, color: "bg-purple-500" },
    { name: "Healthcare", amount: 125, budget: 300, percentage: 41.7, color: "bg-pink-500" }
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

  const spentPercentage = (expenseData.totalThisMonth / expenseData.totalBudget) * 100

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Expense Tracking">
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Expense Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${expenseData.totalThisMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{spentPercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Of monthly budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${expenseData.budgetRemaining.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Budget remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${expenseData.avgDaily}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Progress */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget Progress</CardTitle>
              <CardDescription>How much of your budget you&apos;ve used this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: ${expenseData.totalThisMonth.toLocaleString()}</span>
                  <span>Budget: ${expenseData.totalBudget.toLocaleString()}</span>
                </div>
                <Progress value={spentPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{spentPercentage.toFixed(1)}% used</span>
                  <span>${expenseData.budgetRemaining.toLocaleString()} remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Expenses and Categories */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Your latest transactions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${expense.color}`}>
                        <expense.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{expense.description}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{expense.category}</span>
                          <span>•</span>
                          <span>{expense.date}</span>
                          <span>•</span>
                          <span>{expense.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">-${expense.amount.toFixed(2)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Spending by category this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseCategories.map((category, index) => (
                <motion.div 
                  key={category.name}
                  initial={{ opacity: 0, x: 20 }}
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
                      ${category.amount.toLocaleString()} / ${category.budget.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{category.percentage.toFixed(1)}% of budget</span>
                    <Badge variant={category.percentage > 100 ? "destructive" : category.percentage > 90 ? "default" : "secondary"}>
                      {category.percentage > 100 ? "Over Budget" : category.percentage > 90 ? "Near Limit" : "On Track"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Analysis */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Spending Analysis</CardTitle>
              <CardDescription>Insights and trends in your spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h4 className="font-semibold mb-3">Top Categories</h4>
                  <div className="space-y-2">
                    {expenseCategories
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 3)
                      .map((category, index) => (
                        <div key={category.name} className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="font-medium">${category.amount.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Payment Methods</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Credit Card</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Debit Card</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bank Transfer</span>
                      <span className="font-medium">10%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Budget Health</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">2</Badge>
                      <span className="text-sm">Over budget</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">1</Badge>
                      <span className="text-sm">Near limit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">3</Badge>
                      <span className="text-sm">On track</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common expense management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { name: "Add Expense", icon: Plus, description: "Record a new transaction" },
                  { name: "Search Expenses", icon: Search, description: "Find specific transactions" },
                  { name: "Export Data", icon: CreditCard, description: "Download expense reports" },
                  { name: "Set Budgets", icon: DollarSign, description: "Manage category budgets" }
                ].map((action, index) => (
                  <motion.div
                    key={action.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-center"
                  >
                    <action.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold text-sm">{action.name}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
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