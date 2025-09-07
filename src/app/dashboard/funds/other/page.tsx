import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Plus, Gift, Car, Briefcase, Heart, Coffee, Sparkles, DollarSign, Calendar, Target } from "lucide-react"

// Mock data for other funds
const mockOtherFunds = [
  {
    id: "1",
    name: "Wedding Fund",
    description: "Dream wedding savings",
    targetAmount: 25000,
    currentAmount: 12500,
    currency: "USD",
    category: "life-events" as const,
    priority: "high" as const,
    autoContribute: true,
    monthlyContribution: 1000,
    targetDate: new Date("2025-09-15"),
    tags: ["wedding", "celebration", "family"],
    isActive: true,
  },
  {
    id: "2",
    name: "Car Replacement Fund",
    description: "Saving for next vehicle",
    targetAmount: 30000,
    currentAmount: 8500,
    currency: "USD",
    category: "transportation" as const,
    priority: "medium" as const,
    autoContribute: true,
    monthlyContribution: 600,
    targetDate: new Date("2026-01-01"),
    tags: ["car", "vehicle", "transportation"],
    isActive: true,
  },
  {
    id: "3",
    name: "Business Startup Fund",
    description: "Capital for new business venture",
    targetAmount: 50000,
    currentAmount: 15750,
    currency: "USD",
    category: "business" as const,
    priority: "high" as const,
    autoContribute: false,
    monthlyContribution: 0,
    targetDate: new Date("2025-12-01"),
    tags: ["business", "entrepreneurship", "investment"],
    isActive: true,
  },
  {
    id: "4",
    name: "Gift Fund",
    description: "Holiday and birthday gifts",
    targetAmount: 3000,
    currentAmount: 1800,
    currency: "USD",
    category: "lifestyle" as const,
    priority: "low" as const,
    autoContribute: true,
    monthlyContribution: 200,
    tags: ["gifts", "holidays", "family"],
    isActive: true,
  },
  {
    id: "5",
    name: "Hobby Equipment",
    description: "Photography gear and accessories",
    targetAmount: 5000,
    currentAmount: 3200,
    currency: "USD",
    category: "hobbies" as const,
    priority: "low" as const,
    autoContribute: false,
    monthlyContribution: 0,
    tags: ["photography", "hobby", "equipment"],
    isActive: true,
  },
  {
    id: "6",
    name: "Coffee Shop Fund",
    description: "Monthly coffee and treats budget",
    targetAmount: 1200,
    currentAmount: 950,
    currency: "USD",
    category: "lifestyle" as const,
    priority: "low" as const,
    autoContribute: true,
    monthlyContribution: 100,
    tags: ["coffee", "treats", "lifestyle"],
    isActive: true,
  },
  {
    id: "7",
    name: "Pet Care Fund",
    description: "Veterinary bills and pet supplies",
    targetAmount: 4000,
    currentAmount: 2100,
    currency: "USD",
    category: "healthcare" as const,
    priority: "medium" as const,
    autoContribute: true,
    monthlyContribution: 150,
    tags: ["pets", "veterinary", "healthcare"],
    isActive: true,
  }
]

export default function OtherFundsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Funds", href: "/dashboard/funds" },
    { title: "Other" }
  ]

  const totalSaved = mockOtherFunds.reduce((sum, fund) => sum + fund.currentAmount, 0)
  const totalTarget = mockOtherFunds.reduce((sum, fund) => sum + fund.targetAmount, 0)
  const monthlyContributions = mockOtherFunds.reduce((sum, fund) => 
    fund.autoContribute ? sum + fund.monthlyContribution : sum, 0
  )

  const categorizedFunds = mockOtherFunds.reduce((acc, fund) => {
    if (!acc[fund.category]) {
      acc[fund.category] = []
    }
    acc[fund.category].push(fund)
    return acc
  }, {} as Record<string, typeof mockOtherFunds>)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'life-events':
        return <Heart className="h-5 w-5 text-pink-600" />
      case 'transportation':
        return <Car className="h-5 w-5 text-blue-600" />
      case 'business':
        return <Briefcase className="h-5 w-5 text-green-600" />
      case 'lifestyle':
        return <Coffee className="h-5 w-5 text-orange-600" />
      case 'hobbies':
        return <Sparkles className="h-5 w-5 text-purple-600" />
      case 'healthcare':
        return <Heart className="h-5 w-5 text-red-600" />
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'life-events':
        return 'bg-pink-50 border-pink-200'
      case 'transportation':
        return 'bg-blue-50 border-blue-200'
      case 'business':
        return 'bg-green-50 border-green-200'
      case 'lifestyle':
        return 'bg-orange-50 border-orange-200'
      case 'hobbies':
        return 'bg-purple-50 border-purple-200'
      case 'healthcare':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
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

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getMonthsToTarget = (current: number, target: number, monthlyContribution: number) => {
    if (monthlyContribution <= 0) return null
    return Math.ceil((target - current) / monthlyContribution)
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Other Funds">
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
                Across {mockOtherFunds.length} funds
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
              <CardTitle className="text-sm font-medium">Monthly Auto</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyContributions, 'USD')}</div>
              <p className="text-xs text-muted-foreground">
                Auto contributions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(categorizedFunds).length}</div>
              <p className="text-xs text-muted-foreground">
                Fund categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Other Funds</h2>
            <p className="text-muted-foreground">Miscellaneous savings for various goals and needs</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Fund
          </Button>
        </div>

        {/* Categorized Funds */}
        {Object.entries(categorizedFunds).map(([category, funds], index) => (
          <div key={category} className="space-y-4">
            {index > 0 && <Separator />}
            <div className="flex items-center gap-3">
              {getCategoryIcon(category)}
              <h3 className="text-lg font-semibold">{formatCategoryName(category)}</h3>
              <Badge variant="outline">{funds.length} funds</Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {funds.map((fund) => (
                <Card key={fund.id} className={`hover:shadow-md transition-shadow ${getCategoryColor(fund.category)}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(fund.category)}
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
                          <Badge variant="outline" className="text-xs">
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
                          <span className="text-muted-foreground">Monthly:</span>
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

                    {/* Tags */}
                    {fund.tags && fund.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {fund.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {fund.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{fund.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Add Money
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Fund Ideas Section */}
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fund Ideas</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold">Holiday Fund</h4>
                <p className="text-sm text-muted-foreground">Save for holiday expenses</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">Home Improvement</h4>
                <p className="text-sm text-muted-foreground">Upgrade your living space</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">Professional Development</h4>
                <p className="text-sm text-muted-foreground">Invest in your career</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold">Special Occasions</h4>
                <p className="text-sm text-muted-foreground">Weddings, anniversaries, etc.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Empty State */}
        {mockOtherFunds.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">🌟</div>
              <div>
                <h3 className="text-lg font-semibold">No other funds created yet</h3>
                <p className="text-muted-foreground">Create funds for your miscellaneous financial goals and needs</p>
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
