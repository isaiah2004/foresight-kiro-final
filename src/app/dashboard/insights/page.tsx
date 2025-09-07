import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"

export default function InsightsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Insights" }
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Financial Insights">
      <div className="flex flex-1 flex-col gap-4">
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-lg font-semibold mb-4">Analytics & Insights</h2>
          <p className="text-muted-foreground">
            Get detailed insights about your financial health with risk profiling and actionable recommendations.
          </p>
        </div>
        <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 flex items-center justify-center">
          <p className="text-muted-foreground">Financial Analytics Interface</p>
        </div>
      </div>
    </DashboardLayout>
  )
}