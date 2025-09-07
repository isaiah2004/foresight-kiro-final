'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencySelector } from './currency-selector';
import { CurrencyDisplay } from './currency-display';
import { useCurrency } from '@/hooks/use-currency';
import { parseCurrencyAmount } from '@/lib/currency/utils';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  value: {
    amount: number;
    currency: string;
  };
  onChange: (value: { amount: number; currency: string }) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  showConversion?: boolean;
  convertTo?: string;
  className?: string;
  id?: string;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = "0.00",
  disabled = false,
  required = false,
  error,
  showConversion = true,
  convertTo,
  className,
  id,
}: CurrencyInputProps) {
  const { primaryCurrency, formatAmount } = useCurrency();
  const [amountInput, setAmountInput] = useState(value.amount.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Update input when value changes externally
  useEffect(() => {
    if (!isFocused) {
      setAmountInput(value.amount.toString());
    }
  }, [value.amount, isFocused]);

  const handleAmountChange = useCallback((inputValue: string) => {
    setAmountInput(inputValue);
    
    // Parse the input
    const parsed = parseCurrencyAmount(inputValue);
    if (parsed && !isNaN(parsed.amount)) {
      onChange({
        amount: parsed.amount,
        currency: parsed.currency || value.currency,
      });
    }
  }, [onChange, value.currency]);

  const handleCurrencyChange = useCallback((currency: string) => {
    onChange({
      amount: value.amount,
      currency,
    });
  }, [onChange, value.amount]);

  const handleAmountBlur = useCallback(() => {
    setIsFocused(false);
    // Format the amount on blur
    if (value.amount && !isNaN(value.amount)) {
      setAmountInput(value.amount.toString());
    }
  }, [value.amount]);

  const targetCurrency = convertTo || primaryCurrency;
  const needsConversion = showConversion && value.currency !== targetCurrency;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {label}
        </Label>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            value={amountInput}
            onChange={(e) => handleAmountChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleAmountBlur}
            disabled={disabled}
            className={cn(
              error && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        </div>
        
        <div className="w-32">
          <CurrencySelector
            value={value.currency}
            onValueChange={handleCurrencyChange}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Show conversion if needed */}
      {needsConversion && value.amount > 0 && (
        <div className="text-sm text-muted-foreground">
          <CurrencyDisplay
            amount={value.amount}
            currency={value.currency}
            convertTo={targetCurrency}
            showConversionRate={true}
            size="sm"
            variant="muted"
          />
        </div>
      )}

      {/* Show error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

interface SimpleCurrencyInputProps {
  amount: number;
  currency: string;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SimpleCurrencyInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  placeholder = "0.00",
  disabled = false,
  className,
}: SimpleCurrencyInputProps) {
  const [amountInput, setAmountInput] = useState(amount.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setAmountInput(amount.toString());
    }
  }, [amount, isFocused]);

  const handleAmountChange = (inputValue: string) => {
    setAmountInput(inputValue);
    
    const parsed = parseCurrencyAmount(inputValue);
    if (parsed && !isNaN(parsed.amount)) {
      onAmountChange(parsed.amount);
      if (parsed.currency) {
        onCurrencyChange(parsed.currency);
      }
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex-1">
        <Input
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={amountInput}
          onChange={(e) => handleAmountChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
        />
      </div>
      
      <div className="w-32">
        <CurrencySelector
          value={currency}
          onValueChange={onCurrencyChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}