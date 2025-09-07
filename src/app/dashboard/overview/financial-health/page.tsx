import { Suspense } from "react"
import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { FinancialHealthVisualization } from "@/components/shared/dashboard/financial-health-visualization"
import { FinancialHealthSkeleton } from "@/components/shared/skeletons/dashboard-skeleton"
import { tabNavigationConfig } from "@/lib/navigation-config"

export default function FinancialHealthPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Overview", href: "/dashboard/overview" },
    { title: "Financial Health" },
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Financial Health">
      <TabNavigation tabs={tabNavigationConfig.dashboard} />
      <Suspense fallback={<FinancialHealthSkeleton />}>
        <FinancialHealthVisualization />
      </Suspense>
    </DashboardLayout>
  )
}