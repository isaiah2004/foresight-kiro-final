"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { IncomeSource, OneTimeIncome } from '@/types/financial'
import { useCurrency } from '@/hooks/use-currency'
import { CurrencyConversion, CurrencyConversionError } from '@/types/currency'
import { prepareForFirebaseCreate, prepareForFirebaseUpdate } from '@/lib/firebase/utils'

export interface OneTimeIncomeFormData {
  type: 'bonus' | 'gift' | 'inheritance' | 'investment-maturity' | 'lottery' | 'refund' | 'side-gig' | 'other'
  name: string
  description?: string
  amount: number
  currency: string
  date: Date
  source?: string
  isRecorded: boolean
  metadata?: Record<string, any>
}

export interface IncomeFormData {
  type: 'salary' | 'rental' | 'other'
  name: string
  amount: number
  currency: string
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  isActive: boolean
  startDate: Date
  endDate?: Date
  metadata?: Record<string, any>
}

export interface ConvertedOneTimeIncome extends OneTimeIncome {
  convertedAmount?: number
  conversionError?: string
  exchangeRate?: number
}

export interface ConvertedIncomeSource extends IncomeSource {
  convertedAmount?: number
  convertedMonthlyAmount?: number
  conversionError?: string
  exchangeRate?: number
}

export interface IncomeState {
  hasData: boolean
  isEmpty: boolean
  isFirstLoad: boolean
}

export function useIncome() {
  const { user } = useUser()
  const { primaryCurrency, convertAmount, formatAmount } = useCurrency()
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [oneTimeIncomes, setOneTimeIncomes] = useState<OneTimeIncome[]>([])
  const [convertedIncomeSources, setConvertedIncomeSources] = useState<ConvertedIncomeSource[]>([])
  const [convertedOneTimeIncomes, setConvertedOneTimeIncomes] = useState<ConvertedOneTimeIncome[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [incomeState, setIncomeState] = useState<IncomeState>({
    hasData: false,
    isEmpty: true,
    isFirstLoad: true
  })

  // Calculate monthly equivalent for different frequencies
  const calculateMonthlyEquivalent = useCallback((amount: number, frequency: IncomeSource['frequency']): number => {
    switch (frequency) {
      case 'weekly':
        return amount * 52 / 12 // 52 weeks per year / 12 months
      case 'biweekly':
        return amount * 26 / 12 // 26 biweekly periods per year / 12 months
      case 'monthly':
        return amount
      case 'quarterly':
        return amount / 3 // 3 months per quarter
      case 'yearly':
        return amount / 12 // 12 months per year
      default:
        return amount
    }
  }, [])

  // Convert one-time incomes to primary currency
  const convertOneTimeIncomesToPrimaryCurrency = useCallback(async (incomes: OneTimeIncome[]) => {
    if (!incomes || incomes.length === 0) {
      setConvertedOneTimeIncomes([])
      return
    }

    try {
      const converted = await Promise.all(
        incomes.map(async (income): Promise<ConvertedOneTimeIncome> => {
          if (!income.amount || !income.currency) {
            console.warn('Invalid one-time income data:', income)
            return {
              ...income,
              conversionError: 'Invalid income data',
              convertedAmount: 0
            }
          }

          if (income.currency === primaryCurrency) {
            return {
              ...income,
              convertedAmount: income.amount,
              exchangeRate: 1
            }
          }

          try {
            const conversion = await convertAmount(income.amount, income.currency, primaryCurrency)
            
            if ('errorType' in conversion) {
              return {
                ...income,
                conversionError: conversion.message,
                convertedAmount: income.amount
              }
            }

            return {
              ...income,
              convertedAmount: conversion.convertedAmount,
              exchangeRate: conversion.exchangeRate
            }
          } catch (error) {
            console.error('Error converting one-time income:', error)
            return {
              ...income,
              conversionError: 'Failed to convert currency',
              convertedAmount: income.amount
            }
          }
        })
      )

      setConvertedOneTimeIncomes(converted)
    } catch (error) {
      console.error('Error converting one-time incomes:', error)
      const fallbackConverted = incomes.map(income => ({
        ...income,
        convertedAmount: income.amount,
        conversionError: 'Conversion failed'
      }))
      setConvertedOneTimeIncomes(fallbackConverted)
    }
  }, [primaryCurrency, convertAmount])

  // Convert income sources to primary currency
  const convertIncomeSourcesToPrimaryCurrency = useCallback(async (sources: IncomeSource[]) => {
    // Always reset to empty array if no sources
    if (!sources || sources.length === 0) {
      setConvertedIncomeSources([])
      setIsConverting(false)
      return
    }

    // Don't start conversion if already converting to prevent duplicate requests
    if (isConverting) {
      return
    }

    setIsConverting(true)
    
    try {
      const converted = await Promise.all(
        sources.map(async (source): Promise<ConvertedIncomeSource> => {
          // Validate source data
          if (!source.amount || !source.currency || !source.frequency) {
            console.warn('Invalid income source data:', source)
            return {
              ...source,
              conversionError: 'Invalid income source data',
              convertedAmount: 0,
              convertedMonthlyAmount: 0
            }
          }

          if (source.currency === primaryCurrency) {
            // No conversion needed
            const monthlyAmount = calculateMonthlyEquivalent(source.amount, source.frequency)
            return {
              ...source,
              convertedAmount: source.amount,
              convertedMonthlyAmount: monthlyAmount,
              exchangeRate: 1
            }
          }

          try {
            // Convert the amount to primary currency
            const conversion = await convertAmount(source.amount, source.currency, primaryCurrency)
            
            if ('errorType' in conversion) {
              const fallbackMonthly = calculateMonthlyEquivalent(source.amount, source.frequency)
              return {
                ...source,
                conversionError: conversion.message,
                convertedAmount: source.amount, // Fallback to original
                convertedMonthlyAmount: fallbackMonthly
              }
            }

            const monthlyConverted = calculateMonthlyEquivalent(conversion.convertedAmount, source.frequency)

            return {
              ...source,
              convertedAmount: conversion.convertedAmount,
              convertedMonthlyAmount: monthlyConverted,
              exchangeRate: conversion.exchangeRate
            }
          } catch (error) {
            console.error('Error converting income source:', error)
            const fallbackMonthly = calculateMonthlyEquivalent(source.amount, source.frequency)
            return {
              ...source,
              conversionError: 'Failed to convert currency',
              convertedAmount: source.amount,
              convertedMonthlyAmount: fallbackMonthly
            }
          }
        })
      )

      setConvertedIncomeSources(converted)
    } catch (error) {
      console.error('Error converting income sources:', error)
      setError('Failed to convert income sources to primary currency')
      // Set fallback converted sources without conversion
      const fallbackConverted = sources.map(source => ({
        ...source,
        convertedAmount: source.amount,
        convertedMonthlyAmount: calculateMonthlyEquivalent(source.amount, source.frequency),
        conversionError: 'Conversion failed'
      }))
      setConvertedIncomeSources(fallbackConverted)
    } finally {
      setIsConverting(false)
    }
  }, [primaryCurrency, convertAmount, calculateMonthlyEquivalent, isConverting])

  // Convert one-time incomes when they change or primary currency changes
  useEffect(() => {
    if (oneTimeIncomes.length > 0) {
      convertOneTimeIncomesToPrimaryCurrency(oneTimeIncomes)
    } else {
      setConvertedOneTimeIncomes([])
    }
  }, [oneTimeIncomes, convertOneTimeIncomesToPrimaryCurrency])

  // Convert income sources when they change or primary currency changes
  useEffect(() => {
    if (incomeSources.length > 0) {
      convertIncomeSourcesToPrimaryCurrency(incomeSources)
    } else {
      setConvertedIncomeSources([])
    }
  }, [incomeSources, convertIncomeSourcesToPrimaryCurrency])

  useEffect(() => {
    if (!user?.id) {
      // Reset state when user is not authenticated
      setIncomeSources([])
      setOneTimeIncomes([])
      setConvertedIncomeSources([])
      setConvertedOneTimeIncomes([])
      setIsLoading(false)
      setError(null)
      setIncomeState({
        hasData: false,
        isEmpty: true,
        isFirstLoad: true
      })
      return
    }

    // Set loading to true when starting to fetch
    setIsLoading(true)
    setError(null)

    // Query for recurring income sources
    const incomeSourcesQuery = query(
      collection(db, 'incomeSources'),
      where('userId', '==', user.id),
      orderBy('startDate', 'desc')
    )

    // Query for one-time incomes
    const oneTimeIncomesQuery = query(
      collection(db, 'oneTimeIncomes'),
      where('userId', '==', user.id),
      orderBy('date', 'desc')
    )

    let loadingCount = 2

    const checkLoadingComplete = () => {
      loadingCount--
      if (loadingCount === 0) {
        setIsLoading(false)
      }
    }

    const unsubscribeIncomeSources = onSnapshot(
      incomeSourcesQuery,
      (snapshot) => {
        try {
          if (snapshot.empty) {
            setIncomeSources([])
            checkLoadingComplete()
            return
          }

          const sources = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              startDate: data.startDate?.toDate() || new Date(),
              endDate: data.endDate?.toDate() || undefined,
            }
          }) as IncomeSource[]
          
          const validSources = sources.filter(source => 
            source.id && 
            source.userId && 
            source.amount !== undefined && 
            source.currency && 
            source.frequency
          )
          
          setIncomeSources(validSources)
          checkLoadingComplete()
        } catch (error) {
          console.error('Error processing income sources:', error)
          setError('Failed to process income data')
          checkLoadingComplete()
        }
      },
      (error) => {
        console.error('Error fetching income sources:', error)
        setError('Unable to connect to income data. Please check your connection and try again.')
        setIncomeSources([])
        checkLoadingComplete()
      }
    )

    const unsubscribeOneTimeIncomes = onSnapshot(
      oneTimeIncomesQuery,
      (snapshot) => {
        try {
          if (snapshot.empty) {
            setOneTimeIncomes([])
            checkLoadingComplete()
            return
          }

          const incomes = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              date: data.date?.toDate() || new Date(),
            }
          }) as OneTimeIncome[]
          
          const validIncomes = incomes.filter(income => 
            income.id && 
            income.userId && 
            income.amount !== undefined && 
            income.currency
          )
          
          setOneTimeIncomes(validIncomes)
          checkLoadingComplete()
        } catch (error) {
          console.error('Error processing one-time incomes:', error)
          setError('Failed to process one-time income data')
          checkLoadingComplete()
        }
      },
      (error) => {
        console.error('Error fetching one-time incomes:', error)
        setError('Unable to connect to one-time income data. Please check your connection and try again.')
        setOneTimeIncomes([])
        checkLoadingComplete()
      }
    )

    // Update income state when both data sources change
    const updateIncomeState = () => {
      const hasRecurringData = incomeSources.length > 0
      const hasOneTimeData = oneTimeIncomes.length > 0
      const hasAnyData = hasRecurringData || hasOneTimeData
      
      setIncomeState({
        hasData: hasAnyData,
        isEmpty: !hasAnyData,
        isFirstLoad: false
      })
    }

    // Watch for changes in both arrays
    const timeoutId = setTimeout(updateIncomeState, 100)

    return () => {
      unsubscribeIncomeSources()
      unsubscribeOneTimeIncomes()
      clearTimeout(timeoutId)
    }
  }, [user?.id, incomeSources.length, oneTimeIncomes.length])

  const addOneTimeIncome = async (data: OneTimeIncomeFormData): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      
      const firebaseData = prepareForFirebaseCreate(data, user.id)
      
      await addDoc(collection(db, 'oneTimeIncomes'), firebaseData)
    } catch (error) {
      console.error('Error adding one-time income:', error)
      setError('Failed to add one-time income')
      throw error
    }
  }

  const addIncomeSource = async (data: IncomeFormData): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      
      // Use utility function to clean data and add required fields
      const firebaseData = prepareForFirebaseCreate(data, user.id)
      
      await addDoc(collection(db, 'incomeSources'), firebaseData)
    } catch (error) {
      console.error('Error adding income source:', error)
      setError('Failed to add income source')
      throw error
    }
  }

  const updateOneTimeIncome = async (id: string, data: Partial<OneTimeIncomeFormData>): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      
      const firebaseData = prepareForFirebaseUpdate(data)
      
      await updateDoc(doc(db, 'oneTimeIncomes', id), firebaseData)
    } catch (error) {
      console.error('Error updating one-time income:', error)
      setError('Failed to update one-time income')
      throw error
    }
  }

  const updateIncomeSource = async (id: string, data: Partial<IncomeFormData>): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      
      // Use utility function to clean data and add update timestamp
      const firebaseData = prepareForFirebaseUpdate(data)
      
      await updateDoc(doc(db, 'incomeSources', id), firebaseData)
    } catch (error) {
      console.error('Error updating income source:', error)
      setError('Failed to update income source')
      throw error
    }
  }

  const deleteOneTimeIncome = async (id: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      await deleteDoc(doc(db, 'oneTimeIncomes', id))
    } catch (error) {
      console.error('Error deleting one-time income:', error)
      setError('Failed to delete one-time income')
      throw error
    }
  }

  const deleteIncomeSource = async (id: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      await deleteDoc(doc(db, 'incomeSources', id))
    } catch (error) {
      console.error('Error deleting income source:', error)
      setError('Failed to delete income source')
      throw error
    }
  }

  // Calculate total one-time income for the current year in primary currency
  const totalOneTimeIncomeThisYear = useMemo(() => {
    if (!convertedOneTimeIncomes || convertedOneTimeIncomes.length === 0) {
      return 0
    }
    
    const currentYear = new Date().getFullYear()
    
    return convertedOneTimeIncomes
      .filter(income => 
        income && 
        income.isRecorded && 
        !income.conversionError &&
        income.date.getFullYear() === currentYear
      )
      .reduce((total, income) => {
        const amount = income.convertedAmount || 0
        return total + (isNaN(amount) ? 0 : amount)
      }, 0)
  }, [convertedOneTimeIncomes])

  // Calculate total monthly income in primary currency
  const totalMonthlyIncome = useMemo(() => {
    if (!convertedIncomeSources || convertedIncomeSources.length === 0) {
      return 0
    }
    
    return convertedIncomeSources
      .filter(source => source && source.isActive && !source.conversionError)
      .reduce((total, source) => {
        const amount = source.convertedMonthlyAmount || 0
        return total + (isNaN(amount) ? 0 : amount)
      }, 0)
  }, [convertedIncomeSources])

  // Calculate total annual income in primary currency
  const totalAnnualIncome = useMemo(() => {
    const monthly = totalMonthlyIncome || 0
    return monthly * 12
  }, [totalMonthlyIncome])

  // Get one-time income by type (converted)
  const getOneTimeIncomesByType = useCallback((type: OneTimeIncome['type']) => {
    if (!convertedOneTimeIncomes || convertedOneTimeIncomes.length === 0) {
      return []
    }
    return convertedOneTimeIncomes.filter(income => income && income.type === type)
  }, [convertedOneTimeIncomes])

  // Get income sources by type (converted)
  const getIncomeSourcesByType = useCallback((type: IncomeSource['type']) => {
    if (!convertedIncomeSources || convertedIncomeSources.length === 0) {
      return []
    }
    return convertedIncomeSources.filter(source => source && source.type === type)
  }, [convertedIncomeSources])

  // Calculate monthly total for a specific type
  const getMonthlyTotalByType = useCallback((type: IncomeSource['type']) => {
    if (!convertedIncomeSources || convertedIncomeSources.length === 0) {
      return 0
    }
    
    return convertedIncomeSources
      .filter(source => source && source.type === type && source.isActive && !source.conversionError)
      .reduce((total, source) => {
        const amount = source.convertedMonthlyAmount || 0
        return total + (isNaN(amount) ? 0 : amount)
      }, 0)
  }, [convertedIncomeSources])

  return {
    // Original data
    incomeSources,
    oneTimeIncomes,
    // Converted data with primary currency
    convertedIncomeSources,
    convertedOneTimeIncomes,
    // State information
    isLoading,
    isConverting,
    error,
    incomeState,
    primaryCurrency,
    // CRUD operations for recurring income
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    // CRUD operations for one-time income
    addOneTimeIncome,
    updateOneTimeIncome,
    deleteOneTimeIncome,
    // Calculation utilities
    calculateMonthlyEquivalent,
    // Currency-aware totals
    totalMonthlyIncome,
    totalAnnualIncome,
    totalOneTimeIncomeThisYear,
    // Filtered accessors
    getIncomeSourcesByType,
    getOneTimeIncomesByType,
    getMonthlyTotalByType,
    // Currency utilities
    formatAmount,
  }
}