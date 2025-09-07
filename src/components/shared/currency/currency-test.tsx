'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CurrencyInput } from './currency-input';
import { CurrencyDisplay } from './currency-display';
import { CurrencyManager } from './currency-manager';
import { useCurrency } from '@/hooks/use-currency';

export function CurrencyTest() {
  const { primaryCurrency, formatAmount } = useCurrency();
  const [testAmount, setTestAmount] = useState({ amount: 100, currency: 'USD' });
  const [convertTo, setConvertTo] = useState('EUR');

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Multi-Currency System Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the currency conversion and management features
        </p>
      </div>

      {/* Current Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
          <CardDescription>Your current currency preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Primary Currency: {primaryCurrency}</p>
              <p className="text-sm text-muted-foreground">
                All amounts are displayed in this currency by default
              </p>
            </div>
            <CurrencyManager />
          </div>
        </CardContent>
      </Card>

      {/* Currency Input Test */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Input Test</CardTitle>
          <CardDescription>Test the currency input component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CurrencyInput
            value={testAmount}
            onChange={setTestAmount}
            label="Test Amount"
            showConversion={true}
          />
          
          <div className="text-sm text-muted-foreground">
            Entered: {formatAmount(testAmount.amount, testAmount.currency)}
          </div>
        </CardContent>
      </Card>

      {/* Currency Display Test */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Display Test</CardTitle>
          <CardDescription>Test currency conversion and display</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Original Amount</label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                {formatAmount(testAmount.amount, testAmount.currency)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Converted to {primaryCurrency}</label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                <CurrencyDisplay
                  amount={testAmount.amount}
                  currency={testAmount.currency}
                  showConversionRate={true}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium">Convert to Different Currency</label>
            <div className="mt-2 space-y-2">
              <select
                value={convertTo}
                onChange={(e) => setConvertTo(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
              
              <div className="p-3 bg-muted rounded-md">
                <CurrencyDisplay
                  amount={testAmount.amount}
                  currency={testAmount.currency}
                  convertTo={convertTo}
                  showOriginal={true}
                  showConversionRate={true}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multiple Currency Display */}
      <Card>
        <CardHeader>
          <CardTitle>Multiple Currency Examples</CardTitle>
          <CardDescription>Various amounts in different currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { amount: 1000, currency: 'USD' },
              { amount: 850, currency: 'EUR' },
              { amount: 750, currency: 'GBP' },
              { amount: 110000, currency: 'JPY' },
              { amount: 75000, currency: 'INR' },
              { amount: 1300, currency: 'CAD' },
            ].map((item, index) => (
              <div key={index} className="p-3 border rounded-md">
                <div className="font-medium">
                  {formatAmount(item.amount, item.currency)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  <CurrencyDisplay
                    amount={item.amount}
                    currency={item.currency}
                    size="sm"
                    variant="muted"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}