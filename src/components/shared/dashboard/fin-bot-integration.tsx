"use client"

import { motion } from "framer-motion"
import { Bot, MessageCircle, Sparkles, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FinBotInsight {
  id: string
  type: "tip" | "alert" | "opportunity"
  title: string
  message: string
  priority: "low" | "medium" | "high"
}

const mockInsights: FinBotInsight[] = [
  {
    id: "1",
    type: "opportunity",
    title: "Investment Opportunity",
    message: "Based on your savings rate, you could increase your investment allocation by 5% to reach your retirement goal 2 years earlier.",
    priority: "medium",
  },
  {
    id: "2",
    type: "alert",
    title: "Budget Alert",
    message: "Your lifestyle spending is 15% above target this month. Consider reviewing your dining and entertainment expenses.",
    priority: "high",
  },
  {
    id: "3",
    type: "tip",
    title: "Tax Optimization",
    message: "You're eligible for additional tax deductions through your 401(k). Consider increasing contributions before year-end.",
    priority: "low",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case "opportunity":
      return TrendingUp
    case "alert":
      return AlertCircle
    case "tip":
      return Sparkles
    default:
      return MessageCircle
  }
}

const getInsightColor = (type: string, priority: string) => {
  if (type === "alert") return "destructive"
  if (type === "opportunity") return "default"
  return "secondary"
}

export function FinBotIntegration() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Fin Bot</h2>
            <p className="text-muted-foreground">Your AI Financial Assistant</p>
          </div>
        </div>
        
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Sparkles className="h-3 w-3 mr-1" />
          Coming in Phase 2
        </Badge>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>AI-Powered Insights</span>
            </CardTitle>
            <CardDescription>
              Fin Bot will analyze your financial data and provide personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type)
              return (
                <motion.div
                  key={insight.id}
                  variants={itemVariants}
                  className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30 border border-muted"
                >
                  <div className="p-2 bg-background rounded-full">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge 
                        variant={getInsightColor(insight.type, insight.priority)}
                        className="text-xs"
                      >
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                </motion.div>
              )
            })}
          </CardContent>
        </Card>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Interactive Financial Assistant</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chat with Fin Bot to get instant answers about your finances, 
                    create budgets, analyze spending patterns, and receive personalized advice.
                  </p>
                </div>
                <Button disabled className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Conversation (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}