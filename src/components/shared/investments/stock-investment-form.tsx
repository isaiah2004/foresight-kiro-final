"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarIcon, Plus, TrendingUp, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CurrencySelector } from '@/components/shared/currency/currency-selector'
import { StockSearch } from './stock-search'
import { Investment } from '@/types/financial'

const stockInvestmentSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long'),
  companyName: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  purchaseCurrency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: z.date().max(new Date(), 'Purchase date cannot be in the future'),
  brokerageAccount: z.string().optional(),
  orderType: z.enum(['market', 'limit', 'stop-loss']).optional(),
  dividendYield: z.number().min(0).max(100).optional(),
  notes: z.string().optional()
})

type StockInvestmentFormData = z.infer<typeof stockInvestmentSchema>

interface StockInvestmentFormProps {
  onSubmit: (data: StockInvestmentFormData & { type: 'stock' }) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<Investment>
  isLoading?: boolean
  triggerText?: string
  mode?: 'create' | 'edit'
}

export function StockInvestmentForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false,
  triggerText = "Add Stock Investment",
  mode = 'create'
}: StockInvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any>(null)

  const form = useForm<StockInvestmentFormData>({
    resolver: zodResolver(stockInvestmentSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      companyName: '',
      quantity: initialData?.quantity || 0,
      purchasePrice: initialData?.purchasePrice || 0,
      purchaseCurrency: initialData?.purchaseCurrency || 'USD',
      purchaseDate: initialData?.purchaseDate || new Date(),
      brokerageAccount: '',
      orderType: 'market',
      dividendYield: 0,
      notes: ''
    }
  })

  // Update form when stock is selected from search
  useEffect(() => {
    if (selectedStock) {
      form.setValue('symbol', selectedStock.symbol)
      form.setValue('companyName', selectedStock.name)
      if (selectedStock.currentPrice) {
        form.setValue('purchasePrice', selectedStock.currentPrice)
      }
      form.setValue('purchaseCurrency', selectedStock.currency || 'USD')
    }
  }, [selectedStock, form])

  const handleSubmit = async (data: StockInvestmentFormData) => {
    try {
      await onSubmit({ ...data, type: 'stock' })
      if (mode === 'create') {
        form.reset()
        setSelectedStock(null)
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting stock investment:', error)
    }
  }

  const totalInvestment = (form.watch('quantity') || 0) * (form.watch('purchasePrice') || 0)

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
            {mode === 'create' ? 'Add Stock Investment' : 'Edit Stock Investment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Search for a stock and add it to your investment portfolio with purchase details.'
              : 'Update your stock investment details and purchase information.'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search & Select Stock</TabsTrigger>
            <TabsTrigger value="details">Investment Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <StockSearch
              onSelect={setSelectedStock}
              selectedSymbol={selectedStock?.symbol}
              searchType="stock"
            />
            
            {selectedStock && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Selected Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symbol:</span>
                      <span className="font-medium">{selectedStock.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company:</span>
                      <span className="font-medium">{selectedStock.name}</span>
                    </div>
                    {selectedStock.currentPrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Price:</span>
                        <span className="font-medium">
                          {selectedStock.currency} {selectedStock.currentPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-6 md:grid-cols-2"
                >
                  {/* Symbol (read-only if selected from search) */}
                  <FormField
                    control={form.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Symbol</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., AAPL, GOOGL" 
                            {...field}
                            className="uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            readOnly={!!selectedStock}
                          />
                        </FormControl>
                        <FormDescription>
                          {selectedStock ? 'Selected from search' : 'Stock ticker symbol'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Company Name */}
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Apple Inc." 
                            {...field}
                            readOnly={!!selectedStock}
                          />
                        </FormControl>
                        <FormDescription>
                          Full company name
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
                        <FormLabel>Number of Shares</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.000001"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of shares purchased
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
                        <FormLabel>Purchase Price (per share)</FormLabel>
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
                          Price paid per share
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
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <CurrencySelector
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select currency"
                          />
                        </FormControl>
                        <FormDescription>
                          Currency used for purchase
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
                          When you purchased this stock
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
                  {/* Brokerage Account */}
                  <FormField
                    control={form.control}
                    name="brokerageAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brokerage Account (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Fidelity, Charles Schwab" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Where you purchased this stock
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
                            placeholder="0.00"
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

                {/* Investment Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Stock Investment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stock Symbol:</span>
                          <span className="font-medium">{form.watch('symbol') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shares:</span>
                          <span className="font-medium">{form.watch('quantity') || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price per Share:</span>
                          <span className="font-medium">
                            {form.watch('purchaseCurrency')} {(form.watch('purchasePrice') || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-muted-foreground">Total Investment:</span>
                          <span className="font-medium text-primary">
                            {form.watch('purchaseCurrency')} {totalInvestment.toFixed(2)}
                          </span>
                        </div>
                        {form.watch('dividendYield') && form.watch('dividendYield')! > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expected Annual Dividend:</span>
                            <span className="font-medium text-green-600">
                              {form.watch('purchaseCurrency')} {(totalInvestment * (form.watch('dividendYield')! / 100)).toFixed(2)}
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
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Investment thesis, research notes, etc."
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
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="flex gap-3 pt-4"
                >
                  <Button 
                    type="submit" 
                    disabled={isLoading || !form.watch('symbol')}
                    className="flex-1"
                  >
                    {isLoading ? 'Adding...' : 'Add Stock Investment'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      form.reset()
                      setSelectedStock(null)
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}