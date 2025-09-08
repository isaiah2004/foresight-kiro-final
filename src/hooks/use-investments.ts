"use client"

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Investment } from '@/types/financial'
import { investmentCacheService } from '@/lib/firebase/investment-cache-service'
import { 
  loadUserInvestments,
  addInvestment as addInvestmentToFirebase,
  updateInvestment as updateInvestmentInFirebase,
  deleteInvestment as deleteInvestmentFromFirebase,
  updateMultipleInvestments,
  migrateLocalStorageToFirebase
} from '@/lib/firebase/investments-service'

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

  // Load investments from Firebase with automatic localStorage migration
  const loadInvestments = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      // First, try to migrate any existing localStorage data
      const localStorageKey = `investments_${user.id}`
      const migrationResult = await migrateLocalStorageToFirebase(user.id, localStorageKey)
      
      if (migrationResult.migratedCount > 0) {
        console.log(`Migrated ${migrationResult.migratedCount} investments from localStorage to Firebase`)
      }
      
      if (migrationResult.errors.length > 0) {
        console.warn('Migration errors:', migrationResult.errors)
      }

      // Load investments from Firebase
      let firebaseInvestments = await loadUserInvestments(user.id)

      // If no investments exist, create some mock data for new users
      if (firebaseInvestments.length === 0) {
        const mockInvestments = [
          {
            symbol: 'AAPL',
            type: 'stock' as const,
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
            symbol: 'MSFT',
            type: 'stock' as const,
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
            symbol: 'BTC',
            type: 'crypto' as const,
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
            symbol: 'VFIAX',
            type: 'mutual-fund' as const,
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
        
        // Add mock investments to Firebase
        console.log('Creating mock investments for new user')
        const promises = mockInvestments.map(investment => 
          addInvestmentToFirebase(user.id, investment)
        )
        await Promise.all(promises)
        
        // Reload investments from Firebase to get the proper IDs
        firebaseInvestments = await loadUserInvestments(user.id)
      }

      setInvestments(firebaseInvestments)
      await updateCacheStats(firebaseInvestments)
      
    } catch (err) {
      console.error('Error loading investments:', err)
      setError('Failed to load investments from database')
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
      // Prepare investment data with initial values
      const newInvestmentData = {
        ...investmentData,
        lastSyncedPrice: investmentData.purchasePrice, // Use purchase price initially
        lastSyncedPriceCurrency: investmentData.purchaseCurrency,
        lastSyncTimestamp: new Date(),
        currentValue: investmentData.quantity * investmentData.purchasePrice
      }

      // Add to Firebase
      const newInvestmentId = await addInvestmentToFirebase(user.id, newInvestmentData)
      
      // Create the full investment object with the new ID
      const newInvestment: Investment = {
        ...newInvestmentData,
        id: newInvestmentId,
        userId: user.id
      }

      // Update local state
      const updatedInvestments = [...investments, newInvestment]
      setInvestments(updatedInvestments)
      await updateCacheStats(updatedInvestments)
      
      console.log(`Successfully added investment ${investmentData.symbol} to Firebase`)
    } catch (err) {
      console.error('Error adding investment:', err)
      throw new Error('Failed to add investment to database')
    }
  }, [user?.id, investments, updateCacheStats])

  // Update existing investment
  const updateInvestment = useCallback(async (id: string, updates: Partial<Investment>) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      // Remove fields that shouldn't be updated directly
      const { id: _, userId: __, ...updateData } = updates

      // Update in Firebase
      await updateInvestmentInFirebase(user.id, id, updateData)
      
      // Update local state
      const updatedInvestments = investments.map(inv => 
        inv.id === id ? { ...inv, ...updates } : inv
      )
      
      setInvestments(updatedInvestments)
      await updateCacheStats(updatedInvestments)
      
      console.log(`Successfully updated investment ${id} in Firebase`)
    } catch (err) {
      console.error('Error updating investment:', err)
      throw new Error('Failed to update investment in database')
    }
  }, [user?.id, investments, updateCacheStats])

  // Delete investment
  const deleteInvestment = useCallback(async (id: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      // Delete from Firebase
      await deleteInvestmentFromFirebase(user.id, id)
      
      // Update local state
      const updatedInvestments = investments.filter(inv => inv.id !== id)
      setInvestments(updatedInvestments)
      await updateCacheStats(updatedInvestments)
      
      console.log(`Successfully deleted investment ${id} from Firebase`)
    } catch (err) {
      console.error('Error deleting investment:', err)
      throw new Error('Failed to delete investment from database')
    }
  }, [user?.id, investments, updateCacheStats])

  // Update prices using external API service and cache
  const updatePrices = useCallback(async () => {
    if (!user?.id || investments.length === 0) return

    try {
      setError(null)
      
      // Extract portfolio symbols
      const portfolioSymbols = {
        stocks: investments.filter(inv => inv.type === 'stock').map(inv => inv.symbol),
        crypto: investments.filter(inv => inv.type === 'crypto').map(inv => inv.symbol)
      }

      console.log(`Updating prices for ${portfolioSymbols.stocks.length} stocks and ${portfolioSymbols.crypto.length} crypto symbols`)

      // Request cache update through external API service
      const result = await investmentCacheService.updatePortfolioCache(user.id, portfolioSymbols)
      
      if (result.success) {
        // Get updated portfolio data from cache
        const portfolioData = await investmentCacheService.getPortfolioData(user.id, portfolioSymbols)
        
        // Update investments with new prices
        const investmentUpdates = investments.map(investment => {
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
        
        // Update Firebase with new prices (batch update)
        const firebaseUpdates = investmentUpdates.map(inv => ({
          id: inv.id,
          data: {
            lastSyncedPrice: inv.lastSyncedPrice,
            lastSyncTimestamp: inv.lastSyncTimestamp,
            currentValue: inv.currentValue
          }
        }))
        
        await updateMultipleInvestments(user.id, firebaseUpdates)
        
        // Update local state
        setInvestments(investmentUpdates)
        setLastPriceUpdate(new Date())
        await updateCacheStats(investmentUpdates)
        
        // Log success details
        const successCount = result.updatedSymbols.length
        const failureCount = result.failedSymbols.length
        
        if (successCount > 0) {
          console.log(`Successfully updated ${successCount} symbols`)
          if (failureCount > 0) {
            console.warn(`Failed to update ${failureCount} symbols:`, result.failedSymbols)
          }
        } else {
          console.warn('No symbols were updated')
        }
      } else {
        const errorMessage = result.errors.length > 0 ? result.errors.join(', ') : 'Unknown error'
        throw new Error(`Failed to update prices: ${errorMessage}`)
      }
    } catch (err) {
      console.error('Error updating prices:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prices'
      setError(errorMessage)
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