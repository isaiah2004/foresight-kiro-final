"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { ExpenseDashboard } from "@/components/shared/expenses/expense-dashboard"
import { useExpenses } from "@/hooks/use-expenses"
import { useCurrency } from "@/hooks/use-currency"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ExpensesPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Expenses" }
  ]

  const { 
    expenses, 
    isLoading, 
    error, 
    addExpense, 
    updateExpense, 
    deleteExpense,
    getCurrentMonthExpenses,
    getCurrentMonthDailyAverage,
    getCategoryTotals,
    getRecentExpenses
  } = useExpenses()
  
  const { primaryCurrency } = useCurrency()

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Expense Tracking">
      <TabNavigation tabs={tabNavigationConfig.expenses} />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ExpenseDashboard
        expenses={expenses}
        primaryCurrency={primaryCurrency}
        isLoading={isLoading}
        onAddExpense={addExpense}
        onUpdateExpense={updateExpense}
        onDeleteExpense={deleteExpense}
        getCurrentMonthExpenses={getCurrentMonthExpenses}
        getCurrentMonthDailyAverage={getCurrentMonthDailyAverage}
        getCategoryTotals={getCategoryTotals}
        getRecentExpenses={getRecentExpenses}
      />
    </DashboardLayout>
  )
}