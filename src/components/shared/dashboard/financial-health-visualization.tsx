"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FinancialMetric {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ComponentType<{ className?: string }>
}

const mockMetrics: FinancialMetric[] = [
  {
    title: "Net Worth",
    value: "$125,430",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Monthly Savings",
    value: "$2,340",
    change: "+8.2%",
    trend: "up",
    icon: PiggyBank,
  },
  {
    title: "Investment Growth",
    value: "$45,230",
    change: "+15.3%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Debt Reduction",
    value: "$8,750",
    change: "-5.4%",
    trend: "down",
    icon: TrendingDown,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export function FinancialHealthVisualization() {
  return (
    <div className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {mockMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div key={metric.title} variants={itemVariants}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs flex items-center ${
                    metric.trend === "up" 
                      ? "text-green-600" 
                      : metric.trend === "down" 
                      ? "text-red-600" 
                      : "text-muted-foreground"
                  }`}>
                    {metric.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                    {metric.trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                    {metric.change} from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Financial Health Score</CardTitle>
            <CardDescription>
              Based on your income, expenses, and savings rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px]">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">85</div>
                <div className="text-sm text-muted-foreground">Excellent</div>
                <div className="w-32 h-2 bg-gray-200 rounded-full mt-4 mx-auto">
                  <div className="w-[85%] h-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              Monthly budget allocation and spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Essentials", percentage: 50, spent: 45 },
                { category: "Lifestyle", percentage: 20, spent: 18 },
                { category: "Savings", percentage: 20, spent: 22 },
                { category: "Sinking Fund", percentage: 10, spent: 8 },
              ].map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.category}</span>
                    <span>{item.spent}% / {item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.spent <= item.percentage ? "bg-green-600" : "bg-red-600"
                      }`}
                      style={{ width: `${Math.min(item.spent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}