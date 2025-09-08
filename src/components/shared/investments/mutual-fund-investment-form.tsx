"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarIcon, Plus, PieChart, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CurrencySelector } from '@/components/shared/currency/currency-selector'
import { Investment } from '@/types/financial'

const mutualFundInvestmentSchema = z.object({
  symbol: z.string().min(1, 'Fund symbol is required'),
  fundName: z.string().optional(),
  fundType: z.enum(['index', 'actively-managed', 'etf', 'bond-fund', 'money-market', 'target-date', 'sector', 'international', 'other']),
  shares: z.number().positive('Number of shares must be positive'),
  nav: z.number().positive('NAV must be positive'),
  purchaseCurrency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: z.date().max(new Date(), 'Purchase date cannot be in the future'),
  expenseRatio: z.number().min(0).max(10, 'Expense ratio must be between 0-10%').optional(),
  minimumInvestment: z.number().min(0).optional(),
  fundFamily: z.string().optional(),
  benchmark: z.string().optional(),
  dividendYield: z.number().min(0).max(100).optional(),
  notes: z.string().optional()
})

type MutualFundInvestmentFormData = z.infer<typeof mutualFundInvestmentSchema>

interface MutualFundInvestmentFormProps {
  onSubmit: (data: MutualFundInvestmentFormData & { type: 'mutual-fund' }) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<Investment>
  isLoading?: boolean
  triggerText?: string
  mode?: 'create' | 'edit'
}

const fundTypes = [
  { value: 'index', label: 'Index Fund', description: 'Tracks a market index' },
  { value: 'actively-managed', label: 'Actively Managed', description: 'Professional fund management' },
  { value: 'etf', label: 'ETF', description: 'Exchange-traded fund' },
  { value: 'bond-fund', label: 'Bond Fund', description: 'Invests in bonds' },
  { value: 'money-market', label: 'Money Market', description: 'Short-term debt securities' },
  { value: 'target-date', label: 'Target Date', description: 'Retirement-focused fund' },
  { value: 'sector', label: 'Sector Fund', description: 'Specific industry focus' },
  { value: 'international', label: 'International', description: 'Global investments' },
  { value: 'other', label: 'Other', description: 'Other fund types' },
] as const

export function MutualFundInvestmentForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false,
  triggerText = "Add Mutual Fund Investment",
  mode = 'create'
}: MutualFundInvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<MutualFundInvestmentFormData>({
    resolver: zodResolver(mutualFundInvestmentSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      fundName: '',
      fundType: 'index',
      shares: initialData?.quantity || 0,
      nav: initialData?.purchasePrice || 0,
      purchaseCurrency: initialData?.purchaseCurrency || 'USD',
      purchaseDate: initialData?.purchaseDate || new Date(),
      expenseRatio: 0,
      minimumInvestment: 0,
      fundFamily: '',
      benchmark: '',
      dividendYield: 0,
      notes: ''
    }
  })

  const handleSubmit = async (data: MutualFundInvestmentFormData) => {
    try {
      await onSubmit({ ...data, type: 'mutual-fund' })
      if (mode === 'create') {
        form.reset()
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting mutual fund investment:', error)
    }
  }

  const shares = form.watch('shares') || 0
  const nav = form.watch('nav') || 0
  const expenseRatio = form.watch('expenseRatio') || 0
  const dividendYield = form.watch('dividendYield') || 0
  
  const totalInvestment = shares * nav
  const annualExpense = totalInvestment * (expenseRatio / 100)
  const annualDividend = totalInvestment * (dividendYield / 100)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Mutual Fund Investment' : 'Edit Mutual Fund Investment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a mutual fund or ETF investment to your portfolio with fund details.'
              : 'Update your mutual fund investment details and characteristics.'
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
              {/* Fund Symbol */}
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fund Symbol</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., VFIAX, SPY, FXNAX" 
                        {...field}
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Mutual fund or ETF ticker symbol
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fund Name */}
              <FormField
                control={form.control}
                name="fundName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fund Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Vanguard 500 Index Fund" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Full name of the fund
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
              {/* Fund Type */}
              <FormField
                control={form.control}
                name="fundType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fund Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fund type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fundTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Type of mutual fund or ETF
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fund Family */}
              <FormField
                control={form.control}
                name="fundFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fund Family (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Vanguard, Fidelity, BlackRock" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Fund management company
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
              {/* Number of Shares */}
              <FormField
                control={form.control}
                name="shares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Shares</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.001"
                        placeholder="0.000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of fund shares purchased
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NAV (Net Asset Value) */}
              <FormField
                control={form.control}
                name="nav"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NAV (Net Asset Value)</FormLabel>
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
                      Price per share at purchase
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
              {/* Currency */}
              <FormField
                control={form.control}
                name="purchaseCurrency"
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
                      Currency of the fund
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Purchase Date */}
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
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
                      When you purchased this fund
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
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Expense Ratio */}
              <FormField
                control={form.control}
                name="expenseRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Ratio % (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.04"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Annual management fee percentage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dividend Yield */}
              <FormField
                control={form.control}
                name="dividendYield"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dividend Yield % (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="1.50"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Annual dividend yield percentage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Minimum Investment */}
              <FormField
                control={form.control}
                name="minimumInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Investment (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="3000.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum investment required
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Benchmark */}
              <FormField
                control={form.control}
                name="benchmark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benchmark (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., S&P 500, Total Stock Market" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Index or benchmark the fund tracks
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Fund Investment Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Mutual Fund Investment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fund Symbol:</span>
                      <span className="font-medium">{form.watch('symbol') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shares:</span>
                      <span className="font-medium">{shares.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NAV per Share:</span>
                      <span className="font-medium">
                        {form.watch('purchaseCurrency')} {nav.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Total Investment:</span>
                      <span className="font-medium text-primary">
                        {form.watch('purchaseCurrency')} {totalInvestment.toFixed(2)}
                      </span>
                    </div>
                    {expenseRatio > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Expense:</span>
                        <span className="font-medium text-red-600">
                          {form.watch('purchaseCurrency')} {annualExpense.toFixed(2)} ({expenseRatio}%)
                        </span>
                      </div>
                    )}
                    {dividendYield > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Annual Dividend:</span>
                        <span className="font-medium text-green-600">
                          {form.watch('purchaseCurrency')} {annualDividend.toFixed(2)} ({dividendYield}%)
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Investment strategy, research notes, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional information about this fund investment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Form Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              className="flex gap-3 pt-4"
            >
              <Button 
                type="submit" 
                disabled={isLoading || !form.watch('symbol')}
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add Fund Investment'}
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