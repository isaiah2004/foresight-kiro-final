"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarIcon, Plus, Shield, DollarSign } from 'lucide-react'
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

const bondInvestmentSchema = z.object({
  symbol: z.string().min(1, 'Bond identifier is required'),
  bondName: z.string().optional(),
  bondType: z.enum(['government', 'corporate', 'municipal', 'treasury', 'other']),
  faceValue: z.number().positive('Face value must be positive'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  purchaseCurrency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: z.date().max(new Date(), 'Purchase date cannot be in the future'),
  maturityDate: z.date().min(new Date(), 'Maturity date must be in the future'),
  couponRate: z.number().min(0).max(100, 'Coupon rate must be between 0-100%'),
  paymentFrequency: z.enum(['monthly', 'quarterly', 'semi-annual', 'annual']),
  creditRating: z.string().optional(),
  issuer: z.string().optional(),
  notes: z.string().optional()
})

type BondInvestmentFormData = z.infer<typeof bondInvestmentSchema>

interface BondInvestmentFormProps {
  onSubmit: (data: BondInvestmentFormData & { type: 'bond' }) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<Investment>
  isLoading?: boolean
  triggerText?: string
  mode?: 'create' | 'edit'
}

const bondTypes = [
  { value: 'government', label: 'Government Bond', description: 'Issued by national governments' },
  { value: 'corporate', label: 'Corporate Bond', description: 'Issued by corporations' },
  { value: 'municipal', label: 'Municipal Bond', description: 'Issued by local governments' },
  { value: 'treasury', label: 'Treasury Bond', description: 'US Treasury securities' },
  { value: 'other', label: 'Other', description: 'Other bond types' },
] as const

const paymentFrequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
] as const

export function BondInvestmentForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false,
  triggerText = "Add Bond Investment",
  mode = 'create'
}: BondInvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<BondInvestmentFormData>({
    resolver: zodResolver(bondInvestmentSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      bondName: '',
      bondType: 'government',
      faceValue: 1000,
      purchasePrice: initialData?.purchasePrice || 0,
      purchaseCurrency: initialData?.purchaseCurrency || 'USD',
      purchaseDate: initialData?.purchaseDate || new Date(),
      maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      couponRate: 0,
      paymentFrequency: 'semi-annual',
      creditRating: '',
      issuer: '',
      notes: ''
    }
  })

  const handleSubmit = async (data: BondInvestmentFormData) => {
    try {
      await onSubmit({ ...data, type: 'bond' })
      if (mode === 'create') {
        form.reset()
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting bond investment:', error)
    }
  }

  const faceValue = form.watch('faceValue') || 0
  const purchasePrice = form.watch('purchasePrice') || 0
  const couponRate = form.watch('couponRate') || 0
  const paymentFreq = form.watch('paymentFrequency')
  
  // Calculate yield to maturity (simplified)
  const currentYield = purchasePrice > 0 ? (couponRate / 100) * (faceValue / purchasePrice) * 100 : 0
  
  // Calculate annual coupon payment
  const annualCoupon = (couponRate / 100) * faceValue
  const paymentsPerYear = paymentFreq === 'monthly' ? 12 : paymentFreq === 'quarterly' ? 4 : paymentFreq === 'semi-annual' ? 2 : 1
  const paymentAmount = annualCoupon / paymentsPerYear

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
            {mode === 'create' ? 'Add Bond Investment' : 'Edit Bond Investment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a bond investment to your portfolio with detailed bond characteristics.'
              : 'Update your bond investment details and characteristics.'
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
              {/* Bond Identifier */}
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bond Identifier/CUSIP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., US912828XG55, CORP2025" 
                        {...field}
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      CUSIP, ISIN, or bond identifier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bond Name */}
              <FormField
                control={form.control}
                name="bondName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bond Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., US Treasury 10Y, Apple Corp Bond" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descriptive name of the bond
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
              {/* Bond Type */}
              <FormField
                control={form.control}
                name="bondType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bond Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bond type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bondTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Type of bond issuer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Issuer */}
              <FormField
                control={form.control}
                name="issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuer (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., US Treasury, Apple Inc." 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Entity that issued the bond
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
              {/* Face Value */}
              <FormField
                control={form.control}
                name="faceValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Face Value (Par Value)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="1000.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maturity value of the bond
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
                    <FormLabel>Purchase Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="950.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Price paid for the bond
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
                      Currency of the bond
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Coupon Rate */}
              <FormField
                control={form.control}
                name="couponRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="3.50"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Annual interest rate percentage
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
                      When you purchased this bond
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Maturity Date */}
              <FormField
                control={form.control}
                name="maturityDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maturity Date</FormLabel>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the bond matures
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
              {/* Payment Frequency */}
              <FormField
                control={form.control}
                name="paymentFrequency"
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
                        {paymentFrequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often coupon payments are made
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Credit Rating */}
              <FormField
                control={form.control}
                name="creditRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Rating (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., AAA, AA+, BBB-" 
                        {...field}
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Credit rating from agencies (S&P, Moody&apos;s, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Bond Investment Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Bond Investment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bond Identifier:</span>
                      <span className="font-medium">{form.watch('symbol') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Face Value:</span>
                      <span className="font-medium">
                        {form.watch('purchaseCurrency')} {faceValue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Price:</span>
                      <span className="font-medium">
                        {form.watch('purchaseCurrency')} {purchasePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Premium/Discount:</span>
                      <span className={`font-medium ${purchasePrice > faceValue ? 'text-red-600' : purchasePrice < faceValue ? 'text-green-600' : ''}`}>
                        {purchasePrice > faceValue ? 'Premium' : purchasePrice < faceValue ? 'Discount' : 'At Par'} 
                        {purchasePrice !== faceValue && ` (${((purchasePrice - faceValue) / faceValue * 100).toFixed(2)}%)`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Current Yield:</span>
                      <span className="font-medium text-primary">
                        {currentYield.toFixed(2)}%
                      </span>
                    </div>
                    {paymentAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Amount ({paymentFreq}):</span>
                        <span className="font-medium text-green-600">
                          {form.watch('purchaseCurrency')} {paymentAmount.toFixed(2)}
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
                        placeholder="Investment thesis, research notes, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional information about this bond investment
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
                {isLoading ? 'Adding...' : 'Add Bond Investment'}
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