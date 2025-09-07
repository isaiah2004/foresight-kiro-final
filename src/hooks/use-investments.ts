"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Investment } from '@/types/financial'
import { investmentCacheService } from '@/lib/firebase/investment-cache-service'

export interface UseInvestmentsReturn {
  investments: Investment[]
  isLoading: boolean
  error: string | null
  addInvestment: (investmentData: Omit<Investment, 'id' | 'userId' | 'lastSyncedPrice' | 'lastSyncedPriceCurrency' | 'lastSyncTimestamp'>) => Promise<void>
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>
  deleteInvestment: (id: string) => Promise<void>
  updatePrices: () => Promise<void>
  lastPriceUpdate: Date | null
  cacheStats: {
    totalSymbols: number
    cachedSymbols: number
    freshSymbols: number
    staleSymbols: number
    cacheHitRate: number
  } | null
}

/**
 * Hook for managing investment data with intelligent caching
 */
export function useInvestments(): UseInvestmentsReturn {
  const { user } = useUser()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)
  const [cacheStats, setCacheStats] = useState<UseInvestmentsReturn['cacheStats']>(null)

  // Update cache statistics
  const updateCacheStats = useCallback(async (investmentList: Investment[]) => {
    if (!user?.id || investmentList.length === 0) {
      setCacheStats(null)
      return
    }

    try {
      const portfolioSymbols = {
        stocks: investmentList.filter(inv => inv.type === 'stock').map(inv => inv.symbol),
        crypto: investmentList.filter(inv => inv.type === 'crypto').map(inv => inv.symbol)
      }

      const stats = await investmentCacheService.getCacheStats(user.id, portfolioSymbols)
      setCacheStats(stats)
    } catch (err) {
      console.error('Error updating cache stats:', err)
    }
  }, [user?.id])

  // Load investments from localStorage (mock data for now)
  const loadInvestments = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      // For now, load from localStorage as mock data
      // In a real implementation, this would load from Firebase
      const stored = localStorage.getItem(`investments_${user.id}`)
      const storedInvestments: Investment[] = stored ? JSON.parse(stored) : []

      // Generate some mock data if none exists
      if (storedInvestments.length === 0) {
        const mockInvestments: Investment[] = [
          {
            id: '1',
            userId: user.id,
            symbol: 'AAPL',
            type: 'stock',
            quantity: 10,
            purchasePrice: 150.00,
            purchaseCurrency: 'USD',
            purchaseDate: new Date('2024-01-15'),
            lastSyncedPrice: 175.50,
            lastSyncedPriceCurrency: 'USD',
            lastSyncTimestamp: new Date(),
            currentValue: 1755.00
          },
          {
            id: '2',
            userId: user.id,
            symbol: 'MSFT',
            type: 'stock',
            quantity: 5,
            purchasePrice: 300.00,
            purchaseCurrency: 'USD',
            purchaseDate: new Date('2024-02-01'),
            lastSyncedPrice: 345.20,
            lastSyncedPriceCurrency: 'USD',
            lastSyncTimestamp: new Date(),
            currentValue: 1726.00
          },
          {
            id: '3',
            userId: user.id,
            symbol: 'BTC',
            type: 'crypto',
            quantity: 0.1,
            purchasePrice: 40000.00,
            purchaseCurrency: 'USD',
            purchaseDate: new Date('2024-03-01'),
            lastSyncedPrice: 43500.00,
            lastSyncedPriceCurrency: 'USD',
            lastSyncTimestamp: new Date(),
            currentValue: 4350.00
          },
          {
            id: '4',
            userId: user.id,
            symbol: 'VFIAX',
            type: 'mutual-fund',
            quantity: 50,
            purchasePrice: 320.00,
            purchaseCurrency: 'USD',
            purchaseDate: new Date('2024-01-01'),
            lastSyncedPrice: 347.21,
            lastSyncedPriceCurrency: 'USD',
            lastSyncTimestamp: new Date(),
            currentValue: 17360.50
          }
        ]
        
        localStorage.setItem(`investments_${user.id}`, JSON.stringify(mockInvestments))
        setInvestments(mockInvestments)
      } else {
        setInvestments(storedInvestments)
      }

      // Update cache stats
      await updateCacheStats(storedInvestments)
      
    } catch (err) {
      console.error('Error loading investments:', err)
      setError('Failed to load investments')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, updateCacheStats])

  // Add new investment
  const addInvestment = useCallback(async (
    investmentData: Omit<Investment, 'id' | 'userId' | 'lastSyncedPrice' | 'lastSyncedPriceCurrency' | 'lastSyncTimestamp'>
  ) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const newInvestment: Investment = {
        ...investmentData,
        id: Date.now().toString(),
        userId: user.id,
        lastSyncedPrice: investmentData.purchasePrice, // Use purchase price initially
        lastSyncedPriceCurrency: investmentData.purchaseCurrency,
        lastSyncTimestamp: new Date(),
        currentValue: investmentData.quantity * investmentData.purchasePrice
      }

      const updatedInvestments = [...investments, newInvestment]
      setInvestments(updatedInvestments)
      localStorage.setItem(`investments_${user.id}`, JSON.stringify(updatedInvestments))
      
      await updateCacheStats(updatedInvestments)
    } catch (err) {
      console.error('Error adding investment:', err)
      throw new Error('Failed to add investment')
    }
  }, [user?.id, investments, updateCacheStats])

  // Update existing investment
  const updateInvestment = useCallback(async (id: string, updates: Partial<Investment>) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const updatedInvestments = investments.map(inv => 
        inv.id === id ? { ...inv, ...updates } : inv
      )
      
      setInvestments(updatedInvestments)
      localStorage.setItem(`investments_${user.id}`, JSON.stringify(updatedInvestments))
      
      await updateCacheStats(updatedInvestments)
    } catch (err) {
      console.error('Error updating investment:', err)
      throw new Error('Failed to update investment')
    }
  }, [user?.id, investments, updateCacheStats])

  // Delete investment
  const deleteInvestment = useCallback(async (id: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const updatedInvestments = investments.filter(inv => inv.id !== id)
      setInvestments(updatedInvestments)
      localStorage.setItem(`investments_${user.id}`, JSON.stringify(updatedInvestments))
      
      await updateCacheStats(updatedInvestments)
    } catch (err) {
      console.error('Error deleting investment:', err)
      throw new Error('Failed to delete investment')
    }
  }, [user?.id, investments, updateCacheStats])

  // Update prices using cache service
  const updatePrices = useCallback(async () => {
    if (!user?.id || investments.length === 0) return

    try {
      setError(null)
      
      // Extract portfolio symbols
      const portfolioSymbols = {
        stocks: investments.filter(inv => inv.type === 'stock').map(inv => inv.symbol),
        crypto: investments.filter(inv => inv.type === 'crypto').map(inv => inv.symbol)
      }

      // Request cache update
      const result = await investmentCacheService.updatePortfolioCache(user.id, portfolioSymbols)
      
      if (result.success) {
        // Get updated portfolio data
        const portfolioData = await investmentCacheService.getPortfolioData(user.id, portfolioSymbols)
        
        // Update investments with new prices
        const updatedInvestments = investments.map(investment => {
          let updatedPrice = investment.lastSyncedPrice
          let updatedValue = investment.currentValue
          
          if (investment.type === 'stock' && portfolioData.stocks.has(investment.symbol)) {
            const stockData = portfolioData.stocks.get(investment.symbol)!
            updatedPrice = stockData.price
            updatedValue = investment.quantity * stockData.price
          } else if (investment.type === 'crypto' && portfolioData.crypto.has(investment.symbol)) {
            const cryptoData = portfolioData.crypto.get(investment.symbol)!
            updatedPrice = cryptoData.price
            updatedValue = investment.quantity * cryptoData.price
          }
          
          return {
            ...investment,
            lastSyncedPrice: updatedPrice,
            lastSyncTimestamp: new Date(),
            currentValue: updatedValue
          }
        })
        
        setInvestments(updatedInvestments)
        localStorage.setItem(`investments_${user.id}`, JSON.stringify(updatedInvestments))
        setLastPriceUpdate(new Date())
        
        await updateCacheStats(updatedInvestments)
      } else {
        throw new Error('Failed to update prices: ' + result.errors.join(', '))
      }
    } catch (err) {
      console.error('Error updating prices:', err)
      setError('Failed to update prices')
    }
  }, [user?.id, investments, updateCacheStats])

  // Load investments on mount and user change
  useEffect(() => {
    loadInvestments()
  }, [loadInvestments])

  return {
    investments,
    isLoading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    updatePrices,
    lastPriceUpdate,
    cacheStats
  }
}