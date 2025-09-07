'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCurrency } from '@/hooks/use-currency';
import { CurrencyConversion, CurrencyConversionError } from '@/types/currency';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  convertTo?: string; // If not provided, uses user's primary currency
  showOriginal?: boolean; // Show original amount alongside converted
  showConversionRate?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'success' | 'warning' | 'destructive';
}

export function CurrencyDisplay({
  amount,
  currency,
  convertTo,
  showOriginal = false,
  showConversionRate = false,
  className,
  size = 'md',
  variant = 'default',
}: CurrencyDisplayProps) {
  const { 
    primaryCurrency, 
    formatAmount, 
    convertAmount, 
    isConverting 
  } = useCurrency();
  
  const [conversion, setConversion] = useState<CurrencyConversion | CurrencyConversionError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const targetCurrency = convertTo || primaryCurrency;
  const needsConversion = currency !== targetCurrency;

  useEffect(() => {
    if (!needsConversion) {
      setConversion(null);
      return;
    }

    let isMounted = true;

    const performConversion = async () => {
      setIsLoading(true);
      try {
        const result = await convertAmount(amount, currency, targetCurrency);
        if (isMounted) {
          setConversion(result);
        }
      } catch (error) {
        console.error('Conversion error:', error);
        if (isMounted) {
          setConversion({
            fromCurrency: currency,
            toCurrency: targetCurrency,
            amount,
            errorType: 'api-error' as const,
            message: error instanceof Error ? error.message : 'Conversion failed',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    performConversion();

    return () => {
      isMounted = false;
    };
  }, [amount, currency, targetCurrency, needsConversion, convertAmount]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  const variantClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    destructive: 'text-red-600 dark:text-red-400',
  };

  // If no conversion needed, just show the original amount
  if (!needsConversion) {
    return (
      <span className={cn(sizeClasses[size], variantClasses[variant], className)}>
        {formatAmount(amount, currency)}
      </span>
    );
  }

  // Show loading state
  if (isLoading || isConverting) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className={cn(sizeClasses[size], variantClasses[variant])}>
          {formatAmount(amount, currency)}
        </span>
      </div>
    );
  }

  // Handle conversion error
  if (conversion && 'errorType' in conversion) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-2', className)}>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className={cn(sizeClasses[size], variantClasses[variant])}>
                {formatAmount(amount, currency)}
              </span>
              {conversion.fallbackRate && (
                <Badge variant="outline" className="text-xs">
                  ~{formatAmount(amount * conversion.fallbackRate, targetCurrency)}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Conversion failed: {conversion.message}</p>
            {conversion.fallbackRate && (
              <p className="text-xs text-muted-foreground">
                Showing approximate value using fallback rate
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Show successful conversion
  if (conversion && 'convertedAmount' in conversion) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className={cn(sizeClasses[size], variantClasses[variant])}>
          {formatAmount(conversion.convertedAmount, targetCurrency)}
        </span>
        
        {showOriginal && (
          <span className="text-sm text-muted-foreground">
            ({formatAmount(amount, currency)})
          </span>
        )}
        
        {showConversionRate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-xs cursor-help">
                  1 {currency} = {conversion.exchangeRate.toFixed(4)} {targetCurrency}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exchange rate as of {conversion.timestamp.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  // Fallback - show original amount
  return (
    <span className={cn(sizeClasses[size], variantClasses[variant], className)}>
      {formatAmount(amount, currency)}
    </span>
  );
}

interface CurrencyInputDisplayProps {
  amount: number;
  currency: string;
  onRefresh?: () => void;
  className?: string;
}

export function CurrencyInputDisplay({
  amount,
  currency,
  onRefresh,
  className,
}: CurrencyInputDisplayProps) {
  const { formatAmount } = useCurrency();

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="font-medium">
        {formatAmount(amount, currency)}
      </span>
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}