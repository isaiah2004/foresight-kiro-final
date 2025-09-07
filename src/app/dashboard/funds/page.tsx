import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"

export default function FundsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Funds" }
  ]

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Funds Management">
      <TabNavigation tabs={tabNavigationConfig.funds} />
      <div className="flex flex-1 flex-col gap-4 mt-6">
        <div className="rounded-xl bg-muted/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Financial Goals Overview</h2>
              <p className="text-muted-foreground">
                Manage all your financial goals through Pots, Saving funds, and other objectives.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">$258,600</div>
              <p className="text-sm text-muted-foreground">Total saved across all funds</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="font-semibold">16</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Auto</p>
                <p className="font-semibold">$7,250</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-xl">⏰</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="font-semibold">3</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-semibold">1</p>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Pots</h3>
                <p className="text-sm text-blue-700">Goal-based savings</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">4 Active Goals</span>
                <span className="font-medium text-blue-900">$35,750</span>
              </div>
              <div className="bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <p className="text-xs text-blue-600">68% of targets achieved</p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Saving Funds</h3>
                <p className="text-sm text-green-700">Structured savings</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">5 Active Funds</span>
                <span className="font-medium text-green-900">$178,050</span>
              </div>
              <div className="bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-xs text-green-600">$4,800/month auto-save</p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🌟</span>
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Other Funds</h3>
                <p className="text-sm text-purple-700">Miscellaneous goals</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-600">7 Various Funds</span>
                <span className="font-medium text-purple-900">$44,800</span>
              </div>
              <div className="bg-purple-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '38%' }}></div>
              </div>
              <p className="text-xs text-purple-600">6 categories covered</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}