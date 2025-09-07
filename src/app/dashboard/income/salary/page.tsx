"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Calendar, TrendingUp, Settings, Plus, Edit3, Building } from "lucide-react"

export default function SalaryPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Income", href: "/dashboard/income" },
    { title: "Salary" }
  ]

  const salaryData = {
    currentSalary: 75000,
    lastRaise: {
      amount: 5000,
      percentage: 7.1,
      date: "2024-01-15"
    },
    nextReview: "2025-01-15",
    ytdEarnings: 52500,
    ytdDeductions: 12600,
    netYtd: 39900
  }

  const payStubs = [
    {
      id: 1,
      period: "Dec 1-15, 2024",
      grossPay: 3125,
      deductions: 750,
      netPay: 2375,
      taxes: 625,
      benefits: 125,
      status: "Processed"
    },
    {
      id: 2,
      period: "Nov 16-30, 2024",
      grossPay: 3125,
      deductions: 750,
      netPay: 2375,
      taxes: 625,
      benefits: 125,
      status: "Processed"
    },
    {
      id: 3,
      period: "Nov 1-15, 2024",
      grossPay: 3125,
      deductions: 750,
      netPay: 2375,
      taxes: 625,
      benefits: 125,
      status: "Processed"
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

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Salary Management">
      <TabNavigation tabs={tabNavigationConfig.income} />
      
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Salary Overview */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${salaryData.currentSalary.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{salaryData.lastRaise.percentage}% last raise
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">YTD Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${salaryData.ytdEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${salaryData.ytdDeductions.toLocaleString()} deductions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net YTD</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${salaryData.netYtd.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                After all deductions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Review</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Jan 15</div>
              <p className="text-xs text-muted-foreground">
                2025 performance review
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Salary Breakdown */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Breakdown</CardTitle>
                  <CardDescription>Current pay structure</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Gross Salary</span>
                  <span>${(salaryData.currentSalary / 12).toLocaleString()}</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Federal Tax (22%)</span>
                  <span>-${Math.round((salaryData.currentSalary / 12) * 0.22).toLocaleString()}</span>
                </div>
                <Progress value={22} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>State Tax (6%)</span>
                  <span>-${Math.round((salaryData.currentSalary / 12) * 0.06).toLocaleString()}</span>
                </div>
                <Progress value={6} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>FICA (7.65%)</span>
                  <span>-${Math.round((salaryData.currentSalary / 12) * 0.0765).toLocaleString()}</span>
                </div>
                <Progress value={7.65} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>401k (10%)</span>
                  <span>-${Math.round((salaryData.currentSalary / 12) * 0.10).toLocaleString()}</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Net Monthly</span>
                  <span className="text-green-600">
                    ${Math.round((salaryData.currentSalary / 12) * 0.5435).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Salary History</CardTitle>
              <CardDescription>Your salary progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Current Salary</div>
                    <div className="text-sm text-muted-foreground">Jan 2024 - Present</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${salaryData.currentSalary.toLocaleString()}</div>
                    <Badge variant="default" className="text-xs">
                      +{salaryData.lastRaise.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">Previous Salary</div>
                    <div className="text-sm text-muted-foreground">Mar 2023 - Dec 2023</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$70,000</div>
                    <Badge variant="secondary" className="text-xs">
                      +6.1%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">Starting Salary</div>
                    <div className="text-sm text-muted-foreground">Jun 2022 - Feb 2023</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$66,000</div>
                    <Badge variant="outline" className="text-xs">
                      Initial
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Pay Stubs */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Pay Stubs</CardTitle>
                  <CardDescription>Your latest payment records</CardDescription>
                </div>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payStubs.map((stub, index) => (
                  <motion.div
                    key={stub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold">{stub.period}</h3>
                          <Badge variant="secondary" className="text-xs">{stub.status}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Gross Pay</p>
                          <p className="font-medium">${stub.grossPay.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxes</p>
                          <p className="font-medium text-red-600">-${stub.taxes.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Benefits</p>
                          <p className="font-medium text-red-600">-${stub.benefits.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Deductions</p>
                          <p className="font-medium text-red-600">-${stub.deductions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net Pay</p>
                          <p className="font-semibold text-green-600">${stub.netPay.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits & Perks */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Benefits & Perks</CardTitle>
              <CardDescription>Your employment benefits breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-3">
                  <h4 className="font-semibold">Health Benefits</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Health Insurance</span>
                      <span className="text-green-600">$450/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dental Insurance</span>
                      <span className="text-green-600">$75/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vision Insurance</span>
                      <span className="text-green-600">$25/month</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Retirement</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>401k Match</span>
                      <span className="text-green-600">6% match</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vesting Period</span>
                      <span>3 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Match</span>
                      <span className="text-green-600">$375/month</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Time Off</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>PTO Days</span>
                      <span>25 days/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sick Days</span>
                      <span>10 days/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Holidays</span>
                      <span>12 days/year</span>
                    </div>
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
