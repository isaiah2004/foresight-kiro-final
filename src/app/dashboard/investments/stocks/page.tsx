"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { StocksDashboard } from "@/components/shared/investments/stocks-dashboard"
import { StockInvestmentForm } from "@/components/shared/investments/stock-investment-form"
import { useInvestments } from "@/hooks/use-investments"
import { useCurrency } from "@/hooks/use-currency"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useMemo } from "react"

export default function StocksPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Stocks" }
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

  // Filter only stock investments
  const stockInvestments = useMemo(() => 
    investments.filter(inv => inv.type === 'stock'), 
    [investments]
  )

  const handleAddInvestment = async (data: any) => {
    await addInvestment({
      symbol: data.symbol,
      type: data.type || 'stock',
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseCurrency: data.purchaseCurrency,
      purchaseDate: data.purchaseDate,
      metadata: {
        companyName: data.companyName,
        brokerageAccount: data.brokerageAccount,
        orderType: data.orderType,
        dividendYield: data.dividendYield,
        notes: data.notes
      }
    })
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Stock Investments">
      <TabNavigation tabs={tabNavigationConfig.investments} />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <StocksDashboard
        investments={stockInvestments}
        primaryCurrency={primaryCurrency}
        isLoading={isLoading}
        onAddInvestment={handleAddInvestment}
        onUpdatePrices={updatePrices}
        lastPriceUpdate={lastPriceUpdate || undefined}
      />
    </DashboardLayout>
  )
}
