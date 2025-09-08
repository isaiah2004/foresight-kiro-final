"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { IncomeDashboard } from "@/components/shared/income/income-dashboard"
import { useIncome } from "@/hooks/use-income"
import { useCurrency } from "@/hooks/use-currency"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SalaryPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Income", href: "/dashboard/income" },
    { title: "Salary" }
  ]

  const { 
    incomeSources, 
    isLoading, 
    error, 
    addIncomeSource, 
    updateIncomeSource, 
    deleteIncomeSource,
    calculateMonthlyEquivalent,
    totalMonthlyIncome,
    totalAnnualIncome
  } = useIncome()
  
  const { primaryCurrency } = useCurrency()

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Salary Income">
      <TabNavigation tabs={tabNavigationConfig.income} />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <IncomeDashboard
        incomeSources={incomeSources}
        totalMonthlyIncome={totalMonthlyIncome}
        totalAnnualIncome={totalAnnualIncome}
        primaryCurrency={primaryCurrency}
        isLoading={isLoading}
        onAddIncome={addIncomeSource}
        onUpdateIncome={updateIncomeSource}
        onDeleteIncome={deleteIncomeSource}
        calculateMonthlyEquivalent={calculateMonthlyEquivalent}
        filterByType="salary"
      />
    </DashboardLayout>
  )
}