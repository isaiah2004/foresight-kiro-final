"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BudgetsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/budgets/overview")
  }, [router])

  return null
}