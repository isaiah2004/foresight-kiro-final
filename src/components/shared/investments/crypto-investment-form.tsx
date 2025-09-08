"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarIcon, Plus, Bitcoin, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CurrencySelector } from '@/components/shared/currency/currency-selector'
import { StockSearch } from './stock-search'
import { Investment } from '@/types/financial'

const cryptoInvestmentSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long'),
  cryptoName: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  purchaseCurrency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: z.date().max(new Date(), 'Purchase date cannot be in the future'),
  exchange: z.string().optional(),
  walletType: z.enum(['hot', 'cold', 'exchange']).optional(),
  walletAddress: z.string().optional(),
  stakingReward: z.number().min(0).max(100).optional(),
  notes: z.string().optional()
})

type CryptoInvestmentFormData = z.infer<typeof cryptoInvestmentSchema>

interface CryptoInvestmentFormProps {
  onSubmit: (data: CryptoInvestmentFormData & { type: 'crypto' }) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<Investment>
  isLoading?: boolean
  triggerText?: string
  mode?: 'create' | 'edit'
}

const walletTypes = [
  { value: 'hot', label: 'Hot Wallet', description: 'Online wallet (mobile/desktop app)' },
  { value: 'cold', label: 'Cold Wallet', description: 'Hardware wallet (Ledger, Trezor)' },
  { value: 'exchange', label: 'Exchange Wallet', description: 'Kept on exchange platform' },
] as const

export function CryptoInvestmentForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false,
  triggerText = "Add Crypto Investment",
  mode = 'create'
}: CryptoInvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null)

  const form = useForm<CryptoInvestmentFormData>({
    resolver: zodResolver(cryptoInvestmentSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      cryptoName: '',
      quantity: initialData?.quantity || 0,
      purchasePrice: initialData?.purchasePrice || 0,
      purchaseCurrency: initialData?.purchaseCurrency || 'USD',
      purchaseDate: initialData?.purchaseDate || new Date(),
      exchange: '',
      walletType: 'exchange',
      walletAddress: '',
      stakingReward: 0,
      notes: ''
    }
  })

  // Update form when crypto is selected from search
  useEffect(() => {
    if (selectedCrypto) {
      form.setValue('symbol', selectedCrypto.symbol)
      form.setValue('cryptoName', selectedCrypto.name)
      if (selectedCrypto.currentPrice) {
        form.setValue('purchasePrice', selectedCrypto.currentPrice)
      }
      form.setValue('purchaseCurrency', selectedCrypto.currency || 'USD')
    }
  }, [selectedCrypto, form])

  const handleSubmit = async (data: CryptoInvestmentFormData) => {
    try {
      await onSubmit({ ...data, type: 'crypto' })
      if (mode === 'create') {
        form.reset()
        setSelectedCrypto(null)
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting crypto investment:', error)
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
            {mode === 'create' ? 'Add Cryptocurrency Investment' : 'Edit Cryptocurrency Investment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Search for a cryptocurrency and add it to your investment portfolio with purchase details.'
              : 'Update your cryptocurrency investment details and storage information.'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search & Select Crypto</TabsTrigger>
            <TabsTrigger value="details">Investment Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <StockSearch
              onSelect={setSelectedCrypto}
              selectedSymbol={selectedCrypto?.symbol}
              searchType="crypto"
            />
            
            {selectedCrypto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bitcoin className="h-5 w-5" />
                    Selected Cryptocurrency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symbol:</span>
                      <span className="font-medium">{selectedCrypto.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedCrypto.name}</span>
                    </div>
                    {selectedCrypto.currentPrice && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Price:</span>
                        <span className="font-medium">
                          {selectedCrypto.currency} {selectedCrypto.currentPrice.toFixed(2)}
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
                  {/* Symbol */}
                  <FormField
                    control={form.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crypto Symbol</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., BTC, ETH, ADA" 
                            {...field}
                            className="uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            readOnly={!!selectedCrypto}
                          />
                        </FormControl>
                        <FormDescription>
                          {selectedCrypto ? 'Selected from search' : 'Cryptocurrency symbol'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Crypto Name */}
                  <FormField
                    control={form.control}
                    name="cryptoName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cryptocurrency Name (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Bitcoin, Ethereum" 
                            {...field}
                            readOnly={!!selectedCrypto}
                          />
                        </FormControl>
                        <FormDescription>
                          Full cryptocurrency name
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
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.00000001"
                            placeholder="0.00000000"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Amount of cryptocurrency purchased
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
                          Price paid per unit
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
                          When you purchased this crypto
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
                  {/* Exchange */}
                  <FormField
                    control={form.control}
                    name="exchange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exchange (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Coinbase, Binance, Kraken" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Where you purchased this crypto
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Wallet Type */}
                  <FormField
                    control={form.control}
                    name="walletType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Type (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select wallet type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {walletTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How you store this cryptocurrency
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
                  {/* Wallet Address */}
                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Address (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Wallet address (for tracking)" 
                            {...field}
                            className="font-mono text-xs"
                          />
                        </FormControl>
                        <FormDescription>
                          Wallet address for tracking (keep private)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Staking Reward */}
                  <FormField
                    control={form.control}
                    name="stakingReward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staking Reward % (Optional)</FormLabel>
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
                          Annual staking reward percentage
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
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Bitcoin className="h-4 w-4" />
                        Crypto Investment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cryptocurrency:</span>
                          <span className="font-medium">{form.watch('symbol') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">{form.watch('quantity') || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price per Unit:</span>
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
                        {form.watch('stakingReward') && form.watch('stakingReward')! > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expected Annual Staking:</span>
                            <span className="font-medium text-green-600">
                              {form.watch('purchaseCurrency')} {(totalInvestment * (form.watch('stakingReward')! / 100)).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {form.watch('walletType') && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Storage:</span>
                            <span className="font-medium">
                              {walletTypes.find(w => w.value === form.watch('walletType'))?.label}
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
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="flex gap-3 pt-4"
                >
                  <Button 
                    type="submit" 
                    disabled={isLoading || !form.watch('symbol')}
                    className="flex-1"
                  >
                    {isLoading ? 'Adding...' : 'Add Crypto Investment'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      form.reset()
                      setSelectedCrypto(null)
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