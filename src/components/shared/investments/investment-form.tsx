"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getInvestmentCategories } from '@/lib/financial/investments'
import { Investment } from '@/types/financial'
import { StockInvestmentForm } from './stock-investment-form'
import { CryptoInvestmentForm } from './crypto-investment-form'
import { BondInvestmentForm } from './bond-investment-form'
import { MutualFundInvestmentForm } from './mutual-fund-investment-form'
import { RealEstateInvestmentForm } from './real-estate-investment-form'
import { OtherInvestmentForm } from './other-investment-form'

interface InvestmentFormProps {
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<Investment>
  isLoading?: boolean
  triggerText?: string
  mode?: 'create' | 'edit'
}

export function InvestmentForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false,
  triggerText = "Add Investment",
  mode = 'create'
}: InvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<Investment['type'] | null>(initialData?.type || null)
  const categories = getInvestmentCategories()

  const handleTypeSelect = (type: Investment['type']) => {
    setSelectedType(type)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data)
      setIsOpen(false)
      setSelectedType(null)
    } catch (error) {
      console.error('Error submitting investment:', error)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setSelectedType(null)
    onCancel?.()
  }

  // If we have initial data, use its type
  const formType = initialData?.type || selectedType

  // Render the appropriate form based on type
  const renderSpecificForm = () => {
    if (!formType) return null

    const commonProps = {
      onSubmit: handleFormSubmit,
      onCancel: handleCancel,
      initialData,
      isLoading,
      mode
    }

    switch (formType) {
      case 'stock':
        return <StockInvestmentForm {...commonProps} triggerText="" />
      case 'crypto':
        return <CryptoInvestmentForm {...commonProps} triggerText="" />
      case 'bond':
        return <BondInvestmentForm {...commonProps} triggerText="" />
      case 'mutual-fund':
        return <MutualFundInvestmentForm {...commonProps} triggerText="" />
      case 'real-estate':
        return <RealEstateInvestmentForm {...commonProps} triggerText="" />
      case 'other':
        return <OtherInvestmentForm {...commonProps} triggerText="" />
      default:
        return null
    }
  }

  // If editing, render the specific form directly
  if (mode === 'edit' && formType) {
    return renderSpecificForm()
  }

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
          <DialogTitle>Add New Investment</DialogTitle>
          <DialogDescription>
            Choose the type of investment you want to add to your portfolio.
          </DialogDescription>
        </DialogHeader>

        {!selectedType ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Investment Type</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map((category) => (
                <Card
                  key={category.type}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleTypeSelect(category.type)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{category.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      {category.description}
                    </p>
                    <p className="text-xs font-medium">
                      Examples: {category.examples.slice(0, 3).join(', ')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {categories.find(c => c.type === selectedType)?.label} Investment
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                Change Type
              </Button>
            </div>
            {renderSpecificForm()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}