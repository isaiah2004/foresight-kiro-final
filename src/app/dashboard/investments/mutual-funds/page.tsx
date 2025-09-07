"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function MutualFundsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Mutual Funds" }
  ]

  const fundHoldings = [
    {
      id: 1,
      name: "Vanguard 500 Index Fund",
      symbol: "VFIAX",
      currentValue: 15750,
      invested: 14000,
      shares: 45.32,
      return: 12.5,
      expenseRatio: 0.04,
      category: "Large Cap Blend",
      morningstarRating: 5
    },
    {
      id: 2,
      name: "Fidelity Total Market Index",
      symbol: "FZROX",
      currentValue: 8900,
      invested: 8200,
      shares: 78.15,
      return: 8.5,
      expenseRatio: 0.00,
      category: "Large Cap Blend",
      morningstarRating: 4
    },
    {
      id: 3,
      name: "Vanguard Small Cap Index",
      symbol: "VSMAX",
      currentValue: 4200,
      invested: 4500,
      shares: 52.8,
      return: -6.7,
      expenseRatio: 0.05,
      category: "Small Cap Blend",
      morningstarRating: 4
    },
    {
      id: 4,
      name: "Vanguard International Stock",
      symbol: "VTIAX",
      currentValue: 6800,
      invested: 6000,
      shares: 198.5,
      return: 13.3,
      expenseRatio: 0.11,
      category: "Foreign Large Blend",
      morningstarRating: 5
    }
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

  const totalValue = fundHoldings.reduce((sum, fund) => sum + fund.currentValue, 0)
  const totalInvested = fundHoldings.reduce((sum, fund) => sum + fund.invested, 0)
  const totalReturn = ((totalValue - totalInvested) / totalInvested) * 100
  const weightedExpenseRatio = fundHoldings.reduce((sum, fund) => 
    sum + (fund.expenseRatio * (fund.currentValue / totalValue)), 0
  )

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Mutual Funds">
      <TabNavigation tabs={tabNavigationConfig.investments} />
      
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Portfolio Summary */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +${(totalValue - totalInvested).toLocaleString()} from invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              {totalReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Since inception
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weightedExpenseRatio.toFixed(3)}%</div>
              <p className="text-xs text-muted-foreground">
                Weighted average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funds Count</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fundHoldings.length}</div>
              <p className="text-xs text-muted-foreground">
                Active holdings
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fund Holdings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mutual Fund Holdings</CardTitle>
                  <CardDescription>Your current fund portfolio</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fund
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fundHoldings.map((fund, index) => (
                  <motion.div
                    key={fund.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold">{fund.name}</h3>
                          <p className="text-sm text-muted-foreground">{fund.symbol}</p>
                        </div>
                        <Badge variant="outline">
                          {fund.category}
                        </Badge>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`text-xs ${i < fund.morningstarRating ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Value</p>
                          <p className="font-medium">${fund.currentValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Shares</p>
                          <p className="font-medium">{fund.shares.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expense Ratio</p>
                          <p className="font-medium">{fund.expenseRatio.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Allocation</p>
                          <p className="font-medium">{((fund.currentValue / totalValue) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Return</p>
                          <div className={`flex items-center font-medium ${fund.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fund.return >= 0 ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {fund.return >= 0 ? '+' : ''}{fund.return.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${fund.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(fund.currentValue - fund.invested >= 0 ? '+' : '')}
                        {(fund.currentValue - fund.invested).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        P&L
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis Charts */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Distribution by fund category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Large Cap Blend</span>
                  <span>{(((15750 + 8900) / totalValue) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={((15750 + 8900) / totalValue) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Foreign Large Blend</span>
                  <span>{((6800 / totalValue) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(6800 / totalValue) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Small Cap Blend</span>
                  <span>{((4200 / totalValue) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(4200 / totalValue) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>Year-to-date returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fundHoldings.map((fund) => (
                  <div key={fund.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{fund.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {fund.expenseRatio.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 mx-3">
                        <Progress value={Math.abs(fund.return) * 2} className="h-2" />
                      </div>
                      <span className={`text-sm font-medium ${fund.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fund.return >= 0 ? '+' : ''}{fund.return.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fund Research */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Fund Research</CardTitle>
              <CardDescription>Popular mutual funds you might consider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">FXNAX</h4>
                    <Badge variant="secondary">Bond Fund</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Fidelity U.S. Bond Index Fund
                  </p>
                  <div className="flex justify-between text-xs">
                    <span>Expense Ratio: 0.025%</span>
                    <span className="text-green-600">+2.1% YTD</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">VTSAX</h4>
                    <Badge variant="secondary">Total Market</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Vanguard Total Stock Market Index
                  </p>
                  <div className="flex justify-between text-xs">
                    <span>Expense Ratio: 0.03%</span>
                    <span className="text-green-600">+11.8% YTD</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">FXNAX</h4>
                    <Badge variant="secondary">Emerging Markets</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Fidelity Emerging Markets Index
                  </p>
                  <div className="flex justify-between text-xs">
                    <span>Expense Ratio: 0.035%</span>
                    <span className="text-red-600">-3.2% YTD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
