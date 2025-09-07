"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { BucketCreationForm } from './bucket-creation-form';
import { Bucket, BudgetAllocation } from '@/types/budget';
import { 
  calculateBucketRenewal, 
  formatBudgetAmount, 
  getCategoryColor,
  calculateNextRenewal 
} from '@/lib/financial/budgets';
import { useCurrency } from '@/hooks/use-currency';
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  Pause, 
  Play, 
  Edit, 
  Trash2, 
  RefreshCw,
  Target,
  Clock,
  DollarSign
} from 'lucide-react';

interface BucketManagementDashboardProps {
  buckets: Bucket[];
  budgetAllocation?: BudgetAllocation;
  onBucketCreate: (bucket: Omit<Bucket, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onBucketUpdate: (bucketId: string, updates: Partial<Bucket>) => void;
  onBucketDelete: (bucketId: string) => void;
  onBucketRenew: (bucketId: string, amount: number) => void;
}

export function BucketManagementDashboard({
  buckets,
  budgetAllocation,
  onBucketCreate,
  onBucketUpdate,
  onBucketDelete,
  onBucketRenew
}: BucketManagementDashboardProps) {
  const { primaryCurrency } = useCurrency();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group buckets by category
  const bucketsByCategory = buckets.reduce((acc, bucket) => {
    if (!acc[bucket.category]) {
      acc[bucket.category] = [];
    }
    acc[bucket.category].push(bucket);
    return acc;
  }, {} as Record<string, Bucket[]>);

  // Filter buckets based on selected category
  const filteredBuckets = selectedCategory === 'all' 
    ? buckets 
    : buckets.filter(bucket => bucket.category === selectedCategory);

  // Calculate category totals
  const categoryTotals = Object.entries(bucketsByCategory).map(([category, categoryBuckets]) => {
    const totalTarget = categoryBuckets.reduce((sum, bucket) => sum + bucket.targetAmount, 0);
    const totalCurrent = categoryBuckets.reduce((sum, bucket) => sum + bucket.currentAmount, 0);
    const progress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    
    return {
      category,
      totalTarget,
      totalCurrent,
      progress,
      bucketCount: categoryBuckets.length,
    };
  });

  const handleBucketCreate = (bucket: Omit<Bucket, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    onBucketCreate(bucket);
    setShowCreateForm(false);
  };

  const handleBucketToggle = (bucket: Bucket) => {
    onBucketUpdate(bucket.id, { isActive: !bucket.isActive });
  };

  const handleBucketRenew = (bucket: Bucket) => {
    if (!budgetAllocation) return;
    
    const categoryAllocation = budgetAllocation.categories[bucket.category]?.amount || 0;
    const renewal = calculateBucketRenewal(bucket, categoryAllocation);
    
    if (renewal.shouldRenew && renewal.renewalAmount > 0) {
      onBucketRenew(bucket.id, renewal.renewalAmount);
      onBucketUpdate(bucket.id, { 
        nextRenewal: renewal.nextRenewal,
        lastRenewal: new Date()
      });
    }
  };

  const getBucketProgress = (bucket: Bucket) => {
    return bucket.targetAmount > 0 ? (bucket.currentAmount / bucket.targetAmount) * 100 : 0;
  };

  const getDaysUntilRenewal = (bucket: Bucket) => {
    const now = new Date();
    const diffTime = bucket.nextRenewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryDisplayName = (category: string) => {
    const names = {
      essentials: 'Essentials',
      lifestyle: 'Lifestyle',
      savingsFuture: 'Savings & Future',
      sinkingFund: 'Sinking Fund',
    };
    return names[category as keyof typeof names] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bucket Management</h2>
          <p className="text-muted-foreground">
            Manage your budget buckets with automatic renewal rates
          </p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Bucket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <BucketCreationForm 
              onBucketCreate={handleBucketCreate}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Overview */}
      {categoryTotals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryTotals.map(({ category, totalTarget, totalCurrent, progress, bucketCount }) => (
            <Card 
              key={category}
              className={`cursor-pointer transition-colors ${
                selectedCategory === category ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <span className="font-medium text-sm">{getCategoryDisplayName(category)}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {bucketCount} bucket{bucketCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatBudgetAmount(totalCurrent, primaryCurrency)}</span>
                    <span>{formatBudgetAmount(totalTarget, primaryCurrency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter by category:</span>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All ({buckets.length})
          </Button>
          {Object.keys(bucketsByCategory).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="flex items-center gap-2"
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getCategoryColor(category) }}
              />
              {getCategoryDisplayName(category)} ({bucketsByCategory[category].length})
            </Button>
          ))}
        </div>
      </div>

      {/* Buckets List */}
      {filteredBuckets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No buckets found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {selectedCategory === 'all' 
                ? "You haven't created any buckets yet. Start by creating your first bucket to organize your budget."
                : `No buckets found in the ${getCategoryDisplayName(selectedCategory)} category.`
              }
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Bucket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBuckets.map((bucket) => {
            const progress = getBucketProgress(bucket);
            const daysUntilRenewal = getDaysUntilRenewal(bucket);
            const isOverdue = daysUntilRenewal < 0;
            const isDueSoon = daysUntilRenewal <= 3 && daysUntilRenewal >= 0;

            return (
              <Card key={bucket.id} className={`${!bucket.isActive ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(bucket.category) }}
                        />
                        {bucket.name}
                        {!bucket.isActive && (
                          <Badge variant="secondary" className="text-xs">Paused</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {bucket.description || `${getCategoryDisplayName(bucket.category)} bucket`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBucketToggle(bucket)}
                        className="h-8 w-8 p-0"
                      >
                        {bucket.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBucketRenew(bucket)}
                        className="h-8 w-8 p-0"
                        disabled={!bucket.isActive}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {formatBudgetAmount(bucket.currentAmount, primaryCurrency)}
                      </span>
                      <span className="text-muted-foreground">
                        of {formatBudgetAmount(bucket.targetAmount, primaryCurrency)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Renewal Information */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Next Renewal</span>
                      </div>
                      <Badge 
                        variant={isOverdue ? 'destructive' : isDueSoon ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {isOverdue 
                          ? `${Math.abs(daysUntilRenewal)} days overdue`
                          : daysUntilRenewal === 0 
                            ? 'Due today'
                            : `${daysUntilRenewal} days`
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Renewal Rate</span>
                      <span className="capitalize">{bucket.renewalRate.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Auto Renewal</span>
                      <Badge variant={bucket.autoRenew ? 'default' : 'outline'} className="text-xs">
                        {bucket.autoRenew ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>

                  {/* Renewal Alert */}
                  {(isOverdue || isDueSoon) && bucket.isActive && (
                    <Alert variant={isOverdue ? 'destructive' : 'default'}>
                      <Calendar className="h-4 w-4" />
                      <AlertDescription>
                        {isOverdue 
                          ? `This bucket is ${Math.abs(daysUntilRenewal)} days overdue for renewal.`
                          : `This bucket is due for renewal ${daysUntilRenewal === 0 ? 'today' : `in ${daysUntilRenewal} days`}.`
                        }
                        {bucket.autoRenew && ' It will be automatically renewed.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBucketRenew(bucket)}
                      disabled={!bucket.isActive}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                      onClick={() => onBucketDelete(bucket.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}