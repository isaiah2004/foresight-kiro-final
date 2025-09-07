"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Shield, Plus } from "lucide-react"

export default function BondsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Bonds" }
  ]

  const bondHoldings = [
    {
      id: 1,
      name: "US Treasury 10-Year",
      symbol: "UST-10Y",
      currentValue: 9750,
      invested: 10000,
      return: -2.5,
      yield: 4.2,
      maturity: "2034-03-15",
      rating: "AAA",
      duration: "8.5 years"
    },
    {
      id: 2,
      name: "Corporate Bond - Apple Inc",
      symbol: "AAPL-2029",
      currentValue: 5200,
      invested: 5000,
      return: 4.0,
      yield: 3.8,
      maturity: "2029-11-20",
      rating: "AA+",
      duration: "4.2 years"
    },
    {
      id: 3,
      name: "Municipal Bond - NYC",
      symbol: "NYC-MUNI",
      currentValue: 3100,
      invested: 3000,
      return: 3.3,
      yield: 3.5,
      maturity: "2032-06-30",
      rating: "AA",
      duration: "6.8 years"
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

  const totalValue = bondHoldings.reduce((sum, bond) => sum + bond.currentValue, 0)
  const totalInvested = bondHoldings.reduce((sum, bond) => sum + bond.invested, 0)
  const totalReturn = ((totalValue - totalInvested) / totalInvested) * 100

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Bond Investments">
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
              <CardTitle className="text-sm font-medium">Avg Yield</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.8%</div>
              <p className="text-xs text-muted-foreground">
                Weighted average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.5</div>
              <p className="text-xs text-muted-foreground">
                Years (avg)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bond Holdings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bond Holdings</CardTitle>
                  <CardDescription>Your current bond portfolio</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bond
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bondHoldings.map((bond, index) => (
                  <motion.div
                    key={bond.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold">{bond.name}</h3>
                          <p className="text-sm text-muted-foreground">{bond.symbol}</p>
                        </div>
                        <Badge variant={bond.rating === 'AAA' ? 'default' : 'secondary'}>
                          {bond.rating}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Value</p>
                          <p className="font-medium">${bond.currentValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Yield</p>
                          <p className="font-medium">{bond.yield}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Maturity</p>
                          <p className="font-medium">{bond.maturity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{bond.duration}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${bond.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {bond.return >= 0 ? '+' : ''}{bond.return.toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${(bond.currentValue - bond.invested >= 0 ? '+' : '')}
                        {(bond.currentValue - bond.invested).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bond Allocation Chart */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Bond Type Allocation</CardTitle>
              <CardDescription>Distribution by bond type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Government Bonds</span>
                  <span>54.7%</span>
                </div>
                <Progress value={54.7} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Corporate Bonds</span>
                  <span>29.2%</span>
                </div>
                <Progress value={29.2} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Municipal Bonds</span>
                  <span>16.1%</span>
                </div>
                <Progress value={16.1} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maturity Timeline</CardTitle>
              <CardDescription>Bonds maturing by year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">2029</span>
                  <div className="flex-1 mx-3">
                    <Progress value={29.2} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">$5,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">2032</span>
                  <div className="flex-1 mx-3">
                    <Progress value={16.1} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">$3,100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">2034</span>
                  <div className="flex-1 mx-3">
                    <Progress value={54.7} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">$9,750</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
