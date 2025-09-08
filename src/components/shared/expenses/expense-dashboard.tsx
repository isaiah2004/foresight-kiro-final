"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingDown, 
  Calendar, 
  CreditCard,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  Home,
  ShoppingCart,
  Zap,
  Film,
  Package,
  ArrowUpRight,
  Filter
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExpenseForm } from './expense-form'
import { Expense } from '@/types/financial'
import { ExpenseFormData } from '@/hooks/use-expenses'

interface ExpenseDashboardProps {
  expenses: Expense[]
  primaryCurrency: string
  isLoading?: boolean
  onAddExpense: (data: ExpenseFormData) => Promise<void>
  onUpdateExpense: (id: string, data: Partial<ExpenseFormData>) => Promise<void>
  onDeleteExpense: (id: string) => Promise<void>
  getCurrentMonthExpenses: () => Expense[]
  getCurrentMonthDailyAverage: () => number
  getCategoryTotals: (startDate?: Date, endDate?: Date) => Array<{
    category: string
    total: number
    count: number
    expenses: Expense[]
  }>
  getRecentExpenses: (limit?: number) => Expense[]
}

export function ExpenseDashboard({
  expenses,
  primaryCurrency,
  isLoading = false,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  getCurrentMonthExpenses,
  getCurrentMonthDailyAverage,
  getCategoryTotals,
  getRecentExpenses
}: ExpenseDashboardProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Calculate current month data
  const currentMonthExpenses = getCurrentMonthExpenses()
  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const dailyAverage = getCurrentMonthDailyAverage()
  
  // Mock budget data (in a real app, this would come from budget management)
  const monthlyBudget = 7500
  const budgetRemaining = monthlyBudget - currentMonthTotal
  const budgetUsedPercentage = (currentMonthTotal / monthlyBudget) * 100

  // Get category totals for current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const categoryTotals = getCategoryTotals(startOfMonth, endOfMonth)

  // Recent expenses
  const recentExpenses = getRecentExpenses(5)

  // Category icons and colors
  const getCategoryIcon = (category: Expense['category']) => {
    switch (category) {
      case 'rent':
        return Home
      case 'groceries':
        return ShoppingCart
      case 'utilities':
        return Zap
      case 'entertainment':
        return Film
      case 'other':
        return Package
      default:
        return DollarSign
    }
  }

  const getCategoryColor = (category: Expense['category']) => {
    switch (category) {
      case 'rent':
        return 'bg-red-500'
      case 'groceries':
        return 'bg-green-500'
      case 'utilities':
        return 'bg-yellow-500'
      case 'entertainment':
        return 'bg-purple-500'
      case 'other':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getCategoryLabel = (category: Expense['category']) => {
    switch (category) {
      case 'rent':
        return 'Rent'
      case 'groceries':
        return 'Groceries'
      case 'utilities':
        return 'Utilities'
      case 'entertainment':
        return 'Entertainment'
      case 'other':
        return 'Other'
      default:
        return category
    }
  }

  // Mock budget allocations for categories
  const categoryBudgets = {
    rent: 2500,
    groceries: 1200,
    utilities: 400,
    entertainment: 500,
    other: 2900
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
  }

  const handleUpdateExpense = async (data: ExpenseFormData) => {
    if (!editingExpense) return
    await onUpdateExpense(editingExpense.id, data)
    setEditingExpense(null)
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await onDeleteExpense(id)
    }
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
            <div className="text-2xl font-bold">
              {primaryCurrency} {currentMonthTotal.toLocaleString()}
            </div>
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
            <div className="text-2xl font-bold text-orange-600">
              {budgetUsedPercentage.toFixed(1)}%
            </div>
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
            <div className="text-2xl font-bold text-green-600">
              {primaryCurrency} {Math.max(0, budgetRemaining).toLocaleString()}
            </div>
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
            <div className="text-2xl font-bold">
              {primaryCurrency} {Math.round(dailyAverage)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Progress */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget Progress</CardTitle>
            <CardDescription>How much of your budget you&apos;ve used this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent: {primaryCurrency} {currentMonthTotal.toLocaleString()}</span>
                <span>Budget: {primaryCurrency} {monthlyBudget.toLocaleString()}</span>
              </div>
              <Progress value={Math.min(budgetUsedPercentage, 100)} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetUsedPercentage.toFixed(1)}% used</span>
                <span>
                  {budgetRemaining >= 0 
                    ? `${primaryCurrency} ${budgetRemaining.toLocaleString()} remaining`
                    : `${primaryCurrency} ${Math.abs(budgetRemaining).toLocaleString()} over budget`
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Expense and Recent Expenses */}
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
                <ExpenseForm onSubmit={onAddExpense} isLoading={isLoading} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense, index) => {
                  const IconComponent = getCategoryIcon(expense.category)
                  const colorClass = getCategoryColor(expense.category)
                  
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{expense.description}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{getCategoryLabel(expense.category)}</span>
                            {expense.subcategory && (
                              <>
                                <span>•</span>
                                <span>{expense.subcategory}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{expense.date.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-semibold">
                            -{expense.currency} {expense.amount.toFixed(2)}
                          </div>
                          {expense.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first expense to start tracking your spending.
                  </p>
                  <ExpenseForm onSubmit={onAddExpense} isLoading={isLoading} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Spending by category this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryTotals.map((category, index) => {
              const budget = categoryBudgets[category.category as keyof typeof categoryBudgets] || 0
              const percentage = budget > 0 ? (category.total / budget) * 100 : 0
              const colorClass = getCategoryColor(category.category as Expense['category'])
              
              return (
                <motion.div 
                  key={category.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                      {getCategoryLabel(category.category as Expense['category'])}
                    </span>
                    <span className="font-medium">
                      {primaryCurrency} {category.total.toLocaleString()} / {primaryCurrency} {budget.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% of budget</span>
                    <Badge variant={
                      percentage > 100 ? "destructive" : 
                      percentage > 90 ? "default" : 
                      "secondary"
                    }>
                      {percentage > 100 ? "Over Budget" : 
                       percentage > 90 ? "Near Limit" : 
                       "On Track"}
                    </Badge>
                  </div>
                </motion.div>
              )
            })}
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
                  {categoryTotals
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 3)
                    .map((category) => (
                      <div key={category.category} className="flex justify-between text-sm">
                        <span>{getCategoryLabel(category.category as Expense['category'])}</span>
                        <span className="font-medium">
                          {primaryCurrency} {category.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Expense Types</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>One-time</span>
                    <span className="font-medium">
                      {currentMonthExpenses.filter(e => !e.isRecurring).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recurring</span>
                    <span className="font-medium">
                      {currentMonthExpenses.filter(e => e.isRecurring).length}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Budget Health</h4>
                <div className="space-y-2">
                  {categoryTotals.map(category => {
                    const budget = categoryBudgets[category.category as keyof typeof categoryBudgets] || 0
                    const percentage = budget > 0 ? (category.total / budget) * 100 : 0
                    
                    if (percentage > 100) {
                      return (
                        <div key={category.category} className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">!</Badge>
                          <span className="text-sm">{getCategoryLabel(category.category as Expense['category'])} over budget</span>
                        </div>
                      )
                    }
                    return null
                  }).filter(Boolean)}
                  
                  {categoryTotals.every(category => {
                    const budget = categoryBudgets[category.category as keyof typeof categoryBudgets] || 0
                    const percentage = budget > 0 ? (category.total / budget) * 100 : 0
                    return percentage <= 100
                  }) && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      <span className="text-sm">All categories on track</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <ExpenseForm
          onSubmit={handleUpdateExpense}
          onCancel={() => setEditingExpense(null)}
          initialData={editingExpense}
          isLoading={isLoading}
          triggerText="Update Expense"
          mode="edit"
        />
      )}
    </motion.div>
  )
}