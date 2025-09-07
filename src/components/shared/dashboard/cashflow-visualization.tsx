"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CashflowData {
  month: string
  income: number
  expenses: number
  netFlow: number
}

const mockCashflowData: CashflowData[] = [
  { month: "Jan", income: 8500, expenses: 6200, netFlow: 2300 },
  { month: "Feb", income: 8500, expenses: 5800, netFlow: 2700 },
  { month: "Mar", income: 9200, expenses: 6100, netFlow: 3100 },
  { month: "Apr", income: 8500, expenses: 6400, netFlow: 2100 },
  { month: "May", income: 8500, expenses: 5900, netFlow: 2600 },
  { month: "Jun", income: 8800, expenses: 6300, netFlow: 2500 },
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

export function CashflowVisualization() {
  const currentMonth = mockCashflowData[mockCashflowData.length - 1]
  const avgNetFlow = mockCashflowData.reduce((sum, data) => sum + data.netFlow, 0) / mockCashflowData.length

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-bold">Cashflow Analysis</h2>
          <p className="text-muted-foreground">Track your income and expenses over time</p>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Last 6 months
        </Button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cashflow Trend</CardTitle>
              <CardDescription>
                Income vs Expenses comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between space-x-2 p-4">
                {mockCashflowData.map((data, index) => {
                  const maxValue = Math.max(...mockCashflowData.map(d => Math.max(d.income, d.expenses)))
                  const incomeHeight = (data.income / maxValue) * 250
                  const expenseHeight = (data.expenses / maxValue) * 250
                  
                  return (
                    <motion.div
                      key={data.month}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex-1 flex flex-col items-center space-y-2"
                    >
                      <div className="flex space-x-1 items-end">
                        <div
                          className="w-4 bg-green-500 rounded-t"
                          style={{ height: `${incomeHeight}px` }}
                          title={`Income: $${data.income.toLocaleString()}`}
                        />
                        <div
                          className="w-4 bg-red-500 rounded-t"
                          style={{ height: `${expenseHeight}px` }}
                          title={`Expenses: $${data.expenses.toLocaleString()}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{data.month}</span>
                    </motion.div>
                  )
                })}
              </div>
              
              <div className="flex justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                  <span>Income</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2" />
                  <span>Expenses</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-4 md:grid-cols-3"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">${currentMonth.netFlow.toLocaleString()}</p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Net cashflow for {currentMonth.month}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average</p>
                  <p className="text-2xl font-bold">${Math.round(avgNetFlow).toLocaleString()}</p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                6-month average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round((currentMonth.netFlow / currentMonth.income) * 100)}%
                  </p>
                </div>
                <ArrowDownRight className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Of total income
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}