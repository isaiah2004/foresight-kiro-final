"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarIcon, Plus, X } from 'lucide-react'
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
import { CurrencySelector } from '@/components/shared/currency/currency-selector'
import { getInvestmentCategories, validateInvestmentData } from '@/lib/financial/investments'
import { Investment } from '@/types/financial'

const investmentSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long'),
  type: z.enum(['stock', 'bond', 'mutual-fund', 'real-estate', 'crypto', 'other']),
  quantity: z.number().positive('Quantity must be positive'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  purchaseCurrency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: z.date().max(new Date(), 'Purchase date cannot be in the future'),
  notes: z.string().optional()
})

type InvestmentFormData = z.infer<typeof investmentSchema>

interface InvestmentFormProps {
  onSubmit: (data: InvestmentFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<Investment>
  isLoading?: boolean
}

export function InvestmentForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false 
}: InvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const categories = getInvestmentCategories()

  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      type: initialData?.type || 'stock',
      quantity: initialData?.quantity || 0,
      purchasePrice: initialData?.purchasePrice || 0,
      purchaseCurrency: initialData?.purchaseCurrency || 'USD',
      purchaseDate: initialData?.purchaseDate || new Date(),
      notes: ''
    }
  })

  const handleSubmit = async (data: InvestmentFormData) => {
    try {
      await onSubmit(data)
      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting investment:', error)
    }
  }

  const selectedCategory = categories.find(cat => cat.type === form.watch('type'))

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
          <DialogDescription>
            Add a new investment to your portfolio with purchase details and currency information.
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
              {/* Investment Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select investment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.type} value={category.type}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedCategory?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Symbol */}
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol/Ticker</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., AAPL, BTC, VFIAX" 
                        {...field}
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedCategory && (
                        <span>Examples: {selectedCategory.examples.join(', ')}</span>
                      )}
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
              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.000001"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of shares, units, or coins
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Purchase Price */}
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (per unit)</FormLabel>
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
                      Price paid per share/unit
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
              {/* Currency */}
              <FormField
                control={form.control}
                name="purchaseCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Currency</FormLabel>
                    <FormControl>
                      <CurrencySelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select currency"
                      />
                    </FormControl>
                    <FormDescription>
                      Currency used for the purchase
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
                      When you purchased this investment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Investment Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Investment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Investment:</span>
                      <span className="font-medium">
                        {form.watch('purchaseCurrency')} {(form.watch('quantity') * form.watch('purchasePrice')).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investment Type:</span>
                      <span className="font-medium">{selectedCategory?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symbol:</span>
                      <span className="font-medium">{form.watch('symbol') || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Additional notes about this investment"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional information about this investment
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
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex gap-3 pt-4"
            >
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add Investment'}
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