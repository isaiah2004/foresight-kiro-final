'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Currency } from '@/types/currency';
import { getAllCurrencies } from '@/lib/currency/data';
import { getCurrencyDisplayName, getCurrencySymbol } from '@/lib/currency/utils';

interface CurrencySelectorProps {
  value: string;
  onValueChange: (currency: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showSymbol?: boolean;
  showFullName?: boolean;
}

export function CurrencySelector({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select currency...",
  className,
  showSymbol = true,
  showFullName = false,
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const supportedCurrencies = getAllCurrencies();

  const selectedCurrency = supportedCurrencies.find(
    (currency) => currency.code === value
  );

  const displayValue = selectedCurrency
    ? showFullName
      ? getCurrencyDisplayName(selectedCurrency.code)
      : showSymbol
      ? `${selectedCurrency.symbol} ${selectedCurrency.code}`
      : selectedCurrency.code
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search currencies..." 
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {supportedCurrencies.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={`${currency.code} ${currency.name}`}
                  onSelect={() => {
                    onValueChange(currency.code);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.symbol}</span>
                    <span className="font-mono text-sm">{currency.code}</span>
                    <span className="text-sm text-muted-foreground">
                      {currency.name}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === currency.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}