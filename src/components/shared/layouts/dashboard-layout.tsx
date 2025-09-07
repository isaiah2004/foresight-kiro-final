"use client"

import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs?: Array<{
    title: string
    href?: string
  }>
  title?: string
}

export function DashboardLayout({ 
  children, 
  breadcrumbs = [], 
  title = "Dashboard" 
}: DashboardLayoutProps) {
  return (
    <SidebarInset className="rounded-lg m-2 border border-border/20 min-h-[calc(100vh-2rem)] w-[calc(100%-1rem)] shadow-shadow shadow-lg bg-background/50 backdrop-blur">
      <header className="flex h-16 shrink-0 items-center gap-2 justify-between pr-4">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                  <BreadcrumbItem className="hidden md:block">
                    {breadcrumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={breadcrumb.href}>
                          {breadcrumb.title}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
              {breadcrumbs.length === 0 && (
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <ThemeSwitcher />
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {children}
      </div>
    </SidebarInset>
  )
}