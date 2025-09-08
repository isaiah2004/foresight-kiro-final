"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Calendar, Percent, TrendingDown, Plus, Home, Car, CreditCard, GraduationCap, Clock, Calculator } from "lucide-react"

export default function LoansPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Loans" }
  ]

  const loanData = {
    totalBalance: 285640,
    totalOriginal: 350000,
    totalPaid: 64360,
    monthlyPayments: 2890,
    totalLoans: 4
  }

  const loans = [
    {
      id: 1,
      name: "Primary Mortgage",
      type: "Mortgage",
      balance: 245000,
      originalAmount: 280000,
      monthlyPayment: 1850,
      interestRate: 3.25,
      term: "30 years",
      remainingTerm: "24 years 3 months",
      nextPayment: "2025-01-01",
      status: "Current",
      icon: Home,
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Auto Loan - Honda Civic",
      type: "Auto",
      balance: 18500,
      originalAmount: 28000,
      monthlyPayment: 485,
      interestRate: 4.2,
      term: "5 years",
      remainingTerm: "2 years 8 months",
      nextPayment: "2025-01-15",
      status: "Current",
      icon: Car,
      color: "bg-green-500"
    },
    {
      id: 3,
      name: "Student Loan",
      type: "Education",
      balance: 15890,
      originalAmount: 25000,
      monthlyPayment: 245,
      interestRate: 5.8,
      term: "10 years",
      remainingTerm: "4 years 2 months",
      nextPayment: "2025-01-10",
      status: "Current",
      icon: GraduationCap,
      color: "bg-purple-500"
    },
    {
      id: 4,
      name: "Credit Card Debt",
      type: "Credit Card",
      balance: 6250,
      originalAmount: 17000,
      monthlyPayment: 310,
      interestRate: 18.99,
      term: "Variable",
      remainingTerm: "1 year 8 months",
      nextPayment: "2025-01-05",
      status: "High Interest",
      icon: CreditCard,
      color: "bg-red-500"
    }
  ]

  const paymentSchedule = [
    { month: "January 2025", principal: 1245, interest: 1645, total: 2890 },
    { month: "February 2025", principal: 1250, interest: 1640, total: 2890 },
    { month: "March 2025", principal: 1255, interest: 1635, total: 2890 },
    { month: "April 2025", principal: 1260, interest: 1630, total: 2890 }
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

  const totalPaidPercentage = (loanData.totalPaid / loanData.totalOriginal) * 100
  const weightedInterestRate = loans.reduce((sum, loan) => sum + (loan.interestRate * (loan.balance / loanData.totalBalance)), 0)

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Loan Management">
      <TabNavigation tabs={tabNavigationConfig.loans} />
      
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Loan Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${loanData.totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across {loanData.totalLoans} loans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payments</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${loanData.monthlyPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total monthly obligation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Off</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${loanData.totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {totalPaidPercentage.toFixed(1)}% of original debt
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Interest</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weightedInterestRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                Weighted average
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Debt Payoff Progress */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Overall Debt Payoff Progress</CardTitle>
              <CardDescription>How much of your original debt you&apos;ve paid off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Paid: ${loanData.totalPaid.toLocaleString()}</span>
                  <span>Original: ${loanData.totalOriginal.toLocaleString()}</span>
                </div>
                <Progress value={totalPaidPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{totalPaidPercentage.toFixed(1)}% paid off</span>
                  <span>${loanData.totalBalance.toLocaleString()} remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loan Portfolio */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Loan Portfolio</CardTitle>
                  <CardDescription>All your loans and their current status</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Loan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loans.map((loan, index) => (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${loan.color}`}>
                        <loan.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{loan.name}</h3>
                          <Badge variant={loan.status === 'Current' ? 'default' : 'destructive'}>
                            {loan.status}
                          </Badge>
                          <Badge variant="outline">{loan.type}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Balance</p>
                            <p className="font-medium">${loan.balance.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment</p>
                            <p className="font-medium">${loan.monthlyPayment.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rate</p>
                            <p className="font-medium">{loan.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p className="font-medium">{loan.remainingTerm}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Payment</p>
                            <p className="font-medium">{loan.nextPayment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Progress</div>
                      <div className="w-16">
                        <Progress 
                          value={((loan.originalAmount - loan.balance) / loan.originalAmount) * 100} 
                          className="h-2" 
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {(((loan.originalAmount - loan.balance) / loan.originalAmount) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Schedule and Analysis */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>Next 4 months payment breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentSchedule.map((payment, index) => (
                  <motion.div 
                    key={payment.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm">{payment.month}</div>
                      <div className="text-xs text-muted-foreground">
                        Principal: ${payment.principal} | Interest: ${payment.interest}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${payment.total.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Analysis</CardTitle>
              <CardDescription>Key metrics and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Debt-to-Income Ratio</div>
                    <div className="text-sm text-muted-foreground">Monthly payments vs income</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">34.2%</div>
                    <Badge variant="default">Good</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">High Interest Debt</div>
                    <div className="text-sm text-muted-foreground">Debt above 10% interest</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-600">${loans.filter(l => l.interestRate > 10).reduce((sum, l) => sum + l.balance, 0).toLocaleString()}</div>
                    <Badge variant="destructive">Priority</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Total Interest This Year</div>
                    <div className="text-sm text-muted-foreground">Projected 2024 interest payments</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">$19,680</div>
                    <div className="text-xs text-muted-foreground">Annual</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Payoff Timeline</div>
                    <div className="text-sm text-muted-foreground">At current payment rate</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">18.5 years</div>
                    <div className="text-xs text-muted-foreground">Estimated</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loan Management Tools */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Loan Management Tools</CardTitle>
              <CardDescription>Optimize your debt repayment strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { 
                    name: "Extra Payment Calculator", 
                    description: "See how extra payments reduce total interest", 
                    icon: Calculator,
                    action: "Calculate"
                  },
                  { 
                    name: "Refinance Analyzer", 
                    description: "Compare refinancing options", 
                    icon: TrendingDown,
                    action: "Analyze"
                  },
                  { 
                    name: "Debt Snowball", 
                    description: "Plan your debt elimination strategy", 
                    icon: Clock,
                    action: "Plan"
                  },
                  { 
                    name: "Payment Scheduler", 
                    description: "Set up automatic payments", 
                    icon: Calendar,
                    action: "Schedule"
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