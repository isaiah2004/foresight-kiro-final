"use client"

import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { tabNavigationConfig } from "@/lib/navigation-config"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bitcoin, TrendingUp, TrendingDown, DollarSign, Zap, Plus, Shield, AlertTriangle } from "lucide-react"

export default function CryptoPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Investments", href: "/dashboard/investments" },
    { title: "Crypto" }
  ]

  const cryptoData = {
    totalValue: 12450,
    totalInvested: 10800,
    totalReturn: 15.3,
    todayChange: -2.4,
    portfolioCount: 8
  }

  const cryptoHoldings = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.125,
      value: 5420,
      price: 43360,
      change24h: -1.8,
      allocation: 43.5
    },
    {
      symbol: "ETH", 
      name: "Ethereum",
      amount: 2.45,
      value: 4200,
      price: 1714.29,
      change24h: -3.2,
      allocation: 33.7
    },
    {
      symbol: "ADA",
      name: "Cardano",
      amount: 2500,
      value: 1250,
      price: 0.50,
      change24h: 2.1,
      allocation: 10.0
    },
    {
      symbol: "DOT",
      name: "Polkadot",
      amount: 180,
      value: 980,
      price: 5.44,
      change24h: -0.8,
      allocation: 7.9
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      amount: 42,
      value: 600,
      price: 14.29,
      change24h: 1.5,
      allocation: 4.8
    }
  ]

  const marketMetrics = [
    { label: "Market Cap", value: "$1.7T", trend: "down" },
    { label: "24h Volume", value: "$45.2B", trend: "up" },
    { label: "Bitcoin Dominance", value: "42.8%", trend: "stable" },
    { label: "Fear & Greed Index", value: "65", trend: "up" }
  ]

  const newsAndAlerts = [
    { type: "Price Alert", message: "BTC reached your target of $43,000", time: "2 hours ago" },
    { type: "News", message: "Ethereum upgrade scheduled for next month", time: "4 hours ago" },
    { type: "Warning", message: "High volatility detected in your portfolio", time: "6 hours ago" },
    { type: "Achievement", message: "Portfolio gained 5% this week", time: "1 day ago" }
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
    <DashboardLayout breadcrumbs={breadcrumbs} title="Cryptocurrency Investments">
      <TabNavigation tabs={tabNavigationConfig.investments} />
      
      <motion.div 
        className="flex flex-1 flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Crypto Overview Cards */}
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
          variants={itemVariants}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Bitcoin className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cryptoData.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Current portfolio value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cryptoData.totalInvested.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total capital invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{cryptoData.totalReturn}%</div>
              <p className="text-xs text-muted-foreground">
                All-time performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Change</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cryptoData.todayChange}%</div>
              <p className="text-xs text-muted-foreground">
                Today&apos;s performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cryptoData.portfolioCount}</div>
              <p className="text-xs text-muted-foreground">
                Different assets
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Allocation */}
        <motion.div 
          className="grid gap-4 lg:grid-cols-2"
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
              <CardDescription>Distribution by market cap</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cryptoHoldings.map((crypto, index) => (
                <motion.div 
                  key={crypto.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      {crypto.symbol} - {crypto.name}
                    </span>
                    <span className="font-medium">
                      {crypto.allocation}%
                    </span>
                  </div>
                  <Progress value={crypto.allocation} className="h-2" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Metrics</CardTitle>
              <CardDescription>Global cryptocurrency market data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {marketMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-3 border rounded-lg text-center"
                  >
                    <div className="text-xl font-bold text-primary">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                    <Badge 
                      variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                      className="mt-1"
                    >
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Holdings Detail */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Holdings Detail</CardTitle>
                  <CardDescription>Your cryptocurrency positions</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buy Crypto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cryptoHoldings.map((crypto, index) => (
                  <motion.div
                    key={crypto.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="grid gap-4 md:grid-cols-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {crypto.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold">{crypto.symbol}</div>
                          <div className="text-sm text-muted-foreground">{crypto.name}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Holdings</div>
                        <div className="font-semibold">{crypto.amount.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="font-semibold">${crypto.price.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Value</div>
                        <div className="font-semibold">${crypto.value.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">24h Change</div>
                        <Badge variant={crypto.change24h >= 0 ? 'default' : 'destructive'}>
                          {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h}%
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* News & Alerts */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>News & Alerts</CardTitle>
              <CardDescription>Recent updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {newsAndAlerts.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {item.type === 'Price Alert' && <Zap className="h-4 w-4 text-yellow-500" />}
                      {item.type === 'News' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                      {item.type === 'Warning' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {item.type === 'Achievement' && <Shield className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                      <div className="text-sm">{item.message}</div>
                    </div>
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
