"use client"

import React, { createContext, useContext } from "react"
import { useSidebarState } from "@/hooks/use-sidebar-state"

interface SidebarStateContextType {
  expandedItems: string[]
  toggleExpandedItem: (itemTitle: string) => void
  isItemExpanded: (itemTitle: string) => boolean
  setExpandedItem: (itemTitle: string, expanded: boolean) => void
  isInitialized: boolean
}

const SidebarStateContext = createContext<SidebarStateContextType | undefined>(undefined)

export function SidebarStateProvider({ children }: { children: React.ReactNode }) {
  const sidebarState = useSidebarState()

  return (
    <SidebarStateContext.Provider value={sidebarState}>
      {children}
    </SidebarStateContext.Provider>
  )
}

export function useSidebarStateContext() {
  const context = useContext(SidebarStateContext)
  if (context === undefined) {
    throw new Error('useSidebarStateContext must be used within a SidebarStateProvider')
  }
  return context
}
