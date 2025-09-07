"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { InvestmentOverview } from "@/components/shared/investments/investment-overview"
import { useInvestments } from "@/hooks/use-investments"
import { useCurrency } from "@/hooks/use-currency"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function InvestmentsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments" }
  ]

  const { 
    investments, 
    isLoading, 
    error, 
    addInvestment, 
    updatePrices, 
    lastPriceUpdate 
  } = useInvestments()
  
  const { primaryCurrency } = useCurrency()

  const handleAddInvestment = async (data: any) => {
    await addInvestment({
      symbol: data.symbol,
      type: data.type,
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseCurrency: data.purchaseCurrency,
      purchaseDate: data.purchaseDate
    })
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Investment Portfolio">
      <TabNavigation tabs={tabNavigationConfig.investments} />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <InvestmentOverview
        investments={investments}
        primaryCurrency={primaryCurrency}
        isLoading={isLoading}
        onAddInvestment={handleAddInvestment}
        onUpdatePrices={updatePrices}
        lastPriceUpdate={lastPriceUpdate || undefined}
      />
    </DashboardLayout>
  )
}