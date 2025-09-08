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
          // Check for exact match first - highest priority
          if (pathname === tab.url) {
            return (
              <Link
                key={tab.url}
                href={tab.url}
                className={cn(
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                  "border-primary text-primary"
                )}
              >
                {tab.title}
              </Link>
            )
          }

          // Check if current path starts with tab URL (for nested routes)
          const isNestedActive = pathname.startsWith(tab.url + "/")
          
          // If it's a nested route, only show as active if no other tab has exact match
          let shouldShowActive = false
          if (isNestedActive) {
            // Check if any other tab has exact match
            const hasExactMatch = tabs.some(otherTab => pathname === otherTab.url)
            if (!hasExactMatch) {
              // Find the longest matching URL among all tabs
              const matchingTabs = tabs.filter(t => pathname.startsWith(t.url) || pathname === t.url)
              const longestMatch = matchingTabs.reduce((longest, current) => 
                current.url.length > longest.url.length ? current : longest
              )
              shouldShowActive = tab.url === longestMatch.url
            }
          }
          
          return (
            <Link
              key={tab.url}
              href={tab.url}
              className={cn(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                shouldShowActive
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