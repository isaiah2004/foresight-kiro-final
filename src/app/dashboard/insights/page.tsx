"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, PieChart, Target, Shield, AlertTriangle, CheckCircle, Info, ArrowUpRight, ArrowDownRight, DollarSign, Calendar } from "lucide-react"

export default function InsightsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Insights" }
  ]

  const insightsData = {
    financialHealthScore: 78,
    riskProfile: "Moderate",
    projectedRetirement: "2054",
    emergencyFundRatio: 4.2
  }

  const recommendations = [
    {
      id: 1,
      title: "Increase Emergency Fund",
      description: "Build your emergency fund to 6 months of expenses",
      priority: "High",
      impact: "High",
      category: "Safety",
      action: "Save an additional $3,200",
      icon: Shield,
      color: "bg-red-500"
    },
    {
      id: 2,
      title: "Optimize Investment Portfolio",
      description: "Rebalance your portfolio for better diversification",
      priority: "Medium",
      impact: "Medium",
      category: "Growth",
      action: "Review asset allocation",
      icon: BarChart3,
      color: "bg-blue-500"
    },
    {
      id: 3,
      title: "Reduce High-Interest Debt",
      description: "Focus on paying off credit card debt first",
      priority: "High",
      impact: "High",
      category: "Debt",
      action: "Pay $200 extra monthly",
      icon: AlertTriangle,
      color: "bg-orange-500"
    },
    {
      id: 4,
      title: "Increase Retirement Contributions",
      description: "Maximize your 401k employer match",
      priority: "Medium",
      impact: "High",
      category: "Retirement",
      action: "Increase by 2%",
      icon: Target,
      color: "bg-green-500"
    }
  ]

  const riskAnalysis = [
    { category: "Market Risk", score: 65, status: "Moderate", description: "Your investment portfolio has moderate market exposure" },
    { category: "Credit Risk", score: 85, status: "Low", description: "Strong credit history with minimal default risk" },
    { category: "Liquidity Risk", score: 40, status: "High", description: "Limited liquid assets for emergencies" },
    { category: "Interest Rate Risk", score: 70, status: "Moderate", description: "Some exposure to interest rate fluctuations" }
  ]

  const financialGoals = [
    { name: "Emergency Fund", current: 16800, target: 24000, progress: 70, timeframe: "6 months" },
    { name: "House Down Payment", current: 45000, target: 80000, progress: 56.3, timeframe: "3 years" },
    { name: "Retirement", current: 125000, target: 1500000, progress: 8.3, timeframe: "30 years" },
    { name: "Vacation Fund", current: 2200, target: 5000, progress: 44, timeframe: "1 year" }
  ]

  const monthlyTrends = [
    { month: "Jul", income: 8200, expenses: 5800, savings: 2400, savingsRate: 29.3 },
    { month: "Aug", income: 8450, expenses: 6100, savings: 2350, savingsRate: 27.8 },
    { month: "Sep", income: 8100, expenses: 5900, savings: 2200, savingsRate: 27.2 },
    { month: "Oct", income: 8650, expenses: 6200, savings: 2450, savingsRate: 28.3 },
    { month: "Nov", income: 8450, expenses: 5950, savings: 2500, savingsRate: 29.6 },
    { month: "Dec", income: 8750, expenses: 6300, savings: 2450, savingsRate: 28.0 }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "secondary"
    if (score >= 60) return "default"
    return "destructive"
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Financial Insights">
      <TabNavigation tabs={tabNavigationConfig.insights} />
      
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Financial Health Overview */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financial Health Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(insightsData.financialHealthScore)}`}>
                {insightsData.financialHealthScore}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 100
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Profile</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insightsData.riskProfile}</div>
              <p className="text-xs text-muted-foreground">
                Investment tolerance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{insightsData.emergencyFundRatio}</div>
              <p className="text-xs text-muted-foreground">
                Months of expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retirement Goal</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insightsData.projectedRetirement}</div>
              <p className="text-xs text-muted-foreground">
                Projected retirement
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve your financial health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${rec.color}`}>
                        <rec.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{rec.title}</h3>
                          <Badge variant={rec.priority === 'High' ? 'destructive' : 'default'}>
                            {rec.priority} Priority
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{rec.description}</p>
                        <p className="text-sm font-medium text-primary">{rec.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={rec.impact === 'High' ? 'default' : 'secondary'}>
                        {rec.impact} Impact
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Analysis and Financial Goals */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Assessment of various financial risks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskAnalysis.map((risk, index) => (
                <motion.div 
                  key={risk.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{risk.category}</span>
                    <Badge variant={getScoreBadge(risk.score)} className="text-xs">
                      {risk.status}
                    </Badge>
                  </div>
                  <Progress value={risk.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{risk.description}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Goals Progress</CardTitle>
              <CardDescription>Track your progress toward financial objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {financialGoals.map((goal, index) => (
                <motion.div 
                  key={goal.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-muted-foreground">{goal.timeframe}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}</span>
                    <span className="font-medium">{goal.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings Trends and Performance */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Trends</CardTitle>
              <CardDescription>Track your income, expenses, and savings patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((month, index) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-medium text-sm w-12">{month.month}</div>
                      <div className="grid grid-cols-3 gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Income</p>
                          <p className="font-medium">${month.income.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expenses</p>
                          <p className="font-medium">${month.expenses.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Savings</p>
                          <p className="font-medium text-green-600">${month.savings.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{month.savingsRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Savings Rate</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insight Tools */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Financial Analysis Tools</CardTitle>
              <CardDescription>Advanced tools for deeper financial insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { 
                    name: "Risk Profiler", 
                    description: "Assess your investment risk tolerance", 
                    icon: Shield,
                    action: "Analyze"
                  },
                  { 
                    name: "Tax Optimizer", 
                    description: "Identify tax-saving opportunities", 
                    icon: DollarSign,
                    action: "Optimize"
                  },
                  { 
                    name: "Retirement Planner", 
                    description: "Plan your retirement strategy", 
                    icon: Target,
                    action: "Plan"
                  },
                  { 
                    name: "Goal Tracker", 
                    description: "Monitor progress toward financial goals", 
                    icon: CheckCircle,
                    action: "Track"
                  }
                ].map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-center"
                  >
                    <tool.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{tool.description}</p>
                    <Button size="sm" variant="outline" className="text-xs">
                      {tool.action}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}