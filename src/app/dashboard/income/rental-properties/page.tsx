"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { IncomeDashboard } from "@/components/shared/income/income-dashboard"
import { useIncome } from "@/hooks/use-income"
import { useCurrency } from "@/hooks/use-currency"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function RentalPropertiesPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Income", href: "/dashboard/income" },
    { title: "Rental Properties" }
  ]

  const { 
    incomeSources, 
    convertedIncomeSources,
    isLoading, 
    isConverting,
    error,
    incomeState,
    addIncomeSource, 
    updateIncomeSource, 
    deleteIncomeSource,
    addOneTimeIncome,
    updateOneTimeIncome,
    deleteOneTimeIncome,
    calculateMonthlyEquivalent,
    totalMonthlyIncome,
    totalAnnualIncome,
    totalOneTimeIncomeThisYear,
    formatAmount
  } = useIncome()
  
  const { primaryCurrency, getCurrencySymbol } = useCurrency()

  // Only show error alert for actual errors, not empty states
  const shouldShowError = error && !incomeState.isEmpty

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Rental Property Income">
      <TabNavigation tabs={tabNavigationConfig.income} />
      
      {shouldShowError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <IncomeDashboard
        incomeSources={incomeSources}
        convertedIncomeSources={convertedIncomeSources}
        totalMonthlyIncome={totalMonthlyIncome}
        totalAnnualIncome={totalAnnualIncome}
        totalOneTimeIncomeThisYear={totalOneTimeIncomeThisYear}
        primaryCurrency={primaryCurrency}
        isLoading={isLoading}
        isConverting={isConverting}
        incomeState={incomeState}
        onAddIncome={addIncomeSource}
        onUpdateIncome={updateIncomeSource}
        onDeleteIncome={deleteIncomeSource}
        onAddOneTimeIncome={addOneTimeIncome}
        onUpdateOneTimeIncome={updateOneTimeIncome}
        onDeleteOneTimeIncome={deleteOneTimeIncome}
        calculateMonthlyEquivalent={calculateMonthlyEquivalent}
        formatAmount={formatAmount}
        getCurrencySymbol={getCurrencySymbol}
        filterByType="rental"
      />
    </DashboardLayout>
  )
}