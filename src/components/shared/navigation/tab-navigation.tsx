"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface TabNavigationProps {
  tabs: Array<{
    title: string
    url: string
  }>
  className?: string
}

export function TabNavigation({ tabs, className }: TabNavigationProps) {
  const pathname = usePathname()

  return (
    <div className={cn("border-b border-border", className)}>
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.url || pathname.startsWith(tab.url + "/")
          
          return (
            <Link
              key={tab.url}
              href={tab.url}
              className={cn(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
              )}
            >
              {tab.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}