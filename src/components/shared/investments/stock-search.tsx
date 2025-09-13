"use client"

import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useExternalApi } from '@/hooks/use-external-api'

interface StockSearchResult {
  symbol: string
  name: string
  type: string
  currency: string
  currentPrice?: number
  change?: number
  changePercent?: number
  lastUpdated?: Date
  source?: 'cache' | 'api' | 'demo'
}

interface StockSearchProps {
  onSelect: (stock: StockSearchResult) => void
  selectedSymbol?: string
  searchType?: 'stock' | 'crypto'
}

// Mock crypto prices for fallback when API fails
const getMockCryptoPrice = (symbol: string) => {
  const mockPrices: Record<string, { price: number; change: number; changePercent: number }> = {
    'BTC': { price: 43250.00, change: 1250.50, changePercent: 2.98 },
    'ETH': { price: 2675.30, change: -45.20, changePercent: -1.66 },
    'ADA': { price: 0.485, change: 0.012, changePercent: 2.54 },
    'DOT': { price: 7.82, change: -0.15, changePercent: -1.88 },
    'SOL': { price: 98.75, change: 3.25, changePercent: 3.40 },
    'AVAX': { price: 24.15, change: 0.85, changePercent: 3.65 },
    'MATIC': { price: 0.92, change: -0.03, changePercent: -3.15 },
    'LINK': { price: 14.85, change: 0.45, changePercent: 3.13 },
    'UNI': { price: 6.72, change: -0.08, changePercent: -1.17 },
    'LTC': { price: 73.50, change: 1.20, changePercent: 1.66 },
    'BCH': { price: 245.80, change: -2.30, changePercent: -0.93 },
    'XRP': { price: 0.615, change: 0.015, changePercent: 2.50 }
  }
  
  return mockPrices[symbol] || { price: 100.00, change: 0, changePercent: 0 }
}

export function StockSearch({ onSelect, selectedSymbol, searchType = 'stock' }: StockSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [lastSearchTime, setLastSearchTime] = useState<Date | null>(null)
  const [cacheStatus, setCacheStatus] = useState<'fresh' | 'stale' | 'none'>('none')
  
  const { updatePrices, isUpdating } = useExternalApi()

  // Get cached search results from localStorage
  const getCachedSearchResults = useCallback((query: string): StockSearchResult[] => {
    try {
      const cacheKey = `search_${searchType}_${query.toLowerCase()}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { results, timestamp } = JSON.parse(cached)
        const age = Date.now() - timestamp
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        
        if (age < maxAge) {
          setCacheStatus('fresh')
          return results.map((r: any) => ({
            ...r,
            lastUpdated: new Date(timestamp),
            source: 'cache'
          }))
        } else {
          setCacheStatus('stale')
        }
      }
    } catch (error) {
      console.warn('Error reading search cache:', error)
    }
    return []
  }, [searchType])

  // Cache search results to localStorage
  const cacheSearchResults = useCallback((query: string, results: StockSearchResult[]) => {
    try {
      const cacheKey = `search_${searchType}_${query.toLowerCase()}`
      const cacheData = {
        results: results.map(r => ({ ...r, source: 'api' })),
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      setCacheStatus('fresh')
    } catch (error) {
      console.warn('Error caching search results:', error)
    }
  }, [searchType])

  // Enhanced search function with real API integration
  const searchStocks = useCallback(async (query: string, forceRefresh = false) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      setCacheStatus('none')
      return
    }

    setIsSearching(true)
    
    try {
      // First try cache if not forcing refresh
      if (!forceRefresh) {
        const cachedResults = getCachedSearchResults(query)
        if (cachedResults.length > 0) {
          setSearchResults(cachedResults)
          setIsSearching(false)
          return
        }
      }

      // Search logic based on type
      let results: StockSearchResult[] = []
      
      if (searchType === 'stock') {
        // Stock search with popular symbols and company names
        const stockDatabase = [
          { symbol: 'AAPL', name: 'Apple Inc.', type: 'Common Stock', currency: 'USD' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Common Stock', currency: 'USD' },
          { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Common Stock', currency: 'USD' },
          { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Common Stock', currency: 'USD' },
          { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Common Stock', currency: 'USD' },
          { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Common Stock', currency: 'USD' },
          { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Common Stock', currency: 'USD' },
          { symbol: 'NFLX', name: 'Netflix Inc.', type: 'Common Stock', currency: 'USD' },
          { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', type: 'Common Stock', currency: 'USD' },
          { symbol: 'INTC', name: 'Intel Corporation', type: 'Common Stock', currency: 'USD' },
          { symbol: 'CRM', name: 'Salesforce Inc.', type: 'Common Stock', currency: 'USD' },
          { symbol: 'ORCL', name: 'Oracle Corporation', type: 'Common Stock', currency: 'USD' },
          { symbol: 'IBM', name: 'International Business Machines', type: 'Common Stock', currency: 'USD' },
          { symbol: 'ADBE', name: 'Adobe Inc.', type: 'Common Stock', currency: 'USD' },
          { symbol: 'PYPL', name: 'PayPal Holdings Inc.', type: 'Common Stock', currency: 'USD' }
        ]
        
        results = stockDatabase.filter(stock =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
        )
      } else {
        // Crypto search
        const cryptoDatabase = [
          { symbol: 'BTC', name: 'Bitcoin', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'ETH', name: 'Ethereum', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'ADA', name: 'Cardano', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'DOT', name: 'Polkadot', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'SOL', name: 'Solana', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'AVAX', name: 'Avalanche', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'MATIC', name: 'Polygon', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'LINK', name: 'Chainlink', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'UNI', name: 'Uniswap', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'LTC', name: 'Litecoin', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'BCH', name: 'Bitcoin Cash', type: 'Cryptocurrency', currency: 'USD' },
          { symbol: 'XRP', name: 'Ripple', type: 'Cryptocurrency', currency: 'USD' }
        ]
        
        results = cryptoDatabase.filter(crypto =>
          crypto.symbol.toLowerCase().includes(query.toLowerCase()) ||
          crypto.name.toLowerCase().includes(query.toLowerCase())
        )
      }

      // Try to get current prices for the results
      if (results.length > 0) {
        try {
          const symbols = results.map(r => r.symbol)
          const response = await fetch('/api/investments/search-prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbols, type: searchType })
          })
          
          if (response.ok) {
            const priceData = await response.json()
            results = results.map(result => ({
              ...result,
              currentPrice: priceData[result.symbol]?.price,
              change: priceData[result.symbol]?.change,
              changePercent: priceData[result.symbol]?.changePercent,
              lastUpdated: new Date(),
              source: 'api' as const
            }))
          } else {
            // If API fails, provide fallback mock prices for demonstration
            if (searchType === 'crypto') {
              results = results.map(result => ({
                ...result,
                ...getMockCryptoPrice(result.symbol),
                lastUpdated: new Date(),
                source: 'demo' as const
              }))
            }
          }
        } catch (error) {
          console.warn('Failed to fetch current prices:', error)
          // Provide fallback mock prices for crypto when API fails
          if (searchType === 'crypto') {
            results = results.map(result => ({
              ...result,
              ...getMockCryptoPrice(result.symbol),
              lastUpdated: new Date(),
              source: 'demo' as const
            }))
          }
        }
      }

      setSearchResults(results)
      
      // Cache the results
      if (results.length > 0) {
        cacheSearchResults(query, results)
      }
      
    } catch (error) {
      console.error('Error searching:', error)
      setSearchResults([])
      setCacheStatus('none')
    } finally {
      setIsSearching(false)
    }
  }, [searchType, getCachedSearchResults, cacheSearchResults])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchStocks])

  const handleRefreshPrices = async () => {
    try {
      // Get symbols from current search results
      const symbols = searchResults.map(result => result.symbol)
      if (symbols.length > 0) {
        if (searchType === 'stock') {
          await updatePrices({ stocks: symbols, crypto: [] })
        } else {
          await updatePrices({ stocks: [], crypto: symbols })
        }
      }
      setLastSearchTime(new Date())
      // Re-search with force refresh to get updated prices
      if (searchQuery) {
        await searchStocks(searchQuery, true)
      }
    } catch (error) {
      console.error('Error refreshing prices:', error)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0
    const sign = isPositive ? '+' : ''
    return {
      change: `${sign}${change.toFixed(2)}`,
      changePercent: `${sign}${changePercent.toFixed(2)}%`,
      isPositive
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${searchType === 'crypto' ? 'cryptocurrencies' : 'stocks'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleRefreshPrices}
          disabled={isUpdating}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          Refresh Prices
        </Button>
      </div>

      {/* Cache Status */}
      {cacheStatus !== 'none' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {cacheStatus === 'fresh' 
              ? 'Showing cached results (updated within 24 hours)'
              : 'Showing stale cached results (older than 24 hours) - click Refresh Prices for latest data'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Demo Data Warning */}
      {searchResults.some(result => result.source === 'demo') && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Using demo price data - External API unavailable. Prices shown are for demonstration purposes only.
          </AlertDescription>
        </Alert>
      )}

      {lastSearchTime && (
        <div className="text-xs text-muted-foreground">
          Prices last updated: {lastSearchTime.toLocaleTimeString()}
        </div>
      )}

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Searching...</span>
        </div>
      )}

      {searchResults.length > 0 && (
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {searchResults.map((stock) => {
              const isSelected = selectedSymbol === stock.symbol
              const priceInfo = stock.currentPrice && stock.change !== undefined && stock.changePercent !== undefined
                ? formatChange(stock.change, stock.changePercent)
                : null

              return (
                <Card
                  key={stock.symbol}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onSelect(stock)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">{stock.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {stock.type}
                          </Badge>
                          {stock.source === 'cache' && (
                            <Badge variant="secondary" className="text-xs">
                              Cached
                            </Badge>
                          )}
                          {stock.source === 'demo' && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              Demo Data
                            </Badge>
                          )}
                          {isSelected && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {stock.name}
                        </p>
                        {stock.lastUpdated && (
                          <p className="text-xs text-muted-foreground">
                            Updated: {stock.lastUpdated.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      
                      {stock.currentPrice && (
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatPrice(stock.currentPrice, stock.currency)}
                          </div>
                          {priceInfo && (
                            <div className={`text-sm flex items-center gap-1 ${
                              priceInfo.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {priceInfo.isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{priceInfo.change} ({priceInfo.changePercent})</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No {searchType === 'crypto' ? 'cryptocurrencies' : 'stocks'} found for &quot;{searchQuery}&quot;</p>
          <p className="text-sm">Try a different search term or symbol</p>
        </div>
      )}

      {!searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Start typing to search for {searchType === 'crypto' ? 'cryptocurrencies' : 'stocks'}</p>
          <p className="text-sm">Search by symbol (e.g., AAPL) or company name</p>
        </div>
      )}
    </div>
  )
}