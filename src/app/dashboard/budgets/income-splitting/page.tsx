import { Suspense } from "react"
import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { BudgetAllocationInterface } from "@/components/shared/budgets/budget-allocation-interface"
import { Skeleton } from "@/components/ui/skeleton"
import { tabNavigationConfig } from "@/lib/navigation-config"

function BudgetAllocationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function IncomeSplittingPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Budgets", href: "/dashboard/budgets" },
    { title: "Income Splitting" },
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Income Splitting">
      <TabNavigation tabs={tabNavigationConfig.budgets} />
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-lg font-semibold mb-2">6-Category Budget System</h2>
          <p className="text-muted-foreground">
            Allocate your income across six categories: Essentials (50%), Lifestyle (20%), 
            Savings & Future (20%), Sinking Fund (10%), Unallocated, and Misc. 
            This system helps you maintain a balanced approach to spending and saving.
          </p>
        </div>
        
        <Suspense fallback={<BudgetAllocationSkeleton />}>
          <BudgetAllocationInterface />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}