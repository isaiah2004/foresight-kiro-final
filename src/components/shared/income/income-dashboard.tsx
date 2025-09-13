"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Calendar, 
  Building, 
  Home, 
  Briefcase,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  ArrowUpDown,
  Info,
  CircleDollarSign
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { IncomeForm } from './income-form'
import { OneTimeIncomeForm } from './one-time-income-form'
import { IncomeSource, OneTimeIncome } from '@/types/financial'
import { IncomeFormData, ConvertedIncomeSource, ConvertedOneTimeIncome, IncomeState, OneTimeIncomeFormData } from '@/hooks/use-income'
import { getCurrencyIcon, getCurrencyIconLabel } from '@/lib/currency/icons'

interface IncomeDashboardProps {
  incomeSources: IncomeSource[]
  oneTimeIncomes?: OneTimeIncome[]
  convertedIncomeSources: ConvertedIncomeSource[]
  convertedOneTimeIncomes?: ConvertedOneTimeIncome[]
  totalMonthlyIncome: number
  totalAnnualIncome: number
  totalOneTimeIncomeThisYear: number
  primaryCurrency: string
  isLoading?: boolean
  isConverting?: boolean
  incomeState: IncomeState
  onAddIncome: (data: IncomeFormData) => Promise<void>
  onUpdateIncome: (id: string, data: Partial<IncomeFormData>) => Promise<void>
  onDeleteIncome: (id: string) => Promise<void>
  onAddOneTimeIncome: (data: OneTimeIncomeFormData) => Promise<void>
  onUpdateOneTimeIncome: (id: string, data: Partial<OneTimeIncomeFormData>) => Promise<void>
  onDeleteOneTimeIncome: (id: string) => Promise<void>
  calculateMonthlyEquivalent: (amount: number, frequency: IncomeSource['frequency']) => number
  formatAmount: (amount: number, currency?: string, options?: any) => string
  getCurrencySymbol: (code: string) => string
  filterByType?: IncomeSource['type']
}

export function IncomeDashboard({
  incomeSources,
  oneTimeIncomes,
  convertedIncomeSources,
  convertedOneTimeIncomes,
  totalMonthlyIncome,
  totalAnnualIncome,
  totalOneTimeIncomeThisYear,
  primaryCurrency,
  isLoading = false,
  isConverting = false,
  incomeState,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
  onAddOneTimeIncome,
  onUpdateOneTimeIncome,
  onDeleteOneTimeIncome,
  calculateMonthlyEquivalent,
  formatAmount,
  getCurrencySymbol,
  filterByType
}: IncomeDashboardProps) {
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null)
  const [editingOneTimeIncome, setEditingOneTimeIncome] = useState<OneTimeIncome | null>(null)

  // Get the appropriate currency icon for the primary currency
  const CurrencyIcon = getCurrencyIcon(primaryCurrency)

  // Filter income sources by type if specified
  const filteredIncomeSources = useMemo(() => {
    if (!convertedIncomeSources || convertedIncomeSources.length === 0) {
      return []
    }
    
    if (filterByType) {
      return convertedIncomeSources.filter(source => source && source.type === filterByType)
    }
    return convertedIncomeSources
  }, [convertedIncomeSources, filterByType])

  // Calculate filtered totals in primary currency
  const filteredMonthlyTotal = useMemo(() => {
    if (!filteredIncomeSources || filteredIncomeSources.length === 0) {
      return 0
    }
    
    return filteredIncomeSources
      .filter(source => source && source.isActive && !source.conversionError)
      .reduce((total, source) => {
        const amount = source.convertedMonthlyAmount || 0
        return total + (isNaN(amount) ? 0 : amount)
      }, 0)
  }, [filteredIncomeSources])

  const filteredAnnualTotal = useMemo(() => {
    const monthly = filteredMonthlyTotal || 0
    return monthly * 12
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
        return CircleDollarSign
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

  const handleUpdateOneTimeIncome = async (data: OneTimeIncomeFormData) => {
    if (!editingOneTimeIncome) return
    await onUpdateOneTimeIncome(editingOneTimeIncome.id, data)
    setEditingOneTimeIncome(null)
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
            <CurrencyIcon className="h-4 w-4 text-muted-foreground" aria-label={getCurrencyIconLabel(primaryCurrency)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span>Loading...</span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                formatAmount(filterByType ? filteredMonthlyTotal : totalMonthlyIncome, primaryCurrency)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? (
                'Calculating...'
              ) : (
                <>
                  {(filteredIncomeSources || []).filter(s => s?.isActive).length} active source{(filteredIncomeSources || []).filter(s => s?.isActive).length !== 1 ? 's' : ''}
                  {isConverting && <span className="ml-1 text-orange-600">• Converting...</span>}
                </>
              )}
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
              {isLoading ? (
                'Loading...'
              ) : (
                formatAmount(filterByType ? filteredAnnualTotal : totalAnnualIncome, primaryCurrency)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Calculating...' : 'Projected for this year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(filteredIncomeSources || []).length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  {(filteredIncomeSources || []).filter(s => s?.isActive).length} active, {(filteredIncomeSources || []).filter(s => !s?.isActive).length} inactive
                </>
              )}
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
              {isLoading ? (
                'Loading...'
              ) : (
                formatAmount(
                  (filteredIncomeSources || []).length > 0 
                    ? Math.round((filterByType ? filteredMonthlyTotal : totalMonthlyIncome) / (filteredIncomeSources || []).filter(s => s?.isActive).length || 0)
                    : 0,
                  primaryCurrency
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Calculating...' : 'Monthly average'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">One-Time Income (This Year)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                'Loading...'
              ) : (
                formatAmount(
                  (convertedOneTimeIncomes || [])
                    .filter(income => {
                      const incomeDate = new Date(income.date);
                      const currentYear = new Date().getFullYear();
                      return incomeDate.getFullYear() === currentYear;
                    })
                    .reduce((total, income) => total + (income.convertedAmount || 0), 0),
                  primaryCurrency
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Calculating...' : `${(convertedOneTimeIncomes || []).filter(income => {
                const incomeDate = new Date(income.date);
                const currentYear = new Date().getFullYear();
                return incomeDate.getFullYear() === currentYear;
              }).length} entries this year`}
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

      {/* One-Time Income Management */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">One-Time Income Management</CardTitle>
                <CardDescription>
                  Add and manage one-time income events like bonuses, gifts, and windfalls
                </CardDescription>
              </div>
              <OneTimeIncomeForm
                onSubmit={onAddOneTimeIncome}
                isLoading={isLoading}
                triggerText="Add One-Time Income"
              />
            </div>
          </CardHeader>
          {oneTimeIncomes && oneTimeIncomes.length > 0 && (
            <CardContent>
              <div className="space-y-3">
                {(oneTimeIncomes || [])
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((income) => (
                    <motion.div
                      key={income.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">{income.source}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {income.type} • {new Date(income.date).toLocaleDateString()}
                            {income.isRecorded && <span className="ml-2 text-green-600">✓ Recorded</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {formatAmount(
                            (convertedOneTimeIncomes || []).find(converted => converted.id === income.id)?.convertedAmount || 0,
                            primaryCurrency
                          )}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingOneTimeIncome(income);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteOneTimeIncome(income.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                {oneTimeIncomes && oneTimeIncomes.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    Showing 5 most recent entries • {oneTimeIncomes.length} total
                  </p>
                )}
              </div>
            </CardContent>
          )}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
                    />
                    <span className="text-muted-foreground">Loading income sources...</span>
                  </div>
                </div>
              ) : (filteredIncomeSources || []).length > 0 ? (
                (filteredIncomeSources || []).map((income, index) => {
                  const IconComponent = getIncomeIcon(income.type)
                  const originalMonthlyEquivalent = calculateMonthlyEquivalent(income?.amount || 0, income?.frequency || 'monthly')
                  const convertedMonthlyEquivalent = income?.convertedMonthlyAmount || originalMonthlyEquivalent
                  const hasConversionError = !!income?.conversionError
                  const isDifferentCurrency = income?.currency !== primaryCurrency
                  
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
                            {hasConversionError && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Conversion Error
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{income.conversionError}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {isDifferentCurrency && !hasConversionError && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className="text-xs">
                                      <ArrowUpDown className="h-3 w-3 mr-1" />
                                      Converted
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Rate: 1 {income.currency} = {income.exchangeRate?.toFixed(4)} {primaryCurrency}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Original Amount</p>
                              <p className="font-medium">
                                {formatAmount(income.amount, income.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Frequency</p>
                              <p className="font-medium">{getFrequencyLabel(income.frequency)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Monthly ({primaryCurrency})</p>
                              <p className="font-medium text-primary">
                                {hasConversionError ? (
                                  <span className="text-red-600">Error</span>
                                ) : (
                                  formatAmount(convertedMonthlyEquivalent, primaryCurrency)
                                )}
                              </p>
                              {isDifferentCurrency && !hasConversionError && (
                                <p className="text-xs text-muted-foreground">
                                  ≈ {formatAmount(originalMonthlyEquivalent, income.currency)} {income.currency}
                                </p>
                              )}
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
                            {hasConversionError ? (
                              <span className="text-red-600">Error</span>
                            ) : (
                              formatAmount(convertedMonthlyEquivalent * 12, primaryCurrency)
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Annual ({primaryCurrency})</p>
                          {isDifferentCurrency && !hasConversionError && (
                            <p className="text-xs text-muted-foreground">
                              ≈ {formatAmount(originalMonthlyEquivalent * 12, income.currency)} {income.currency}
                            </p>
                          )}
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
                    {incomeState.isFirstLoad && isLoading ? (
                      'Loading your income sources...'
                    ) : filterByType ? (
                      `Add your first ${getIncomeTypeLabel(filterByType).toLowerCase()} source to start tracking your income.`
                    ) : (
                      'Add your first income source to start tracking your earnings and calculating budgets.'
                    )}
                  </p>
                  {!isLoading && (
                    <IncomeForm 
                      onSubmit={onAddIncome} 
                      isLoading={isLoading}
                      triggerText={filterByType ? `Add ${getIncomeTypeLabel(filterByType)}` : 'Add Income Source'}
                    />
                  )}
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

      {/* Edit One-Time Income Dialog */}
      {editingOneTimeIncome && (
        <OneTimeIncomeForm
          onSubmit={handleUpdateOneTimeIncome}
          onCancel={() => setEditingOneTimeIncome(null)}
          initialData={editingOneTimeIncome}
          isLoading={isLoading}
          triggerText="Update One-Time Income"
          mode="edit"
        />
      )}

      {/* Income Analysis */}
      {!filterByType && (filteredIncomeSources || []).length > 0 && !isLoading && (
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
                    <h4 className="font-semibold mb-4">Income by Type ({primaryCurrency})</h4>
                    <div className="space-y-3">
                      {['salary', 'rental', 'other'].map((type) => {
                        const typeIncome = (filteredIncomeSources || [])
                          .filter(source => source && source.type === type && source.isActive && !source.conversionError)
                          .reduce((total, source) => {
                            const amount = source.convertedMonthlyAmount || 0
                            return total + (isNaN(amount) ? 0 : amount)
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
                                {formatAmount(typeIncome, primaryCurrency)} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </div>                <div>
                  <h4 className="font-semibold mb-4">Payment Frequencies</h4>
                  <div className="space-y-2">
                    {['monthly', 'biweekly', 'weekly', 'quarterly', 'yearly'].map((frequency) => {
                      const count = (filteredIncomeSources || []).filter(
                        source => source && source.frequency === frequency && source.isActive
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