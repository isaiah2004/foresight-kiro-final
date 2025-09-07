import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Plus, Target, Calendar, DollarSign, TrendingUp } from "lucide-react"

// Mock data for demonstration
const mockPots = [
  {
    id: "1",
    name: "Vacation Fund",
    description: "Trip to Japan in 2025",
    targetAmount: 5000,
    currentAmount: 2750,
    currency: "USD",
    goalType: "vacation" as const,
    targetDate: new Date("2025-06-01"),
    linkedCategories: ["savingsFuture", "sinkingFund"],
    isCompleted: false,
  },
  {
    id: "2", 
    name: "Emergency Fund",
    description: "6 months of expenses",
    targetAmount: 15000,
    currentAmount: 12000,
    currency: "USD",
    goalType: "other" as const,
    linkedCategories: ["savingsFuture"],
    isCompleted: false,
  },
  {
    id: "3",
    name: "New Laptop",
    description: "MacBook Pro for work",
    targetAmount: 2500,
    currentAmount: 2500,
    currency: "USD", 
    goalType: "laptop" as const,
    targetDate: new Date("2024-12-01"),
    linkedCategories: ["sinkingFund"],
    isCompleted: true,
  },
  {
    id: "4",
    name: "House Down Payment",
    description: "20% down payment for house",
    targetAmount: 60000,
    currentAmount: 18500,
    currency: "USD",
    goalType: "house-downpayment" as const,
    targetDate: new Date("2026-03-01"),
    linkedCategories: ["savingsFuture"],
    isCompleted: false,
  }
]

export default function PotsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Funds", href: "/dashboard/funds" },
    { title: "Pots" }
  ]

  const activePots = mockPots.filter(pot => !pot.isCompleted)
  const completedPots = mockPots.filter(pot => pot.isCompleted)
  const totalSaved = mockPots.reduce((sum, pot) => sum + pot.currentAmount, 0)
  const totalTarget = mockPots.reduce((sum, pot) => sum + pot.targetAmount, 0)

  const getGoalTypeIcon = (goalType: string) => {
    switch (goalType) {
      case 'vacation':
        return '✈️'
      case 'house-downpayment':
        return '🏠'
      case 'laptop':
        return '💻'
      default:
        return '🎯'
    }
  }

  const getGoalTypeColor = (goalType: string) => {
    switch (goalType) {
      case 'vacation':
        return 'bg-blue-100 text-blue-800'
      case 'house-downpayment':
        return 'bg-green-100 text-green-800'
      case 'laptop':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Pots">
      <TabNavigation tabs={tabNavigationConfig.funds} />
      <div className="flex flex-1 flex-col gap-6 mt-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSaved, 'USD')}</div>
              <p className="text-xs text-muted-foreground">
                Across {mockPots.length} pots
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Target</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalTarget, 'USD')}</div>
              <p className="text-xs text-muted-foreground">
                {((totalSaved / totalTarget) * 100).toFixed(1)}% achieved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Pots</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePots.length}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedPots.length}</div>
              <p className="text-xs text-muted-foreground">
                Goals achieved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Pots</h2>
            <p className="text-muted-foreground">Manage your financial goals and savings targets</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Pot
          </Button>
        </div>

        {/* Active Pots */}
        {activePots.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Pots</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activePots.map((pot) => (
                <Card key={pot.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getGoalTypeIcon(pot.goalType)}</span>
                        <div>
                          <CardTitle className="text-lg">{pot.name}</CardTitle>
                          <CardDescription>{pot.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getGoalTypeColor(pot.goalType)}>
                        {pot.goalType.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {formatCurrency(pot.currentAmount, pot.currency)} / {formatCurrency(pot.targetAmount, pot.currency)}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(pot.currentAmount, pot.targetAmount)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{getProgressPercentage(pot.currentAmount, pot.targetAmount).toFixed(1)}% complete</span>
                        <span>{formatCurrency(pot.targetAmount - pot.currentAmount, pot.currency)} remaining</span>
                      </div>
                    </div>

                    {pot.targetDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Target: {formatDate(pot.targetDate)}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Add Money
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Pots */}
        {completedPots.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold text-green-700">Completed Pots</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedPots.map((pot) => (
                <Card key={pot.id} className="bg-green-50 border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getGoalTypeIcon(pot.goalType)}</span>
                        <div>
                          <CardTitle className="text-lg text-green-800">{pot.name}</CardTitle>
                          <CardDescription className="text-green-600">{pot.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Completed ✓
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Goal Achieved</span>
                        <span className="font-medium text-green-800">
                          {formatCurrency(pot.targetAmount, pot.currency)}
                        </span>
                      </div>
                      <Progress value={100} className="h-2 bg-green-100" />
                    </div>

                    {pot.targetDate && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Calendar className="h-4 w-4" />
                        <span>Completed by: {formatDate(pot.targetDate)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {mockPots.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎯</div>
              <div>
                <h3 className="text-lg font-semibold">No pots created yet</h3>
                <p className="text-muted-foreground">Start by creating your first savings pot for a specific goal</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Pot
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
