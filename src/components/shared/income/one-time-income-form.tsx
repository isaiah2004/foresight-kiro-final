"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarIcon, Plus, DollarSign, ArrowUpDown, Loader2, Gift, Award, Banknote } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { OneTimeIncome } from '@/types/financial'
import { OneTimeIncomeFormData } from '@/hooks/use-income'
import { CurrencyConversion, CurrencyConversionError } from '@/types/currency'

const oneTimeIncomeSchema = z.object({
  type: z.enum(['bonus', 'gift', 'inheritance', 'investment-maturity', 'lottery', 'refund', 'side-gig', 'other']),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Invalid currency code'),
  date: z.date().max(new Date(), 'Date cannot be in the future'),
  source: z.string().optional(),
  isRecorded: z.boolean(),
})

type OneTimeIncomeFormSchema = z.infer<typeof oneTimeIncomeSchema>

interface OneTimeIncomeFormProps {
  onSubmit: (data: OneTimeIncomeFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<OneTimeIncome>
  isLoading?: boolean
  triggerText?: string
  mode?: 'create' | 'edit'
}

const oneTimeIncomeTypes = [
  { value: 'bonus', label: 'Bonus', description: 'Work-related bonus or incentive', icon: Award },
  { value: 'gift', label: 'Gift', description: 'Money received as a gift', icon: Gift },
  { value: 'inheritance', label: 'Inheritance', description: 'Inherited money or assets', icon: Banknote },
  { value: 'investment-maturity', label: 'Investment Maturity', description: 'Matured investment, FD, bonds', icon: DollarSign },
  { value: 'lottery', label: 'Lottery/Prize', description: 'Lottery winnings or prize money', icon: Award },
  { value: 'refund', label: 'Refund', description: 'Tax refund or other refunds', icon: ArrowUpDown },
  { value: 'side-gig', label: 'Side Gig', description: 'One-time freelance or project work', icon: Banknote },
  { value: 'other', label: 'Other', description: 'Any other one-time income', icon: Plus },
] as const

export function OneTimeIncomeForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false,
  triggerText = "Add One-Time Income",
  mode = 'create'
}: OneTimeIncomeFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [conversionPreview, setConversionPreview] = useState<CurrencyConversion | CurrencyConversionError | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  
  const { primaryCurrency, convertAmount, formatAmount } = useCurrency()

  const form = useForm<OneTimeIncomeFormSchema>({
    resolver: zodResolver(oneTimeIncomeSchema),
    defaultValues: {
      type: initialData?.type || 'bonus',
      name: initialData?.name || '',
      description: initialData?.description || '',
      amount: initialData?.amount || 0,
      currency: initialData?.currency || primaryCurrency,
      date: initialData?.date || new Date(),
      source: initialData?.source || '',
      isRecorded: initialData?.isRecorded ?? false,
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

  const handleSubmit = async (data: OneTimeIncomeFormSchema) => {
    try {
      await onSubmit(data)
      if (mode === 'create') {
        form.reset()
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting one-time income:', error)
    }
  }

  const selectedType = oneTimeIncomeTypes.find(type => type.value === form.watch('type'))
  const selectedTypeIcon = selectedType?.icon || Plus

  // Get converted amounts for display
  const getConvertedAmounts = () => {
    if (!conversionPreview || 'errorType' in conversionPreview) {
      return {
        convertedAmount: watchedAmount || 0,
        convertedCurrency: watchedCurrency || primaryCurrency,
        hasConversion: false,
        conversionError: conversionPreview && 'errorType' in conversionPreview ? conversionPreview.message : null
      }
    }

    return {
      convertedAmount: conversionPreview.convertedAmount,
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
        <Button variant="outline">
          <Gift className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add One-Time Income' : 'Edit One-Time Income'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Record a one-time income like a bonus, gift, or matured investment.'
              : 'Update your one-time income details.'
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
                        {oneTimeIncomeTypes.map((type) => {
                          const IconComponent = type.icon
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          )
                        })}
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
                    <FormLabel>Income Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Year-end Bonus, Birthday Gift" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this income
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
            >
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional details about this income..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional notes about this income
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
                      Total amount received
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
                      Currency of this income
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
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Received</FormLabel>
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
                      When you received this income
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., ABC Company, Uncle John" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Who or what provided this income
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {/* Recorded Status */}
              <FormField
                control={form.control}
                name="isRecorded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Mark as Recorded
                      </FormLabel>
                      <FormDescription>
                        Have you actually received this income?
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
            </motion.div>

            {/* Income Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <selectedTypeIcon className="h-4 w-4" />
                    Income Summary
                    {isConverting && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedType?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        {formatAmount(form.watch('amount') || 0, form.watch('currency'))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {form.watch('date') ? format(form.watch('date'), "PPP") : 'Not selected'}
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
                          <span className="text-muted-foreground">Amount ({primaryCurrency}):</span>
                          <span className="font-medium text-green-600">
                            {formatAmount(conversionInfo.convertedAmount, primaryCurrency)}
                          </span>
                        </div>
                      </>
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
                      <span className={`font-medium ${form.watch('isRecorded') ? 'text-green-600' : 'text-orange-600'}`}>
                        {form.watch('isRecorded') ? 'Recorded' : 'Not Recorded Yet'}
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
              transition={{ duration: 0.3, delay: 0.6 }}
              className="flex gap-3 pt-4"
            >
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading 
                  ? (mode === 'create' ? 'Adding...' : 'Updating...') 
                  : (mode === 'create' ? 'Add One-Time Income' : 'Update One-Time Income')
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
