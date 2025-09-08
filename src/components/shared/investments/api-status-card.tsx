/**
 * API Status Card Component
 * 
 * This component displays the status of external financial APIs
 * and provides controls for testing connections and updating prices.
 */

"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useExternalApi, useApiUsageStats } from '@/hooks/use-external-api'
import { formatApiErrors, getUpdateSuccessRate } from '@/hooks/use-external-api'

interface ApiStatusCardProps {
  symbols?: {
    stocks: string[]
    crypto: string[]
  }
  onPricesUpdated?: () => void
  className?: string
}

export function ApiStatusCard({ 
  symbols = { stocks: [], crypto: [] }, 
  onPricesUpdated,
  className 
}: ApiStatusCardProps) {
  const {
    isUpdating,
    isTesting,
    lastUpdateResult,
    lastConnectionTest,
    error,
    updatePrices,
    testConnections,
    clearError
  } = useExternalApi()

  const {
    stats,
    isLoading: isLoadingStats,
    fetchStats
  } = useApiUsageStats()

  const [autoRefresh, setAutoRefresh] = useState(false)

  const handleTestConnections = async () => {
    try {
      await testConnections()
    } catch (err) {
      console.error('Failed to test connections:', err)
    }
  }

  const handleUpdatePrices = useCallback(async () => {
    try {
      const result = await updatePrices(symbols)
      if (result.success && onPricesUpdated) {
        onPricesUpdated()
      }
    } catch (err) {
      console.error('Failed to update prices:', err)
    }
  }, [symbols, updatePrices, onPricesUpdated])

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      if (symbols.stocks.length > 0 || symbols.crypto.length > 0) {
        handleUpdatePrices()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [autoRefresh, symbols, handleUpdatePrices])

  // Load stats on mount
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "Connected" : "Unavailable"}
      </Badge>
    )
  }

  const totalSymbols = symbols.stocks.length + symbols.crypto.length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              External API Status
            </CardTitle>
            <CardDescription>
              Real-time financial data integration status
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnections}
            disabled={isTesting}
          >
            {isTesting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Test APIs
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-2 h-auto p-0 text-xs"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* API Connection Status */}
        {lastConnectionTest && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">API Connections</h4>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  {getStatusIcon(lastConnectionTest.finnhub.success)}
                  <span className="text-sm font-medium">FinnHub</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(lastConnectionTest.finnhub.success)}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  {getStatusIcon(lastConnectionTest.alphavantage.success)}
                  <span className="text-sm font-medium">Alpha Vantage</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(lastConnectionTest.alphavantage.success)}
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Price Update Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Price Updates</h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdatePrices}
                disabled={isUpdating || totalSymbols === 0}
              >
                {isUpdating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                Update Prices
              </Button>
            </div>
          </div>

          {totalSymbols > 0 && (
            <div className="text-xs text-muted-foreground">
              {symbols.stocks.length} stocks, {symbols.crypto.length} crypto symbols
            </div>
          )}
        </div>

        {/* Last Update Result */}
        {lastUpdateResult && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground">Last Update</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Updated: {lastUpdateResult.data.updatedSymbols.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                <span>Failed: {lastUpdateResult.data.failedSymbols.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-blue-500" />
                <span>API Calls: {lastUpdateResult.data.apiCalls}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-purple-500" />
                <span>Success: {getUpdateSuccessRate(lastUpdateResult).toFixed(1)}%</span>
              </div>
            </div>

            {lastUpdateResult.data.errors.length > 0 && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {formatApiErrors(lastUpdateResult.data.errors)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Separator />

        {/* Usage Statistics */}
        {stats && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground">Usage Statistics</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <span>FinnHub: {stats.finnhubCallsToday}/day</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-green-500" />
                <span>Alpha Vantage: {stats.alphaVantageCallsToday}/day</span>
              </div>
              <div className="flex items-center gap-1 col-span-2">
                <Activity className="h-3 w-3 text-purple-500" />
                <span>Cache Hit Rate: {stats.cacheHitRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Auto-refresh Toggle */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">Auto-refresh (5 min)</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "text-green-600" : "text-muted-foreground"}
          >
            {autoRefresh ? "Enabled" : "Disabled"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}