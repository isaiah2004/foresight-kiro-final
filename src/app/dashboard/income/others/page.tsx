"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { IncomeDashboard } from "@/components/shared/income/income-dashboard"
import { useIncome } from "@/hooks/use-income"
import { useCurrency } from "@/hooks/use-currency"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function OthersPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Income", href: "/dashboard/income" },
    { title: "Others" }
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
    calculateMonthlyEquivalent,
    totalMonthlyIncome,
    totalAnnualIncome,
    formatAmount
  } = useIncome()
  
  const { primaryCurrency, getCurrencySymbol } = useCurrency()

  // Only show error alert for actual errors, not empty states
  const shouldShowError = error && !incomeState.isEmpty

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Other Income Sources">
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
        primaryCurrency={primaryCurrency}
        isLoading={isLoading}
        isConverting={isConverting}
        incomeState={incomeState}
        onAddIncome={addIncomeSource}
        onUpdateIncome={updateIncomeSource}
        onDeleteIncome={deleteIncomeSource}
        calculateMonthlyEquivalent={calculateMonthlyEquivalent}
        formatAmount={formatAmount}
        getCurrencySymbol={getCurrencySymbol}
        filterByType="other"
      />
    </DashboardLayout>
  )
}