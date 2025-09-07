import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { Settings, TrendingUp, Calendar, Target } from "lucide-react"

export default function BudgetManagePage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Budgets", href: "/dashboard/budgets" },
    { title: "Manage" },
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Budget Management">
      <TabNavigation tabs={tabNavigationConfig.budgets} />
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-lg font-semibold mb-2">Budget Management Center</h2>
          <p className="text-muted-foreground">
            Manage your overall budget settings, review allocations, and track your financial progress.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Budget Overview
              </CardTitle>
              <CardDescription>
                View your current budget allocation and spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Income</span>
                  <span className="font-medium">$5,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Allocated</span>
                  <span className="font-medium">$3,750</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unallocated</span>
                  <span className="font-medium text-green-600">$0</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                View Detailed Breakdown
              </Button>
            </CardContent>
          </Card>

          {/* Budget Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Budget Settings
              </CardTitle>
              <CardDescription>
                Adjust your budget preferences and allocation rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax Rate</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Primary Currency</span>
                  <span className="font-medium">USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget Period</span>
                  <span className="font-medium">Monthly</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Update Settings
              </Button>
            </CardContent>
          </Card>

          {/* Spending Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Spending Analysis
              </CardTitle>
              <CardDescription>
                Track your spending against budget allocations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-medium">$2,850 / $3,750</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium text-green-600">$900</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">On Track</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                View Spending Report
              </Button>
            </CardContent>
          </Card>

          {/* Goals & Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goals & Targets
              </CardTitle>
              <CardDescription>
                Monitor progress towards your financial goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Buckets</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Target</span>
                  <span className="font-medium">$20,900</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-blue-600">48%</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Manage Goals
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common budget management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Adjust Allocation</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Target className="h-6 w-6" />
                <span>Create New Bucket</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Calendar className="h-6 w-6" />
                <span>Review Monthly</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}