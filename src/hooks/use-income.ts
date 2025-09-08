"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { IncomeSource } from '@/types/financial'

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

export function useIncome() {
  const { user } = useUser()
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    const q = query(
      collection(db, 'incomeSources'),
      where('userId', '==', user.id),
      orderBy('startDate', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sources = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate() || undefined,
        })) as IncomeSource[]
        
        setIncomeSources(sources)
        setIsLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error fetching income sources:', error)
        setError('Failed to load income sources')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.id])

  const addIncomeSource = async (data: IncomeFormData): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      await addDoc(collection(db, 'incomeSources'), {
        ...data,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Error adding income source:', error)
      setError('Failed to add income source')
      throw error
    }
  }

  const updateIncomeSource = async (id: string, data: Partial<IncomeFormData>): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      await updateDoc(doc(db, 'incomeSources', id), {
        ...data,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Error updating income source:', error)
      setError('Failed to update income source')
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

  // Calculate monthly equivalent for different frequencies
  const calculateMonthlyEquivalent = (amount: number, frequency: IncomeSource['frequency']): number => {
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
  }

  // Calculate total monthly income
  const totalMonthlyIncome = incomeSources
    .filter(source => source.isActive)
    .reduce((total, source) => {
      return total + calculateMonthlyEquivalent(source.amount, source.frequency)
    }, 0)

  // Calculate total annual income
  const totalAnnualIncome = incomeSources
    .filter(source => source.isActive)
    .reduce((total, source) => {
      const monthlyAmount = calculateMonthlyEquivalent(source.amount, source.frequency)
      return total + (monthlyAmount * 12)
    }, 0)

  // Get income sources by type
  const getIncomeSourcesByType = (type: IncomeSource['type']) => {
    return incomeSources.filter(source => source.type === type)
  }

  return {
    incomeSources,
    isLoading,
    error,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    calculateMonthlyEquivalent,
    totalMonthlyIncome,
    totalAnnualIncome,
    getIncomeSourcesByType,
  }
}