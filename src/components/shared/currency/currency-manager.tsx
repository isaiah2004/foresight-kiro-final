'use client';

import { useState } from 'react';
import { Settings, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CurrencySelector } from './currency-selector';
import { useCurrency } from '@/hooks/use-currency';
import { formatDistanceToNow } from 'date-fns';

interface CurrencyManagerProps {
  showTrigger?: boolean;
  triggerVariant?: 'default' | 'outline' | 'ghost';
  triggerSize?: 'sm' | 'lg' | 'icon';
}

export function CurrencyManager({
  showTrigger = true,
  triggerVariant = 'outline',
  triggerSize = 'sm',
}: CurrencyManagerProps) {
  const {
    primaryCurrency,
    updatePrimaryCurrency,
    refreshRates,
    cacheStatus,
    isUpdatingCurrency,
    updateError,
    supportedCurrencies,
    getCurrency,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(primaryCurrency);

  const handleSave = async () => {
    if (selectedCurrency !== primaryCurrency) {
      const success = await updatePrimaryCurrency(selectedCurrency);
      if (success) {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  const currentCurrency = getCurrency(primaryCurrency);
  const selectedCurrencyInfo = getCurrency(selectedCurrency);

  const trigger = showTrigger ? (
    <DialogTrigger asChild>
      <Button variant={triggerVariant} size={triggerSize}>
        <Settings className="h-4 w-4 mr-2" />
        Currency Settings
      </Button>
    </DialogTrigger>
  ) : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Currency Settings</DialogTitle>
          <DialogDescription>
            Manage your primary currency and exchange rate preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Primary Currency */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Primary Currency</CardTitle>
              <CardDescription>
                All amounts will be displayed in this currency by default.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentCurrency?.symbol}</span>
                  <div>
                    <p className="font-medium">{currentCurrency?.name}</p>
                    <p className="text-sm text-muted-foreground">{currentCurrency?.code}</p>
                  </div>
                </div>
                <Badge variant="secondary">Current</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Currency Selection */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Select New Primary Currency</label>
              <p className="text-sm text-muted-foreground">
                Choose from {supportedCurrencies.length} supported currencies.
              </p>
            </div>
            
            <CurrencySelector
              value={selectedCurrency}
              onValueChange={setSelectedCurrency}
              showFullName={true}
              disabled={isUpdatingCurrency}
            />

            {selectedCurrency !== primaryCurrency && selectedCurrencyInfo && (
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{selectedCurrencyInfo.symbol}</span>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {selectedCurrencyInfo.name}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Will become your new primary currency
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Exchange Rate Cache Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Exchange Rate Cache</CardTitle>
                  <CardDescription>
                    Current status of currency conversion data.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshRates}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cache Status</span>
                  <div className="flex items-center gap-2">
                    {cacheStatus.hasCache ? (
                      cacheStatus.isValid ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <Badge variant="secondary" className="text-green-700 bg-green-100">
                            Active
                          </Badge>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">
                            Expired
                          </Badge>
                        </>
                      )
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-gray-500" />
                        <Badge variant="outline">No Cache</Badge>
                      </>
                    )}
                  </div>
                </div>

                {cacheStatus.hasCache && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Base Currency</span>
                      <span className="text-sm font-mono">{cacheStatus.baseCurrency}</span>
                    </div>

                    {cacheStatus.lastUpdated && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Updated</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(cacheStatus.lastUpdated, { addSuffix: true })}
                        </span>
                      </div>
                    )}

                    {cacheStatus.expiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Expires</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(cacheStatus.expiresAt, { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {updateError && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-300">{updateError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUpdatingCurrency}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdatingCurrency || selectedCurrency === primaryCurrency}
            >
              {isUpdatingCurrency ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}