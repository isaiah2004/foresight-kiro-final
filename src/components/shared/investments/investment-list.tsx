"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Investment } from '@/types/financial'
import { formatInvestmentValue, formatPercentageChange } from '@/lib/financial/investments'
import { InvestmentForm } from './investment-form'

interface InvestmentListProps {
  investments: Investment[]
  primaryCurrency: string
  onEdit: (investment: Investment, data: any) => Promise<void>
  onDelete: (investmentId: string) => Promise<void>
  isLoading?: boolean
}

export function InvestmentList({
  investments,
  primaryCurrency,
  onEdit,
  onDelete,
  isLoading = false
}: InvestmentListProps) {
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [deletingInvestment, setDeletingInvestment] = useState<Investment | null>(null)

  const handleEdit = async (data: any) => {
    if (!editingInvestment) return
    
    try {
      await onEdit(editingInvestment, data)
      setEditingInvestment(null)
    } catch (error) {
      console.error('Error editing investment:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingInvestment) return
    
    try {
      await onDelete(deletingInvestment.id)
      setDeletingInvestment(null)
    } catch (error) {
      console.error('Error deleting investment:', error)
    }
  }

  const getInvestmentTypeColor = (type: Investment['type']) => {
    switch (type) {
      case 'stock':
        return 'bg-blue-100 text-blue-800'
      case 'crypto':
        return 'bg-orange-100 text-orange-800'
      case 'bond':
        return 'bg-green-100 text-green-800'
      case 'mutual-fund':
        return 'bg-purple-100 text-purple-800'
      case 'real-estate':
        return 'bg-yellow-100 text-yellow-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInvestmentTypeLabel = (type: Investment['type']) => {
    switch (type) {
      case 'stock':
        return 'Stock'
      case 'crypto':
        return 'Crypto'
      case 'bond':
        return 'Bond'
      case 'mutual-fund':
        return 'Mutual Fund'
      case 'real-estate':
        return 'Real Estate'
      case 'other':
        return 'Other'
      default:
        return 'Unknown'
    }
  }

  if (investments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start building your portfolio by adding your first investment.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {investments.map((investment, index) => {
          const currentValue = investment.currentValue || (investment.quantity * investment.lastSyncedPrice)
          const totalInvested = investment.quantity * investment.purchasePrice
          const totalReturn = currentValue - totalInvested
          const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0
          const isPositive = totalReturn >= 0

          return (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">{investment.symbol}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge className={getInvestmentTypeColor(investment.type)}>
                            {getInvestmentTypeLabel(investment.type)}
                          </Badge>
                          <span>
                            {investment.quantity} {investment.type === 'stock' ? 'shares' : 'units'}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatInvestmentValue(currentValue, primaryCurrency)}
                        </div>
                        <div className={`text-sm flex items-center gap-1 ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>
                            {formatPercentageChange(returnPercentage).formatted}
                          </span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingInvestment(investment)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Investment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingInvestment(investment)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Investment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Price:</span>
                      <span>
                        {formatInvestmentValue(investment.purchasePrice, investment.purchaseCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Price:</span>
                      <span>
                        {formatInvestmentValue(investment.lastSyncedPrice, investment.purchaseCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Invested:</span>
                      <span>
                        {formatInvestmentValue(totalInvested, investment.purchaseCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Total Return:</span>
                      <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {formatInvestmentValue(totalReturn, primaryCurrency, false)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Date:</span>
                      <span>
                        {new Date(investment.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>
                    {investment.lastSyncTimestamp && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>
                          {new Date(investment.lastSyncTimestamp).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Edit Investment Dialog */}
      {editingInvestment && (
        <InvestmentForm
          mode="edit"
          initialData={editingInvestment}
          onSubmit={handleEdit}
          onCancel={() => setEditingInvestment(null)}
          isLoading={isLoading}
          triggerText="Save Changes"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingInvestment} onOpenChange={() => setDeletingInvestment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the investment &quot;{deletingInvestment?.symbol}&quot;? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Investment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}