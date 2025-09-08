"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Expense } from '@/types/financial'

export interface ExpenseFormData {
  category: 'rent' | 'groceries' | 'utilities' | 'entertainment' | 'other'
  subcategory?: string
  amount: number
  currency: string
  description: string
  date: Date
  isRecurring: boolean
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  bucketId?: string
  metadata?: Record<string, any>
}

export function useExpenses() {
  const { user } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.id),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expenseList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
        })) as Expense[]
        
        setExpenses(expenseList)
        setIsLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error fetching expenses:', error)
        setError('Failed to load expenses')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.id])

  const addExpense = async (data: ExpenseFormData): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      await addDoc(collection(db, 'expenses'), {
        ...data,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Error adding expense:', error)
      setError('Failed to add expense')
      throw error
    }
  }

  const updateExpense = async (id: string, data: Partial<ExpenseFormData>): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      await updateDoc(doc(db, 'expenses', id), {
        ...data,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Error updating expense:', error)
      setError('Failed to update expense')
      throw error
    }
  }

  const deleteExpense = async (id: string): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setError(null)
      await deleteDoc(doc(db, 'expenses', id))
    } catch (error) {
      console.error('Error deleting expense:', error)
      setError('Failed to delete expense')
      throw error
    }
  }

  // Calculate total expenses for a given period
  const getTotalExpenses = (startDate?: Date, endDate?: Date): number => {
    return expenses
      .filter(expense => {
        if (startDate && expense.date < startDate) return false
        if (endDate && expense.date > endDate) return false
        return true
      })
      .reduce((total, expense) => total + expense.amount, 0)
  }

  // Get expenses by category
  const getExpensesByCategory = (category: Expense['category']) => {
    return expenses.filter(expense => expense.category === category)
  }

  // Calculate expenses by category for a period
  const getCategoryTotals = (startDate?: Date, endDate?: Date) => {
    const categories = ['rent', 'groceries', 'utilities', 'entertainment', 'other'] as const
    
    return categories.map(category => {
      const categoryExpenses = expenses.filter(expense => {
        if (expense.category !== category) return false
        if (startDate && expense.date < startDate) return false
        if (endDate && expense.date > endDate) return false
        return true
      })
      
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      return {
        category,
        total,
        count: categoryExpenses.length,
        expenses: categoryExpenses
      }
    })
  }

  // Get current month expenses
  const getCurrentMonthExpenses = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return expenses.filter(expense => 
      expense.date >= startOfMonth && expense.date <= endOfMonth
    )
  }

  // Calculate daily average for current month
  const getCurrentMonthDailyAverage = () => {
    const currentMonthExpenses = getCurrentMonthExpenses()
    const total = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const daysInMonth = new Date().getDate() // Current day of month
    
    return daysInMonth > 0 ? total / daysInMonth : 0
  }

  // Get recent expenses (last N expenses)
  const getRecentExpenses = (limit: number = 10) => {
    return expenses.slice(0, limit)
  }

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalExpenses,
    getExpensesByCategory,
    getCategoryTotals,
    getCurrentMonthExpenses,
    getCurrentMonthDailyAverage,
    getRecentExpenses,
  }
}