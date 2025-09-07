"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/shared/layouts/dashboard-layout"
import { TabNavigation } from "@/components/shared/navigation/tab-navigation"
import { BucketManagementDashboard } from "@/components/shared/budgets/bucket-management-dashboard"
import { Bucket, BudgetAllocation } from "@/types/budget"
import { tabNavigationConfig } from "@/lib/navigation-config"

// Mock data for demonstration
const mockBudgetAllocation: BudgetAllocation = {
  id: "1",
  userId: "user1",
  grossIncome: 5000,
  netIncome: 3750,
  taxRate: 25,
  currency: "USD",
  categories: {
    essentials: {
      id: "essentials",
      name: "Essentials",
      percentage: 50,
      amount: 1875,
      description: "Housing, groceries, transportation, insurance, debt repayment, medical",
      color: "#ef4444"
    },
    lifestyle: {
      id: "lifestyle", 
      name: "Lifestyle",
      percentage: 20,
      amount: 750,
      description: "Dining out, subscriptions, travel, personal fun money",
      color: "#f59e0b"
    },
    savingsFuture: {
      id: "savingsFuture",
      name: "Savings & Future", 
      percentage: 20,
      amount: 750,
      description: "Emergency fund, retirement/investments, general savings",
      color: "#10b981"
    },
    sinkingFund: {
      id: "sinkingFund",
      name: "Sinking Fund",
      percentage: 10,
      amount: 375,
      description: "Electronics, clothing, home & furniture, gifts, annual expenses", 
      color: "#3b82f6"
    },
    unallocated: {
      id: "unallocated",
      name: "Unallocated",
      percentage: 0,
      amount: 0,
      description: "Mid-month income increases",
      color: "#6b7280"
    },
    misc: {
      id: "misc",
      name: "Misc",
      percentage: 0,
      amount: 0,
      description: "Hard-to-track cash expenses",
      color: "#8b5cf6"
    }
  },
  lastUpdated: new Date(),
  createdAt: new Date()
};

const mockBuckets: Bucket[] = [
  {
    id: "1",
    userId: "user1",
    name: "Emergency Fund",
    description: "3-6 months of expenses for financial security",
    category: "savingsFuture",
    targetAmount: 15000,
    currentAmount: 8500,
    currency: "USD",
    renewalRate: "monthly",
    nextRenewal: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    lastRenewal: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    isActive: true,
    autoRenew: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2", 
    userId: "user1",
    name: "Vacation Fund",
    description: "Annual vacation to Europe",
    category: "lifestyle",
    targetAmount: 3000,
    currentAmount: 1200,
    currency: "USD",
    renewalRate: "monthly",
    nextRenewal: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    isActive: true,
    autoRenew: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    userId: "user1", 
    name: "Groceries",
    description: "Weekly grocery shopping",
    category: "essentials",
    targetAmount: 400,
    currentAmount: 150,
    currency: "USD",
    renewalRate: "weekly",
    nextRenewal: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    isActive: true,
    autoRenew: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    userId: "user1",
    name: "New Laptop",
    description: "Saving for a new MacBook Pro",
    category: "sinkingFund", 
    targetAmount: 2500,
    currentAmount: 800,
    currency: "USD",
    renewalRate: "monthly",
    nextRenewal: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days overdue
    isActive: false,
    autoRenew: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function BucketsPage() {
  const [buckets, setBuckets] = useState<Bucket[]>(mockBuckets);

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Budgets", href: "/dashboard/budgets" },
    { title: "Buckets" },
  ]

  const handleBucketCreate = (newBucket: Omit<Bucket, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const bucket: Bucket = {
      ...newBucket,
      id: Date.now().toString(),
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBuckets(prev => [...prev, bucket]);
  };

  const handleBucketUpdate = (bucketId: string, updates: Partial<Bucket>) => {
    setBuckets(prev => prev.map(bucket => 
      bucket.id === bucketId 
        ? { ...bucket, ...updates, updatedAt: new Date() }
        : bucket
    ));
  };

  const handleBucketDelete = (bucketId: string) => {
    setBuckets(prev => prev.filter(bucket => bucket.id !== bucketId));
  };

  const handleBucketRenew = (bucketId: string, amount: number) => {
    setBuckets(prev => prev.map(bucket => 
      bucket.id === bucketId 
        ? { 
            ...bucket, 
            currentAmount: Math.min(bucket.currentAmount + amount, bucket.targetAmount),
            updatedAt: new Date()
          }
        : bucket
    ));
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} title="Budget Buckets">
      <TabNavigation tabs={tabNavigationConfig.budgets} />
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-lg font-semibold mb-2">Bucket Management System</h2>
          <p className="text-muted-foreground">
            Create and manage budget buckets with configurable renewal rates. 
            Buckets help you allocate funds for specific purposes within each budget category, 
            with automatic renewal based on your chosen schedule (daily, weekly, monthly, etc.).
          </p>
        </div>
        
        <BucketManagementDashboard
          buckets={buckets}
          budgetAllocation={mockBudgetAllocation}
          onBucketCreate={handleBucketCreate}
          onBucketUpdate={handleBucketUpdate}
          onBucketDelete={handleBucketDelete}
          onBucketRenew={handleBucketRenew}
        />
      </div>
    </DashboardLayout>
  )
}