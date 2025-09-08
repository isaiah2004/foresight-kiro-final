"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarIcon, Plus, Layers, DollarSign } from 'lucide-react'
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

const otherInvestmentSchema = z.object({
  symbol: z.string().min(1, 'Investment identifier is required'),
  investmentName: z.string().optional(),
  investmentType: z.enum(['commodity', 'precious-metals', 'collectibles', 'derivatives', 'private-equity', 'hedge-fund', 'structured-product', 'alternative', 'other']),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  purchaseCurrency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: z.date().max(new Date(), 'Purchase date cannot be in the future'),
  maturityDate: z.date().optional(),
  storageLocation: z.string().optional(),
  storageCosts: z.number().min(0).optional(),
  insuranceCosts: z.number().min(0).optional(),
  managementFees: z.number().min(0).max(100).optional(),
  expectedReturn: z.number().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'very-high']).optional(),
  notes: z.string().optional()
})

type OtherInvestmentFormData = z.infer<typeof otherInvestmentSchema>

interface OtherInvestmentFormProps {
  onSubmit: (data: OtherInvestmentFormData & { type: 'other' }) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<Investment>
  isLoading?: boolean
  triggerText?: string
  mode?: 'create' | 'edit'
}

const investmentTypes = [
  { value: 'commodity', label: 'Commodity', description: 'Oil, gas, agricultural products' },
  { value: 'precious-metals', label: 'Precious Metals', description: 'Gold, silver, platinum' },
  { value: 'collectibles', label: 'Collectibles', description: 'Art, wine, antiques' },
  { value: 'derivatives', label: 'Derivatives', description: 'Options, futures, swaps' },
  { value: 'private-equity', label: 'Private Equity', description: 'Private company investments' },
  { value: 'hedge-fund', label: 'Hedge Fund', description: 'Alternative investment funds' },
  { value: 'structured-product', label: 'Structured Product', description: 'Complex financial instruments' },
  { value: 'alternative', label: 'Alternative Investment', description: 'Non-traditional investments' },
  { value: 'other', label: 'Other', description: 'Other investment types' },
] as const

const riskLevels = [
  { value: 'low', label: 'Low Risk', description: 'Conservative investments' },
  { value: 'medium', label: 'Medium Risk', description: 'Moderate risk investments' },
  { value: 'high', label: 'High Risk', description: 'Aggressive investments' },
  { value: 'very-high', label: 'Very High Risk', description: 'Speculative investments' },
] as const

export function OtherInvestmentForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false,
  triggerText = "Add Other Investment",
  mode = 'create'
}: OtherInvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<OtherInvestmentFormData>({
    resolver: zodResolver(otherInvestmentSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      investmentName: '',
      investmentType: 'commodity',
      quantity: initialData?.quantity || 0,
      unitPrice: initialData?.purchasePrice || 0,
      purchaseCurrency: initialData?.purchaseCurrency || 'USD',
      purchaseDate: initialData?.purchaseDate || new Date(),
      maturityDate: undefined,
      storageLocation: '',
      storageCosts: 0,
      insuranceCosts: 0,
      managementFees: 0,
      expectedReturn: 0,
      riskLevel: 'medium',
      notes: ''
    }
  })

  const handleSubmit = async (data: OtherInvestmentFormData) => {
    try {
      await onSubmit({ ...data, type: 'other' })
      if (mode === 'create') {
        form.reset()
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting other investment:', error)
    }
  }

  const quantity = form.watch('quantity') || 0
  const unitPrice = form.watch('unitPrice') || 0
  const storageCosts = form.watch('storageCosts') || 0
  const insuranceCosts = form.watch('insuranceCosts') || 0
  const managementFees = form.watch('managementFees') || 0
  
  const totalInvestment = quantity * unitPrice
  const annualCosts = storageCosts + insuranceCosts + (totalInvestment * (managementFees / 100))

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
            {mode === 'create' ? 'Add Alternative Investment' : 'Edit Alternative Investment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add an alternative investment such as commodities, collectibles, or derivatives to your portfolio.'
              : 'Update your alternative investment details and characteristics.'
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
              {/* Investment Identifier */}
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Identifier</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., GOLD, OIL, ART001" 
                        {...field}
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this investment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Investment Name */}
              <FormField
                control={form.control}
                name="investmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Gold Bullion, Vintage Wine Collection" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descriptive name of the investment
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
              {/* Investment Type */}
              <FormField
                control={form.control}
                name="investmentType"
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
                        {investmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Category of alternative investment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Risk Level */}
              <FormField
                control={form.control}
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Level (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {riskLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Risk assessment of this investment
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
              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity/Units</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.000001"
                        placeholder="0.000000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of units or amount purchased
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Price */}
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
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
                      Price per unit at purchase
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
                      Currency of the investment
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Maturity Date */}
              <FormField
                control={form.control}
                name="maturityDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maturity Date (Optional)</FormLabel>
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
                              <span>No maturity date</span>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Expiration or maturity date (if applicable)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Storage Location */}
              <FormField
                control={form.control}
                name="storageLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Location (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Bank Vault, Home Safe, Warehouse" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Where the investment is stored
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Costs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Costs & Fees</h3>
              
              <div className="grid gap-6 md:grid-cols-3">
                {/* Storage Costs */}
                <FormField
                  control={form.control}
                  name="storageCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Storage Costs (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="100.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Annual storage fees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Insurance Costs */}
                <FormField
                  control={form.control}
                  name="insuranceCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Insurance (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="50.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Annual insurance costs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Management Fees */}
                <FormField
                  control={form.control}
                  name="managementFees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Fees % (Optional)</FormLabel>
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
                        Annual management fee percentage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>

            {/* Expected Return */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <FormField
                control={form.control}
                name="expectedReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Annual Return % (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="5.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Expected annual return percentage
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
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Alternative Investment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investment ID:</span>
                      <span className="font-medium">{form.watch('symbol') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">
                        {investmentTypes.find(t => t.value === form.watch('investmentType'))?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit Price:</span>
                      <span className="font-medium">
                        {form.watch('purchaseCurrency')} {unitPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Total Investment:</span>
                      <span className="font-medium text-primary">
                        {form.watch('purchaseCurrency')} {totalInvestment.toFixed(2)}
                      </span>
                    </div>
                    {annualCosts > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Costs:</span>
                        <span className="font-medium text-red-600">
                          {form.watch('purchaseCurrency')} {annualCosts.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {form.watch('riskLevel') && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Level:</span>
                        <span className={`font-medium ${
                          form.watch('riskLevel') === 'low' ? 'text-green-600' :
                          form.watch('riskLevel') === 'medium' ? 'text-yellow-600' :
                          form.watch('riskLevel') === 'high' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {riskLevels.find(r => r.value === form.watch('riskLevel'))?.label}
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
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Investment thesis, storage details, etc."
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
              transition={{ duration: 0.3, delay: 0.9 }}
              className="flex gap-3 pt-4"
            >
              <Button 
                type="submit" 
                disabled={isLoading || !form.watch('symbol')}
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add Alternative Investment'}
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