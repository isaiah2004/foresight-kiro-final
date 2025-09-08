"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarIcon, Plus, Home, DollarSign } from 'lucide-react'
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

const realEstateInvestmentSchema = z.object({
  symbol: z.string().min(1, 'Property identifier is required'),
  propertyName: z.string().optional(),
  propertyType: z.enum(['residential', 'commercial', 'reit', 'land', 'industrial', 'retail', 'office', 'multifamily', 'other']),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  purchaseCurrency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: z.date().max(new Date(), 'Purchase date cannot be in the future'),
  propertyAddress: z.string().optional(),
  squareFootage: z.number().min(0).optional(),
  monthlyRent: z.number().min(0).optional(),
  propertyTaxes: z.number().min(0).optional(),
  maintenanceCosts: z.number().min(0).optional(),
  managementFees: z.number().min(0).optional(),
  occupancyRate: z.number().min(0).max(100).optional(),
  capRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional()
})

type RealEstateInvestmentFormData = z.infer<typeof realEstateInvestmentSchema>

interface RealEstateInvestmentFormProps {
  onSubmit: (data: RealEstateInvestmentFormData & { type: 'real-estate' }) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<Investment>
  isLoading?: boolean
  triggerText?: string
  mode?: 'create' | 'edit'
}

const propertyTypes = [
  { value: 'residential', label: 'Residential', description: 'Single-family homes, condos' },
  { value: 'commercial', label: 'Commercial', description: 'Office buildings, warehouses' },
  { value: 'reit', label: 'REIT', description: 'Real Estate Investment Trust' },
  { value: 'land', label: 'Land', description: 'Undeveloped land' },
  { value: 'industrial', label: 'Industrial', description: 'Manufacturing, logistics' },
  { value: 'retail', label: 'Retail', description: 'Shopping centers, stores' },
  { value: 'office', label: 'Office', description: 'Office buildings' },
  { value: 'multifamily', label: 'Multifamily', description: 'Apartments, duplexes' },
  { value: 'other', label: 'Other', description: 'Other property types' },
] as const

export function RealEstateInvestmentForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false,
  triggerText = "Add Real Estate Investment",
  mode = 'create'
}: RealEstateInvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<RealEstateInvestmentFormData>({
    resolver: zodResolver(realEstateInvestmentSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      propertyName: '',
      propertyType: 'residential',
      purchasePrice: initialData?.purchasePrice || 0,
      purchaseCurrency: initialData?.purchaseCurrency || 'USD',
      purchaseDate: initialData?.purchaseDate || new Date(),
      propertyAddress: '',
      squareFootage: 0,
      monthlyRent: 0,
      propertyTaxes: 0,
      maintenanceCosts: 0,
      managementFees: 0,
      occupancyRate: 100,
      capRate: 0,
      notes: ''
    }
  })

  const handleSubmit = async (data: RealEstateInvestmentFormData) => {
    try {
      await onSubmit({ ...data, type: 'real-estate' })
      if (mode === 'create') {
        form.reset()
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting real estate investment:', error)
    }
  }

  const purchasePrice = form.watch('purchasePrice') || 0
  const monthlyRent = form.watch('monthlyRent') || 0
  const propertyTaxes = form.watch('propertyTaxes') || 0
  const maintenanceCosts = form.watch('maintenanceCosts') || 0
  const managementFees = form.watch('managementFees') || 0
  const occupancyRate = form.watch('occupancyRate') || 100
  
  // Calculate financial metrics
  const annualRent = monthlyRent * 12 * (occupancyRate / 100)
  const annualExpenses = propertyTaxes + (maintenanceCosts * 12) + (managementFees * 12)
  const netOperatingIncome = annualRent - annualExpenses
  const grossRentMultiplier = purchasePrice > 0 && annualRent > 0 ? purchasePrice / annualRent : 0
  const cashOnCashReturn = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0

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
            {mode === 'create' ? 'Add Real Estate Investment' : 'Edit Real Estate Investment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a real estate investment to your portfolio with property details and financials.'
              : 'Update your real estate investment details and financial information.'
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
              {/* Property Identifier */}
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Identifier</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., PROP001, VNQ, 123MainSt" 
                        {...field}
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this property
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Name */}
              <FormField
                control={form.control}
                name="propertyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Downtown Apartment, Office Complex" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descriptive name of the property
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
              {/* Property Type */}
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Type of real estate investment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Address */}
              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 123 Main St, City, State" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Physical address of the property
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
                        placeholder="250000.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Total purchase price of the property
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Square Footage */}
              <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Square Footage (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1"
                        placeholder="1500"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Total square footage of the property
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
                      When you purchased this property
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Income Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Income & Expenses</h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Monthly Rent */}
                <FormField
                  control={form.control}
                  name="monthlyRent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="2000.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Monthly rental income
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Occupancy Rate */}
                <FormField
                  control={form.control}
                  name="occupancyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupancy Rate % (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="95.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Expected occupancy percentage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Property Taxes */}
                <FormField
                  control={form.control}
                  name="propertyTaxes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Property Taxes (Optional)</FormLabel>
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
                        Annual property tax amount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Maintenance Costs */}
                <FormField
                  control={form.control}
                  name="maintenanceCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Maintenance (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="200.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Monthly maintenance costs
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
                      <FormLabel>Monthly Management Fees (Optional)</FormLabel>
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
                        Monthly property management fees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>

            {/* Real Estate Investment Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Real Estate Investment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property ID:</span>
                      <span className="font-medium">{form.watch('symbol') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Price:</span>
                      <span className="font-medium">
                        {form.watch('purchaseCurrency')} {purchasePrice.toLocaleString()}
                      </span>
                    </div>
                    {monthlyRent > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Rent (Gross):</span>
                          <span className="font-medium text-green-600">
                            {form.watch('purchaseCurrency')} {(monthlyRent * 12).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Rent (Net):</span>
                          <span className="font-medium text-green-600">
                            {form.watch('purchaseCurrency')} {annualRent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Expenses:</span>
                          <span className="font-medium text-red-600">
                            {form.watch('purchaseCurrency')} {annualExpenses.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-muted-foreground">Net Operating Income:</span>
                          <span className={`font-medium ${netOperatingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {form.watch('purchaseCurrency')} {netOperatingIncome.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cash-on-Cash Return:</span>
                          <span className={`font-medium ${cashOnCashReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {cashOnCashReturn.toFixed(2)}%
                          </span>
                        </div>
                        {grossRentMultiplier > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gross Rent Multiplier:</span>
                            <span className="font-medium">
                              {grossRentMultiplier.toFixed(1)}x
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Investment strategy, property details, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional information about this real estate investment
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
              transition={{ duration: 0.3, delay: 0.7 }}
              className="flex gap-3 pt-4"
            >
              <Button 
                type="submit" 
                disabled={isLoading || !form.watch('symbol')}
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add Real Estate Investment'}
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