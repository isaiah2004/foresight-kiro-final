# Dashboard Implementation Guide

## Purpose
This guide provides step-by-step instructions for implementing the dashboard with shadcn sidebar-08 component and dual navigation pattern.

## Initial Setup

### Install Sidebar Component
```bash
npx shadcn@latest add sidebar-08
```

**Important**: Do not discard existing dashboard code. Refactor the existing implementation to use the new sidebar structure.

## Navigation Structure

### Sidebar Hierarchy
The dashboard sidebar should implement the following structure:

```
1. Dashboard Overview
   - Financial health visualization
   - Cashflow visualization
   - Fin Bot integration

2. Investment Portfolio
   - Stocks
   - Bonds
   - Mutual funds
   - Real estate
   - Crypto
   - Other

3. Budgets
   - Income splitting
   - Buckets
   - Manage

4. Income Sources
   - Salary
   - Rental Properties
   - Others

5. Expenses
   - Rent
   - Groceries
   - Utilities
   - Entertainment
   - Other

6. Loans
   - Home loan
   - Car loan
   - Personal loan
   - Other

7. Funds Management
   - Pots
   - Saving funds (401K, education funds, etc.)
   - Other (Vacation savings, item savings, etc.)

8. Insights
   - Risk profile
   - Taxation analysis
   - Other analytics

9. Settings
   - User preferences
   - Currency settings
   - Account management

10. Feedback
    - Submit feedback
    - View feedback history
```

## Dual Navigation Pattern

### Implementation Strategy
For each main section (e.g., Income Sources), implement both:

1. **Collapsible Sidebar Menu**: Shows sub-items in expandable format
2. **Tab Navigation**: Horizontal tabs in the main content area

### Example: Income Section
**Sidebar Structure:**
```
Income Sources (collapsible)
├── Salary
├── Rental Properties
└── Others
```

**Tab Navigation:**
```
[Salary] [Rental Properties] [Others]
```

Both navigation methods should provide identical functionality to suit different user preferences.

## Persistent State Implementation

### SidebarProvider Setup
Configure persistent state in `app/layout.tsx`:

```typescript
import { cookies } from "next/headers"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
```

### Cookie Configuration
The sidebar state is persisted using a cookie named `sidebar_state`. To customize the cookie name, update the `SIDEBAR_COOKIE_NAME` variable in `sidebar.tsx`:

```typescript
const SIDEBAR_COOKIE_NAME = "sidebar_state"
```

## Component Structure

### Shared Navigation Configuration
Create a centralized navigation config file that both sidebar and breadcrumb components can import:

```typescript
// lib/navigation-config.ts
export const navigationConfig = {
  dashboard: {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    subItems: []
  },
  investments: {
    label: 'Investments',
    href: '/dashboard/investments',
    icon: 'trending-up',
    subItems: [
      { label: 'Stocks', href: '/dashboard/investments/stocks' },
      { label: 'Bonds', href: '/dashboard/investments/bonds' },
      { label: 'Mutual Funds', href: '/dashboard/investments/mutual-funds' },
      { label: 'Real Estate', href: '/dashboard/investments/real-estate' },
      { label: 'Crypto', href: '/dashboard/investments/crypto' },
      { label: 'Other', href: '/dashboard/investments/other' }
    ]
  },
  // ... other sections
};
```

### Sidebar Component Structure
```typescript
// components/app-sidebar.tsx
import { navigationConfig } from '@/lib/navigation-config';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Financial Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(navigationConfig).map(([key, item]) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.subItems.length > 0 && (
                    <SidebarMenuSub>
                      {item.subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.href}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.href}>
                              <span>{subItem.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

## Layout Implementation

### Dashboard Layout
The dashboard layout should only apply to routes under `/dashboard`:

```typescript
// app/dashboard/layout.tsx
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { cookies } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="flex-1">
        {children}
      </main>
    </SidebarProvider>
  )
}
```

### Route Organization
Ensure all main application features are nested under `/dashboard`:
- Landing page: `/` (no sidebar)
- Dashboard: `/dashboard` (with sidebar)
- All features: `/dashboard/*` (with sidebar)

## Performance Considerations

- Lazy load sidebar sub-components for better initial load time
- Use React.memo for navigation components to prevent unnecessary re-renders
- Implement skeleton loading for sidebar content
- Optimize icon loading and caching

## Accessibility Requirements

- Proper ARIA labels for all navigation elements
- Keyboard navigation support for all sidebar items
- Screen reader compatibility
- Focus management for collapsible sections
- High contrast mode support

## Testing Requirements

- Unit tests for navigation configuration
- Integration tests for sidebar state persistence
- End-to-end tests for dual navigation functionality
- Accessibility tests for keyboard and screen reader navigation
- Performance tests for sidebar rendering with large navigation trees