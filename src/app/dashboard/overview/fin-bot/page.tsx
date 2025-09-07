import { Suspense } from "react"
import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { FinBotIntegration } from "@/components/shared/dashboard/fin-bot-integration"
import { FinBotSkeleton } from "@/components/shared/skeletons/dashboard-skeleton"
import { tabNavigationConfig } from "@/lib/navigation-config"

export default function FinBotPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Overview", href: "/dashboard/overview" },
    { title: "Fin Bot" },
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Fin Bot">
      <TabNavigation tabs={tabNavigationConfig.dashboard} />
      <Suspense fallback={<FinBotSkeleton />}>
        <FinBotIntegration />
      </Suspense>
    </DashboardLayout>
  )
}