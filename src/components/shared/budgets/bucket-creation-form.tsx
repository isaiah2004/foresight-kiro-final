"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bucket, BucketExample, BUCKET_EXAMPLES, RENEWAL_RATE_OPTIONS } from '@/types/budget';
import { calculateNextRenewal } from '@/lib/financial/budgets';
import { useCurrency } from '@/hooks/use-currency';
import { Plus, Lightbulb, Calendar, DollarSign, Repeat } from 'lucide-react';

interface BucketCreationFormProps {
  onBucketCreate: (bucket: Omit<Bucket, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

export function BucketCreationForm({ onBucketCreate, onCancel }: BucketCreationFormProps) {
  const { primaryCurrency } = useCurrency();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as Bucket['category'] | '',
    targetAmount: '',
    renewalRate: 'monthly' as Bucket['renewalRate'],
    autoRenew: true,
    isActive: true,
  });
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.targetAmount) {
      return;
    }

    const bucket: Omit<Bucket, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      description: formData.description,
      category: formData.category as Bucket['category'],
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      currency: primaryCurrency,
      renewalRate: formData.renewalRate,
      nextRenewal: calculateNextRenewal(formData.renewalRate),
      isActive: formData.isActive,
      autoRenew: formData.autoRenew,
    };

    onBucketCreate(bucket);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: '',
      targetAmount: '',
      renewalRate: 'monthly',
      autoRenew: true,
      isActive: true,
    });
  };

  const handleExampleSelect = (example: BucketExample) => {
    setFormData(prev => ({
      ...prev,
      name: example.name,
      description: example.description,
      category: example.category,
      renewalRate: example.renewalRate,
    }));
    setShowExamples(false);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      essentials: 'bg-red-100 text-red-800',
      lifestyle: 'bg-amber-100 text-amber-800',
      savingsFuture: 'bg-emerald-100 text-emerald-800',
      sinkingFund: 'bg-blue-100 text-blue-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Bucket
        </CardTitle>
        <CardDescription>
          Set up a new budget bucket with specific goals and renewal rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bucket Examples */}
          <div className="flex items-center justify-between">
            <Label>Need inspiration?</Label>
            <Dialog open={showExamples} onOpenChange={setShowExamples}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  View Examples
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bucket Examples by Category</DialogTitle>
                  <DialogDescription>
                    Click on any example to use it as a template for your bucket
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {Object.entries(BUCKET_EXAMPLES).map(([category, examples]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="font-semibold capitalize flex items-center gap-2">
                        <Badge className={getCategoryColor(category)}>
                          {category === 'savingsFuture' ? 'Savings & Future' : 
                           category === 'sinkingFund' ? 'Sinking Fund' : category}
                        </Badge>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {examples.map((example, index) => (
                          <Card 
                            key={index} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleExampleSelect(example)}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-medium">{example.name}</h4>
                              <p className="text-sm text-muted-foreground">{example.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {RENEWAL_RATE_OPTIONS.find(r => r.value === example.renewalRate)?.label}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bucket-name">Bucket Name *</Label>
              <Input
                id="bucket-name"
                placeholder="e.g., Emergency Fund, Vacation, New Laptop"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bucket-description">Description</Label>
              <Textarea
                id="bucket-description"
                placeholder="Optional description of what this bucket is for..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bucket-category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Bucket['category'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essentials">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Essentials (50%)
                    </div>
                  </SelectItem>
                  <SelectItem value="lifestyle">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      Lifestyle (20%)
                    </div>
                  </SelectItem>
                  <SelectItem value="savingsFuture">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      Savings & Future (20%)
                    </div>
                  </SelectItem>
                  <SelectItem value="sinkingFund">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Sinking Fund (10%)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-amount">Target Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="target-amount"
                  type="number"
                  placeholder="1000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  className="pl-9"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewal-rate">Renewal Rate</Label>
              <Select 
                value={formData.renewalRate} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, renewalRate: value as Bucket['renewalRate'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RENEWAL_RATE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How often should this bucket be refilled from your budget allocation?
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-renew">Auto Renewal</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically add funds to this bucket based on the renewal rate
                </p>
              </div>
              <Switch
                id="auto-renew"
                checked={formData.autoRenew}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRenew: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Whether this bucket is currently active and should receive funds
                </p>
              </div>
              <Switch
                id="is-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Create Bucket
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}