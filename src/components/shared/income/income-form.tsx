"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarIcon, Plus, X, DollarSign, ArrowUpDown, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CurrencySelector } from '@/components/shared/currency/currency-selector'
import { useCurrency } from '@/hooks/use-currency'
import { IncomeSource } from '@/types/financial'
import { IncomeFormData } from '@/hooks/use-income'
import { CurrencyConversion, CurrencyConversionError } from '@/types/currency'

const incomeSchema = z.object({
  type: z.enum(['salary', 'rental', 'other']),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Invalid currency code'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
  isActive: z.boolean(),
  startDate: z.date().max(new Date(), 'Start date cannot be in the future'),
  endDate: z.date().optional(),
})

type IncomeFormSchema = z.infer<typeof incomeSchema>

interface IncomeFormProps {
  onSubmit: (data: IncomeFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<IncomeSource>
  isLoading?: boolean
  triggerText?: string
  mode?: 'create' | 'edit'
}

const incomeTypes = [
  { value: 'salary', label: 'Salary', description: 'Regular employment income' },
  { value: 'rental', label: 'Rental Properties', description: 'Income from rental properties' },
  { value: 'other', label: 'Others', description: 'Freelance, consulting, and other income' },
] as const

const frequencies = [
  { value: 'weekly', label: 'Weekly', description: 'Every week' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Every two weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Every month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every three months' },
  { value: 'yearly', label: 'Yearly', description: 'Once per year' },
] as const

export function IncomeForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false,
  triggerText = "Add Income Source",
  mode = 'create'
}: IncomeFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [conversionPreview, setConversionPreview] = useState<CurrencyConversion | CurrencyConversionError | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  
  const { primaryCurrency, convertAmount, formatAmount } = useCurrency()

  const form = useForm<IncomeFormSchema>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      type: initialData?.type || 'salary',
      name: initialData?.name || '',
      amount: initialData?.amount || 0,
      currency: initialData?.currency || primaryCurrency,
      frequency: initialData?.frequency || 'monthly',
      isActive: initialData?.isActive ?? true,
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || undefined,
    }
  })

  // Update currency conversion preview when amount or currency changes
  const watchedAmount = form.watch('amount')
  const watchedCurrency = form.watch('currency')
  
  useEffect(() => {
    if (watchedAmount > 0 && watchedCurrency && watchedCurrency !== primaryCurrency) {
      setIsConverting(true)
      convertAmount(watchedAmount, watchedCurrency, primaryCurrency)
        .then(result => {
          setConversionPreview(result)
        })
        .catch(error => {
          console.error('Error converting currency:', error)
          setConversionPreview(null)
        })
        .finally(() => {
          setIsConverting(false)
        })
    } else {
      setConversionPreview(null)
    }
  }, [watchedAmount, watchedCurrency, primaryCurrency, convertAmount])

  const handleSubmit = async (data: IncomeFormSchema) => {
    try {
      await onSubmit(data)
      if (mode === 'create') {
        form.reset()
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting income source:', error)
    }
  }

  const selectedType = incomeTypes.find(type => type.value === form.watch('type'))
  const selectedFrequency = frequencies.find(freq => freq.value === form.watch('frequency'))

  // Calculate monthly equivalent for preview
  const calculateMonthlyEquivalent = (amount: number, frequency: string): number => {
    switch (frequency) {
      case 'weekly':
        return amount * 52 / 12
      case 'biweekly':
        return amount * 26 / 12
      case 'monthly':
        return amount
      case 'quarterly':
        return amount / 3
      case 'yearly':
        return amount / 12
      default:
        return amount
    }
  }

  const originalMonthlyEquivalent = calculateMonthlyEquivalent(
    form.watch('amount') || 0, 
    form.watch('frequency')
  )

  // Get converted amounts for display
  const getConvertedAmounts = () => {
    if (!conversionPreview || 'errorType' in conversionPreview) {
      return {
        convertedAmount: originalMonthlyEquivalent,
        convertedCurrency: watchedCurrency || primaryCurrency,
        hasConversion: false,
        conversionError: conversionPreview && 'errorType' in conversionPreview ? conversionPreview.message : null
      }
    }

    const convertedMonthly = calculateMonthlyEquivalent(conversionPreview.convertedAmount, form.watch('frequency'))
    
    return {
      convertedAmount: convertedMonthly,
      convertedCurrency: primaryCurrency,
      hasConversion: true,
      exchangeRate: conversionPreview.exchangeRate,
      conversionError: null
    }
  }

  const conversionInfo = getConvertedAmounts()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Income Source' : 'Edit Income Source'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new income source to track your earnings and calculate budget allocations.'
              : 'Update your income source details and payment schedule.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Income Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select income type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {incomeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedType?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Income Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Source Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Primary Job, Rental Property A" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this income source
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount received per payment period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <CurrencySelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select currency"
                      />
                    </FormControl>
                    <FormDescription>
                      Currency for this income source
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Frequency */}
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencies.map((frequency) => (
                          <SelectItem key={frequency.value} value={frequency.value}>
                            {frequency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedFrequency?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When this income source started
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Active Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Income Source
                      </FormLabel>
                      <FormDescription>
                        Include this income in budget calculations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* End Date (Optional) */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When this income source will end (if applicable)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Income Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Income Summary
                    {isConverting && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Amount:</span>
                      <span className="font-medium">
                        {formatAmount(form.watch('amount') || 0, form.watch('currency'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="font-medium">{selectedFrequency?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Equivalent:</span>
                      <span className="font-medium text-primary">
                        {formatAmount(originalMonthlyEquivalent, form.watch('currency'))}
                      </span>
                    </div>
                    
                    {/* Currency Conversion Info */}
                    {conversionInfo.hasConversion && (
                      <>
                        <div className="border-t pt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <ArrowUpDown className="h-3 w-3" />
                            <span>Converted to {primaryCurrency}</span>
                            {conversionInfo.exchangeRate && (
                              <span>(Rate: {conversionInfo.exchangeRate.toFixed(4)})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly ({primaryCurrency}):</span>
                          <span className="font-medium text-green-600">
                            {formatAmount(conversionInfo.convertedAmount, primaryCurrency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual ({primaryCurrency}):</span>
                          <span className="font-medium text-green-600">
                            {formatAmount(conversionInfo.convertedAmount * 12, primaryCurrency)}
                          </span>
                        </div>
                      </>
                    )}
                    
                    {/* Original currency calculations if no conversion */}
                    {!conversionInfo.hasConversion && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Equivalent:</span>
                        <span className="font-medium">
                          {formatAmount(originalMonthlyEquivalent * 12, form.watch('currency'))}
                        </span>
                      </div>
                    )}
                    
                    {/* Conversion Error */}
                    {conversionInfo.conversionError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          Currency conversion failed: {conversionInfo.conversionError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${form.watch('isActive') ? 'text-green-600' : 'text-gray-500'}`}>
                        {form.watch('isActive') ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Form Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex gap-3 pt-4"
            >
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading 
                  ? (mode === 'create' ? 'Adding...' : 'Updating...') 
                  : (mode === 'create' ? 'Add Income Source' : 'Update Income Source')
                }
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  form.reset()
                  setIsOpen(false)
                  onCancel?.()
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </motion.div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}