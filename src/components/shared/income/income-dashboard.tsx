"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Building, 
  Home, 
  Briefcase,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IncomeForm } from './income-form'
import { IncomeSource } from '@/types/financial'
import { IncomeFormData } from '@/hooks/use-income'

interface IncomeDashboardProps {
  incomeSources: IncomeSource[]
  totalMonthlyIncome: number
  totalAnnualIncome: number
  primaryCurrency: string
  isLoading?: boolean
  onAddIncome: (data: IncomeFormData) => Promise<void>
  onUpdateIncome: (id: string, data: Partial<IncomeFormData>) => Promise<void>
  onDeleteIncome: (id: string) => Promise<void>
  calculateMonthlyEquivalent: (amount: number, frequency: IncomeSource['frequency']) => number
  filterByType?: IncomeSource['type']
}

export function IncomeDashboard({
  incomeSources,
  totalMonthlyIncome,
  totalAnnualIncome,
  primaryCurrency,
  isLoading = false,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
  calculateMonthlyEquivalent,
  filterByType
}: IncomeDashboardProps) {
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null)

  // Filter income sources by type if specified
  const filteredIncomeSources = useMemo(() => {
    if (filterByType) {
      return incomeSources.filter(source => source.type === filterByType)
    }
    return incomeSources
  }, [incomeSources, filterByType])

  // Calculate filtered totals
  const filteredMonthlyTotal = useMemo(() => {
    return filteredIncomeSources
      .filter(source => source.isActive)
      .reduce((total, source) => {
        return total + calculateMonthlyEquivalent(source.amount, source.frequency)
      }, 0)
  }, [filteredIncomeSources, calculateMonthlyEquivalent])

  const filteredAnnualTotal = useMemo(() => {
    return filteredMonthlyTotal * 12
  }, [filteredMonthlyTotal])

  // Income type icons
  const getIncomeIcon = (type: IncomeSource['type']) => {
    switch (type) {
      case 'salary':
        return Briefcase
      case 'rental':
        return Home
      case 'other':
        return Building
      default:
        return DollarSign
    }
  }

  // Income type labels
  const getIncomeTypeLabel = (type: IncomeSource['type']) => {
    switch (type) {
      case 'salary':
        return 'Salary'
      case 'rental':
        return 'Rental Property'
      case 'other':
        return 'Other Income'
      default:
        return 'Income'
    }
  }

  // Frequency labels
  const getFrequencyLabel = (frequency: IncomeSource['frequency']) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly'
      case 'biweekly':
        return 'Bi-weekly'
      case 'monthly':
        return 'Monthly'
      case 'quarterly':
        return 'Quarterly'
      case 'yearly':
        return 'Yearly'
      default:
        return frequency
    }
  }

  const handleEditIncome = (income: IncomeSource) => {
    setEditingIncome(income)
  }

  const handleUpdateIncome = async (data: IncomeFormData) => {
    if (!editingIncome) return
    await onUpdateIncome(editingIncome.id, data)
    setEditingIncome(null)
  }

  const handleDeleteIncome = async (id: string) => {
    if (confirm('Are you sure you want to delete this income source?')) {
      await onDeleteIncome(id)
    }
  }

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
    <motion.div 
      className="flex flex-1 flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Income Overview Cards */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {filterByType ? `${getIncomeTypeLabel(filterByType)} (Monthly)` : 'Monthly Income'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {primaryCurrency} {(filterByType ? filteredMonthlyTotal : totalMonthlyIncome).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredIncomeSources.filter(s => s.isActive).length} active source{filteredIncomeSources.filter(s => s.isActive).length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {filterByType ? `${getIncomeTypeLabel(filterByType)} (Annual)` : 'Annual Income'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {primaryCurrency} {(filterByType ? filteredAnnualTotal : totalAnnualIncome).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Projected for this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredIncomeSources.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredIncomeSources.filter(s => s.isActive).length} active, {filteredIncomeSources.filter(s => !s.isActive).length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Source</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {primaryCurrency} {filteredIncomeSources.length > 0 
                ? Math.round((filterByType ? filteredMonthlyTotal : totalMonthlyIncome) / filteredIncomeSources.filter(s => s.isActive).length || 0).toLocaleString()
                : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly average
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Income Source */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {filterByType ? `${getIncomeTypeLabel(filterByType)} Management` : 'Income Source Management'}
                </CardTitle>
                <CardDescription>
                  {filterByType 
                    ? `Manage your ${getIncomeTypeLabel(filterByType).toLowerCase()} income sources`
                    : 'Add and manage all your income sources with frequency normalization'
                  }
                </CardDescription>
              </div>
              <IncomeForm 
                onSubmit={onAddIncome} 
                isLoading={isLoading}
                triggerText={filterByType ? `Add ${getIncomeTypeLabel(filterByType)}` : 'Add Income Source'}
              />
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Income Sources List */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>
              {filterByType ? `${getIncomeTypeLabel(filterByType)} Sources` : 'All Income Sources'}
            </CardTitle>
            <CardDescription>
              Detailed view of your income sources with monthly equivalents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIncomeSources.length > 0 ? (
                filteredIncomeSources.map((income, index) => {
                  const IconComponent = getIncomeIcon(income.type)
                  const monthlyEquivalent = calculateMonthlyEquivalent(income.amount, income.frequency)
                  
                  return (
                    <motion.div
                      key={income.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{income.name}</h3>
                            <Badge variant={income.isActive ? 'default' : 'secondary'}>
                              {income.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              {getIncomeTypeLabel(income.type)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-medium">
                                {income.currency} {income.amount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Frequency</p>
                              <p className="font-medium">{getFrequencyLabel(income.frequency)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Monthly Equivalent</p>
                              <p className="font-medium text-primary">
                                {income.currency} {monthlyEquivalent.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="font-medium">
                                {income.startDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {income.currency} {(monthlyEquivalent * 12).toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Annual</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditIncome(income)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteIncome(income.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {filterByType ? `No ${getIncomeTypeLabel(filterByType).toLowerCase()} sources yet` : 'No income sources yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {filterByType 
                      ? `Add your first ${getIncomeTypeLabel(filterByType).toLowerCase()} source to start tracking your income.`
                      : 'Add your first income source to start tracking your earnings and calculating budgets.'
                    }
                  </p>
                  <IncomeForm 
                    onSubmit={onAddIncome} 
                    isLoading={isLoading}
                    triggerText={filterByType ? `Add ${getIncomeTypeLabel(filterByType)}` : 'Add Income Source'}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Income Dialog */}
      {editingIncome && (
        <IncomeForm
          onSubmit={handleUpdateIncome}
          onCancel={() => setEditingIncome(null)}
          initialData={editingIncome}
          isLoading={isLoading}
          triggerText="Update Income Source"
          mode="edit"
        />
      )}

      {/* Income Analysis */}
      {!filterByType && filteredIncomeSources.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Income Analysis</CardTitle>
              <CardDescription>
                Breakdown and insights about your income sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-4">Income by Type</h4>
                  <div className="space-y-3">
                    {['salary', 'rental', 'other'].map((type) => {
                      const typeIncome = filteredIncomeSources
                        .filter(source => source.type === type && source.isActive)
                        .reduce((total, source) => {
                          return total + calculateMonthlyEquivalent(source.amount, source.frequency)
                        }, 0)
                      
                      const percentage = totalMonthlyIncome > 0 ? (typeIncome / totalMonthlyIncome) * 100 : 0
                      
                      if (typeIncome === 0) return null
                      
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 capitalize">
                              {getIncomeTypeLabel(type as IncomeSource['type'])}
                            </span>
                            <span className="font-medium">
                              {primaryCurrency} {typeIncome.toLocaleString()} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Payment Frequencies</h4>
                  <div className="space-y-2">
                    {['monthly', 'biweekly', 'weekly', 'quarterly', 'yearly'].map((frequency) => {
                      const count = filteredIncomeSources.filter(
                        source => source.frequency === frequency && source.isActive
                      ).length
                      
                      if (count === 0) return null
                      
                      return (
                        <div key={frequency} className="flex justify-between text-sm">
                          <span className="capitalize">{getFrequencyLabel(frequency as IncomeSource['frequency'])}</span>
                          <span className="font-medium">{count} source{count !== 1 ? 's' : ''}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}