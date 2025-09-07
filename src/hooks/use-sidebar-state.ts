"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export interface SidebarState {
  isOpen: boolean
  expandedItems: string[]
}

const DEFAULT_SIDEBAR_STATE: SidebarState = {
  isOpen: true,
  expandedItems: []
}

const EXPANDED_ITEMS_COOKIE_NAME = 'sidebar:expanded'

// Helper function to determine which navigation items should be expanded based on current path
function getDefaultExpandedItemsFromPath(pathname: string): string[] {
  const defaults: string[] = []
  
  if (pathname.startsWith('/dashboard/investments')) {
    defaults.push('Investments')
  } else if (pathname.startsWith('/dashboard/budgets')) {
    defaults.push('Budgets')
  } else if (pathname.startsWith('/dashboard/income')) {
    defaults.push('Income')
  } else if (pathname.startsWith('/dashboard/funds')) {
    defaults.push('Funds')
  } else if (pathname.startsWith('/dashboard/overview')) {
    defaults.push('Overview')
  }
  
  return defaults
}

export function useSidebarState() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Get expanded items from cookie
    const expandedItemsState = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${EXPANDED_ITEMS_COOKIE_NAME}=`))
      ?.split('=')[1]
    
    let savedExpandedItems: string[] = []
    
    if (expandedItemsState) {
      try {
        const decoded = decodeURIComponent(expandedItemsState)
        const parsed = JSON.parse(decoded)
        savedExpandedItems = Array.isArray(parsed) ? parsed : []
      } catch (error) {
        console.warn('Failed to parse expanded items from cookie:', error)
        savedExpandedItems = []
      }
    }

    // Always ensure the current route's section is expanded
    const defaultForCurrentPath = getDefaultExpandedItemsFromPath(pathname)
    const mergedExpandedItems = Array.from(new Set([...savedExpandedItems, ...defaultForCurrentPath]))

    setExpandedItems(mergedExpandedItems)
    setIsInitialized(true)

    // Save the merged state back to cookie if it changed
    if (mergedExpandedItems.length !== savedExpandedItems.length || 
        !mergedExpandedItems.every(item => savedExpandedItems.includes(item))) {
      const encoded = encodeURIComponent(JSON.stringify(mergedExpandedItems))
      document.cookie = `${EXPANDED_ITEMS_COOKIE_NAME}=${encoded}; path=/; max-age=${60 * 60 * 24 * 365}`
    }
  }, [pathname])

  const toggleExpandedItem = (itemTitle: string) => {
    const newExpandedItems = expandedItems.includes(itemTitle)
      ? expandedItems.filter(item => item !== itemTitle)
      : [...expandedItems, itemTitle]
    
    setExpandedItems(newExpandedItems)
    
    // Save to cookie
    const encoded = encodeURIComponent(JSON.stringify(newExpandedItems))
    document.cookie = `${EXPANDED_ITEMS_COOKIE_NAME}=${encoded}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year
  }

  const isItemExpanded = (itemTitle: string) => {
    return expandedItems.includes(itemTitle)
  }

  const setExpandedItem = (itemTitle: string, expanded: boolean) => {
    const newExpandedItems = expanded
      ? [...expandedItems.filter(item => item !== itemTitle), itemTitle]
      : expandedItems.filter(item => item !== itemTitle)
    
    setExpandedItems(newExpandedItems)
    
    // Save to cookie
    const encoded = encodeURIComponent(JSON.stringify(newExpandedItems))
    document.cookie = `${EXPANDED_ITEMS_COOKIE_NAME}=${encoded}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year
  }

  return {
    expandedItems,
    toggleExpandedItem,
    isItemExpanded,
    setExpandedItem,
    isInitialized
  }
}