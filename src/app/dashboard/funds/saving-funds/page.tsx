import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Plus, Shield, TrendingUp, Calendar, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"

// Mock data for saving funds
const mockSavingFunds = [
  {
    id: "1",
    name: "Emergency Fund",
    description: "6 months of living expenses",
    targetAmount: 30000,
    currentAmount: 22500,
    currency: "USD",
    priority: "high" as const,
    autoContribute: true,
    monthlyContribution: 1500,
    targetDate: new Date("2025-03-01"),
    fundType: "emergency" as const,
    isActive: true,
  },
  {
    id: "2",
    name: "Retirement Savings",
    description: "Long-term retirement planning",
    targetAmount: 500000,
    currentAmount: 125000,
    currency: "USD",
    priority: "high" as const,
    autoContribute: true,
    monthlyContribution: 2000,
    fundType: "retirement" as const,
    isActive: true,
  },
  {
    id: "3",
    name: "Education Fund",
    description: "Professional development and courses",
    targetAmount: 10000,
    currentAmount: 6500,
    currency: "USD",
    priority: "medium" as const,
    autoContribute: true,
    monthlyContribution: 500,
    targetDate: new Date("2025-08-01"),
    fundType: "education" as const,
    isActive: true,
  },
  {
    id: "4",
    name: "Health Savings",
    description: "Medical expenses and health insurance",
    targetAmount: 15000,
    currentAmount: 8750,
    currency: "USD",
    priority: "high" as const,
    autoContribute: false,
    monthlyContribution: 0,
    fundType: "health" as const,
    isActive: true,
  },
  {
    id: "5",
    name: "General Savings",
    description: "Flexible savings for future opportunities",
    targetAmount: 25000,
    currentAmount: 15300,
    currency: "USD",
    priority: "low" as const,
    autoContribute: true,
    monthlyContribution: 800,
    fundType: "general" as const,
    isActive: true,
  }
]

export default function SavingFundsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Funds", href: "/dashboard/funds" },
    { title: "Saving Funds" }
  ]

  const totalSaved = mockSavingFunds.reduce((sum, fund) => sum + fund.currentAmount, 0)
  const totalTarget = mockSavingFunds.reduce((sum, fund) => sum + fund.targetAmount, 0)
  const monthlyContributions = mockSavingFunds.reduce((sum, fund) => 
    fund.autoContribute ? sum + fund.monthlyContribution : sum, 0
  )
  const highPriorityFunds = mockSavingFunds.filter(fund => fund.priority === 'high')

  const getFundTypeIcon = (fundType: string) => {
    switch (fundType) {
      case 'emergency':
        return <Shield className="h-5 w-5 text-red-600" />
      case 'retirement':
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case 'education':
        return <span className="text-lg">🎓</span>
      case 'health':
        return <span className="text-lg">🏥</span>
      case 'general':
        return <DollarSign className="h-5 w-5 text-green-600" />
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFundTypeBarColor = (fundType: string) => {
    switch (fundType) {
      case 'emergency':
        return 'bg-red-500'
      case 'retirement':
        return 'bg-blue-500'
      case 'education':
        return 'bg-purple-500'
      case 'health':
        return 'bg-green-500'
      case 'general':
        return 'bg-gray-100'
      default:
        return 'bg-gray-400'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getMonthsToTarget = (current: number, target: number, monthlyContribution: number) => {
    if (monthlyContribution <= 0) return null
    return Math.ceil((target - current) / monthlyContribution)
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Saving Funds">
      <TabNavigation tabs={tabNavigationConfig.funds} />
      <div className="flex flex-1 flex-col gap-6 mt-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSaved, 'USD')}</div>
              <p className="text-xs text-muted-foreground">
                {((totalSaved / totalTarget) * 100).toFixed(1)}% of target
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Contributions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyContributions, 'USD')}</div>
              <p className="text-xs text-muted-foreground">
                Auto-contributing funds
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highPriorityFunds.length}</div>
              <p className="text-xs text-muted-foreground">
                Critical funds
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funds</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSavingFunds.length}</div>
              <p className="text-xs text-muted-foreground">
                Active savings funds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Saving Funds</h2>
            <p className="text-muted-foreground">Build your financial security with structured savings</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Fund
          </Button>
        </div>

        {/* High Priority Funds */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">High Priority Funds</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {highPriorityFunds.map((fund) => (
              <Card key={fund.id} className="hover:shadow-md transition-shadow overflow-hidden rounded-3xl">
                <div className={`h-8 m-3 rounded-2xl ${getFundTypeBarColor(fund.fundType)}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFundTypeIcon(fund.fundType)}
                      <div>
                        <CardTitle className="text-lg">{fund.name}</CardTitle>
                        <CardDescription>{fund.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getPriorityColor(fund.priority)}>
                        {fund.priority}
                      </Badge>
                      {fund.autoContribute && (
                        <Badge variant="outline" className="text-xs text-center">
                          Auto
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {formatCurrency(fund.currentAmount, fund.currency)} / {formatCurrency(fund.targetAmount, fund.currency)}
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(fund.currentAmount, fund.targetAmount)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{getProgressPercentage(fund.currentAmount, fund.targetAmount).toFixed(1)}% complete</span>
                      <span>{formatCurrency(fund.targetAmount - fund.currentAmount, fund.currency)} remaining</span>
                    </div>
                  </div>

                  {fund.autoContribute && fund.monthlyContribution > 0 && (
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Contribution:</span>
                        <span className="font-medium">{formatCurrency(fund.monthlyContribution, fund.currency)}</span>
                      </div>
                      {(() => {
                        const months = getMonthsToTarget(fund.currentAmount, fund.targetAmount, fund.monthlyContribution)
                        return months && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Target in:</span>
                            <span className="font-medium">{months} months</span>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {fund.targetDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Target: {formatDate(fund.targetDate)}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Add Money
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* All Other Funds */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Saving Funds</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockSavingFunds.filter(fund => fund.priority !== 'high').map((fund) => (
              <Card key={fund.id} className="hover:shadow-md transition-shadow rounded-3xl overflow-hidden">
                <div className={`h-8 m-3 rounded-2xl ${getFundTypeBarColor(fund.fundType)}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFundTypeIcon(fund.fundType)}
                      <div>
                        <CardTitle className="text-lg">{fund.name}</CardTitle>
                        <CardDescription>{fund.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getPriorityColor(fund.priority)}>
                        {fund.priority}
                      </Badge>
                      {fund.autoContribute && (
                        <Badge variant="outline" className="text-xs text-center">
                          Auto
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {formatCurrency(fund.currentAmount, fund.currency)} / {formatCurrency(fund.targetAmount, fund.currency)}
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(fund.currentAmount, fund.targetAmount)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{getProgressPercentage(fund.currentAmount, fund.targetAmount).toFixed(1)}% complete</span>
                      <span>{formatCurrency(fund.targetAmount - fund.currentAmount, fund.currency)} remaining</span>
                    </div>
                  </div>

                  {fund.autoContribute && fund.monthlyContribution > 0 && (
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Contribution:</span>
                        <span className="font-medium">{formatCurrency(fund.monthlyContribution, fund.currency)}</span>
                      </div>
                      {(() => {
                        const months = getMonthsToTarget(fund.currentAmount, fund.targetAmount, fund.monthlyContribution)
                        return months && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Target in:</span>
                            <span className="font-medium">{months} months</span>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {fund.targetDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Target: {formatDate(fund.targetDate)}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Add Money
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {mockSavingFunds.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">💰</div>
              <div>
                <h3 className="text-lg font-semibold">No saving funds created yet</h3>
                <p className="text-muted-foreground">Start building your financial security with your first saving fund</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Fund
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
