"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PiggyBank, Target, TrendingUp, Calendar, Plus, CheckCircle, Clock, DollarSign, ArrowRight } from "lucide-react"

export default function FundsOverviewPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Funds", href: "/dashboard/funds" },
    { title: "Overview" }
  ]

  const fundsData = {
    totalSaved: 258600,
    activeGoals: 16,
    monthlyAutoSave: 7250,
    completedGoals: 1,
    dueThisMonth: 3
  }

  const goalCategories = [
    {
      name: "Pots",
      description: "Goal-based savings",
      activeGoals: 4,
      totalSaved: 35750,
      targetTotal: 52500,
      progress: 68.1,
      monthlyContribution: 1250,
      color: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-900",
      progressColor: "bg-blue-600",
      icon: "🎯",
      href: "/dashboard/funds/pots"
    },
    {
      name: "Saving Funds",
      description: "Structured long-term savings",
      activeGoals: 5,
      totalSaved: 178050,
      targetTotal: 590000,
      progress: 30.2,
      monthlyContribution: 4800,
      color: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-900",
      progressColor: "bg-green-600",
      icon: "💰",
      href: "/dashboard/funds/saving-funds"
    },
    {
      name: "Other Funds",
      description: "Miscellaneous financial goals",
      activeGoals: 7,
      totalSaved: 44800,
      targetTotal: 118000,
      progress: 38.0,
      monthlyContribution: 1200,
      color: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-900",
      progressColor: "bg-purple-600",
      icon: "🌟",
      href: "/dashboard/funds/other"
    }
  ]

  const activeGoals = [
    {
      id: 1,
      name: "Emergency Fund",
      category: "Pots",
      current: 16800,
      target: 24000,
      progress: 70,
      deadline: "2025-06-01",
      monthlyContribution: 500,
      priority: "High",
      status: "On Track"
    },
    {
      id: 2,
      name: "House Down Payment",
      category: "Pots",
      current: 45000,
      target: 80000,
      progress: 56.3,
      deadline: "2027-01-01",
      monthlyContribution: 1200,
      priority: "High",
      status: "On Track"
    },
    {
      id: 3,
      name: "401k Retirement",
      category: "Saving Funds",
      current: 125000,
      target: 500000,
      progress: 25,
      deadline: "2054-12-01",
      monthlyContribution: 2400,
      priority: "Medium",
      status: "On Track"
    },
    {
      id: 4,
      name: "Vacation Fund",
      category: "Other",
      current: 2200,
      target: 5000,
      progress: 44,
      deadline: "2025-08-01",
      monthlyContribution: 300,
      priority: "Low",
      status: "Behind"
    }
  ]

  const recentActivity = [
    { action: "Auto-save", fund: "Emergency Fund", amount: 500, date: "2024-12-01", type: "deposit" },
    { action: "Goal achieved", fund: "New Car Fund", amount: 25000, date: "2024-11-28", type: "completed" },
    { action: "Manual deposit", fund: "Vacation Fund", amount: 200, date: "2024-11-25", type: "deposit" },
    { action: "Auto-save", fund: "401k Retirement", amount: 2400, date: "2024-11-01", type: "deposit" }
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

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Funds Overview">
      <TabNavigation tabs={tabNavigationConfig.funds} />
      
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Funds Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${fundsData.totalSaved.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all funds
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fundsData.activeGoals}</div>
              <p className="text-xs text-muted-foreground">
                Currently saving for
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Auto-Save</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${fundsData.monthlyAutoSave.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Automated contributions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Goals</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fundsData.completedGoals}</div>
              <p className="text-xs text-muted-foreground">
                This year
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fund Categories Overview */}
        <motion.div 
          className="grid gap-4 md:grid-cols-3"
          variants={itemVariants}
        >
          {goalCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl bg-gradient-to-br ${category.color} p-6 border ${category.borderColor} cursor-pointer`}
              onClick={() => window.location.href = category.href}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/80 rounded-lg">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <div>
                  <h3 className={`font-semibold ${category.textColor}`}>{category.name}</h3>
                  <p className="text-sm opacity-80">{category.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{category.activeGoals} Active Goals</span>
                  <span className={`font-medium ${category.textColor}`}>
                    ${category.totalSaved.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/30 rounded-full h-2">
                  <div 
                    className={`${category.progressColor} h-2 rounded-full`} 
                    style={{ width: `${category.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs opacity-80">
                  <span>{category.progress.toFixed(1)}% of targets</span>
                  <span>${category.monthlyContribution}/month</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Active Goals and Recent Activity */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Goals</CardTitle>
                  <CardDescription>Your current savings goals and progress</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{goal.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{goal.category}</Badge>
                          <Badge 
                            variant={goal.priority === 'High' ? 'destructive' : goal.priority === 'Medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {goal.priority}
                          </Badge>
                          <Badge 
                            variant={goal.status === 'On Track' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {goal.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${goal.current.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">of ${goal.target.toLocaleString()}</div>
                      </div>
                    </div>
                    <Progress value={goal.progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{goal.progress.toFixed(1)}% complete</span>
                      <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest transactions and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className={`p-2 rounded-full ${
                      activity.type === 'completed' ? 'bg-green-100' :
                      activity.type === 'deposit' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {activity.type === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : activity.type === 'deposit' ? (
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">{activity.fund}</div>
                      <div className="text-xs text-muted-foreground">{activity.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        activity.type === 'completed' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        ${activity.amount.toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fund Management Tools */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Fund Management Tools</CardTitle>
              <CardDescription>Tools to optimize your savings strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { 
                    name: "Goal Calculator", 
                    description: "Calculate how much to save monthly", 
                    icon: Target,
                    action: "Calculate"
                  },
                  { 
                    name: "Auto-Save Setup", 
                    description: "Automate your savings contributions", 
                    icon: TrendingUp,
                    action: "Setup"
                  },
                  { 
                    name: "Progress Tracker", 
                    description: "Monitor goal completion timeline", 
                    icon: Clock,
                    action: "Track"
                  },
                  { 
                    name: "Goal Optimizer", 
                    description: "Optimize allocation across goals", 
                    icon: CheckCircle,
                    action: "Optimize"
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
