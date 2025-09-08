"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function InvestmentsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/investments/overview")
  }, [router])

  return null
}
