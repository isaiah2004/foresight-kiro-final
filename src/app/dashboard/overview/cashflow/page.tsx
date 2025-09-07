import { Suspense } from "react"
import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { CashflowVisualization } from "@/components/shared/dashboard/cashflow-visualization"
import { CashflowSkeleton } from "@/components/shared/skeletons/dashboard-skeleton"
import { tabNavigationConfig } from "@/lib/navigation-config"

export default function CashflowPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Overview", href: "/dashboard/overview" },
    { title: "Cashflow" },
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Cashflow">
      <TabNavigation tabs={tabNavigationConfig.dashboard} />
      <Suspense fallback={<CashflowSkeleton />}>
        <CashflowVisualization />
      </Suspense>
    </DashboardLayout>
  )
}